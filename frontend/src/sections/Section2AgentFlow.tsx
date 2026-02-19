import type { RunResponse } from "../types";

export function Section2AgentFlow({ data }: { data: RunResponse }) {
  const timeline = data.ci_timeline ?? [];
  const fixes = data.fixes ?? [];
  const totalFailures = data.total_failures ?? 0;
  const totalFixes = data.total_fixes_applied ?? 0;
  const firstFix = fixes[0];
  const firstStatus = timeline[0]?.status;
  const lastStatus = timeline[timeline.length - 1]?.status;

  const steps: string[] = [];

  steps.push("Cloned repository");

  if (timeline.length > 0) {
    steps.push(
      firstStatus === "PASSED"
        ? "Ran CI tests (PASSED)"
        : "Ran CI tests (FAILED)"
    );
  }

  if (totalFailures > 0 && firstFix) {
    const file = firstFix.file ?? "file";
    const bugType = firstFix.bug_type ?? "error";
    steps.push(`Detected ${bugType.toLowerCase()} in ${file}`);
  }

  if (totalFixes > 0) {
    steps.push("Applied fix automatically");
  }

  if (timeline.length > 1 && lastStatus === "PASSED") {
    steps.push("Re-ran tests (PASSED)");
  } else if (timeline.length > 1 && lastStatus === "FAILED") {
    steps.push("Re-ran tests (FAILED)");
  }

  return (
    <section className="dashboard-section">
      <h3>Agent Execution Flow</h3>
      <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1rem" }}>
        Steps the AI agent performed during this run.
      </p>
      <ol style={{ margin: 0, paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {steps.map((step, i) => (
          <li key={i} style={{ color: "#e2e8f0", lineHeight: 1.6 }}>
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}
