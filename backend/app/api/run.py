import os
import shutil
import time
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter

from app.agent.graph import run_pipeline
from app.models import RunRequest, RunResponse
from app.services.repo_service import clone_and_create_branch, create_branch_name
from app.utils.result_builder import build_run_response

router = APIRouter()

RETRY_LIMIT = int(os.environ.get("RETRY_LIMIT", "5"))


@router.post("/run", response_model=RunResponse)
def run_agent(request: RunRequest) -> RunResponse:
    """
    Trigger agent pipeline synchronously.
    Returns results.json structure (judge-critical, always non-empty).
    Retries up to RETRY_LIMIT times until tests pass.
    """
    repo_path: Path | None = None
    start_time = time.perf_counter()

    try:
        # 1. Clone and create branch (use per-request token if provided)
        repo_path, branch_name = clone_and_create_branch(
            request.repo_url,
            request.team_name,
            request.team_leader_name,
            token_override=request.github_token,
        )
        repo_path = Path(repo_path)

        # 2. Build initial state
        state = {
            "repo_path": str(repo_path),
            "repo_url": request.repo_url,
            "team_name": request.team_name,
            "team_leader_name": request.team_leader_name,
            "branch_name": branch_name,
            "failures": [],
            "fixes": [],
            "commits": [],
            "retry_limit": RETRY_LIMIT,
        }

        # 3. Retry loop: run pipeline until PASSED or limit reached
        ci_timeline: list[dict] = []
        iteration = 1
        while iteration <= RETRY_LIMIT:
            state = run_pipeline(state)
            exit_code = state.get("test_exit_code", 1)
            ci_status = "PASSED" if exit_code == 0 else "FAILED"
            ci_timeline.append({
                "iteration": iteration,
                "status": ci_status,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            if exit_code == 0:
                break
            iteration += 1

        # 6. Build fixes from state fixes (have description) + commits (have commit_message, status)
        commits = state.get("commits", []) or []
        state_fixes = state.get("fixes", []) or []
        commit_by_key = {(c.get("file"), c.get("line_number")): c for c in commits}

        fixes_for_response = []
        for f in state_fixes:
            key = (f.get("file", ""), f.get("line"))
            c = commit_by_key.get(key)
            commit_msg = (c.get("message", "") if c else "") or f"[AI-AGENT] Fix {f.get('bug_type', 'LOGIC')} error in {f.get('file', '')} line {f.get('line', '?')}"
            status = "Fixed" if c else "Failed"
            fixes_for_response.append({
                "file": f.get("file", ""),
                "bug_type": f.get("bug_type", "LOGIC"),
                "line_number": f.get("line"),
                "commit_message": commit_msg,
                "description": f.get("description"),
                "status": status,
            })

        total_time_seconds = time.perf_counter() - start_time
        total_failures = len(state.get("failures", []) or [])
        total_fixes_applied = len(fixes_for_response)

        push_errors = state.get("push_errors", []) or []
        error_msg = "; ".join(push_errors) if push_errors else None
        if error_msg and ("403" in error_msg or "unable to access" in error_msg.lower()):
            error_msg += " To push to your repos, add your GitHub Personal Access Token in the form (deployed) or set GITHUB_TOKEN in backend/.env (local). See README."

        response = build_run_response(
            repo_url=request.repo_url,
            team_name=request.team_name,
            team_leader_name=request.team_leader_name,
            branch_name=branch_name,
            total_failures=total_failures,
            total_fixes_applied=total_fixes_applied,
            ci_status=ci_status,
            total_time_seconds=total_time_seconds,
            fixes=fixes_for_response,
            ci_timeline=ci_timeline,
            retry_limit=RETRY_LIMIT,
            error=error_msg,
        )

        # Write results.json to workspace (judge requirement)
        results_path = Path(__file__).resolve().parent.parent.parent / "results.json"
        try:
            results_path.write_text(response.model_dump_json(indent=2), encoding="utf-8")
        except OSError:
            pass  # Non-fatal

        return response

    except Exception as e:
        total_time_seconds = time.perf_counter() - start_time
        branch_name = create_branch_name(request.team_name, request.team_leader_name)
        ci_timeline = [
            {"iteration": 1, "status": "FAILED", "timestamp": datetime.now(timezone.utc).isoformat()},
        ]
        return build_run_response(
            repo_url=request.repo_url,
            team_name=request.team_name,
            team_leader_name=request.team_leader_name,
            branch_name=branch_name,
            total_failures=0,
            total_fixes_applied=0,
            ci_status="FAILED",
            total_time_seconds=total_time_seconds,
            fixes=[],
            ci_timeline=ci_timeline,
            retry_limit=RETRY_LIMIT,
            error=str(e),
        )
    finally:
        if repo_path is not None and Path(repo_path).exists():
            try:
                shutil.rmtree(repo_path)
            except OSError:
                pass
