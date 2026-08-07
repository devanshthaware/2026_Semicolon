import os
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, List, Optional, Any

from app.nli import EntailmentModel
from app.fusion import FusionModel
from app.conformal import ConformalCalibrator
from app.signals.sep import SemanticEntropyProbe
from app.classifier import ClaimClassifier

app = FastAPI(title="Model Service")

nli_model = EntailmentModel()
fusion_model = FusionModel()
conformal_model = ConformalCalibrator()
sep_probe = SemanticEntropyProbe()
classifier = ClaimClassifier()

class AssessRequest(BaseModel):
    claim: str
    evidence: str
    retrieval_score: float

class PredictRequest(BaseModel):
    features: Dict[str, Optional[float]]

class ClaimRequest(BaseModel):
    claim: str

@app.post("/nli")
def assess_nli(req: AssessRequest):
    res = nli_model.assess(req.claim, req.evidence, req.retrieval_score)
    return {"relation": res.relation, "confidence": res.confidence}

@app.post("/fusion")
def predict_fusion(req: PredictRequest):
    return {"score": fusion_model.predict(req.features), "backend": fusion_model.backend}

@app.get("/conformal")
def get_conformal(probability: float):
    return {"interval": conformal_model.interval(probability), "calibrated": conformal_model.calibrated}

@app.get("/sep")
def get_sep():
    return {"score": sep_probe.score(), "available": sep_probe.available}

@app.post("/claim_type")
def get_claim_type(req: ClaimRequest):
    return {"type": classifier.classify(req.claim)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
