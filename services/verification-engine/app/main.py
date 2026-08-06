from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.pipeline import VerificationPipeline
from app.schemas import VerifyRequest, VerifyResult
from app.ingestion import ingest_document

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

class IngestRequest(BaseModel):
    document_id: str
    text: str
    source_name: str

@app.post("/v1/ingest")
async def ingest(request: IngestRequest):
    try:
        results = ingest_document(request.document_id, request.text, request.source_name)
        return {"chunks": len(results), "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
