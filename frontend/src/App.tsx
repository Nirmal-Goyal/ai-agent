import { useState } from "react";
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

export default function App() {
  const [result, setResult] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async (req: RunRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
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
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 600 }}>
          CI/CD Healing Agent
        </h1>
        <p style={{ color: "#94a3b8", marginTop: "0.25rem" }}>
          Autonomous test failure analysis and fix
        </p>
      </header>

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

      <RunForm onRun={handleRun} loading={loading} />

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
}: {
  onRun: (req: RunRequest) => void;
  loading: boolean;
}) {
  const [repoUrl, setRepoUrl] = useState("");
  const [teamName, setTeamName] = useState("CodeCrew");
  const [teamLeader, setTeamLeader] = useState("Nirmal Goyal");
  const [githubToken, setGithubToken] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRun({
      repo_url: repoUrl,
      team_name: teamName,
      team_leader_name: teamLeader,
      github_token: githubToken.trim() || undefined,
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
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
          GitHub Token (optional)
        </label>
        <input
          type="password"
          value={githubToken}
          onChange={(e) => setGithubToken(e.target.value)}
          placeholder="Leave empty to use server token. Add your token to push to your repos."
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
