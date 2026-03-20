import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  detectAgent,
  buildClaudeAllow,
  mergeClaudeAllow,
  taskRunnerAllow,
  PLUGIN_PERMISSIONS,
} from '../../src/commands/perms.js';

describe('perms', () => {
  describe('detectAgent', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
      // Restore env
      for (const key of Object.keys(process.env)) {
        if (!(key in originalEnv)) delete process.env[key];
      }
      Object.assign(process.env, originalEnv);
    });

    it('returns claude-code when CLAUDECODE=1', () => {
      process.env.CLAUDECODE = '1';
      delete process.env.OPENCODE_CONFIG;
      expect(detectAgent()).toBe('claude-code');
    });

    it('returns claude-code when CLAUDE_CODE_ENTRYPOINT is set', () => {
      delete process.env.CLAUDECODE;
      process.env.CLAUDE_CODE_ENTRYPOINT = 'cli';
      expect(detectAgent()).toBe('claude-code');
    });

    it('returns opencode when an OPENCODE_ env var is set and Claude vars absent', () => {
      delete process.env.CLAUDECODE;
      delete process.env.CLAUDE_CODE_ENTRYPOINT;
      process.env.OPENCODE_CONFIG = '/some/path';
      expect(detectAgent()).toBe('opencode');
      delete process.env.OPENCODE_CONFIG;
    });

    it('prefers claude-code over opencode when both signals present', () => {
      process.env.CLAUDECODE = '1';
      process.env.OPENCODE_CONFIG = '/some/path';
      expect(detectAgent()).toBe('claude-code');
      delete process.env.OPENCODE_CONFIG;
    });

    it('honours --agent override', () => {
      expect(detectAgent('opencode')).toBe('opencode');
      expect(detectAgent('vscode-copilot')).toBe('vscode-copilot');
    });
  });

  describe('taskRunnerAllow', () => {
    it.each([
      ['just', 'Bash(just:*)'],
      ['mise run', 'Bash(mise run:*)'],
      ['task', 'Bash(task:*)'],
      ['make', 'Bash(make:*)'],
      ['pnpm run', 'Bash(pnpm run:*)'],
      ['yarn run', 'Bash(yarn:*)'],
      ['npm run', 'Bash(npm run:*)'],
    ])('maps "%s" → "%s"', (command, expected) => {
      expect(taskRunnerAllow(command)).toBe(expected);
    });

    it('returns null for unknown runner', () => {
      expect(taskRunnerAllow('gradle')).toBeNull();
    });
  });

  describe('PLUGIN_PERMISSIONS', () => {
    it('defines entries for all expected plugins', () => {
      expect(Object.keys(PLUGIN_PERMISSIONS)).toEqual(expect.arrayContaining(['spec', 'dev', 'em', 'pm', 'ux']));
    });

    it('spec includes git and web entries', () => {
      expect(PLUGIN_PERMISSIONS.spec).toContain('Bash(git commit:*)');
      expect(PLUGIN_PERMISSIONS.spec).toContain('WebSearch');
      expect(PLUGIN_PERMISSIONS.spec).toContain('WebFetch');
    });

    it('dev includes git push and gh entries', () => {
      expect(PLUGIN_PERMISSIONS.dev).toContain('Bash(git push origin:*)');
      expect(PLUGIN_PERMISSIONS.dev).toContain('Bash(gh run:*)');
    });

    it('pm and ux only need web access', () => {
      expect(PLUGIN_PERMISSIONS.pm).toContain('WebFetch');
      expect(PLUGIN_PERMISSIONS.ux).toContain('WebFetch');
    });
  });

  describe('buildClaudeAllow', () => {
    let tmpDir: string;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-perms-test-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('includes baseline entries', () => {
      const result = buildClaudeAllow([], tmpDir);
      expect(result).toContain('Read');
      expect(result).toContain('Write');
      expect(result).toContain('Edit');
      expect(result).toContain('Bash(mkdir:*)');
    });

    it('includes plugin-specific entries', () => {
      const result = buildClaudeAllow(['spec'], tmpDir);
      expect(result).toContain('Bash(git commit:*)');
      expect(result).toContain('WebSearch');
    });

    it('merges multiple plugins without duplicates', () => {
      const result = buildClaudeAllow(['spec', 'dev'], tmpDir);
      const gitLog = result.filter((e) => e === 'Bash(git log:*)');
      expect(gitLog).toHaveLength(1);
    });

    it('adds task runner allow when Makefile present', () => {
      fs.writeFileSync(path.join(tmpDir, 'Makefile'), 'test:\n\techo test\n');
      const result = buildClaudeAllow([], tmpDir);
      expect(result).toContain('Bash(make:*)');
    });

    it('returns sorted list', () => {
      const result = buildClaudeAllow(['spec', 'dev'], tmpDir);
      const sorted = [...result].sort();
      expect(result).toEqual(sorted);
    });
  });

  describe('mergeClaudeAllow', () => {
    let tmpDir: string;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-perms-merge-test-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('creates settings.json if absent', () => {
      const target = path.join(tmpDir, '.claude', 'settings.json');
      const result = mergeClaudeAllow(target, ['Read', 'Write']);
      expect(fs.existsSync(target)).toBe(true);
      expect(result.total).toBe(2);
      expect(result.added).toBe(2);
    });

    it('merges into existing permissions.allow', () => {
      const target = path.join(tmpDir, 'settings.json');
      fs.writeFileSync(target, JSON.stringify({ permissions: { allow: ['Read'] } }));
      const result = mergeClaudeAllow(target, ['Read', 'Write']);
      expect(result.total).toBe(2);
      expect(result.added).toBe(1); // only Write is new
    });

    it('preserves other top-level settings keys', () => {
      const target = path.join(tmpDir, 'settings.json');
      fs.writeFileSync(target, JSON.stringify({ theme: 'dark', permissions: { allow: [] } }));
      mergeClaudeAllow(target, ['Read']);
      const written = JSON.parse(fs.readFileSync(target, 'utf-8'));
      expect(written.theme).toBe('dark');
    });

    it('deduplicates entries', () => {
      const target = path.join(tmpDir, 'settings.json');
      mergeClaudeAllow(target, ['Read', 'Write']);
      const result = mergeClaudeAllow(target, ['Read', 'Write', 'Glob']);
      expect(result.added).toBe(1);
      expect(result.total).toBe(3);
    });
  });
});
