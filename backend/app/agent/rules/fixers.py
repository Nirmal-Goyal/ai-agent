"""Rule-based fixers for each bug type. No LLM at runtime."""

import re
import subprocess
from pathlib import Path
from typing import Callable

# Keywords that require a trailing colon
COLON_KEYWORDS = ("def", "class", "if", "else", "elif", "for", "while", "try", "except", "finally", "with")


def fix_linting(file_path: str, line: int | None, full_path: Path) -> bool:
    """Remove the unused import line at line."""
    if not line or not full_path.exists():
        return False
    try:
        lines = full_path.read_text(encoding="utf-8").splitlines()
        if line < 1 or line > len(lines):
            return False
        # Remove line (1-based index -> 0-based)
        del lines[line - 1]
        full_path.write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")
        return True
    except Exception:
        return False


def fix_syntax(file_path: str, line: int | None, full_path: Path) -> bool:
    """Add missing ':' after def/class/if/for/while/try/elif/except."""
    if not line or not full_path.exists():
        return False
    try:
        lines = full_path.read_text(encoding="utf-8").splitlines()
        if line < 1 or line > len(lines):
            return False
        idx = line - 1
        content = lines[idx]
        stripped = content.strip()
        # Already has colon
        if stripped.rstrip().endswith(":"):
            return False
        # Check if line starts with a colon-requiring keyword
        for kw in COLON_KEYWORDS:
            if stripped.startswith(kw + " ") or stripped == kw or stripped.startswith(kw + "("):
                # Add colon at end (remove trailing whitespace, add colon)
                lines[idx] = content.rstrip() + ":"
                full_path.write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")
                return True
        return False
    except Exception:
        return False


def fix_indentation(file_path: str, line: int | None, full_path: Path) -> bool:
    """Fix indentation of the offending line to match expected block level (4 spaces per level)."""
    if not line or not full_path.exists():
        return False
    try:
        lines = full_path.read_text(encoding="utf-8").splitlines()
        if line < 1 or line > len(lines):
            return False
        idx = line - 1
        content = lines[idx]
        stripped = content.strip()
        if not stripped:
            return False
        # Find previous non-empty line to determine expected indent
        prev_idx = idx - 1
        while prev_idx >= 0 and not lines[prev_idx].strip():
            prev_idx -= 1
        if prev_idx < 0:
            # First line - no indent
            expected_indent = 0
        else:
            prev = lines[prev_idx]
            prev_stripped = prev.strip()
            # If previous line ends with colon, we're inside a block - add 4 spaces
            if prev_stripped.rstrip().endswith(":"):
                prev_indent = len(prev) - len(prev.lstrip())
                expected_indent = prev_indent + 4
            else:
                prev_indent = len(prev) - len(prev.lstrip())
                expected_indent = prev_indent
        lines[idx] = " " * expected_indent + stripped
        full_path.write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")
        return True
    except Exception:
        return False


def fix_import(file_path: str, line: int | None, full_path: Path, error_snippet: str = "") -> bool:
    """Try pip install for missing module from ModuleNotFoundError. Else skip."""
    if not full_path.exists():
        return False
    # Parse "No module named 'X'" or "No module named \"X\""
    m = re.search(r"No module named ['\"]([a-zA-Z0-9_-]+)['\"]", error_snippet or "")
    if not m:
        return False
    module = m.group(1)
    # Only allow simple alphanumeric module names (no path traversal)
    if not re.match(r"^[a-zA-Z0-9_-]+$", module):
        return False
    try:
        subprocess.run(
            ["pip", "install", module],
            cwd=full_path.parent,
            capture_output=True,
            text=True,
            timeout=60,
        )
        return True
    except Exception:
        return False


def fix_logic(file_path: str, line: int | None, full_path: Path) -> bool:
    """Skip - rule-based cannot fix logic errors."""
    return False


def fix_type_error(file_path: str, line: int | None, full_path: Path) -> bool:
    """Skip - rule-based cannot fix type errors."""
    return False


FIXERS: dict[str, Callable[..., bool]] = {
    "LINTING": fix_linting,
    "SYNTAX": fix_syntax,
    "INDENTATION": fix_indentation,
    "IMPORT": fix_import,
    "LOGIC": fix_logic,
    "TYPE_ERROR": fix_type_error,
}
