import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from './helpers.js';

// MANUAL: confirm push creates project, 3 milestones, issues in Linear
// MANUAL: confirm --continue reads project/milestones/issues and updates local files
// MANUAL: confirm linear-ids.json written after push

describe('em:plan skill structure', () => {
  const planSkillDir = join(REPO_ROOT, 'skills', 'em-plan');
  const refsDir = join(planSkillDir, 'references');

  it('em:plan SKILL.md exists', () => {
    expect(existsSync(join(planSkillDir, 'SKILL.md'))).toBe(true);
  });

  it('em:plan local output structure uses .codevoyant/em/plans/{slug}/', () => {
    const content = readFileSync(join(planSkillDir, 'SKILL.md'), 'utf-8');
    expect(content).toContain('.codevoyant/em/plans/');
    expect(content).toContain('plan.md');
    expect(content).toContain('tasks/');
  });

  it('em:plan --delegate produces stubs not full breakdown', () => {
    const content = readFileSync(join(planSkillDir, 'SKILL.md'), 'utf-8');
    expect(content).toContain('--delegate');
    expect(content).toMatch(/stub/i);
  });

  it('em:plan plan-template contains milestone table, requirements, and ACs', () => {
    const template = readFileSync(join(refsDir, 'plan-template.md'), 'utf-8');
    expect(template).toContain('Milestones');
    expect(template).toContain('| Milestone |');
    expect(template).toContain('Requirements');
    expect(template).toContain('Acceptance Criteria');
  });

  it('em:plan references include plan-template, task-template, linear-push-guide', () => {
    expect(existsSync(join(refsDir, 'plan-template.md'))).toBe(true);
    expect(existsSync(join(refsDir, 'task-template.md'))).toBe(true);
    expect(existsSync(join(refsDir, 'linear-push-guide.md'))).toBe(true);
  });

  it('em:plan documents --continue and --push flags', () => {
    const content = readFileSync(join(planSkillDir, 'SKILL.md'), 'utf-8');
    expect(content).toContain('--continue');
    expect(content).toContain('--push');
  });

  it('em:plan references Linear MCP tools for push', () => {
    const content = readFileSync(join(planSkillDir, 'SKILL.md'), 'utf-8');
    expect(content).toMatch(/save_project|save_milestone|save_issue/);
  });

  it('deleted skills no longer exist', () => {
    expect(existsSync(join(REPO_ROOT, 'skills', 'em-breakdown', 'SKILL.md'))).toBe(false);
    expect(existsSync(join(REPO_ROOT, 'skills', 'em-sync', 'SKILL.md'))).toBe(false);
    expect(existsSync(join(REPO_ROOT, 'skills', 'em-docs', 'SKILL.md'))).toBe(false);
  });
});
