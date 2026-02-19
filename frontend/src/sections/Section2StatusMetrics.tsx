import type { RunResponse } from "../types";

export function Section2StatusMetrics({ data }: { data: RunResponse }) {
  const isPassed = data.ci_status === "PASSED";
  const timeSeconds = data.total_time_seconds;
  const timeStr = timeSeconds != null ? Number(timeSeconds).toFixed(2) : "—";
  return (
    <section className="dashboard-section">
      <h3>2. Status & Metrics</h3>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
        }}
        className="status-metrics"
      >
        <Metric
          label="CI Status"
          value={data.ci_status ?? "—"}
          highlight
          status={isPassed ? "pass" : "fail"}
        />
        <Metric label="Total Failures" value={String(data.total_failures ?? "—")} />
        <Metric label="Fixes Applied" value={String(data.total_fixes_applied ?? "—")} />
        <Metric label="Time (s)" value={timeStr} />
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  highlight,
  status,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  status?: "pass" | "fail";
}) {
  let color = "#e2e8f0";
  if (status === "pass") color = "#22c55e";
  if (status === "fail") color = "#ef4444";
  return (
    <div>
      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{label}</div>
      <div style={{ fontSize: highlight ? "1.25rem" : "1rem", fontWeight: highlight ? 600 : 400, color }}>
        {value}
      </div>
    </div>
  );
}
