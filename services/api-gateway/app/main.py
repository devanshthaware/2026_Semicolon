import os
import json
import httpx
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from websockets.asyncio.client import connect as ws_connect
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
LANGGRAPH_WS_URL = os.getenv("LANGGRAPH_WS_URL", "ws://langgraph-runtime:8000")

@app.get("/v1/health/ollama")
async def ollama_health():
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{LANGGRAPH_URL}/v1/health/ollama", timeout=5.0)
            return res.json()
        except Exception as e:
            return {"status": "offline", "error": str(e)}

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
async def verify_stream(session_id: str, prompt: str = "", model: str = "", ablated: str = ""):
    async def proxy_stream():
        async with httpx.AsyncClient() as client:
            try:
                params = {"prompt": prompt}
                if model:
                    params["model"] = model
                if ablated:
                    params["ablated"] = ablated
                async with client.stream("GET", f"{LANGGRAPH_URL}/v1/verify/{session_id}/stream", params=params, timeout=None) as response:
                    if response.status_code != 200:
                        yield f"data: {{\"type\": \"error\", \"message\": \"Failed to connect to langgraph-runtime\"}}\n\n"
                        return
                    async for chunk in response.aiter_bytes():
                        yield chunk
            except Exception as e:
                yield f"data: {{\"type\": \"error\", \"message\": \"{str(e)}\"}}\n\n"
    
    return StreamingResponse(proxy_stream(), media_type="text/event-stream")

@app.websocket("/ws/verification/{session_id}")
async def websocket_proxy(websocket: WebSocket, session_id: str):
    await websocket.accept()
    target_url = f"{LANGGRAPH_WS_URL}/ws/verification/{session_id}"
    try:
        data = await websocket.receive_text()
        async with ws_connect(target_url) as target_ws:
            await target_ws.send(data)
            async for msg in target_ws:
                await websocket.send_text(msg)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_text(json.dumps({"type": "verification.error", "payload": {"message": str(e)}}))
    finally:
        try:
            await websocket.close()
        except Exception:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
