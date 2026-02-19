import type { RunResponse } from "../types";

export function Section5CITimeline({ data }: { data: RunResponse }) {
  const timeline = data.ci_timeline ?? [];
  const retryLimit = data.retry_limit ?? 5;
  const iterationsUsed = timeline.length;
  return (
    <section className="dashboard-section">
      <h3>5. CI Timeline</h3>
      <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
        Each iteration represents a CI run. The agent runs tests, fixes failures, and re-runs until passing.
      </p>
      {timeline.length > 0 && (
        <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
          Iterations: {iterationsUsed}/{retryLimit}
        </p>
      )}
      {timeline.length === 0 ? (
        <p style={{ color: "#94a3b8", margin: 0 }}>No timeline data</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {timeline.map((e, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.5rem",
                background: "#0f172a",
                borderRadius: "4px",
              }}
            >
              <span style={{ fontWeight: 600, minWidth: "100px" }}>
                Iteration {e.iteration ?? i + 1}
              </span>
              <span
                style={{
                  color: e.status === "PASSED" ? "#22c55e" : "#ef4444",
                  fontWeight: 600,
                }}
              >
                {e.status ?? "—"}
              </span>
              <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
                {e.timestamp ?? ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
