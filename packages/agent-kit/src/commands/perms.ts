import { Command } from 'commander';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { detectRunner } from './task-runner.js';
import type { AgentType } from '../types.js';

// ── Permission tables ─────────────────────────────────────────────────────────

const BASELINE: string[] = [
  'Bash(bash:*)',
  'Bash(cat:*)',
  'Bash(cp:*)',
  'Bash(date:*)',
  'Bash(echo:*)',
  'Bash(jq:*)',
  'Bash(ls:*)',
  'Bash(mkdir:*)',
  'Bash(mv:*)',
  'Bash(npx:*)',
  'Edit',
  'Glob',
  'Grep',
  'Read',
  'Write',
];

/** Claude Code allow entries per plugin (merged with BASELINE on add). */
export const PLUGIN_PERMISSIONS: Record<string, string[]> = {
  spec: [
    'Bash(git add:*)',
    'Bash(git checkout:*)',
    'Bash(git commit --amend:*)',
    'Bash(git commit -m:*)',
    'Bash(git commit:*)',
    'Bash(git diff:*)',
    'Bash(git fetch:*)',
    'Bash(git log:*)',
    'Bash(git rev-parse:*)',
    'Bash(git stash:*)',
    'Bash(git status:*)',
    'Bash(git worktree:*)',
    'WebFetch',
    'WebSearch',
  ],
  dev: [
    'Bash(gh pr:*)',
    'Bash(gh run:*)',
    'Bash(git add:*)',
    'Bash(git checkout:*)',
    'Bash(git commit --amend:*)',
    'Bash(git commit -m:*)',
    'Bash(git commit:*)',
    'Bash(git diff:*)',
    'Bash(git fetch:*)',
    'Bash(git log:*)',
    'Bash(git pull:*)',
    'Bash(git push --force-with-lease:*)',
    'Bash(git push origin:*)',
    'Bash(git rebase:*)',
    'Bash(git rev-parse:*)',
    'Bash(git status:*)',
    'Bash(glab ci:*)',
    'Bash(glab mr:*)',
    'Bash(notify-send:*)',
    'Bash(osascript:*)',
  ],
  em: ['Bash(git diff:*)', 'Bash(git log:*)', 'Bash(git rev-parse:*)', 'Bash(git shortlog:*)'],
  pm: ['WebFetch', 'WebSearch'],
  ux: ['WebFetch'],
};

/** Map a task runner command string to its Claude Code allow entry. */
export function taskRunnerAllow(command: string): string | null {
  if (command.startsWith('just')) return 'Bash(just:*)';
  if (command.startsWith('mise')) return 'Bash(mise run:*)';
  if (command.startsWith('task')) return 'Bash(task:*)';
  if (command.startsWith('make')) return 'Bash(make:*)';
  if (command.startsWith('pnpm')) return 'Bash(pnpm run:*)';
  if (command.startsWith('yarn')) return 'Bash(yarn:*)';
  if (command.startsWith('npm')) return 'Bash(npm run:*)';
  return null;
}

// ── Agent detection ───────────────────────────────────────────────────────────

/** Detect the AI agent environment from process env variables. */
export function detectAgent(override?: string): AgentType {
  if (override) return override as AgentType;
  // Claude Code sets CLAUDECODE=1 and CLAUDE_CODE_ENTRYPOINT
  if (process.env.CLAUDECODE === '1' || process.env.CLAUDE_CODE_ENTRYPOINT) {
    return 'claude-code';
  }
  // OpenCode sets OPENCODE_* env vars
  if (Object.keys(process.env).some((k) => k.startsWith('OPENCODE_'))) {
    return 'opencode';
  }
  // VS Code Copilot
  if (process.env.VSCODE_GIT_ASKPASS_MAIN || process.env.VSCODE_IPC_HOOK_CLI) {
    return 'vscode-copilot';
  }
  return 'unknown';
}

// ── Config helpers ────────────────────────────────────────────────────────────

function readJsonFile(filePath: string): Record<string, unknown> {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function writeJsonFile(filePath: string, data: Record<string, unknown>): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
  fs.renameSync(tmp, filePath);
}

// ── Allow list builder ────────────────────────────────────────────────────────

/** Build the full Claude Code allow list for the given plugins + detected task runner. */
export function buildClaudeAllow(plugins: string[], cwd?: string): string[] {
  const entries = new Set<string>(BASELINE);

  const runner = detectRunner(cwd);
  if (runner) {
    const allow = taskRunnerAllow(runner.command);
    if (allow) entries.add(allow);
  }

  for (const plugin of plugins) {
    for (const entry of PLUGIN_PERMISSIONS[plugin] ?? []) {
      entries.add(entry);
    }
  }

  return [...entries].sort();
}

