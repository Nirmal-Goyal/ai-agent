import os
import re
import tempfile
import uuid
from pathlib import Path

from git import Repo


def _inject_token(repo_url: str, token: str) -> str:
    """Inject GITHUB_TOKEN into clone URL for push auth. https://github.com/... -> https://<token>@github.com/..."""
    if not token or not repo_url:
        return repo_url
    # Match https://github.com/... or https://user:pass@github.com/...
    m = re.match(r"(https?://)([^@/]*@)?(github\.com/.*)", repo_url, re.IGNORECASE)
    if m:
        return f"{m.group(1)}{token}@{m.group(3)}"
    return repo_url


def create_branch_name(team_name: str, team_leader_name: str) -> str:
    """Create branch name: TEAM_NAME_LEADER_NAME_AI_Fix (uppercase, spaces -> underscores)."""
    team = team_name.upper().replace(" ", "_")
    leader = team_leader_name.upper().replace(" ", "_")
    return f"{team}_{leader}_AI_Fix"


def clone_and_create_branch(
    repo_url: str, team_name: str, team_leader_name: str
) -> tuple[Path, str]:
    """
    Clone repo to temp dir, create fix branch from main/master.
    Returns (repo_path, branch_name).
    Never modifies main.
    """
    temp_dir = Path(tempfile.gettempdir()) / f"repo_{uuid.uuid4().hex[:8]}"
    temp_dir.mkdir(parents=True, exist_ok=True)

    token = os.environ.get("GITHUB_TOKEN", "").strip()
    clone_url = _inject_token(repo_url, token) if token else repo_url

    repo = Repo.clone_from(clone_url, temp_dir)

    # Determine default branch (main or master)
    try:
        default_branch = repo.active_branch.name
    except TypeError:
        default_branch = "main" if "main" in [h.name for h in repo.heads] else "master"

    # Create fix branch from default
    branch_name = create_branch_name(team_name, team_leader_name)
    repo.git.checkout("-b", branch_name)

    return temp_dir, branch_name
