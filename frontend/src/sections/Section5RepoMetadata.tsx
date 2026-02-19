import { useState } from "react";
import type { RunResponse } from "../types";

export function Section5RepoMetadata({ data }: { data: RunResponse }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="dashboard-section">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          width: "100%",
          padding: 0,
          background: "none",
          border: "none",
          color: "#94a3b8",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ transform: expanded ? "rotate(90deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>
          ▸
        </span>
        Repository Info
      </button>
      {expanded && (
        <dl style={{ display: "grid", gap: "0.5rem", margin: "1rem 0 0 0", paddingLeft: "1.25rem" }}>
          <Row label="Repo" value={data.repo_url ?? ""} link={data.repo_url} />
          <Row label="Branch" value={data.branch_name ?? ""} />
          <Row label="Team" value={data.team_name ?? ""} />
          <Row label="Team Leader" value={data.team_leader_name ?? ""} />
        </dl>
      )}
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
