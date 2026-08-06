from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    environment: str = os.getenv("ENVIRONMENT", "development")
    nli_backend: str = os.getenv("NLI_BACKEND", "lexical")
    nli_model: str = os.getenv("NLI_MODEL", "microsoft/deberta-v3-large-mnli")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    qdrant_url: str | None = os.getenv("QDRANT_URL")
    qdrant_collection: str = os.getenv("QDRANT_COLLECTION", "truthlayer-evidence")
    fusion_model_path: str | None = os.getenv("FUSION_MODEL_PATH")
    conformal_calibration_path: str | None = os.getenv("CONFORMAL_CALIBRATION_PATH")
    sep_probe_path: str | None = os.getenv("SEP_PROBE_PATH")


settings = Settings()
