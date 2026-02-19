import type { RunResponse, FixResult } from "../types";

const BUG_TYPE_LABELS: Record<string, string> = {
  LINTING: "Unused import",
  SYNTAX: "Syntax Error (missing colon)",
  INDENTATION: "Indentation Error",
  IMPORT: "Missing module",
  LOGIC: "Logic Error",
  TYPE_ERROR: "Type Error",
};

const BUG_TYPE_ACTIONS: Record<string, string> = {
  LINTING: "Removed unused import",
  SYNTAX: "Added missing colon",
  INDENTATION: "Fixed indentation",
  IMPORT: "Installed missing module",
  LOGIC: "Skipped (requires manual fix)",
  TYPE_ERROR: "Skipped (requires manual fix)",
};

function getIssueLabel(bugType: string): string {
  return BUG_TYPE_LABELS[bugType] ?? bugType;
}

function getActionTaken(fix: FixResult): string {
  if (fix.description) {
    const match = fix.description.match(/→ Fix: (.+)$/);
    if (match) return match[1].trim();
  }
  return BUG_TYPE_ACTIONS[fix.bug_type ?? ""] ?? "Applied fix";
}

export function Section4Fixes({ data }: { data: RunResponse }) {
  const fixes = data.fixes ?? [];
  return (
    <section className="dashboard-section">
      <h3>Fix Details</h3>
      <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1rem" }}>
        Changes the AI agent applied to resolve detected issues.
      </p>
      {fixes.length === 0 ? (
        <p style={{ color: "#94a3b8", margin: 0 }}>No fixes applied</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {fixes.map((f, i) => (
            <FixCard key={i} fix={f} />
          ))}
        </div>
      )}
    </section>
  );
}

function FixCard({ fix }: { fix: FixResult }) {
  return (
    <div
      style={{
        padding: "1rem",
        background: "#0f172a",
        borderRadius: "8px",
        border: "1px solid #334155",
      }}
    >
      <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.9rem" }}>
        <Row label="File" value={fix.file ?? ""} />
        <Row label="Issue" value={getIssueLabel(fix.bug_type ?? "")} />
        <Row label="Line" value={String(fix.line_number ?? "—")} />
        <Row label="Action Taken" value={getActionTaken(fix)} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
          <span style={{ color: "#94a3b8", minWidth: "100px" }}>Status:</span>
          <StatusBadge status={fix.status ?? "Fixed"} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <span style={{ color: "#94a3b8", minWidth: "100px" }}>{label}:</span>
      <span style={{ color: "#e2e8f0" }}>{value}</span>
    </div>
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
