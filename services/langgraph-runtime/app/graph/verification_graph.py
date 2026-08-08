import os
import json
import asyncio
from datetime import datetime, timezone
from uuid import uuid4
from typing import TypedDict, List, Dict, Any, Optional

from app.ollama_service import OllamaService
from app.claims import extract_claims
from app.agents.logic_agent import LogicAgent
from app.agents.evidence_agent import BoundedEvidenceAgent
from app.nli import EntailmentModel
from app.fusion import FusionModel
from app.conformal import ConformalCalibrator
from app.signals.sep import SemanticEntropyProbe
from app.retrieval import HybridRetriever

class VerificationState(TypedDict, total=False):
    session_id: str
    prompt: str
    model: str
    ablated_layers: List[str]
    response_text: str
    claims: List[Dict[str, Any]]
    claim_results: List[Dict[str, Any]]
    trust_score: float
    verdict: str
    receipt: Optional[Dict[str, Any]]
    corrections: List[Dict[str, Any]]
    events: List[Dict[str, Any]]
    status: str

class RealtimeVerificationEngine:
    def __init__(self):
        self.ollama = OllamaService()
        self.retriever = HybridRetriever()
        self.evidence_agent = BoundedEvidenceAgent(self.retriever)
        self.logic_agent = LogicAgent()
        self.nli = EntailmentModel()
        self.fusion = FusionModel()
        self.conformal = ConformalCalibrator()
        self.sep = SemanticEntropyProbe()

    async def execute_realtime_workflow(
        self,
        session_id: str,
        prompt: str,
        ablated_layers: Optional[List[str]] = None,
        model: Optional[str] = None,
        event_callback=None
    ) -> VerificationState:
        """Executes the 10-phase cost-aware real-time verification workflow."""
        ablated = set(ablated_layers or [])
        events: List[Dict[str, Any]] = []

        async def emit(event_type: str, payload: Dict[str, Any]):
            event = {
                "type": event_type,
                "session_id": session_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "payload": payload
            }
            events.append(event)
            if event_callback:
                await event_callback(event)

        # 1. Started
        await emit("verification.started", {"prompt": prompt, "model": model or self.ollama.default_model})

        # 2. Token Generation via Ollama
        await emit("response.started", {})
        generated_text = ""
        try:
            async for token in self.ollama.stream(prompt=prompt, model=model):
                generated_text += token
                await emit("response.token", {"text": token})
        except Exception as err:
            # Fallback if streaming fails or Ollama error
            await emit("verification.error", {"message": f"Ollama generation error: {str(err)}"})
            generated_text = f"Unable to generate response from Ollama: {str(err)}"

        await emit("response.completed", {"full_text": generated_text})

        # 3. Claim Extraction
        await emit("claim.extraction.started", {})
        extracted_texts = extract_claims(generated_text)
        claims = []
        for idx, text in enumerate(extracted_texts, 1):
            claim_id = f"clm_{idx}"
            # Quick heuristic classification
            claim_type = "factual"
            clean_text = text.lower()
            if any(op in text for op in ["+", "-", "*", "/", "=", "<", ">", "%", "grew", "increased", "decreased"]):
                claim_type = "numeric"
            elif any(w in clean_text for w in ["implies", "therefore", "unless", "all ", "if "]):
                claim_type = "logical"
            elif any(w in clean_text for w in ["in 20", "in 19", "yesterday", "current", "date", "stale"]):
                claim_type = "time-sensitive"

            claim_obj = {
                "id": claim_id,
                "text": text,
                "type": claim_type,
                "verdict": "UNVERIFIED"
            }
            claims.append(claim_obj)
            await emit("claim.extracted", claim_obj)

        await emit("claim.extraction.completed", {"count": len(claims)})

        # 4. Routing & Verification per Claim
        await emit("routing.started", {})
        claim_results = []
        total_trust_scores = []
        corrections = []

        for c in claims:
            cid = c["id"]
            text = c["text"]
            ctype = c["type"]

            await emit("layer.started", {"claim_id": cid, "type": ctype})

            # Check Numeric/Logical path
            if ctype == "numeric" and "symbolic" not in ablated:
                is_valid, msg, grounding = self.logic_agent.evaluate_arithmetic(text)
                verdict_str = "GROUNDED" if is_valid else "CONTRADICTED"
                trust_val = 0.98 if is_valid else 0.15
                
                res_obj = {
                    "id": cid,
                    "text": text,
                    "type": ctype,
                    "verdict": verdict_str,
                    "trust": trust_val,
                    "evidence": [{"source": "Python Arithmetic Engine", "snippet": msg, "relation": "entails" if is_valid else "contradicts", "score": 1.0}],
                    "diagnostics": {"symbolic": 1.0 if is_valid else 0.0}
                }
                claim_results.append(res_obj)
                total_trust_scores.append(trust_val)
                await emit("layer.completed", {"claim_id": cid, "layer": "symbolic", "status": verdict_str, "details": msg})

                # Check if correction needed
                if not is_valid:
                    await emit("correction.started", {"claim_id": cid, "reason": "Arithmetic Contradiction Detected"})
                    corr_prompt = f"The claim '{text}' contains an arithmetic contradiction ({msg}). Please provide a mathematically correct version of this claim in one sentence."
                    try:
                        corrected_text = await self.ollama.generate(prompt=corr_prompt, model=model)
                        corrected_text = corrected_text.strip()
                        c_valid, c_msg, c_grounding = self.logic_agent.evaluate_arithmetic(corrected_text)
                        c_verdict = "GROUNDED" if c_valid else "UNCERTAIN"
                        c_trust = 0.92 if c_valid else 0.40
                        
                        corr_entry = {
                            "original_claim": text,
                            "corrected_claim": corrected_text,
                            "verdict": c_verdict,
                            "trust": c_trust
                        }
                        corrections.append(corr_entry)
                        await emit("correction.completed", corr_entry)
                        await emit("reverification.completed", {"claim_id": cid, "verdict": c_verdict, "trust": c_trust})
                    except Exception as cex:
                        await emit("correction.completed", {"error": str(cex)})

            elif ctype == "logical" and "symbolic" not in ablated:
                is_valid, msg, grounding = self.logic_agent.evaluate_logic(text)
                verdict_str = "GROUNDED" if is_valid else "FLAGGED"
                trust_val = 0.90 if is_valid else 0.20
                res_obj = {
                    "id": cid,
                    "text": text,
                    "type": ctype,
                    "verdict": verdict_str,
                    "trust": trust_val,
                    "evidence": [{"source": "Z3 Solver", "snippet": msg, "relation": "entails" if is_valid else "contradicts", "score": 0.9}],
                    "diagnostics": {"z3": 1.0 if is_valid else 0.0}
                }
                claim_results.append(res_obj)
                total_trust_scores.append(trust_val)
                await emit("layer.completed", {"claim_id": cid, "layer": "z3_logic", "status": verdict_str, "details": msg})

            else:
                # Factual verification path (Retrieval + NLI)
                await emit("retrieval.started", {"claim_id": cid})
                agent_res = await asyncio.to_thread(self.evidence_agent.retrieve, text)
                passages = agent_res.passages
                best = passages[0] if passages else None
                
                if best and best.score > 0.3:
                    await emit("retrieval.completed", {"claim_id": cid, "source": best.source, "snippet": best.text, "score": round(best.score, 3)})
                    nli_res = await asyncio.to_thread(self.nli.assess, text, best.text, best.score)
                    await emit("nli.completed", {"claim_id": cid, "relation": nli_res.relation, "confidence": round(nli_res.confidence, 3)})
                    
                    grounding = nli_res.confidence if nli_res.relation == "entails" else 1.0 - nli_res.confidence if nli_res.relation == "contradicts" else 0.5
                    verdict_str = "GROUNDED" if nli_res.relation == "entails" else "CONTRADICTED" if nli_res.relation == "contradicts" else "REVIEW"
                    trust_val = round(self.fusion.predict({"sep": self.sep.score(), "semantic": 0.8, "kernel": 0.8, "grounding": grounding, "retrieval": best.score}), 3)
                    
                    res_obj = {
                        "id": cid,
                        "text": text,
                        "type": ctype,
                        "verdict": verdict_str,
                        "trust": trust_val,
                        "evidence": [{"source": best.source, "snippet": best.text, "relation": nli_res.relation, "score": round(best.score, 3)}],
                        "diagnostics": {"grounding": grounding, "retrieval": best.score}
                    }
                else:
                    await emit("retrieval.completed", {"claim_id": cid, "source": "None", "snippet": "No relevant indexed evidence found.", "score": 0.0})
                    verdict_str = "REVIEW"
                    trust_val = 0.50
                    res_obj = {
                        "id": cid,
                        "text": text,
                        "type": ctype,
                        "verdict": verdict_str,
                        "trust": trust_val,
                        "evidence": [{"source": "Indexed Corpus", "snippet": "No relevant evidence indexed.", "relation": "neutral", "score": 0.0}],
                        "diagnostics": {"grounding": 0.5, "retrieval": 0.0}
                    }

                claim_results.append(res_obj)
                total_trust_scores.append(trust_val)
                await emit("layer.completed", {"claim_id": cid, "layer": "retrieval_nli", "status": verdict_str, "trust": trust_val})

        # 5. Overall Fusion & Calibration
        await emit("fusion.started", {})
        overall_trust = round(sum(total_trust_scores) / len(total_trust_scores), 3) if total_trust_scores else 0.75
        await emit("fusion.completed", {"trust_score": overall_trust})

        await emit("calibration.started", {})
        interval = self.conformal.interval(overall_trust)
        calibrated_status = "CALIBRATED" if self.conformal.calibrated else "UNCALIBRATED"
        await emit("calibration.completed", {"status": calibrated_status, "interval": interval})

        # 6. Receipt Generation
        receipt = {
            "receipt_id": f"rcpt_{uuid4().hex[:12]}",
            "session_id": session_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "model": model or self.ollama.default_model,
            "raw_trust": overall_trust,
            "calibrated_status": calibrated_status,
            "conformal_interval": interval if self.conformal.calibrated else "UNAVAILABLE",
            "executed_layers": ["OllamaStream", "ClaimExtraction", "CostAwareRouter"] + [k for k in ["SymbolicPython", "Z3Logic", "RetrievalNLI"] if k.lower() not in ablated],
            "ablated_layers": list(ablated),
            "signature_status": "UNSIGNED (LOCAL DEV)"
        }
        await emit("receipt.created", receipt)

        final_verdict = "GROUNDED" if overall_trust >= 0.80 else "REVIEW" if overall_trust >= 0.55 else "FLAGGED"
        await emit("verification.completed", {"trust_score": overall_trust, "verdict": final_verdict})

        state: VerificationState = {
            "session_id": session_id,
            "prompt": prompt,
            "model": model or self.ollama.default_model,
            "ablated_layers": list(ablated),
            "response_text": generated_text,
            "claims": claims,
            "claim_results": claim_results,
            "trust_score": overall_trust,
            "verdict": final_verdict,
            "receipt": receipt,
            "corrections": corrections,
            "events": events,
            "status": "COMPLETED"
        }

        return state
