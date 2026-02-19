from pathlib import Path
from typing import Any

from app.agent.state import AgentState
from app.services.git_service import commit_file, push


def commit_node(state: AgentState) -> dict[str, Any]:
    """
    Per-fix commit and push. Never batch.
    For each fix: git add <file>, git commit -m "[AI-AGENT] Fix <BUG_TYPE> error in <file> line <line>", git push.
    """
    repo_path = state.get("repo_path", "")
    branch_name = state.get("branch_name", "")
    fixes: list[dict] = state.get("fixes", []) or []
    commits_list: list[dict] = state.get("commits", []) or []

    if not repo_path or not fixes or not branch_name:
        return {"commits": commits_list}

    if branch_name.lower() in ("main", "master"):
        return {"commits": commits_list}

    path = Path(repo_path)
    push_errors: list[str] = list(state.get("push_errors", []) or [])

    for fix in fixes:
        file_path = fix.get("file", "")
        bug_type = fix.get("bug_type", "LOGIC")
        line = fix.get("line")
        line_str = str(line) if line is not None else "0"

        msg = f"[AI-AGENT] Fix {bug_type} error in {file_path} line {line_str}"
        sha = commit_file(path, file_path, msg)
        if sha:
            try:
                push(path, branch_name)
                commits_list.append({
                    "message": msg,
                    "sha": sha,
                    "file": file_path,
                    "bug_type": bug_type,
                    "line_number": line,
                })
            except Exception as e:
                push_errors.append(f"Push failed for {file_path}: {e}")

    return {"commits": commits_list, "push_errors": push_errors}
