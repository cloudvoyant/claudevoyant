import { Command } from 'commander';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { readConfig, writeConfig, getConfigPath } from '../config.js';
import type { WorktreeEntry } from '../types.js';

function git(args: string[], cwd?: string): string {
  const result = spawnSync('git', args, { encoding: 'utf-8', cwd });
  if (result.status !== 0) throw new Error(result.stderr?.trim() || `git ${args[0]} failed`);
  return result.stdout?.trim() ?? '';
}

interface ParsedWorktree {
  worktree: string;
  branch: string;
  HEAD: string;
  bare?: boolean;
}

function parseWorktreeList(cwd?: string): ParsedWorktree[] {
  const output = git(['worktree', 'list', '--porcelain'], cwd);
  if (!output) return [];

  const entries: ParsedWorktree[] = [];
  let current: Partial<ParsedWorktree> = {};

  for (const line of output.split('\n')) {
    if (line === '') {
      if (current.worktree) {
        entries.push(current as ParsedWorktree);
      }
      current = {};
    } else if (line.startsWith('worktree ')) {
      current.worktree = line.slice('worktree '.length);
    } else if (line.startsWith('HEAD ')) {
      current.HEAD = line.slice('HEAD '.length);
    } else if (line.startsWith('branch ')) {
      current.branch = line.slice('branch '.length).replace('refs/heads/', '');
    } else if (line === 'bare') {
      current.bare = true;
    }
  }
  if (current.worktree) {
    entries.push(current as ParsedWorktree);
  }

  return entries;
}

function ensureGitignoreEntry(dir: string): void {
  const gitignorePath = path.join(dir, '.gitignore');
  const entry = '.codevoyant/worktrees/';
  if (fs.existsSync(gitignorePath)) {
    const existing = fs.readFileSync(gitignorePath, 'utf-8');
    if (!existing.includes(entry)) {
      fs.appendFileSync(gitignorePath, '\n# codevoyant\n' + entry + '\n');
    }
  } else {
    fs.writeFileSync(gitignorePath, '# codevoyant\n' + entry + '\n');
  }
}

