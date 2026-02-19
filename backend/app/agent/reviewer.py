import re
from typing import Any

from app.agent.state import AgentState, FixInfo

# Exact format for dashboard output
DESCRIPTION_FORMAT = "{bug_type} error in {file} line {line} → Fix: {description}"

# Deterministic short descriptions per bug type
BUG_TYPE_DESCRIPTIONS = {
    "LINTING": "remove the import statement",
    "SYNTAX": "add the colon at the correct position",
    "INDENTATION": "fix indentation",
    "IMPORT": "fix module import",
    "LOGIC": "fix assertion",
    "TYPE_ERROR": "fix type error",
}


def _rewrite_description(fix: FixInfo) -> str:
    """Rewrite fix description to match exact dashboard format deterministically."""
    file_path = fix.get("file", "")
    line = fix.get("line")
    bug_type = fix.get("bug_type", "LOGIC")
    desc = fix.get("description", "applied")
    # Use deterministic mapping if description is generic
    if desc in ("applied", "Fix applied", ""):
        desc = BUG_TYPE_DESCRIPTIONS.get(bug_type, "fix applied")

    line_str = str(line) if line is not None else "?"
    return DESCRIPTION_FORMAT.format(
        bug_type=bug_type,
        file=file_path,
        line=line_str,
        description=desc,
    )


def _matches_format(text: str) -> bool:
    """Check if text matches exact format: X error in Y line Z → Fix: W"""
    pattern = r"^[A-Z_]+ error in .+ line [\d?]+ → Fix: .+$"
    return bool(re.match(pattern, text))


def reviewer_node(state: AgentState) -> dict[str, Any]:
    """
    Format enforcer. Ensures dashboard output string matches EXACT format.
    Does NOT reason deeply. Rewrites descriptions deterministically if not matching.
    """
    fixes: list[FixInfo] = state.get("fixes", []) or []
    rewritten: list[FixInfo] = []

    for fix in fixes:
        desc = fix.get("description", "")
        if not _matches_format(desc):
            desc = _rewrite_description(fix)
        rewritten.append(
            FixInfo(
                file=fix.get("file", ""),
                line=fix.get("line"),
                bug_type=fix.get("bug_type", "LOGIC"),
                description=desc,
            )
        )

    return {"fixes": rewritten}
