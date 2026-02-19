/** Types match backend RunResponse - read ONLY from API JSON */
export interface FixResult {
  file: string;
  bug_type: string;
  line_number: number | null;
  commit_message: string;
  description?: string | null;
  status: string;
}

export interface ScoreResult {
  base: number;
  speed_bonus: number;
  efficiency_penalty: number;
  total: number;
}

export interface CITimelineEntry {
  iteration: number;
  status: string;
  timestamp: string;
}

export interface RunResponse {
  repo_url: string;
  team_name: string;
  team_leader_name: string;
  branch_name: string;
  total_failures: number;
  total_fixes_applied: number;
  ci_status: string;
  total_time_seconds: number;
  score: ScoreResult;
  fixes: FixResult[];
  ci_timeline: CITimelineEntry[];
  retry_limit?: number;
  error?: string | null;
}

export interface RunRequest {
  repo_url: string;
  team_name: string;
  team_leader_name: string;
  github_token?: string | null;
}
