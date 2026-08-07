from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from uuid import uuid4

from app.claims import extract_claims
from app.agents.evidence_agent import BoundedEvidenceAgent
from app.agents.logic_agent import LogicAgent
import requests
import os
from app.conformal import ConformalCalibrator
from app.fusion import FusionModel
from app.nli import EntailmentModel
from app.retrieval import HybridRetriever
from app.schemas import Claim, Evidence, VerifyRequest, VerifyResult
from app.signals.kernel_entropy import kernel_language_entropy, normalized_kernel_consistency
from app.signals.semantic_entropy import normalized_consistency_score, semantic_entropy
from app.signals.sep import SemanticEntropyProbe


def verdict(score: float) -> str:
    return "grounded" if score >= 0.82 else "review" if score >= 0.56 else "flagged"


class VerificationPipeline:
    def __init__(self) -> None:
        self.retriever = HybridRetriever()
        self.evidence_agent = BoundedEvidenceAgent(self.retriever)
        self.logic_agent = LogicAgent()
        self.nli = EntailmentModel()
        self.fusion = FusionModel()
        self.conformal = ConformalCalibrator()
        self.sep = SemanticEntropyProbe()

    async def verify(self, request: VerifyRequest) -> VerifyResult:
        extracted = extract_claims(request.response)
        claim_results = await asyncio.gather(*(self._verify_claim(index, text, request.samples or []) for index, text in enumerate(extracted, 1)))
        trust = sum(claim.trust for claim in claim_results) / len(claim_results)
        if request.mode == "strict":
            trust = max(0.0, trust - 0.04)
        interval = self.conformal.interval(trust)
        layers = {name: round(sum(float(claim.diagnostics.get(name) or 0) for claim in claim_results) / len(claim_results), 3) for name in ("semanticEntropyProbe", "semanticEntropy", "kernelLanguageEntropy", "retrievalGroundedEntailment")}
        return VerifyResult(id=f"vrf_{uuid4().hex[:16]}", trust=round(trust, 3), verdict=verdict(trust), claims=claim_results, layers=layers, receipt={"issuedAt": datetime.now(timezone.utc).isoformat(), "mode": request.mode, "version": "0.2.0-engine", "conformalLower": interval[0] if interval else "unavailable", "conformalUpper": interval[1] if interval else "unavailable"}, diagnostics={"retrievalBackend": self.retriever.backend, "fusionBackend": self.fusion.backend, "conformalCalibrated": self.conformal.calibrated, "sepAvailable": self.sep.available})

    async def _verify_claim(self, index: int, text: str, samples: list[str]) -> Claim:
        # Determine Claim Type via model-service
        claim_type = "factual"
        try:
            model_url = os.getenv("MODEL_SERVICE_URL", "http://model-service:8001")
            res = requests.post(f"{model_url}/claim_type", json={"claim": text})
            if res.status_code == 200:
                claim_type = res.json().get("type", "factual")
        except Exception:
            pass

        if claim_type == "numeric":
            is_valid, msg, grounding = await asyncio.to_thread(self.logic_agent.evaluate_arithmetic, text)
            return self._build_claim_result(index, text, samples, is_valid, msg, grounding, "Python Arithmetic Engine")
        elif claim_type == "logical":
            is_valid, msg, grounding = await asyncio.to_thread(self.logic_agent.evaluate_logic, text)
            return self._build_claim_result(index, text, samples, is_valid, msg, grounding, "Z3 Solver")
        else:
            return await self._verify_factual_claim(index, text, samples)

    async def _verify_factual_claim(self, index: int, text: str, samples: list[str]) -> Claim:
        agent_result = await asyncio.to_thread(self.evidence_agent.retrieve, text)
        passages = agent_result.passages
        best = passages[0]
        nli = await asyncio.to_thread(self.nli.assess, text, best.text, best.score)
        semantic = semantic_entropy(samples, lambda left, right: left.lower().strip() == right.lower().strip())
        semantic_score = normalized_consistency_score(semantic, len(samples))
        matrix = [[1.0 if left.lower().strip() == right.lower().strip() else 0.15 for right in samples] for left in samples]
        kernel = kernel_language_entropy(matrix) if samples else None
        kernel_score = normalized_kernel_consistency(kernel, len(samples))
        grounding = nli.confidence if nli.relation == "entails" else 1 - nli.confidence if nli.relation == "contradicts" else 0.5
        trust = self.fusion.predict({"sep": self.sep.score(), "semantic": semantic_score, "kernel": kernel_score, "grounding": grounding, "retrieval": best.score})
        evidence = Evidence(source=best.source if nli.relation != "neutral" else "Retrieval pending", snippet=best.text if nli.relation != "neutral" else "No sufficiently relevant indexed evidence was found.", relation=nli.relation, retrieval_score=round(best.score, 3), entailment_score=round(nli.confidence, 3))
        diagnostics = {"semanticEntropyProbe": self.sep.score(), "semanticEntropy": semantic_score, "kernelLanguageEntropy": kernel_score, "retrievalGroundedEntailment": grounding, "retrievalScore": best.score, "agentAttempts": float(len(agent_result.trace))}
        return Claim(id=f"clm_{index}", text=text, trust=round(trust, 3), verdict=verdict(trust), evidence=[evidence], diagnostics=diagnostics)

    def _build_claim_result(self, index: int, text: str, samples: list[str], is_valid: bool, msg: str, grounding: float, engine: str) -> Claim:
        semantic = semantic_entropy(samples, lambda left, right: left.lower().strip() == right.lower().strip())
        semantic_score = normalized_consistency_score(semantic, len(samples))
        kernel_score = 1.0 # Not highly relevant for logical claims
        trust = self.fusion.predict({"sep": self.sep.score(), "semantic": semantic_score, "kernel": kernel_score, "grounding": grounding, "retrieval": 1.0})
        evidence = Evidence(source=engine, snippet=msg, relation="entails" if is_valid else "contradicts", retrieval_score=1.0, entailment_score=grounding)
        diagnostics = {"semanticEntropyProbe": self.sep.score(), "semanticEntropy": semantic_score, "kernelLanguageEntropy": kernel_score, "retrievalGroundedEntailment": grounding, "retrievalScore": 1.0, "agentAttempts": 1.0}
        return Claim(id=f"clm_{index}", text=text, trust=round(trust, 3), verdict=verdict(trust), evidence=[evidence], diagnostics=diagnostics)
