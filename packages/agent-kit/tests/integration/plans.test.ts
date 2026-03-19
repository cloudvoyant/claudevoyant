import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { spawnCLI, mkTmpDir, cleanTmpDir } from './helpers.js';

describe('plans command', () => {
  let tmpDir: string;
  let registryPath: string;

  beforeEach(() => {
    tmpDir = mkTmpDir();
    registryPath = path.join(tmpDir, '.codevoyant', 'codevoyant.json');
    // Initialize
    spawnCLI(['init', '--dir', tmpDir], tmpDir);
  });

  afterEach(() => {
    cleanTmpDir(tmpDir);
  });

  describe('register', () => {
    it('should register a new plan', () => {
      const result = spawnCLI(
        [
          'plans',
          'register',
          '--name',
          'test-plan',
          '--plugin',
          'spec',
          '--description',
          'A test',
          '--total',
          '5',
          '--registry',
          registryPath,
        ],
        tmpDir,
      );
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Registered plan: test-plan');

      const config = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      expect(config.activePlans).toHaveLength(1);
      expect(config.activePlans[0].name).toBe('test-plan');
      expect(config.activePlans[0].plugin).toBe('spec');
      expect(config.activePlans[0].progress.total).toBe(5);
    });

    it('should reject duplicate plan names', () => {
      spawnCLI(
        [
          'plans',
          'register',
          '--name',
          'dup',
          '--plugin',
          'spec',
          '--description',
          'First',
          '--registry',
          registryPath,
        ],
        tmpDir,
      );
      const result = spawnCLI(
        [
          'plans',
          'register',
          '--name',
          'dup',
          '--plugin',
          'spec',
          '--description',
          'Second',
          '--registry',
          registryPath,
        ],
        tmpDir,
      );
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('already exists');
    });
  });

  describe('update-progress', () => {
    it('should update progress', () => {
      spawnCLI(
        [
          'plans',
          'register',
          '--name',
          'prog',
          '--plugin',
          'spec',
          '--description',
          'Test',
          '--total',
          '10',
          '--registry',
          registryPath,
        ],
        tmpDir,
      );
      const result = spawnCLI(
        ['plans', 'update-progress', '--name', 'prog', '--completed', '3', '--registry', registryPath],
        tmpDir,
      );
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('3/10');
    });

    it('should update total when provided', () => {
      spawnCLI(
        [
          'plans',
          'register',
          '--name',
          'prog2',
          '--plugin',
          'spec',
          '--description',
          'Test',
          '--total',
          '5',
          '--registry',
          registryPath,
        ],
        tmpDir,
      );
      spawnCLI(
        ['plans', 'update-progress', '--name', 'prog2', '--completed', '2', '--total', '8', '--registry', registryPath],
        tmpDir,
      );
      const config = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      expect(config.activePlans[0].progress).toEqual({ completed: 2, total: 8 });
    });
  });

  describe('update-status', () => {
    it('should update status', () => {
      spawnCLI(
        [
          'plans',
          'register',
          '--name',
          'stat',
          '--plugin',
          'spec',
          '--description',
          'Test',
          '--registry',
          registryPath,
        ],
        tmpDir,
      );
      const result = spawnCLI(
        ['plans', 'update-status', '--name', 'stat', '--status', 'Executing', '--registry', registryPath],
        tmpDir,
      );
      expect(result.status).toBe(0);
      const config = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      expect(config.activePlans[0].status).toBe('Executing');
    });
  });

  describe('archive', () => {
    it('should move plan from active to archived', () => {
      spawnCLI(
        [
          'plans',
          'register',
          '--name',
          'arch',
          '--plugin',
          'spec',
          '--description',
          'Test',
          '--registry',
          registryPath,
        ],
        tmpDir,
      );
      const result = spawnCLI(['plans', 'archive', '--name', 'arch', '--registry', registryPath], tmpDir);
      expect(result.status).toBe(0);

      const config = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      expect(config.activePlans).toHaveLength(0);
      expect(config.archivedPlans).toHaveLength(1);
      expect(config.archivedPlans[0].name).toBe('arch');
      expect(config.archivedPlans[0].status).toBe('Complete');
    });
  });

  describe('delete', () => {
    it('should delete from active plans', () => {
      spawnCLI(
        ['plans', 'register', '--name', 'del', '--plugin', 'spec', '--description', 'Test', '--registry', registryPath],
        tmpDir,
      );
      const result = spawnCLI(['plans', 'delete', '--name', 'del', '--registry', registryPath], tmpDir);
      expect(result.status).toBe(0);

      const config = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      expect(config.activePlans).toHaveLength(0);
    });

    it('should error on nonexistent plan', () => {
      const result = spawnCLI(['plans', 'delete', '--name', 'nope', '--registry', registryPath], tmpDir);
      expect(result.status).not.toBe(0);
    });
  });

  describe('rename', () => {
    it('should rename a plan', () => {
      spawnCLI(
        [
          'plans',
          'register',
          '--name',
          'old-name',
          '--plugin',
          'spec',
          '--description',
          'Test',
          '--registry',
          registryPath,
        ],
        tmpDir,
      );
      const result = spawnCLI(
        ['plans', 'rename', '--name', 'old-name', '--new-name', 'new-name', '--registry', registryPath],
        tmpDir,
      );
      expect(result.status).toBe(0);

      const config = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      expect(config.activePlans[0].name).toBe('new-name');
      expect(config.activePlans[0].path).toContain('new-name');
    });
  });

  describe('get', () => {
    it('should print plan as JSON', () => {
      spawnCLI(
        [
          'plans',
          'register',
          '--name',
          'get-me',
          '--plugin',
          'spec',
          '--description',
          'Test',
          '--registry',
          registryPath,
        ],
        tmpDir,
      );
      const result = spawnCLI(['plans', 'get', '--name', 'get-me', '--registry', registryPath], tmpDir);
      expect(result.status).toBe(0);

      const plan = JSON.parse(result.stdout);
      expect(plan.name).toBe('get-me');
    });

    it('should error on nonexistent plan', () => {
      const result = spawnCLI(['plans', 'get', '--name', 'nope', '--registry', registryPath], tmpDir);
      expect(result.status).not.toBe(0);
    });
  });

  describe('list', () => {
    it('should list active plans as JSON', () => {
      spawnCLI(
        ['plans', 'register', '--name', 'p1', '--plugin', 'spec', '--description', 'A', '--registry', registryPath],
        tmpDir,
      );
      spawnCLI(
        ['plans', 'register', '--name', 'p2', '--plugin', 'pm', '--description', 'B', '--registry', registryPath],
        tmpDir,
      );
      const result = spawnCLI(['plans', 'list', '--registry', registryPath], tmpDir);
      expect(result.status).toBe(0);

      const plans = JSON.parse(result.stdout);
      expect(plans).toHaveLength(2);
    });

    it('should filter by plugin', () => {
      spawnCLI(
        ['plans', 'register', '--name', 'p1', '--plugin', 'spec', '--description', 'A', '--registry', registryPath],
        tmpDir,
      );
      spawnCLI(
        ['plans', 'register', '--name', 'p2', '--plugin', 'pm', '--description', 'B', '--registry', registryPath],
        tmpDir,
      );
      const result = spawnCLI(['plans', 'list', '--plugin', 'pm', '--registry', registryPath], tmpDir);
      const plans = JSON.parse(result.stdout);
      expect(plans).toHaveLength(1);
      expect(plans[0].plugin).toBe('pm');
    });
  });

  describe('migrate', () => {
    it('should migrate spec.json to codevoyant.json', () => {
      // Remove existing codevoyant.json first
      fs.unlinkSync(registryPath);

      // Create a legacy spec.json
      const specData = {
        activePlans: [
          {
            name: 'legacy-plan',
            description: 'From spec.json',
            status: 'Active',
            progress: { completed: 0, total: 3 },
            created: '2024-01-01T00:00:00Z',
            lastUpdated: '2024-01-01T00:00:00Z',
            path: '.codevoyant/plans/legacy-plan/',
            branch: null,
            worktree: null,
          },
        ],
      };
      fs.writeFileSync(path.join(tmpDir, '.codevoyant', 'spec.json'), JSON.stringify(specData));

      const result = spawnCLI(['plans', 'migrate', '--dir', tmpDir], tmpDir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Migrated spec.json');

      const config = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      expect(config.activePlans).toHaveLength(1);
      expect(config.activePlans[0].plugin).toBe('spec');
    });

    it('should no-op if codevoyant.json already exists', () => {
      const result = spawnCLI(['plans', 'migrate', '--dir', tmpDir], tmpDir);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('already exists');
    });
  });
});
