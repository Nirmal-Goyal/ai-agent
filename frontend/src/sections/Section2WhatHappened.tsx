import type { RunResponse } from "../types";

export function Section2WhatHappened({ data }: { data: RunResponse }) {
  const isPassed = data.ci_status === "PASSED";
  const timeline = data.ci_timeline ?? [];
  const iterationsUsed = timeline.length;
  const totalFixes = data.total_fixes_applied ?? 0;
  const totalFailures = data.total_failures ?? 0;
  const branchName = data.branch_name ?? "";

  return (
    <section className="dashboard-section">
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: 600, color: "#1e293b" }}>
        What the AI Agent Did
      </h3>
      <div
        style={{
          padding: "1rem",
          background: "#f8fafc",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          lineHeight: 1.7,
          color: "#334155",
        }}
      >
        {isPassed ? (
          <p style={{ margin: 0 }}>
            {totalFixes > 0
              ? "The agent successfully fixed all issues and tests passed. You can safely merge the pull request."
              : "All tests passed on the first run. No fixes were needed."}
          </p>
        ) : (
          <>
            <ul style={{ margin: "0 0 1rem 0", paddingLeft: "1.25rem" }}>
              <li>Your repository had {totalFailures} failing test{totalFailures !== 1 ? "s" : ""}</li>
              <li>The agent attempted automated fixes {iterationsUsed} times</li>
              <li>
                {totalFixes === 0
                  ? "No fixes were successfully applied and pushed"
                  : `${totalFixes} fix${totalFixes !== 1 ? "es" : ""} ${totalFixes === 1 ? "was" : "were"} successfully applied and pushed`}
              </li>
              <li>Tests still failed after maximum retries</li>
              {branchName && (
                <li>A fix branch was created for manual review</li>
              )}
            </ul>
            <p style={{ margin: 0, fontWeight: 600 }}>
              Next Step: Open the Pull Request and review remaining issues manually.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
