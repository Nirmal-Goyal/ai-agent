import type { RunResponse } from "../types";

export function Section6FinalAction({ data }: { data: RunResponse }) {
  const isPassed = data.ci_status === "PASSED";
  const branchName = data.branch_name ?? "";
  const totalFixes = data.total_fixes_applied ?? 0;
  const repoUrl = data.repo_url ?? "";
  const prLink =
    repoUrl && branchName && totalFixes > 0
      ? `${repoUrl.replace(/\/$/, "")}/compare/main...${branchName}`
      : "";

  return (
    <section className="dashboard-section">
      {isPassed ? (
        <>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", fontWeight: 700, color: "#166534" }}>
            All tests passed successfully
          </h3>
          <p style={{ color: "#334155", margin: "0 0 1rem 0", fontSize: "1rem" }}>
            You can merge the pull request safely.
          </p>
          {prLink && (
            <a
              href={prLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.75rem 1.5rem",
                background: "#22c55e",
                color: "#fff",
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              MERGE PR
            </a>
          )}
        </>
      ) : (
        <>
          <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", fontWeight: 700, color: "#b45309" }}>
            Action Required
          </h3>
          <p style={{ color: "#334155", margin: "0 0 1rem 0", fontSize: "1rem" }}>
            Automated fixes could not fully resolve all issues.
          </p>
          <ul style={{ margin: "0 0 1rem 0", paddingLeft: "1.25rem", color: "#334155" }}>
            <li style={{ color: branchName ? "#22c55e" : "#64748b" }}>
              {branchName ? "✓" : "✗"} Fix branch {branchName ? "created" : "not created"}
            </li>
            <li style={{ color: "#ef4444" }}>✗ Tests still failing</li>
          </ul>
          <p style={{ color: "#64748b", margin: "0 0 1rem 0", fontSize: "0.9rem" }}>
            Please open the pull request and fix remaining issues manually.
          </p>
          {prLink && (
            <a
              href={prLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.75rem 1.5rem",
                background: "#3b82f6",
                color: "#fff",
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              OPEN PULL REQUEST
            </a>
          )}
        </>
      )}
    </section>
  );
}
