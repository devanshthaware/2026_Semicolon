import uuid
from typing import List, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
from app.config import settings

# Lazy loading of models to avoid slow startups
_model = None
_qdrant = None

def get_model():
    global _model
    if _model is None:
        print(f"Loading embedding model: {settings.embedding_model}")
        _model = SentenceTransformer(settings.embedding_model)
    return _model

def get_qdrant():
    global _qdrant
    if _qdrant is None and settings.qdrant_url:
        _qdrant = QdrantClient(url=settings.qdrant_url)
        # Ensure collection exists
        try:
            _qdrant.get_collection(settings.qdrant_collection)
        except Exception:
            print(f"Creating Qdrant collection: {settings.qdrant_collection}")
            # all-MiniLM-L6-v2 size is 384. BGE is 1024. We'll use the loaded model's dimension.
            model = get_model()
            _qdrant.create_collection(
                collection_name=settings.qdrant_collection,
                vectors_config=VectorParams(size=model.get_sentence_embedding_dimension(), distance=Distance.COSINE),
            )
    return _qdrant

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

def ingest_document(document_id: str, text: str, source_name: str) -> List[Dict[str, Any]]:
    client = get_qdrant()
    if not client:
        raise ValueError("Qdrant URL is not configured.")
        
    model = get_model()
    chunks = chunk_text(text)
    
    if not chunks:
        return []
        
    embeddings = model.encode(chunks)
    points = []
    results = []
    
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        vector_id = str(uuid.uuid4())
        points.append(
            PointStruct(
                id=vector_id,
                vector=embedding.tolist(),
                payload={
                    "document_id": document_id,
                    "source": source_name,
                    "text": chunk,
                    "chunk_index": i
                }
            )
        )
        results.append({
            "vectorId": vector_id,
            "text": chunk,
        })
        
    client.upsert(
        collection_name=settings.qdrant_collection,
        points=points
    )
    
    return results
