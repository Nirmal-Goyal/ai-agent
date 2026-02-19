import type { RunResponse } from "../types";

export function Section4Fixes({ data }: { data: RunResponse }) {
  const fixes = data.fixes ?? [];
  return (
    <section className="dashboard-section">
      <h3>4. Fixes Applied</h3>
      {fixes.length === 0 ? (
        <p style={{ color: "#94a3b8", margin: 0 }}>No fixes applied</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                <th style={{ textAlign: "left", padding: "0.5rem", color: "#94a3b8" }}>File</th>
                <th style={{ textAlign: "left", padding: "0.5rem", color: "#94a3b8" }}>Bug Type</th>
                <th style={{ textAlign: "left", padding: "0.5rem", color: "#94a3b8" }}>Line Number</th>
                <th style={{ textAlign: "left", padding: "0.5rem", color: "#94a3b8" }}>Description</th>
                <th style={{ textAlign: "left", padding: "0.5rem", color: "#94a3b8" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {fixes.map((f, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "0.5rem" }}>{f.file ?? ""}</td>
                  <td style={{ padding: "0.5rem" }}>{f.bug_type ?? ""}</td>
                  <td style={{ padding: "0.5rem" }}>{f.line_number ?? "—"}</td>
                  <td style={{ padding: "0.5rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                    {f.description ?? f.commit_message ?? ""}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <StatusBadge status={f.status ?? "Fixed"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isFixed = status.toLowerCase() === "fixed";
  const color = isFixed ? "#22c55e" : "#ef4444";
  const symbol = isFixed ? "✓" : "✗";
  const text = isFixed ? "Fixed" : "Failed";
  return (
    <span
      style={{
        color,
        fontWeight: 600,
      }}
    >
      {symbol} {text}
    </span>
  );
}
