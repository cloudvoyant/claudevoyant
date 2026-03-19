import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export const CLI = path.resolve(path.join(__dirname, '..', '..', 'dist', 'bin.js'));

export function spawnCLI(args: string[], cwd: string): { status: number; stdout: string; stderr: string } {
  const r = spawnSync('node', [CLI, ...args], { encoding: 'utf-8', cwd });
  return { status: r.status ?? 1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

export function mkTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cv-test-'));
}

export function initGitRepo(dir: string): void {
  spawnSync('git', ['init'], { cwd: dir });
  spawnSync(
    'git',
    ['-c', 'user.email=test@test.com', '-c', 'user.name=Test', 'commit', '--allow-empty', '-m', 'init'],
    {
      cwd: dir,
    },
  );
}

export function cleanTmpDir(dir: string): void {
  fs.rmSync(dir, { recursive: true, force: true });
}
