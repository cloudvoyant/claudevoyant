import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { spawnCLI, mkTmpDir, cleanTmpDir } from './helpers.js';

describe('init command', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkTmpDir();
  });

  afterEach(() => {
    cleanTmpDir(tmpDir);
  });

  it('should create .codevoyant/ directory structure', () => {
    const result = spawnCLI(['init', '--dir', tmpDir], tmpDir);
    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(tmpDir, '.codevoyant', 'codevoyant.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.codevoyant', 'settings.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.codevoyant', 'plans'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.codevoyant', 'worktrees'))).toBe(true);
  });

  it('should create .gitignore with worktrees entry', () => {
    spawnCLI(['init', '--dir', tmpDir], tmpDir);
    const gitignore = fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf-8');
    expect(gitignore).toContain('.codevoyant/worktrees/');
  });

  it('should append to existing .gitignore', () => {
    fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'node_modules/\n');
    spawnCLI(['init', '--dir', tmpDir], tmpDir);
    const gitignore = fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf-8');
    expect(gitignore).toContain('node_modules/');
    expect(gitignore).toContain('.codevoyant/worktrees/');
  });

  it('should be idempotent', () => {
    spawnCLI(['init', '--dir', tmpDir], tmpDir);
    const first = fs.readFileSync(path.join(tmpDir, '.codevoyant', 'codevoyant.json'), 'utf-8');

    spawnCLI(['init', '--dir', tmpDir], tmpDir);
    const second = fs.readFileSync(path.join(tmpDir, '.codevoyant', 'codevoyant.json'), 'utf-8');

    expect(first).toBe(second);
  });

  it('should write valid JSON in codevoyant.json', () => {
    spawnCLI(['init', '--dir', tmpDir], tmpDir);
    const raw = fs.readFileSync(path.join(tmpDir, '.codevoyant', 'codevoyant.json'), 'utf-8');
    const config = JSON.parse(raw);
    expect(config.version).toBe('1.0');
    expect(config.activePlans).toEqual([]);
  });
});
