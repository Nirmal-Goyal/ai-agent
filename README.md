# CI/CD Healing Agent

Autonomous CI/CD healing agent that clones repos, runs pytest, detects failures, applies rule-based fixes, and pushes commits. Built for hackathon demos. No LLM or API key required at runtime.

## Supported Scope

- **Language**: Python only
- **Test framework**: pytest only
- **Repos**: Public GitHub repos
- **Fix scope**: Simple deterministic bugs only
- **Bug types** (hardcoded):
  - `LINTING` (unused import)
  - `SYNTAX` (SyntaxError, missing `:`)
  - `INDENTATION` (IndentationError)
  - `IMPORT` (ModuleNotFoundError)
  - `LOGIC` (AssertionError)
  - `TYPE_ERROR` (TypeError)

## Architecture

```mermaid
flowchart TB
    subgraph Frontend [Frontend]
        UI[React Dashboard]
    end

    subgraph Backend [Backend - FastAPI]
        API[POST /api/run]
    end

    subgraph Pipeline [LangGraph Pipeline]
        A[Analyzer]
        F[Fixer]
        R[Reviewer]
        C[Commit]
        A --> F --> R --> C
    end

    subgraph Services [Services]
        RS[repo_service]
        TR[test_runner]
        GS[git_service]
    end

    UI -->|"JSON only"| API
    API --> RS
    RS --> Pipeline
    Pipeline --> TR
    Pipeline --> GS
    API -->|results.json| UI
```

**Flow**: Clone → Create branch → Analyzer (run pytest, parse failures) → Fixer (rule-based fixes) → Reviewer (format) → Commit (per-fix commit + push) → Return results.json

## Quick Start

### Setup Checklist (Local)

- **Python 3.11+**, **Node 18+**
- `pip install -r backend/requirements.txt` (includes pytest)
- Create `backend/.env` with `GITHUB_TOKEN=ghp_...` — create a token at [GitHub Settings > Tokens](https://github.com/settings/tokens) with `repo` scope
- Start backend: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Start frontend: `cd frontend && npm install && npm run dev`
- Open http://localhost:5173

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Start from `backend/`:** Run `cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000`. You can also run from project root (`uvicorn app.main:app ...`); `.env` is loaded from `backend/.env` regardless of cwd.

**Verify config:** Open `http://localhost:8000/api/check` — confirm `llm_required: false` (no API key needed).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Docker (Backend)

```bash
cd backend
docker build -t cicd-healing-agent .
docker run -p 8000:8000 cicd-healing-agent
```

## Live URL & Demo

- **Backend**: `http://localhost:8000` (local)
- **Frontend**: `http://localhost:5173` (local)
- **API docs**: `http://localhost:8000/docs`
- **Demo link**: Use a known failing Python repo; see [DEMO.md](DEMO.md) for demo safety rules.

## Deployment

### Frontend (Vercel)

```bash
cd frontend
# Set VITE_API_URL to your backend URL in Vercel project settings
vercel deploy
```

### Backend (Railway, Render, Fly.io)

Deploy the `backend/` directory. Set env vars: `GITHUB_TOKEN` (for push), `RETRY_LIMIT` (default 5).

### GITHUB_TOKEN (for push)

To push fixes to GitHub:

- **Local:** Add `GITHUB_TOKEN` to `backend/.env`. Copy from `backend/.env.example`.
- **Deployed:** Set `GITHUB_TOKEN` in your hosting platform (Railway, Render, etc.) for repos you own.
- **Per-user (deployed):** Visitors can add their own token in the optional "GitHub Token" field in the form to push to their repos. When empty, the server's token is used (for repos the deployer can push to).

Create a Personal Access Token at https://github.com/settings/tokens with `repo` scope.

## Future Work

- **Docker Compose**: Single command to run backend + frontend
- **CI polling**: Poll GitHub Actions / external CI instead of running pytest locally
- **More bug types**: Extend pattern mappings

## Project Structure

```
ai-agent/
├── backend/
│   ├── app/
│   │   ├── api/run.py       # POST /api/run
│   │   ├── agent/           # LangGraph: analyzer, fixer, reviewer, commit
│   │   ├── services/         # repo, test_runner, git
│   │   └── utils/           # result_builder
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   └── src/                 # React dashboard (5 sections)
├── DEMO.md                  # Demo safety rules
└── README.md
```

## License

MIT