export function worktreesCommand(): Command {
  const wt = new Command('worktrees').description('Manage git worktrees');

  wt.command('create')
    .description('Create a new worktree')
    .requiredOption('--branch <branch>', 'Branch name')
    .option('--base <base>', 'Base branch/commit', 'HEAD')
    .option('--plan <plan>', 'Associated plan name')
    .option('--registry <path>', 'Path to codevoyant.json')
    .action((opts) => {
      // Validate branch name
      if (!/^[\w/.-]+$/.test(opts.branch)) {
        console.error('Invalid branch name: only alphanumeric, hyphens, underscores, slashes, and dots allowed');
        process.exit(1);
      }

      // Check not already a worktree
      const existing = parseWorktreeList();
      if (existing.some((e) => e.branch === opts.branch)) {
        console.error(`Branch "${opts.branch}" is already a worktree`);
        process.exit(1);
      }

      const wtPath = path.join('.codevoyant', 'worktrees', opts.branch);
      if (fs.existsSync(wtPath)) {
        console.error(`Directory already exists: ${wtPath}`);
        process.exit(1);
      }

      // Check if branch exists
      const branchCheck = spawnSync('git', ['rev-parse', '--verify', opts.branch], { encoding: 'utf-8' });
      if (branchCheck.status === 0) {
        git(['worktree', 'add', wtPath, opts.branch]);
      } else {
        git(['worktree', 'add', '-b', opts.branch, wtPath, opts.base]);
      }

      // Ensure .gitignore entry
      ensureGitignoreEntry('.');

      // Register in config
      const configPath = getConfigPath(opts.registry);
      const config = readConfig(configPath);
      const entry: WorktreeEntry = {
        branch: opts.branch,
        path: wtPath,
        planName: opts.plan ?? null,
        createdAt: new Date().toISOString(),
      };
      config.worktrees.push(entry);
      writeConfig(configPath, config);

      console.log(`Worktree created: ${wtPath}`);
    });

  wt.command('remove')
    .description('Remove a worktree')
    .requiredOption('--branch <branch>', 'Branch name')
    .option('--delete-branch', 'Also delete the branch', false)
    .option('--force', 'Force removal', false)
    .option('--registry <path>', 'Path to codevoyant.json')
    .action((opts) => {
      const worktrees = parseWorktreeList();
      const wte = worktrees.find((e) => e.branch === opts.branch);
      if (!wte) {
        console.error(`Worktree for branch "${opts.branch}" not found`);
        process.exit(1);
      }

      // Warn if uncommitted changes
      const statusResult = spawnSync('git', ['-C', wte.worktree, 'status', '--porcelain'], { encoding: 'utf-8' });
      if (statusResult.stdout && statusResult.stdout.trim() && !opts.force) {
        console.error(`Worktree has uncommitted changes. Use --force to remove anyway.`);
        process.exit(1);
      }

      // Remove worktree
      const removeArgs = ['worktree', 'remove', wte.worktree];
      if (opts.force) removeArgs.push('--force');
      git(removeArgs);

      // Delete branch if requested
      if (opts.deleteBranch) {
        const deleteFlag = opts.force ? '-D' : '-d';
        git(['branch', deleteFlag, opts.branch]);
      }

      // Remove from config
      const configPath = getConfigPath(opts.registry);
      const config = readConfig(configPath);
      config.worktrees = config.worktrees.filter((w) => w.branch !== opts.branch);
      writeConfig(configPath, config);

      console.log(`Removed worktree: ${opts.branch}`);
    });

  wt.command('prune')
    .description('Prune stale worktrees')
    .option('--registry <path>', 'Path to codevoyant.json')
    .action((opts) => {
      git(['worktree', 'prune', '--verbose']);

      const configPath = getConfigPath(opts.registry);
      const config = readConfig(configPath);
      const before = config.worktrees.length;
      config.worktrees = config.worktrees.filter((w) => fs.existsSync(w.path));
      const pruned = before - config.worktrees.length;
      writeConfig(configPath, config);

      console.log(`Pruned ${pruned} stale worktree entries`);
    });

  wt.command('list')
    .description('List worktrees')
    .option('--json', 'Output as JSON', false)
    .option('--registry <path>', 'Path to codevoyant.json')
    .action((opts) => {
      const worktrees = parseWorktreeList();
      const configPath = getConfigPath(opts.registry);
      const config = readConfig(configPath);

      const enriched = worktrees.map((wte) => {
        const registered = config.worktrees.find((w) => w.branch === wte.branch);
        const plan = config.activePlans.find((p) => p.worktree === wte.worktree || p.branch === wte.branch);

        // Check dirty status
        let dirty = false;
        try {
          const status = spawnSync('git', ['-C', wte.worktree, 'status', '--porcelain'], { encoding: 'utf-8' });
          dirty = !!(status.stdout && status.stdout.trim());
        } catch {
          // ignore
        }

        return {
          path: wte.worktree,
          branch: wte.branch,
          commit: wte.HEAD?.slice(0, 8) ?? '',
          status: dirty ? 'dirty' : 'clean',
          plan: plan?.name ?? registered?.planName ?? null,
        };
      });

      if (opts.json) {
        console.log(JSON.stringify(enriched, null, 2));
      } else {
        console.log('PATH\tBRANCH\tCOMMIT\tSTATUS\tPLAN');
        for (const e of enriched) {
          console.log(`${e.path}\t${e.branch}\t${e.commit}\t${e.status}\t${e.plan ?? ''}`);
        }
      }
    });

  wt.command('export')
    .description('Export plan from worktree to main repo')
    .option('--plan <plan>', 'Plan name to export')
    .option('--force', 'Overwrite existing plan in main repo', false)
    .option('--registry <path>', 'Path to codevoyant.json')
    .action((opts) => {
      const configPath = getConfigPath(opts.registry);
      const config = readConfig(configPath);

      // Auto-detect plan if not given
      let planName = opts.plan;
      if (!planName) {
        const sorted = [...config.activePlans].sort(
          (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
        );
        if (sorted.length === 0) {
          console.error('No active plans found');
          process.exit(1);
        }
        planName = sorted[0].name;
        console.log(`Auto-detected plan: ${planName}`);
      }

      // Verify plan.md exists
      const planDir = path.join('.codevoyant', 'plans', planName);
      const planMd = path.join(planDir, 'plan.md');
      if (!fs.existsSync(planMd)) {
        console.error(`Plan file not found: ${planMd}`);
        process.exit(1);
      }

      // Resolve main repo root
      const gitCommonDir = git(['rev-parse', '--git-common-dir']);
      const mainRoot = path.resolve(path.dirname(gitCommonDir));
      const currentRoot = path.resolve('.');

      if (mainRoot === currentRoot) {
        console.error('Already in main repo');
        process.exit(1);
      }

      // Check destination
      const destDir = path.join(mainRoot, '.codevoyant', 'plans', planName);
      if (fs.existsSync(destDir) && !opts.force) {
        console.error(`Destination already exists: ${destDir}. Use --force to overwrite.`);
        process.exit(1);
      }

      // Copy plan directory
      fs.cpSync(planDir, destDir, { recursive: true, force: true });

      // Upsert plan entry in main repo config
      const mainConfigPath = path.join(mainRoot, '.codevoyant', 'codevoyant.json');
      const mainConfig = readConfig(mainConfigPath);
      const existingPlan = mainConfig.activePlans.find((p) => p.name === planName);
      const sourcePlan = config.activePlans.find((p) => p.name === planName);

      if (existingPlan && sourcePlan) {
        existingPlan.progress = sourcePlan.progress;
        existingPlan.status = sourcePlan.status;
        existingPlan.lastUpdated = new Date().toISOString();
      } else if (sourcePlan) {
        mainConfig.activePlans.push({ ...sourcePlan, lastUpdated: new Date().toISOString() });
      }

      writeConfig(mainConfigPath, mainConfig);
      console.log(`Exported ${planName} to ${destDir}`);
    });

  wt.command('register')
    .description('Register a worktree in the registry (no git operations)')
    .requiredOption('--branch <branch>', 'Branch name')
    .requiredOption('--path <path>', 'Worktree path')
    .option('--plan <plan>', 'Associated plan name')
    .option('--registry <registryPath>', 'Path to codevoyant.json')
    .action((opts) => {
      const configPath = getConfigPath(opts.registryPath);
      const config = readConfig(configPath);

      const entry: WorktreeEntry = {
        branch: opts.branch,
        path: opts.path,
        planName: opts.plan ?? null,
        createdAt: new Date().toISOString(),
      };
      config.worktrees.push(entry);
      writeConfig(configPath, config);
      console.log(`Registered worktree: ${opts.branch}`);
    });

  wt.command('unregister')
    .description('Unregister a worktree from the registry (no git operations)')
    .requiredOption('--branch <branch>', 'Branch name')
    .option('--registry <path>', 'Path to codevoyant.json')
    .action((opts) => {
      const configPath = getConfigPath(opts.registry);
      const config = readConfig(configPath);
      const before = config.worktrees.length;
      config.worktrees = config.worktrees.filter((w) => w.branch !== opts.branch);

      if (config.worktrees.length === before) {
        console.error(`Worktree for branch "${opts.branch}" not found in registry`);
        process.exit(1);
      }

      writeConfig(configPath, config);
      console.log(`Unregistered worktree: ${opts.branch}`);
    });

  return wt;
}
