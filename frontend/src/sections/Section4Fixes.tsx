import type { RunResponse } from "../types";

const BUG_TYPE_COLORS: Record<string, string> = {
  SYNTAX: "#f97316",
  LOGIC: "#ef4444",
  LINTING: "#3b82f6",
  TYPE_ERROR: "#a855f7",
  IMPORT: "#14b8a6",
  INDENTATION: "#f59e0b",
};

function getBugTypeColor(bugType: string): string {
  return BUG_TYPE_COLORS[bugType ?? ""] ?? "#64748b";
}

export function Section4Fixes({ data }: { data: RunResponse }) {
  const fixes = data.fixes ?? [];
  return (
    <section className="dashboard-section">
      <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: 600, color: "#1e293b" }}>
        Fixes Applied
      </h3>
      {fixes.length === 0 ? (
        <p style={{ color: "#64748b", margin: 0 }}>No fixes applied</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", color: "#64748b", fontWeight: 600 }}>File</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", color: "#64748b", fontWeight: 600 }}>Bug Type</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", color: "#64748b", fontWeight: 600 }}>Line</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", color: "#64748b", fontWeight: 600 }}>Commit Message</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", color: "#64748b", fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {fixes.map((f, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#1e293b" }}>{f.file ?? ""}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    <BugTypeBadge bugType={f.bug_type ?? ""} />
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#1e293b" }}>
                    {f.line_number != null ? f.line_number : "—"}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#1e293b" }}>
                    {f.commit_message ?? ""}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
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

function BugTypeBadge({ bugType }: { bugType: string }) {
  const color = getBugTypeColor(bugType);
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.5rem",
        borderRadius: "4px",
        background: `${color}20`,
        color: color,
        fontWeight: 600,
        fontSize: "0.8rem",
      }}
    >
      {bugType || "—"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isFixed = status.toLowerCase() === "fixed";
  const color = isFixed ? "#22c55e" : "#ef4444";
  const symbol = isFixed ? "✓" : "✗";
  const text = isFixed ? "Fixed" : "Failed";
  return (
    <span style={{ color, fontWeight: 600 }}>
      {symbol} {text}
    </span>
  );
}
