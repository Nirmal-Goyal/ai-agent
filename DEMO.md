# Demo Safety Rules

## Known Failing Repo

Use one known failing Python repo for demos. Example:

- **Repo**: A public GitHub repo with known pytest failures (e.g. simple bugs: unused import, AssertionError)
- **Never live-debug** during the demo

## What to Show

1. **Dashboard** – All 5 sections populated from backend JSON:
   - Run Info (repo, team, branch)
   - Status & Metrics (CI status, failures, fixes, time)
   - Score (base, speed, penalty, total)
   - Fixes Applied (file, line, commit message)
   - CI Timeline (iterations)

2. **GitHub Branch** – After run, show the created branch:
   - Format: `TEAM_NAME_LEADER_NAME_AI_Fix` (e.g. `CODECREW_NIRMAL_GOYAL_AI_Fix`)

3. **Commit Message** – Each fix has its own commit:
   - Format: `[AI-AGENT] Fix <BUG_TYPE> error in <file> line <line>`

## Explaining Iteration (Conceptually)

- **Iteration 1**: Agent runs tests, detects failures.
- **Iteration 2**: Agent applies fixes, re-runs tests. If passing, done.
- Keep it high-level; avoid technical details.
