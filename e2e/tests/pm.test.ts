import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT } from './helpers.js';

// MANUAL: confirm prd attaches to Linear project via create_document
// MANUAL: confirm roadmap attaches to Linear initiative via create_document
// MANUAL: confirm "No — repo only" skips all Linear calls

describe('pm:prd skill structure', () => {
  const prdSkillDir = join(REPO_ROOT, 'skills', 'pm-prd');
  const prdRefsDir = join(prdSkillDir, 'references');

  it('pm:prd SKILL.md references docs/prd/ output path', () => {
    const content = readFileSync(join(prdSkillDir, 'SKILL.md'), 'utf-8');
    expect(content).toContain('docs/prd/');
  });

  it('pm:prd template contains required sections', () => {
    const template = readFileSync(join(prdRefsDir, 'prd-template.md'), 'utf-8');
    expect(template).toContain('Problem');
    expect(template).toContain('Goals');
    expect(template).toContain('Non-Goals');
    expect(template).toContain('Requirements');
    expect(template).toContain('Acceptance Criteria');
    expect(template).toContain('Open Questions');
    expect(template).toContain('Dependencies');
  });

  it('pm:prd references create_document for Linear attachment', () => {
    const content = readFileSync(join(prdSkillDir, 'SKILL.md'), 'utf-8');
    expect(content).toContain('create_document');
  });

  it('pm:prd template exists', () => {
    expect(existsSync(join(prdRefsDir, 'prd-template.md'))).toBe(true);
  });
});

describe('pm:plan skill structure', () => {
  const planSkillDir = join(REPO_ROOT, 'skills', 'pm-plan');
  const planRefsDir = join(planSkillDir, 'references');

  it('pm:plan SKILL.md references docs/product/roadmaps/ output path', () => {
    const content = readFileSync(join(planSkillDir, 'SKILL.md'), 'utf-8');
    expect(content).toContain('docs/product/roadmaps');
  });

  it('pm:plan references create_document for Linear attachment', () => {
    const content = readFileSync(join(planSkillDir, 'SKILL.md'), 'utf-8');
    expect(content).toContain('create_document');
  });

  it('pm:plan roadmap template exists', () => {
    expect(existsSync(join(planRefsDir, 'roadmap-template.md'))).toBe(true);
  });

  it('deleted skills no longer exist', () => {
    expect(existsSync(join(REPO_ROOT, 'skills', 'pm-breakdown', 'SKILL.md'))).toBe(false);
    expect(existsSync(join(REPO_ROOT, 'skills', 'pm-docs', 'SKILL.md'))).toBe(false);
  });
});
