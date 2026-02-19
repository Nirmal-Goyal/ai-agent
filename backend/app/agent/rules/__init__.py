"""Rule-based fix dispatcher. No LLM at runtime."""

from pathlib import Path

from app.agent.state import FailureInfo
from app.agent.rules.fixers import FIXERS


def apply_rule_fix(failure: FailureInfo, repo_path: Path) -> bool:
    """
    Apply rule-based fix for a single failure.
    Returns True if fix was applied, False otherwise.
    """
    file_path = failure.get("file", "")
    line = failure.get("line")
    bug_type = failure.get("bug_type", "LOGIC")
    full_path = repo_path / file_path

    fixer = FIXERS.get(bug_type)
    if not fixer:
        return False

    if bug_type == "IMPORT":
        error_snippet = failure.get("error_snippet", "")
        return fixer(file_path, line, full_path, error_snippet)
    return fixer(file_path, line, full_path)
