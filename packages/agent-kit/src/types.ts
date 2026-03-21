export interface PlanEntry {
  name: string;
  plugin: 'spec' | 'em' | 'pm' | string;
  description: string;
  status: 'Active' | 'Executing' | 'Paused' | 'Complete' | 'Abandoned';
  progress: { completed: number; total: number };
  created: string;
  lastUpdated: string;
  path: string;
  branch: string | null;
  worktree: string | null;
}

export interface WorktreeEntry {
  branch: string;
  path: string;
  planName: string | null;
  createdAt: string;
}

export interface CodevoyantConfig {
  version: string;
  activePlans: PlanEntry[];
  archivedPlans: PlanEntry[];
  worktrees: WorktreeEntry[];
}

export interface TaskRunnerInfo {
  runner: string;
  command: string;
  configFile: string;
  detectedAt: string;
}

export interface MemSettings {
  manifestPath?: string; // default: "mem.json", resolved relative to .codevoyant/
  docsDir?: string;      // default: "docs" — base dir for styleguide/ and recipes/ subdirs
}

export interface PluginDocsConfig {
  types?: string[];
  tags?: string[];
}

export interface PluginConfig {
  docs?: PluginDocsConfig;
}

export interface CodevoyantSettings {
  notifications?: boolean;
  defaultPlugin?: string;
  taskRunner?: TaskRunnerInfo;
  mem?: MemSettings;
  plugins?: Record<string, PluginConfig>;
  [key: string]: unknown;
}

export type AgentType = 'claude-code' | 'opencode' | 'vscode-copilot' | 'unknown';
