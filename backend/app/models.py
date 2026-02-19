from pydantic import BaseModel


class RunRequest(BaseModel):
    repo_url: str
    team_name: str
    team_leader_name: str
    github_token: str | None = None  # Optional per-request token for push (deployed usage)


class FixResult(BaseModel):
    file: str
    bug_type: str
    line_number: int | None
    commit_message: str
    description: str | None = None  # Exact format: "X error in Y line Z → Fix: W"
    status: str = "Fixed"


class ScoreResult(BaseModel):
    base: int = 100
    speed_bonus: int = 0
    efficiency_penalty: int = 0
    total: int = 100


class CITimelineEntry(BaseModel):
    iteration: int
    status: str
    timestamp: str


class RunResponse(BaseModel):
    """results.json format - judge-critical."""
    repo_url: str
    team_name: str
    team_leader_name: str
    branch_name: str
    total_failures: int
    total_fixes_applied: int
    ci_status: str  # PASSED | FAILED
    total_time_seconds: float
    score: ScoreResult
    fixes: list[FixResult]
    ci_timeline: list[CITimelineEntry]
    retry_limit: int = 5
    error: str | None = None  # Set when exception occurs (clone, push, etc.)
