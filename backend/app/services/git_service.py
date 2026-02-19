from pathlib import Path

from git import Repo

PREFIX = "[AI-AGENT]"


def ensure_prefix(message: str) -> str:
    """Ensure commit message starts with [AI-AGENT]."""
    if not message.strip().startswith(PREFIX):
        return f"{PREFIX} {message.strip()}"
    return message.strip()


def commit(repo_path: Path, message: str) -> str | None:
    """
    Stage all changes and commit with [AI-AGENT] prefix.
    Returns commit sha or None if nothing to commit.
    """
    repo = Repo(repo_path)
    if repo.is_dirty() or repo.untracked_files:
        repo.git.add(A=True)
        msg = ensure_prefix(message)
        repo.index.commit(msg)
        return repo.head.commit.hexsha
    return None


def commit_file(repo_path: Path, file_path: str, message: str) -> str | None:
    """
    Stage single file and commit. For per-fix commits.
    Returns commit sha or None if nothing to commit.
    """
    repo = Repo(repo_path)
    full = repo_path / file_path
    if not full.exists():
        return None
    repo.git.add(file_path)
    staged = repo.index.diff("HEAD")
    if not staged:
        return None
    msg = ensure_prefix(message)
    repo.index.commit(msg)
    return repo.head.commit.hexsha


def push(repo_path: Path, branch_name: str) -> None:
    """Push branch to origin. Never push to main."""
    if branch_name.lower() in ("main", "master"):
        raise ValueError("Cannot push to main/master")
    repo = Repo(repo_path)
    origin = repo.remotes.origin
    origin.push(branch_name)
