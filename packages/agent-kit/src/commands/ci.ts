import { Command } from 'commander';
import { execSync } from 'child_process';

export type CIProvider = 'github' | 'gitlab' | 'unknown';

export interface CIInfo {
  provider: CIProvider;
  remote: string | null;
}

/** Detect the CI provider from the git remote URL, with CLI fallback. */
export function detectCIProvider(cwd?: string): CIInfo {
  const opts = { encoding: 'utf-8' as const, stdio: 'pipe' as const, cwd };

  let remote: string | null = null;
  try {
    remote = execSync('git remote get-url origin', opts).trim();
    if (remote.includes('github')) return { provider: 'github', remote };
    if (remote.includes('gitlab')) return { provider: 'gitlab', remote };
  } catch {
    // not a git repo or no remote — fall through to CLI detection
  }

  // Fallback: check which CLI is installed
  try {
    execSync('gh --version', opts);
    return { provider: 'github', remote };
    // eslint-disable-next-line no-empty
  } catch {}

  try {
    execSync('glab --version', opts);
    return { provider: 'gitlab', remote };
    // eslint-disable-next-line no-empty
  } catch {}

  return { provider: 'unknown', remote };
}

export function ciCommand(): Command {
  const cmd = new Command('ci').description('CI/CD provider detection');

  cmd
    .command('detect')
    .description('Detect the CI provider from git remote URL')
    .option('--dir <dir>', 'Directory to run git command in')
    .action((opts) => {
      const result = detectCIProvider(opts.dir);
      console.log(JSON.stringify(result, null, 2));
    });

  return cmd;
}
