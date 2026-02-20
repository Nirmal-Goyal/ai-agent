import { useState, useEffect } from "react";
import type { RunResponse, RunRequest } from "./types";
import { Section1RunSummary } from "./sections/Section1RunSummary";
import { Section2WhatHappened } from "./sections/Section2WhatHappened";
import { Section3Score } from "./sections/Section3Score";
import { Section4Fixes } from "./sections/Section4Fixes";
import { Section5CITimeline } from "./sections/Section5CITimeline";
import { Section6FinalAction } from "./sections/Section6FinalAction";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api";

const BACKEND_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
  : "";

const GITHUB_TOKEN_KEY = "cicd_agent_github_token";

const LOADING_STEPS = [
  "Cloning repository…",
  "Running tests…",
  "Analyzing failures…",
  "Applying fixes…",
  "Pushing changes…",
  "Verifying results…",
];

function useLoadingStep(loading: boolean): string {
  const [stepIndex, setStepIndex] = useState(0);
  useEffect(() => {
    if (!loading) {
      setStepIndex(0);
      return;
    }
    setStepIndex(0);
    const id = setInterval(() => {
      setStepIndex((i) => (i + 1) % LOADING_STEPS.length);
    }, 2500);
    return () => clearInterval(id);
  }, [loading]);
  return LOADING_STEPS[stepIndex] ?? LOADING_STEPS[0];
}

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

function isAuthPushError(error: string | null | undefined): boolean {
  if (!error) return false;
  const lower = error.toLowerCase();
  return lower.includes("403") || lower.includes("unable to access");
}

export default function App() {
  const [result, setResult] = useState<RunResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [githubToken, setGithubToken] = useState<string | null>(getStoredToken);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const loadingStep = useLoadingStep(loading);

  useEffect(() => {
    if (result?.error && isAuthPushError(result.error)) {
      setShowAuthPopup(true);
    }
  }, [result?.error]);

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
          <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
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
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                color: "#475569",
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
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            marginBottom: "1rem",
            color: "#92400e",
          }}
        >
          Auth error: {authError}
        </div>
      )}

      {result?.error && (
        <div
          style={{
            padding: "1rem",
            background: "#fee2e2",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            marginBottom: "1rem",
            color: "#991b1b",
          }}
        >
          <strong>Backend error:</strong> {result.error}
        </div>
      )}

      <RunForm onRun={handleRun} loading={loading} githubToken={githubToken} />

      {loading && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1.5rem",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              border: "2px solid #cbd5e1",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span style={{ fontSize: "1.1rem", fontWeight: 500, color: "#1e293b" }}>
            {loadingStep}
          </span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "#fee2e2",
            border: "1px solid #ef4444",
            borderRadius: "8px",
            marginTop: "1rem",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <GlobalStatusBanner data={result} />
      )}

      {result && (
        <Dashboard data={result} />
      )}

      {showAuthPopup && (
        <AuthRequiredModal
          onSignIn={handleSignIn}
          onDismiss={() => setShowAuthPopup(false)}
        />
      )}
    </div>
  );
}

function AuthRequiredModal({
  onSignIn,
  onDismiss,
}: {
  onSignIn: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "1.5rem 2rem",
          maxWidth: "420px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1.25rem", fontWeight: 700, color: "#1e293b" }}>
          Sign in required
        </h3>
        <p style={{ margin: "0 0 1.5rem 0", fontSize: "1rem", color: "#475569", lineHeight: 1.5 }}>
          To push fixes to your branch, sign in with GitHub. This allows the agent to push changes to
          your repository.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onDismiss}
            style={{
              padding: "0.5rem 1rem",
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              color: "#475569",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={onSignIn}
            style={{
              padding: "0.5rem 1rem",
              background: "#24292e",
              border: "1px solid #444d56",
              borderRadius: "6px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

function GlobalStatusBanner({ data }: { data: RunResponse }) {
  const hasError = Boolean(data.error);
  const isPassed = data.ci_status === "PASSED";
  const totalFixes = data.total_fixes_applied ?? 0;
  const branchName = data.branch_name ?? "";

  let bg = "#dcfce7";
  let border = "#22c55e";
  let color = "#166534";
  let text =
    totalFixes > 0
      ? "CI/CD HEALING SUCCESSFUL — All tests passed after automated fixes."
      : "CI/CD HEALING SUCCESSFUL — All tests passed (no fixes needed).";

  if (hasError) {
    bg = "#fee2e2";
    border = "#ef4444";
    color = "#991b1b";
    text = "Run encountered an error.";
  } else if (!isPassed) {
    if (totalFixes > 0 && branchName) {
      bg = "#fef3c7";
      border = "#f59e0b";
      color = "#92400e";
      text = "CI/CD PARTIALLY FIXED — Automated fixes applied, but tests still failing. Manual review required.";
    } else {
      bg = "#fee2e2";
      border = "#ef4444";
      color = "#991b1b";
      text = "CI/CD NOT FIXED — Initial tests failed. No fixes could be applied.";
    }
  }

  return (
    <div
      style={{
        width: "100%",
        padding: "1rem 1.5rem",
        borderRadius: "8px",
        marginTop: "1.5rem",
        marginBottom: "1rem",
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontSize: "1.1rem",
        fontWeight: 600,
      }}
    >
      {text}
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
        background: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
      }}
    >
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem", color: "#475569" }}>
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
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "4px",
            color: "#1e293b",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem", color: "#475569" }}>
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
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "4px",
              color: "#1e293b",
            }}
          />
        </div>
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem", color: "#475569" }}>
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
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "4px",
              color: "#1e293b",
            }}
          />
        </div>
      </div>
      {!githubToken && (
        <div
          style={{
            padding: "0.75rem",
            background: "#eff6ff",
            border: "1px solid #3b82f6",
            borderRadius: "6px",
            fontSize: "0.875rem",
            color: "#1e40af",
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
        {loading ? "Running…" : "Run Agent"}
      </button>
    </form>
  );
}

function Dashboard({ data }: { data: RunResponse }) {
  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Section1RunSummary data={data} />
        <Section2WhatHappened data={data} />
        <Section3Score data={data} />
        <Section4Fixes data={data} />
        <Section5CITimeline data={data} />
        <Section6FinalAction data={data} />
      </div>
    </div>
  );
}
