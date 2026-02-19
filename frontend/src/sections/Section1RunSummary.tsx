import type { RunResponse } from "../types";

export function Section1RunSummary({ data }: { data: RunResponse }) {
  const isPassed = data.ci_status === "PASSED";
  const timeline = data.ci_timeline ?? [];
  const retryLimit = data.retry_limit ?? 5;
  const iterationsUsed = timeline.length;
  const timeSeconds = data.total_time_seconds;
  const timeStr = timeSeconds != null ? `${Number(timeSeconds).toFixed(2)} seconds` : "—";

  const branchName = data.branch_name ?? "";
  const repoUrl = data.repo_url ?? "";
  const prLink =
    repoUrl && branchName ? `${repoUrl.replace(/\/$/, "")}/compare/main...${branchName}` : "";

  return (
    <section className="dashboard-section" style={{ padding: "1.5rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 1rem 0", color: "#1e293b" }}>
        Run Summary
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <SummaryRow
          label="Repository Analyzed"
          value={repoUrl}
          link={repoUrl}
        />
        <SummaryRow
          label="Team"
          value={`Team Name: ${data.team_name ?? ""} | Team Leader: ${data.team_leader_name ?? ""}`}
        />
        <div>
          <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.5rem" }}>
            Fix Branch Created
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1e293b" }}>
              {branchName || "—"}
            </span>
            {prLink && (
              <a
                href={prLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.75rem 1.5rem",
                  background: "#22c55e",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "1rem",
                  borderRadius: "8px",
                  textDecoration: "none",
                  border: "none",
                }}
              >
                OPEN PULL REQUEST
              </a>
            )}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.5rem" }}>
            CI Result
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "0.75rem",
            }}
          >
            <MetricItem label="Final Status" value={isPassed ? "PASSED" : "FAILED"} status={isPassed ? "pass" : "fail"} />
            <MetricItem label="Failures Detected" value={String(data.total_failures ?? 0)} />
            <MetricItem label="Fixes Applied" value={String(data.total_fixes_applied ?? 0)} />
            <MetricItem label="Iterations Used" value={`${iterationsUsed} / ${retryLimit}`} />
          </div>
        </div>
        <SummaryRow label="Total Time Taken" value={timeStr} />
      </div>
    </section>
  );
}

function SummaryRow({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.25rem" }}>{label}</div>
      <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b" }}>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>
            {value}
          </a>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function MetricItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: "pass" | "fail";
}) {
  let color = "#1e293b";
  if (status === "pass") color = "#22c55e";
  if (status === "fail") color = "#ef4444";
  return (
    <div>
      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: "1.1rem", fontWeight: 600, color }}>{value}</div>
    </div>
  );
}
