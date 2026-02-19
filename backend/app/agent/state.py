from typing import TypedDict

try:
    from typing import NotRequired
except ImportError:
    from typing_extensions import NotRequired


# Bug types from hardcoded pattern mappings
BUG_TYPES = ("LINTING", "SYNTAX", "INDENTATION", "IMPORT", "LOGIC", "TYPE_ERROR")


class FailureInfo(TypedDict):
    file: str
    line: int | None
    bug_type: str
    error_snippet: NotRequired[str]


class FixInfo(TypedDict):
    file: str
    line: int | None
    bug_type: str
    description: str  # After Reviewer: "{BUG_TYPE} error in {file} line {line} → Fix: {description}"


class AgentState(TypedDict, total=False):
    repo_path: str
    repo_url: str
    team_name: str
    team_leader_name: str
    branch_name: str
    test_output: str
    test_exit_code: int
    test_stdout: str
    test_stderr: str
    failures: list[FailureInfo]
    fixes: list[FixInfo]
    commits: list[dict]
    errors: list[str]
    push_errors: list[str]  # Push failures to surface to user
    ci_timeline: list[dict]  # [{iteration, status, timestamp}]
    retry_limit: int
