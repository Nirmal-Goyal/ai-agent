import type { RunResponse } from "../types";

const DEFAULT_SCORE = { base: 0, speed_bonus: 0, efficiency_penalty: 0, total: 0 };

export function Section3Score({ data }: { data: RunResponse }) {
  const s = data.score ?? DEFAULT_SCORE;
  const base = s.base ?? 0;
  const speedBonus = s.speed_bonus ?? 0;
  const penalty = s.efficiency_penalty ?? 0;
  const total = s.total ?? 0;
  const maxScore = 110; // base 100 + max speed bonus 10
  const totalPct = Math.min(100, Math.max(0, (total / maxScore) * 100));
  return (
    <section className="dashboard-section">
      <h3>Score</h3>
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <ScoreItem label="Base" value={base} />
        <ScoreItem label="Speed Bonus" value={speedBonus} positive />
        <ScoreItem label="Efficiency Penalty" value={penalty} negative />
        <ScoreItem label="Total" value={total} highlight />
      </div>
      <div style={{ marginTop: "1rem" }}>
        <div
          style={{
            height: "8px",
            background: "#1e293b",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${totalPct}%`,
              height: "100%",
              background: total >= 100 ? "#22c55e" : total >= 90 ? "#60a5fa" : "#94a3b8",
              borderRadius: "4px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
          Score breakdown: {base} + {speedBonus} − {penalty} = {total}
        </div>
      </div>
    </section>
  );
}

function ScoreItem({
  label,
  value,
  positive,
  negative,
  highlight,
}: {
  label: string;
  value: number;
  positive?: boolean;
  negative?: boolean;
  highlight?: boolean;
}) {
  let color = "#e2e8f0";
  if (positive && value > 0) color = "#22c55e";
  if (negative && value > 0) color = "#ef4444";
  if (highlight) color = "#60a5fa";
  return (
    <div>
      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{label}</div>
      <div style={{ fontSize: highlight ? "1.5rem" : "1rem", fontWeight: highlight ? 700 : 400, color }}>
        {value}
      </div>
    </div>
  );
}
