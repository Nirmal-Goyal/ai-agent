from pathlib import Path
from typing import Any

from app.agent.state import AgentState, FailureInfo, FixInfo, BUG_TYPES
from app.agent.rules import apply_rule_fix


def fixer_node(state: AgentState) -> dict[str, Any]:
    """Apply rule-based fixes for known bug types. No LLM at runtime."""
    repo_path = Path(state.get("repo_path", ""))
    failures: list[FailureInfo] = state.get("failures", [])
    fixes: list[FixInfo] = state.get("fixes", []) or []

    if not failures:
        return {"fixes": fixes}

    known_failures = [f for f in failures if f.get("bug_type") in BUG_TYPES]
    if not known_failures:
        return {"fixes": fixes}

    # Apply fixes in reverse line order (high to low) to avoid line-number shift when removing lines
    sorted_failures = sorted(
        known_failures,
        key=lambda f: (f.get("file", ""), -(f.get("line") or 0)),
    )

    applied: list[FixInfo] = list(fixes)
    for failure in sorted_failures:
        file_path = failure.get("file", "")
        line = failure.get("line")
        bug_type = failure.get("bug_type", "LOGIC")
        full_path = repo_path / file_path

        if not full_path.exists():
            continue

        if apply_rule_fix(failure, repo_path):
            applied.append(
                FixInfo(
                    file=file_path,
                    line=line,
                    bug_type=bug_type,
                    description="applied",
                )
            )

    return {"fixes": applied}
