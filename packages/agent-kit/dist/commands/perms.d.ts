import { Command } from 'commander';
import type { AgentType } from '../types.js';
/** Claude Code allow entries per plugin (merged with BASELINE on add). */
export declare const PLUGIN_PERMISSIONS: Record<string, string[]>;
/** Map a task runner command string to its Claude Code allow entry. */
export declare function taskRunnerAllow(command: string): string | null;
/** Detect the AI agent environment from process env variables. */
export declare function detectAgent(override?: string): AgentType;
/** Build the full Claude Code allow list for the given plugins + detected task runner. */
export declare function buildClaudeAllow(plugins: string[], cwd?: string): string[];
/** Merge allow entries into a Claude Code settings.json, return stats. */
export declare function mergeClaudeAllow(filePath: string, newEntries: string[]): {
    path: string;
    added: number;
    total: number;
};
export declare function permsCommand(): Command;
//# sourceMappingURL=perms.d.ts.map