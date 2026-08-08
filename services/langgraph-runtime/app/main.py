import os
from fastapi import FastAPI
from app.pipeline import VerificationPipeline
from app.schemas import VerifyRequest

app = FastAPI(title="LangGraph Runtime")

# Initialize the pipeline (which now connects to remote model and retrieval services)
pipeline = VerificationPipeline()

from fastapi.responses import StreamingResponse

@app.post("/v1/verify")
async def verify(req: VerifyRequest):
    return await pipeline.verify(req)

@app.get("/v1/verify/{session_id}/stream")
async def verify_stream_route(session_id: str, prompt: str = ""):
    req = VerifyRequest(response=prompt, mode="standard")
    return StreamingResponse(pipeline.verify_stream(req), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
