import re
from datetime import datetime, timezone
from typing import Any

from app.agent.state import AgentState, FailureInfo
from app.services.test_runner import run_pytest, run_syntax_check

# Hardcoded pattern -> bug type mappings
PATTERN_TO_BUG_TYPE = {
    "unused import": "LINTING",
    "SyntaxError": "SYNTAX",
    "invalid syntax": "SYNTAX",
    "missing ':'": "SYNTAX",
    "expected ':'": "SYNTAX",
    "IndentationError": "INDENTATION",
    "ModuleNotFoundError": "IMPORT",
    "AssertionError": "LOGIC",
    "TypeError": "TYPE_ERROR",
}


def detect_bug_type(error_message: str) -> str | None:
    """Detect bug type from error message. Returns None if unknown."""
    msg_lower = error_message.lower()
    for pattern, bug_type in PATTERN_TO_BUG_TYPE.items():
        if pattern.lower() in msg_lower:
            return bug_type
    return None


def extract_file_and_line(text: str) -> tuple[str | None, int | None]:
    """Extract file path and line number from pytest/traceback output."""
    # Match: File "path/to/file.py", line 123 (traceback format)
    m = re.search(r'File\s+"([^"]+\.py)"[^,]*,\s*line\s+(\d+)', text)
    if m:
        return m.group(1).strip(), int(m.group(2))
    # Match: FAILED path/to/file.py::test_name or path/to/file.py:123
    m = re.search(r"(?:FAILED\s+)?([a-zA-Z0-9_/\\\.\-]+\.py)(?::(\d+))?(?:::|$)", text)
    if m:
        return m.group(1).strip(), int(m.group(2)) if m.group(2) else None
    return None, None


def to_repo_relative_path(full_path: str, repo_path: str) -> str:
    """Convert absolute path to repo-relative (e.g. src/validator.py)."""
    from pathlib import Path
    full = Path(full_path)
    repo = Path(repo_path)
    try:
        return str(full.relative_to(repo)).replace("\\", "/")
    except ValueError:
        # Path not under repo - extract last meaningful part (e.g. src/validator.py)
        parts = full.parts
        for i in range(len(parts) - 1, -1, -1):
            if parts[i] in ("src", "tests") and i + 1 < len(parts):
                return "/".join(parts[i:]).replace("\\", "/")
        return full_path.replace("\\", "/")


def parse_pytest_failures(test_output: str, repo_path: str = "") -> list[FailureInfo]:
    """
    Parse pytest output to extract failures with known bug types only.
    Handles both FAILED tests and ERROR during collection (e.g. SyntaxError).
    Returns list of {file, line, bug_type}.
    """
    failures: list[FailureInfo] = []
    lines = test_output.split("\n")

    # Pass 1: Find all "File \"path\" line N" lines (traceback format - most reliable for collection errors)
    for i, line in enumerate(lines):
        if 'File "' in line and ", line " in line:
            file_path, line_num = extract_file_and_line(line)
            if file_path:
                block = " ".join(lines[max(0, i - 3) : min(len(lines), i + 6)])
                bug_type = detect_bug_type(block)
                if bug_type:
                    rel_path = to_repo_relative_path(file_path, repo_path) if repo_path else file_path
                    failures.append(
                        FailureInfo(file=rel_path, line=line_num, bug_type=bug_type, error_snippet=block)
                    )

    # Pass 2: FAILED test lines (if no traceback-style matches)
    if not failures:
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            if "FAILED" in line_stripped:
                file_path, line_num = extract_file_and_line(line_stripped)
                if not file_path and i + 1 < len(lines):
                    file_path, line_num = extract_file_and_line(lines[i + 1])
                if file_path:
                    block = " ".join(lines[max(0, i - 2) : i + 5])
                    bug_type = detect_bug_type(block)
                    if bug_type:
                        rel_path = to_repo_relative_path(file_path, repo_path) if repo_path else file_path
                        failures.append(
                            FailureInfo(file=rel_path, line=line_num, bug_type=bug_type, error_snippet=block)
                        )

    # Deduplicate by (file, line) - keep first occurrence
    seen: set[tuple[str, int | None]] = set()
    unique: list[FailureInfo] = []
    for f in failures:
        key = (f["file"], f.get("line"))
        if key not in seen:
            seen.add(key)
            unique.append(f)

    return unique


def _syntax_failures_to_failure_info(
    syntax_failures: list[tuple[str, int | None, str]]
) -> list[FailureInfo]:
    """Convert syntax check results to FailureInfo with bug type detection."""
    result: list[FailureInfo] = []
    for file_path, line, error_msg in syntax_failures:
        bug_type = detect_bug_type(error_msg) or "SYNTAX"
        result.append(
            FailureInfo(file=file_path, line=line, bug_type=bug_type, error_snippet=error_msg)
        )
    return result


def analyzer_node(state: AgentState) -> dict[str, Any]:
    """
    Run syntax check on all .py files (catches errors in code tests never import),
    then run pytest. Failures from either step are merged.
    """
    repo_path = state.get("repo_path", "")
    if not repo_path:
        return {"failures": [], "errors": []}

    from pathlib import Path

    path = Path(repo_path)
    failures: list[FailureInfo] = []
    exit_code = 0
    test_output = ""

    # 1. Syntax check: catches SyntaxError/IndentationError in files tests never import
    syn_exit, syn_out, syn_failures = run_syntax_check(path)
    if syn_failures:
        failures.extend(_syntax_failures_to_failure_info(syn_failures))
        exit_code = 1
        test_output = syn_out

    # 2. Pytest: only run if syntax check passed (otherwise collection may fail redundantly)
    if exit_code == 0:
        exit_code, stdout, stderr = run_pytest(path)
        test_output = stdout + "\n" + stderr
        failures = parse_pytest_failures(test_output, repo_path)

    status = "PASSED" if exit_code == 0 else "FAILED"
    ci_timeline = [
        {"iteration": 1, "status": status, "timestamp": datetime.now(timezone.utc).isoformat()}
    ]

    return {
        "test_output": test_output,
        "test_stdout": test_output.split("\n\n")[0] if test_output else "",
        "test_stderr": "",
        "test_exit_code": exit_code,
        "failures": failures,
        "ci_timeline": ci_timeline,
    }
