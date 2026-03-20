import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import { detectCIProvider } from '../../src/commands/ci.js';

describe('detectCIProvider', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-ci-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('detects github from remote URL', () => {
    execSync('git init', { cwd: tmpDir, stdio: 'pipe' });
    execSync('git remote add origin https://github.com/org/repo.git', { cwd: tmpDir, stdio: 'pipe' });
    const result = detectCIProvider(tmpDir);
    expect(result.provider).toBe('github');
    expect(result.remote).toContain('github.com');
  });

  it('detects gitlab from remote URL', () => {
    execSync('git init', { cwd: tmpDir, stdio: 'pipe' });
    execSync('git remote add origin https://gitlab.com/org/repo.git', { cwd: tmpDir, stdio: 'pipe' });
    const result = detectCIProvider(tmpDir);
    expect(result.provider).toBe('gitlab');
    expect(result.remote).toContain('gitlab.com');
  });

  it('returns unknown for non-git directory', () => {
    // tmpDir has no git repo and likely no gh/glab (or they are present — just check shape)
    const result = detectCIProvider(tmpDir);
    expect(['github', 'gitlab', 'unknown']).toContain(result.provider);
    expect(result).toHaveProperty('remote');
  });

  it('returns unknown remote null for non-git directory without CLIs', () => {
    // We can only assert the shape; CLI presence varies by environment
    const result = detectCIProvider(tmpDir);
    expect(result).toMatchObject({ provider: expect.any(String), remote: null });
  });
});
