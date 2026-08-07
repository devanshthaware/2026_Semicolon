import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas import VerifyRequest

app = FastAPI(title="API Gateway")

LANGGRAPH_URL = os.getenv("LANGGRAPH_URL", "http://langgraph-runtime:8000")

@app.post("/v1/verify")
async def verify(req: VerifyRequest):
    # In a full LangGraph setup this might trigger a redis pub/sub event.
    # For simplicity, we forward the HTTP request to the runtime.
    try:
        response = requests.post(f"{LANGGRAPH_URL}/v1/verify", json=req.model_dump())
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
