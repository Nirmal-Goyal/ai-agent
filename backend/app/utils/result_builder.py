from datetime import datetime, timezone

from app.models import RunResponse, FixResult, ScoreResult, CITimelineEntry


def _compute_score(
    ci_status: str, total_time_seconds: float, total_commits: int
) -> ScoreResult:
    """Compute score: base 100, speed_bonus if < 5 min, efficiency_penalty -2 per commit over 20."""
    base = 100
    speed_bonus = 10 if ci_status == "PASSED" and total_time_seconds < 300 else 0
    efficiency_penalty = max(0, total_commits - 20) * 2
    total = base + speed_bonus - efficiency_penalty
    return ScoreResult(
        base=base,
        speed_bonus=speed_bonus,
        efficiency_penalty=efficiency_penalty,
        total=max(0, total),
    )


def build_run_response(
    repo_url: str,
    team_name: str,
    team_leader_name: str,
    branch_name: str,
    total_failures: int,
    total_fixes_applied: int,
    ci_status: str,
    total_time_seconds: float,
    fixes: list[dict],
    ci_timeline: list[dict],
    retry_limit: int = 5,
    error: str | None = None,
) -> RunResponse:
    """Build RunResponse matching results.json format. Always non-empty."""
    total_commits = len(fixes)
    score = _compute_score(ci_status, total_time_seconds, total_commits)
    fix_results = [
        FixResult(
            file=f.get("file", ""),
            bug_type=f.get("bug_type", "LOGIC"),
            line_number=f.get("line") or f.get("line_number"),
            commit_message=f.get("commit_message", f.get("message", "")),
            description=f.get("description"),
            status=f.get("status", "Fixed"),
        )
        for f in fixes
    ]
    timeline = [
        CITimelineEntry(
            iteration=e.get("iteration", 0),
            status=e.get("status", "UNKNOWN"),
            timestamp=e.get("timestamp", ""),
        )
        for e in ci_timeline
    ]
    return RunResponse(
        repo_url=repo_url,
        team_name=team_name,
        team_leader_name=team_leader_name,
        branch_name=branch_name,
        total_failures=total_failures,
        total_fixes_applied=total_fixes_applied,
        ci_status=ci_status,
        total_time_seconds=round(total_time_seconds, 2),
        score=score,
        fixes=fix_results,
        ci_timeline=timeline,
        retry_limit=retry_limit,
        error=error,
    )
