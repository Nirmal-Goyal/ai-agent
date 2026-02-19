import re
import py_compile
import subprocess
import sys
from pathlib import Path


def run_syntax_check(repo_path: Path) -> tuple[int, str, list[tuple[str, int | None, str]]]:
    """
    Compile all .py files in the repo to catch SyntaxError/IndentationError
    in code that tests never import. Returns (exit_code, output, [(file, line, error_msg), ...]).
    """
    skip_dirs = {"__pycache__", ".git", "venv", ".venv", "env", "node_modules"}
    failures: list[tuple[str, int | None, str]] = []
    output_lines: list[str] = []

    for py_file in repo_path.rglob("*.py"):
        if any(part in py_file.parts for part in skip_dirs):
            continue
        try:
            py_compile.compile(str(py_file), doraise=True)
        except py_compile.PyCompileError as e:
            try:
                rel = py_file.relative_to(repo_path)
            except ValueError:
                rel = py_file
            rel_str = str(rel).replace("\\", "/")
            line = getattr(e, "lineno", None)
            if line is None:
                m = re.search(r"line\s+(\d+)", str(e))
                line = int(m.group(1)) if m else None
            msg = str(e.msg) if hasattr(e, "msg") and e.msg else str(e)
            failures.append((rel_str, line, msg))
            output_lines.append(f"SyntaxError in {rel_str} line {line}: {msg}")

    output = "\n".join(output_lines) if output_lines else ""
    exit_code = 1 if failures else 0
    return exit_code, output, failures


def run_pytest(repo_path: Path) -> tuple[int, str, str]:
    """
    Run pytest in repo directory.
    Returns (exit_code, stdout, stderr).
    """
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "-v", "--tb=short"],
        cwd=repo_path,
        capture_output=True,
        text=True,
        timeout=120,
    )
    return result.returncode, result.stdout, result.stderr
