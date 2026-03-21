import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { REPO_ROOT, parseFrontmatter } from './helpers.js';

const marketplacePath = join(REPO_ROOT, '.claude-plugin/marketplace.json');
const marketplace = JSON.parse(readFileSync(marketplacePath, 'utf-8'));

describe('Claude marketplace.json', () => {
  it('is valid JSON with no trailing commas', () => {
    expect(() => JSON.parse(readFileSync(marketplacePath, 'utf-8'))).not.toThrow();
  });

  it('has required top-level fields', () => {
    expect(marketplace).toHaveProperty('name');
    expect(marketplace).toHaveProperty('plugins');
    expect(Array.isArray(marketplace.plugins)).toBe(true);
    expect(marketplace.plugins.length).toBeGreaterThan(0);
  });

  it('each plugin entry has name, description, and source', () => {
    for (const plugin of marketplace.plugins) {
      expect(plugin, `plugin missing name`).toHaveProperty('name');
      expect(plugin, `${plugin.name} missing description`).toHaveProperty('description');
      expect(plugin, `${plugin.name} missing source`).toHaveProperty('source');
    }
  });

  it('each plugin source path exists on disk', () => {
    for (const plugin of marketplace.plugins) {
      const sourcePath = join(REPO_ROOT, plugin.source);
      expect(existsSync(sourcePath), `${plugin.name}: source path not found at ${sourcePath}`).toBe(true);
    }
  });
});

describe('Flat skills/ structure', () => {
  const skillsDir = join(REPO_ROOT, 'skills');

  it('skills/ directory exists', () => {
    expect(existsSync(skillsDir)).toBe(true);
  });

  it('has 40+ skill directories', () => {
    const skills = readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
    expect(skills.length).toBeGreaterThanOrEqual(40);
  });

  it('each skill directory has a SKILL.md', () => {
    const skills = readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const skill of skills) {
      const skillFile = join(skillsDir, skill, 'SKILL.md');
      expect(existsSync(skillFile), `missing SKILL.md in skills/${skill}`).toBe(true);
    }
  });
});

describe('SKILL.md structure', () => {
  const skillsDir = join(REPO_ROOT, 'skills');
  const skills = readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const skill of skills) {
    const skillFile = join(skillsDir, skill, 'SKILL.md');

    it(`${skill} — SKILL.md exists`, () => {
      expect(existsSync(skillFile), `missing ${skillFile}`).toBe(true);
    });

    it(`${skill} — has description in frontmatter`, () => {
      const content = readFileSync(skillFile, 'utf-8');
      const fm = parseFrontmatter(content);
      expect(fm.description, `${skill} missing frontmatter description`).toBeTruthy();
    });

    it(`${skill} — frontmatter opens and closes with ---`, () => {
      const content = readFileSync(skillFile, 'utf-8');
      expect(content.startsWith('---\n'), `${skill} frontmatter must start with ---`).toBe(true);
      const secondDash = content.indexOf('\n---', 3);
      expect(secondDash, `${skill} frontmatter not closed`).toBeGreaterThan(0);
    });
  }
});