/** Merge allow entries into a Claude Code settings.json, return stats. */
export function mergeClaudeAllow(
  filePath: string,
  newEntries: string[],
): { path: string; added: number; total: number } {
  const existing = readJsonFile(filePath);
  const permissions = (existing.permissions ?? {}) as { allow?: string[] };
  const existingAllow = new Set<string>(permissions.allow ?? []);
  const before = existingAllow.size;

  for (const entry of newEntries) existingAllow.add(entry);
  const sorted = [...existingAllow].sort();

  existing.permissions = { ...permissions, allow: sorted };
  writeJsonFile(filePath, existing);
  return { path: filePath, added: sorted.length - before, total: sorted.length };
}

// ── Command ───────────────────────────────────────────────────────────────────

export function permsCommand(): Command {
  const cmd = new Command('perms').description('Manage agent permissions for plugin execution');

  // perms detect
  cmd
    .command('detect')
    .description('Detect which AI agent is running')
    .option('--agent <agent>', 'Override detection (claude-code, opencode, vscode-copilot)')
    .action((opts) => {
      const agent = detectAgent(opts.agent);
      console.log(JSON.stringify({ agent }, null, 2));
    });

  // perms add --plugins spec,dev
  cmd
    .command('add')
    .description('Add permissions for one or more plugins to the agent config')
    .requiredOption('--plugins <list>', 'Comma-separated plugin names (spec,dev,em,pm,ux)')
    .option('--agent <agent>', 'Override detection (claude-code, opencode, vscode-copilot)')
    .option('--global', 'Write to global config instead of project-level', false)
    .action((opts) => {
      const plugins = (opts.plugins as string).split(',').map((p) => p.trim().toLowerCase());
      const agent = detectAgent(opts.agent as string | undefined);

      const unknown = plugins.filter((p) => !PLUGIN_PERMISSIONS[p]);
      if (unknown.length > 0) {
        console.error(`Unknown plugins: ${unknown.join(', ')}. Valid: ${Object.keys(PLUGIN_PERMISSIONS).join(', ')}`);
        process.exit(1);
      }

      if (agent === 'claude-code') {
        const target = opts.global
          ? path.join(os.homedir(), '.claude', 'settings.json')
          : path.join('.claude', 'settings.json');

        const newEntries = buildClaudeAllow(plugins);
        const result = mergeClaudeAllow(target, newEntries);
        console.log(JSON.stringify({ agent, target: result.path, added: result.added, total: result.total }, null, 2));
      } else if (agent === 'opencode') {
        const target = path.join(os.homedir(), '.config', 'opencode', 'config.json');
        const existing = readJsonFile(target);
        const current = (existing.permission ?? {}) as Record<string, string>;

        existing.permission = {
          read: 'allow',
          edit: 'allow',
          write: 'allow',
          glob: 'allow',
          grep: 'allow',
          list: 'allow',
          bash: 'allow',
          task: 'allow',
          todowrite: 'allow',
          todoread: 'allow',
          webfetch: 'allow',
          websearch: 'allow',
          ...current,
          question: 'ask', // never auto-approve user-facing prompts
        };

        writeJsonFile(target, existing);
        console.log(
          JSON.stringify({ agent, target, entries: Object.keys(existing.permission as object).length }, null, 2),
        );
      } else if (agent === 'vscode-copilot') {
        console.log(
          JSON.stringify({
            agent,
            message:
              'VS Code Copilot permissions are set per agent via tools: frontmatter. Reinstall with: bash scripts/install-vscode.sh',
          }),
        );
      } else {
        console.error('Could not detect agent. Use --agent claude-code|opencode|vscode-copilot to specify.');
        process.exit(1);
      }
    });

  // perms list
  cmd
    .command('list')
    .description('List current permissions in the agent config')
    .option('--agent <agent>', 'Override detection (claude-code, opencode, vscode-copilot)')
    .option('--global', 'Read from global config', false)
    .action((opts) => {
      const agent = detectAgent(opts.agent as string | undefined);

      if (agent === 'claude-code') {
        const target = opts.global
          ? path.join(os.homedir(), '.claude', 'settings.json')
          : path.join('.claude', 'settings.json');
        const existing = readJsonFile(target);
        const allow = ((existing.permissions as Record<string, unknown>)?.allow ?? []) as string[];
        console.log(JSON.stringify({ agent, target, allow }, null, 2));
      } else if (agent === 'opencode') {
        const target = path.join(os.homedir(), '.config', 'opencode', 'config.json');
        const existing = readJsonFile(target);
        console.log(JSON.stringify({ agent, target, permission: existing.permission ?? {} }, null, 2));
      } else {
        console.error('Could not detect agent. Use --agent claude-code|opencode|vscode-copilot to specify.');
        process.exit(1);
      }
    });

  return cmd;
}
