from langgraph.graph import END, START, StateGraph

from app.agent.analyzer import analyzer_node
from app.agent.fixer import fixer_node
from app.agent.reviewer import reviewer_node
from app.agent.commit_node import commit_node
from app.agent.state import AgentState


def run_pipeline(state: AgentState) -> dict:
    """Build and run the linear LangGraph pipeline. No recursion, no loops."""
    builder = StateGraph(AgentState)

    builder.add_node("analyzer", analyzer_node)
    builder.add_node("fixer", fixer_node)
    builder.add_node("reviewer", reviewer_node)
    builder.add_node("commit", commit_node)

    builder.add_edge(START, "analyzer")
    builder.add_edge("analyzer", "fixer")
    builder.add_edge("fixer", "reviewer")
    builder.add_edge("reviewer", "commit")
    builder.add_edge("commit", END)

    graph = builder.compile()
    final_state = graph.invoke(state)
    return dict(final_state)
