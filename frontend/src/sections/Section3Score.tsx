import type { RunResponse } from "../types";

const DEFAULT_SCORE = { base: 0, speed_bonus: 0, efficiency_penalty: 0, total: 0 };

export function Section3Score({ data }: { data: RunResponse }) {
  const s = data.score ?? DEFAULT_SCORE;
  const base = s.base ?? 0;
  const speedBonus = s.speed_bonus ?? 0;
  const penalty = s.efficiency_penalty ?? 0;
  const total = s.total ?? 0;
  const maxScore = 110;
  const totalPct = Math.min(100, Math.max(0, (total / maxScore) * 100));
  const isPassed = data.ci_status === "PASSED";

  return (
    <section className="dashboard-section">
      <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: 600, color: "#1e293b" }}>
        Score Breakdown
      </h3>
      {!isPassed && (
        <p
          style={{
            margin: "0 0 1rem 0",
            fontSize: "0.9rem",
            color: "#b45309",
            fontWeight: 600,
          }}
        >
          Score shown is provisional.
        </p>
      )}
      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        title="Score is awarded even if CI fails, but full points require passing CI."
      >
        <ScoreRow label="Base Score" value={base} />
        <ScoreRow label="Speed Bonus" value={`+${speedBonus}`} positive />
        <ScoreRow label="Efficiency Penalty" value={`-${penalty}`} negative />
        <div
          style={{
            borderTop: "1px solid #e2e8f0",
            marginTop: "0.25rem",
            paddingTop: "0.5rem",
          }}
        />
        <ScoreRow label="Final Score" value={total} highlight />
      </div>
      <div style={{ marginTop: "1rem" }}>
        <div
          style={{
            height: "10px",
            background: "#cbd5e1",
            borderRadius: "4px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${totalPct}%`,
              background: "#22c55e",
              borderRadius: "4px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
          Score is awarded even if CI fails, but full points require passing CI.
        </div>
      </div>
    </section>
  );
}

function ScoreRow({
  label,
  value,
  positive,
  negative,
  highlight,
}: {
  label: string;
  value: number | string;
  positive?: boolean;
  negative?: boolean;
  highlight?: boolean;
}) {
  const numVal = typeof value === "number" ? value : parseInt(String(value).replace(/[+-]/g, ""), 10) || 0;
  let color = "#1e293b";
  if (positive && numVal > 0) color = "#22c55e";
  if (negative && numVal > 0) color = "#ef4444";
  if (highlight) color = "#2563eb";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontSize: "0.9rem", color: "#64748b" }}>{label}</span>
      <span
        style={{
          fontSize: highlight ? "1.25rem" : "1rem",
          fontWeight: highlight ? 700 : 500,
          color,
        }}
      >
        {value}
      </span>
    </div>
  );
}
