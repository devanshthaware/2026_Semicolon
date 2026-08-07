"""Bounded LangGraph orchestration; scoring stays in explicit engine modules."""
from typing import TypedDict
from langgraph.graph import END, StateGraph
from app.agents.evidence_agent import BoundedEvidenceAgent

class VerificationState(TypedDict, total=False):
    claim: str
    attempts: int
    evidence_score: float
    trace: list[dict]

def build_evidence_graph(agent: BoundedEvidenceAgent):
    def retrieve(state: VerificationState):
        result = agent.retrieve(state["claim"])
        return {"attempts": len(result.trace), "evidence_score": result.passages[0].score if result.passages else 0.0, "trace": [item.__dict__ for item in result.trace]}
    graph = StateGraph(VerificationState)
    graph.add_node("retrieve", retrieve)
    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", END)
    return graph.compile()
