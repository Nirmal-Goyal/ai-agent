import subprocess
from pathlib import Path


def run_pytest(repo_path: Path) -> tuple[int, str, str]:
    """
    Run pytest in repo directory.
    Returns (exit_code, stdout, stderr).
    """
    result = subprocess.run(
        ["pytest", "-v", "--tb=short"],
        cwd=repo_path,
        capture_output=True,
        text=True,
        timeout=120,
    )
    return result.returncode, result.stdout, result.stderr
