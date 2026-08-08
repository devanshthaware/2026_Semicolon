import os
import json
import asyncio
from typing import Optional, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.ollama_service import OllamaService
from app.graph.verification_graph import RealtimeVerificationEngine, VerificationState

app = FastAPI(title="LangGraph Runtime")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ollama_service = OllamaService()
realtime_engine = RealtimeVerificationEngine()

class VerifyRequestPayload(BaseModel):
    prompt: str
    response: Optional[str] = None
    model: Optional[str] = None
    ablated_layers: Optional[List[str]] = None
    mode: Optional[str] = "standard"

@app.get("/v1/health/ollama")
async def get_ollama_health():
    return await ollama_service.health_check()

@app.post("/v1/verify")
async def verify(req: VerifyRequestPayload):
    session_id = f"sess_{os.urandom(6).hex()}"
    state = await realtime_engine.execute_realtime_workflow(
        session_id=session_id,
        prompt=req.prompt,
        ablated_layers=req.ablated_layers,
        model=req.model
    )
    return state

@app.get("/v1/verify/{session_id}/stream")
async def verify_stream_route(
    session_id: str,
    prompt: str = "",
    model: Optional[str] = None,
    ablated: Optional[str] = None
):
    ablated_list = ablated.split(",") if ablated else []

    async def sse_event_generator():
        queue = asyncio.Queue()

        async def callback(event: dict):
            await queue.put(event)

        # Run workflow in task
        task = asyncio.create_task(
            realtime_engine.execute_realtime_workflow(
                session_id=session_id,
                prompt=prompt,
                ablated_layers=ablated_list,
                model=model,
                event_callback=callback
            )
        )

        while not task.done() or not queue.empty():
            try:
                event = await asyncio.wait_for(queue.get(), timeout=0.1)
                yield f"data: {json.dumps(event)}\n\n"
            except asyncio.TimeoutError:
                await asyncio.sleep(0.01)

        # Ensure task exception is raised if any
        if task.exception():
            err_msg = str(task.exception())
            yield f"data: {json.dumps({'type': 'verification.error', 'session_id': session_id, 'payload': {'message': err_msg}})}\n\n"

    return StreamingResponse(sse_event_generator(), media_type="text/event-stream")

@app.websocket("/ws/verification/{session_id}")
async def websocket_verification_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        data = await websocket.receive_text()
        params = json.loads(data) if data else {}
        prompt = params.get("prompt", "")
        model = params.get("model")
        ablated_layers = params.get("ablated_layers", [])

        async def ws_callback(event: dict):
            await websocket.send_text(json.dumps(event))

        await realtime_engine.execute_realtime_workflow(
            session_id=session_id,
            prompt=prompt,
            ablated_layers=ablated_layers,
            model=model,
            event_callback=ws_callback
        )
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_text(json.dumps({
            "type": "verification.error",
            "session_id": session_id,
            "payload": {"message": str(e)}
        }))
    finally:
        try:
            await websocket.close()
        except Exception:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
