import type { RunResponse } from "../types";

export function Section1RunInfo({ data }: { data: RunResponse }) {
  return (
    <section className="dashboard-section">
      <h3>1. Run Info</h3>
      <dl style={{ display: "grid", gap: "0.5rem", margin: 0 }}>
        <Row label="Repo" value={data.repo_url ?? ""} link={data.repo_url} />
        <Row label="Team" value={data.team_name ?? ""} />
        <Row label="Team Leader" value={data.team_leader_name ?? ""} />
        <Row label="Branch" value={data.branch_name ?? ""} />
      </dl>
    </section>
  );
}

function Row({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: string;
}) {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <dt style={{ margin: 0, minWidth: "100px", color: "#94a3b8" }}>{label}:</dt>
      <dd style={{ margin: 0, flex: 1 }}>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
