from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any

from app.retrieval import HybridRetriever

app = FastAPI(title="Retrieval Service")
retriever = HybridRetriever()

class RetrieveRequest(BaseModel):
    query: str

@app.post("/retrieve")
def retrieve(req: RetrieveRequest):
    passages = retriever.retrieve(req.query)
    # Convert dataclasses to dicts
    return {
        "passages": [{"text": p.text, "source": p.source, "score": p.score} for p in passages],
        "backend": retriever.backend
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
