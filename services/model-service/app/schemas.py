from typing import Literal
from pydantic import BaseModel, Field

Verdict = Literal["grounded", "review", "flagged"]
Relation = Literal["entails", "neutral", "contradicts"]


class Evidence(BaseModel):
    source: str
    snippet: str
    relation: Relation
    retrieval_score: float | None = None
    entailment_score: float | None = None


class Claim(BaseModel):
    id: str
    text: str
    trust: float = Field(ge=0, le=1)
    verdict: Verdict
    evidence: list[Evidence]
    diagnostics: dict[str, float | str | None] = {}


class VerifyRequest(BaseModel):
    input: str = ""
    response: str = Field(min_length=1)
    mode: Literal["standard", "strict"] = "standard"
    samples: list[str] | None = None


class VerifyResult(BaseModel):
    id: str
    trust: float
    verdict: Verdict
    claims: list[Claim]
    layers: dict[str, float]
    receipt: dict[str, str | float]
    diagnostics: dict[str, str | bool | float | None] = {}
