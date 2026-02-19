import type { RunResponse } from "../types";

export function Section5CITimeline({ data }: { data: RunResponse }) {
  const timeline = data.ci_timeline ?? [];
  const retryLimit = data.retry_limit ?? 5;
  const iterationsUsed = timeline.length;

  return (
    <section className="dashboard-section">
      <h3>CI Timeline</h3>
      <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
        Each iteration represents a CI run. The agent runs tests, fixes failures, and re-runs until passing.
      </p>
      {timeline.length > 0 && (
        <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1rem" }}>
          Iterations: {iterationsUsed} / {retryLimit}
        </p>
      )}
      {timeline.length === 0 ? (
        <p style={{ color: "#94a3b8", margin: 0 }}>No timeline data</p>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Progress line */}
          <div
            style={{
              position: "absolute",
              left: "12px",
              top: "24px",
              bottom: "24px",
              width: "2px",
              background: "#334155",
              borderRadius: "1px",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {timeline.map((e, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  position: "relative",
                  paddingLeft: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: e.status === "PASSED" ? "#22c55e" : "#ef4444",
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                />
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <StatusChip status={e.status ?? "—"} iteration={e.iteration ?? i + 1} isSubsequent={i > 0} />
                  <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
                    {e.timestamp ? new Date(e.timestamp).toLocaleString() : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function StatusChip({
  status,
  iteration,
  isSubsequent,
}: {
  status: string;
  iteration: number;
  isSubsequent: boolean;
}) {
  const isPassed = status === "PASSED";
  const color = isPassed ? "#22c55e" : "#ef4444";
  const symbol = isPassed ? "✓" : "✗";
  const suffix = isPassed && isSubsequent ? " (After auto-fix)" : "";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.25rem 0.6rem",
        borderRadius: "9999px",
        background: isPassed ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
        color,
        fontWeight: 600,
        fontSize: "0.875rem",
      }}
    >
      {symbol} Iteration {iteration} {status}
      {suffix}
    </span>
  );
}
