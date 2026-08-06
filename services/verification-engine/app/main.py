from fastapi import FastAPI, HTTPException

from app.pipeline import VerificationPipeline
from app.schemas import VerifyRequest, VerifyResult

app = FastAPI(title="TruthLayer Verification Engine", version="0.2.0")
pipeline = VerificationPipeline()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "truthlayer-verification-engine"}


@app.post("/v1/verify", response_model=VerifyResult)
async def verify(request: VerifyRequest) -> VerifyResult:
    if not request.response.strip():
        raise HTTPException(status_code=400, detail="response is required")
    return await pipeline.verify(request)
