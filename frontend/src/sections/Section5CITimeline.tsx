import type { RunResponse } from "../types";

function formatTime(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    const s = d.getSeconds().toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  } catch {
    return "";
  }
}

export function Section5CITimeline({ data }: { data: RunResponse }) {
  const timeline = data.ci_timeline ?? [];
  const retryLimit = data.retry_limit ?? 5;
  const iterationsUsed = timeline.length;
  const allFailed =
    timeline.length > 0 && timeline.every((e) => (e.status ?? "").toUpperCase() === "FAILED");

  return (
    <section className="dashboard-section">
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: 600, color: "#1e293b" }}>
        CI/CD Timeline ({iterationsUsed} / {retryLimit} Attempts)
      </h3>
      {timeline.length === 0 ? (
        <p style={{ color: "#64748b", margin: 0 }}>No timeline data</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {timeline.map((e, i) => {
            const isPassed = (e.status ?? "").toUpperCase() === "PASSED";
            const status = e.status ?? "FAILED";
            const attemptNum = e.iteration ?? i + 1;
            const timeStr = e.timestamp ? formatTime(e.timestamp) : "";
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: isPassed ? "#22c55e" : "#ef4444",
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: "#1e293b", fontSize: "0.95rem" }}>
                  Attempt {attemptNum} — {status}
                  {timeStr && !isPassed ? ` — ${timeStr}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {allFailed && (
        <p style={{ color: "#ef4444", fontSize: "0.9rem", marginTop: "1rem", marginBottom: 0, fontWeight: 600 }}>
          Maximum retries reached.
        </p>
      )}
    </section>
  );
}
