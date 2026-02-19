import { useState, useEffect } from "react";
import type { RunResponse, RunRequest } from "./types";
import { Section1RunSummary } from "./sections/Section1RunSummary";
import { Section2AgentFlow } from "./sections/Section2AgentFlow";
import { Section3Score } from "./sections/Section3Score";
import { Section4Fixes } from "./sections/Section4Fixes";
import { Section5CITimeline } from "./sections/Section5CITimeline";
import { Section5RepoMetadata } from "./sections/Section5RepoMetadata";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api";

const BACKEND_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
  : "";

const GITHUB_TOKEN_KEY = "cicd_agent_github_token";

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(GITHUB_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(GITHUB_TOKEN_KEY, token);
    else localStorage.removeItem(GITHUB_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export default function App() {
  const [result, setResult] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(getStoredToken);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const params = Object.fromEntries(new URLSearchParams(hash));
    if (params.token) {
      setStoredToken(params.token);
      setGithubToken(params.token);
      setAuthError(null);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    if (params.error) {
      setAuthError(decodeURIComponent(params.error));
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  const handleSignIn = () => {
    const url = BACKEND_BASE ? `${BACKEND_BASE}/auth/login` : "/auth/login";
    window.location.href = url;
  };

  const handleSignOut = () => {
    setStoredToken(null);
    setGithubToken(null);
  };

  const handleRun = async (req: RunRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);
    const tokenToUse = req.github_token ?? githubToken ?? undefined;
    const payload = { ...req, github_token: tokenToUse };
    try {
      const res = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data?.detail)
          ? data.detail.map((d: { msg?: string }) => d?.msg).filter(Boolean).join("; ")
          : typeof data?.detail === "string"
            ? data.detail
            : "Request failed";
        setError(msg || "Request failed");
        return;
      }
      setResult(data as RunResponse);
      console.log("API response:", JSON.stringify(data, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 600 }}>
            CI/CD Healing Agent
          </h1>
          <p style={{ color: "#94a3b8", marginTop: "0.25rem" }}>
            Autonomous test failure analysis and fix
          </p>
        </div>
        <div>
          {githubToken ? (
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                padding: "0.5rem 1rem",
                background: "#334155",
                border: "1px solid #475569",
                borderRadius: "6px",
                color: "#e2e8f0",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Sign out
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              style={{
                padding: "0.5rem 1rem",
                background: "#24292e",
                border: "1px solid #444d56",
                borderRadius: "6px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Sign in with GitHub
            </button>
          )}
        </div>
      </header>

      {authError && (
        <div
          style={{
            padding: "1rem",
            background: "#422006",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          Auth error: {authError}
        </div>
      )}

      {result?.error && (
        <div
          style={{
            padding: "1rem",
            background: "#7f1d1d",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          <strong>Backend error:</strong> {result.error}
        </div>
      )}

      <RunForm onRun={handleRun} loading={loading} githubToken={githubToken} />

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "#7f1d1d",
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <Dashboard data={result} />
      )}
    </div>
  );
}

function RunForm({
  onRun,
  loading,
  githubToken,
}: {
  onRun: (req: RunRequest) => void;
  loading: boolean;
  githubToken: string | null;
}) {
  const [repoUrl, setRepoUrl] = useState("");
  const [teamName, setTeamName] = useState("CodeCrew");
  const [teamLeader, setTeamLeader] = useState("Nirmal Goyal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRun({
      repo_url: repoUrl,
      team_name: teamName,
      team_leader_name: teamLeader,
      github_token: githubToken ?? undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1.5rem",
        background: "#1e293b",
        borderRadius: "8px",
      }}
    >
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
          Repo URL
        </label>
        <input
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          required
          style={{
            width: "100%",
            padding: "0.5rem",
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "4px",
            color: "#e2e8f0",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
            Team Name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "4px",
              color: "#e2e8f0",
            }}
          />
        </div>
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
            Team Leader
          </label>
          <input
            type="text"
            value={teamLeader}
            onChange={(e) => setTeamLeader(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "4px",
              color: "#e2e8f0",
            }}
          />
        </div>
      </div>
      {!githubToken && (
        <div
          style={{
            padding: "0.75rem",
            background: "#1e3a5f",
            borderRadius: "6px",
            fontSize: "0.875rem",
            color: "#93c5fd",
          }}
        >
          Sign in with GitHub above to push fixes to your repos.
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "0.75rem 1.5rem",
          background: loading ? "#475569" : "#3b82f6",
          border: "none",
          borderRadius: "6px",
          color: "white",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "AI agent is analyzing your repository and running CI tests…" : "Run Agent"}
      </button>
    </form>
  );
}

function Dashboard({ data }: { data: RunResponse }) {
  return (
    <div style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Results</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Section1RunSummary data={data} />
        <Section2AgentFlow data={data} />
        <Section3Score data={data} />
        <Section4Fixes data={data} />
        <Section5CITimeline data={data} />
        <Section5RepoMetadata data={data} />
      </div>
    </div>
  );
}
