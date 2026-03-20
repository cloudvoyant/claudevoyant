import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { spawnCLI, mkTmpDir, cleanTmpDir } from './helpers.js';

function writeMd(dir: string, relativePath: string, frontmatter: string, body = ''): void {
  const fullPath = path.join(dir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `---\n${frontmatter}\n---\n${body}`);
}

describe('mem command (integration)', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkTmpDir();
    fs.mkdirSync(path.join(tmpDir, '.codevoyant'), { recursive: true });
  });

  afterEach(() => {
    cleanTmpDir(tmpDir);
  });

  it('indexes .md files with valid frontmatter', () => {
    writeMd(
      tmpDir,
      'styleguide/naming.md',
      'type: styleguide\ntags: [naming, typescript]\ndescription: Naming conventions',
    );
    writeMd(tmpDir, 'decisions/adr-001.md', 'type: decision\ntags: [architecture]\ndescription: Use ESM');

    const result = spawnCLI(['mem', 'index', '--dir', tmpDir], tmpDir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Indexed 2 doc(s)');

    const manifest = JSON.parse(fs.readFileSync(path.join(tmpDir, '.codevoyant', 'mem.json'), 'utf-8'));
    expect(manifest).toHaveLength(2);
  });

  it('omits archived docs from index', () => {
    writeMd(tmpDir, 'active.md', 'type: guide\ntags: [setup]\ndescription: Active');
    writeMd(tmpDir, 'archived.md', 'type: guide\ntags: [setup]\nstatus: archived\ndescription: Archived');

    const result = spawnCLI(['mem', 'index', '--dir', tmpDir], tmpDir);
    expect(result.status).toBe(0);

    const manifest = JSON.parse(fs.readFileSync(path.join(tmpDir, '.codevoyant', 'mem.json'), 'utf-8'));
    expect(manifest).toHaveLength(1);
    expect(manifest[0].path).toBe('active.md');
  });

  it('treats missing status as active', () => {
    writeMd(tmpDir, 'no-status.md', 'type: guide\ntags: [setup]\ndescription: No status');

    spawnCLI(['mem', 'index', '--dir', tmpDir], tmpDir);

    const manifest = JSON.parse(fs.readFileSync(path.join(tmpDir, '.codevoyant', 'mem.json'), 'utf-8'));
    expect(manifest).toHaveLength(1);
    expect(manifest[0].path).toBe('no-status.md');
  });

  it('omits files with no type/tags', () => {
    writeMd(tmpDir, 'valid.md', 'type: guide\ntags: [setup]\ndescription: Valid');
    writeMd(tmpDir, 'no-type.md', 'tags: [orphan]\ndescription: Missing type');
    writeMd(tmpDir, 'no-tags.md', 'type: guide\ndescription: Missing tags');

    spawnCLI(['mem', 'index', '--dir', tmpDir], tmpDir);

    const manifest = JSON.parse(fs.readFileSync(path.join(tmpDir, '.codevoyant', 'mem.json'), 'utf-8'));
    expect(manifest).toHaveLength(1);
    expect(manifest[0].path).toBe('valid.md');
  });

  it('mem find --type filters correctly', () => {
    writeMd(tmpDir, 'a.md', 'type: styleguide\ntags: [naming]\ndescription: A');
    writeMd(tmpDir, 'b.md', 'type: decision\ntags: [naming]\ndescription: B');

    spawnCLI(['mem', 'index', '--dir', tmpDir], tmpDir);

    const result = spawnCLI(['mem', 'find', '--type', 'styleguide', '--dir', tmpDir], tmpDir);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('a.md');
  });

  it('mem find --tag uses AND logic across multiple flags', () => {
    writeMd(tmpDir, 'both.md', 'type: guide\ntags: [typescript, naming]\ndescription: Both');
    writeMd(tmpDir, 'one.md', 'type: guide\ntags: [typescript]\ndescription: One');

    spawnCLI(['mem', 'index', '--dir', tmpDir], tmpDir);

    const result = spawnCLI(['mem', 'find', '--tag', 'typescript', '--tag', 'naming', '--dir', tmpDir], tmpDir);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('both.md');
  });

  it('mem find --json returns full entry objects', () => {
    writeMd(tmpDir, 'doc.md', 'type: guide\ntags: [setup]\ndescription: My guide');

    spawnCLI(['mem', 'index', '--dir', tmpDir], tmpDir);

    const result = spawnCLI(['mem', 'find', '--tag', 'setup', '--json', '--dir', tmpDir], tmpDir);
    expect(result.status).toBe(0);

    const parsed = JSON.parse(result.stdout);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual({
      path: 'doc.md',
      type: 'guide',
      tags: ['setup'],
      description: 'My guide',
    });
  });
});
