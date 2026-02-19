import type { RunResponse } from "../types";

export function Section1RunSummary({ data }: { data: RunResponse }) {
  const isPassed = data.ci_status === "PASSED";
  const hasError = Boolean(data.error);
  const timeline = data.ci_timeline ?? [];
  const retryLimit = data.retry_limit ?? 5;
  const iterationsUsed = timeline.length;
  const timeSeconds = data.total_time_seconds;
  const timeStr = timeSeconds != null ? `${Number(timeSeconds).toFixed(2)}s` : "—";

  let headline = "CI Fixed Successfully";
  let subtext =
    "The AI agent analyzed your repository, detected test failures, automatically applied fixes, and re-ran CI until it passed.";
  if (hasError) {
    headline = "Run Encountered an Error";
    subtext = "The agent could not complete the run. Check the error message above for details.";
  } else if (!isPassed) {
    headline = "CI Did Not Pass";
    subtext = "Initial CI failed. AI attempted automatic fixes.";
  } else if (data.total_fixes_applied === 0 && data.total_failures === 0) {
    subtext = "CI passed. No failures were detected.";
  }

  return (
    <section className="dashboard-section" style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem 0", color: "#e2e8f0" }}>
        {headline}
      </h2>
      <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: "0 0 1.5rem 0", lineHeight: 1.5 }}>
        {subtext}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "1rem",
        }}
      >
        <MetricCard
          label="CI Status"
          value={isPassed ? "PASSED" : "FAILED"}
          status={isPassed ? "pass" : "fail"}
        />
        <MetricCard
          label="Iterations"
          value={`${iterationsUsed} / ${retryLimit}`}
        />
        <MetricCard label="Fixes Applied" value={String(data.total_fixes_applied ?? 0)} />
        <MetricCard label="Total Time" value={timeStr} />
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: "pass" | "fail";
}) {
  let color = "#e2e8f0";
  if (status === "pass") color = "#22c55e";
  if (status === "fail") color = "#ef4444";
  return (
    <div
      style={{
        padding: "1rem",
        background: "#0f172a",
        borderRadius: "8px",
        border: "1px solid #334155",
      }}
    >
      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.25rem" }}>{label}</div>
      <div style={{ fontSize: "1.25rem", fontWeight: 600, color }}>{value}</div>
    </div>
  );
}
