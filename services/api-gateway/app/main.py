import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import VerifyRequest

app = FastAPI(title="API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LANGGRAPH_URL = os.getenv("LANGGRAPH_URL", "http://langgraph-runtime:8000")

@app.post("/v1/verify")
async def verify(req: VerifyRequest):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{LANGGRAPH_URL}/v1/verify", json=req.model_dump(), timeout=120.0)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/v1/verify/{session_id}/stream")
async def verify_stream(session_id: str, prompt: str = ""):
    # Proxy the SSE stream from langgraph-runtime
    async def proxy_stream():
        async with httpx.AsyncClient() as client:
            try:
                async with client.stream("GET", f"{LANGGRAPH_URL}/v1/verify/{session_id}/stream", params={"prompt": prompt}, timeout=None) as response:
                    if response.status_code != 200:
                        yield f"data: {{\"type\": \"error\", \"message\": \"Failed to connect to langgraph-runtime\"}}\n\n"
                        return
                    async for chunk in response.aiter_bytes():
                        yield chunk
            except Exception as e:
                yield f"data: {{\"type\": \"error\", \"message\": \"{str(e)}\"}}\n\n"
    
    return StreamingResponse(proxy_stream(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
