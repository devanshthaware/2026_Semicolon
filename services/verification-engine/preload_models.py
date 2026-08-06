import os
from sentence_transformers import SentenceTransformer
from transformers import pipeline

embedding_model = os.getenv("EMBEDDING_MODEL", "BAAI/bge-large-en-v1.5")
nli_model = os.getenv("NLI_MODEL", "MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli")

print(f"Preloading embedding model: {embedding_model}")
SentenceTransformer(embedding_model)

print(f"Preloading NLI model: {nli_model}")
pipeline("text-classification", model=nli_model, tokenizer=nli_model)

print("Preload complete!")
