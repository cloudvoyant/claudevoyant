import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// We test the mem command logic by importing the internals indirectly through the CLI.
// For unit tests, we create fixture files and invoke the command's action logic.
// Since the command is a Commander command, we'll test via the built binary (lightweight spawn).
// However, for true unit tests of parsing/indexing, we re-implement a focused approach.

// Import the command factory to test
import { memCommand } from '../../src/commands/mem.js';

// Helper to create .md files with frontmatter
function writeMd(dir: string, relativePath: string, frontmatter: string, body = ''): void {
  const fullPath = path.join(dir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `---\n${frontmatter}\n---\n${body}`);
}

// Helper: run the mem command programmatically by capturing stdout
async function runMemCommand(args: string[]): Promise<string> {
  const cmd = memCommand();
  let output = '';
  const origLog = console.log;
  console.log = (...msgs: unknown[]) => {
    output += msgs.join(' ') + '\n';
  };
  try {
    await cmd.parseAsync(['node', 'mem', ...args]);
  } finally {
    console.log = origLog;
  }
  return output;
}

describe('mem command (unit)', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-mem-unit-'));
    fs.mkdirSync(path.join(tmpDir, '.codevoyant'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('mem index', () => {
    it('indexes files with valid frontmatter', async () => {
      writeMd(
        tmpDir,
        'styleguide/naming.md',
        'type: styleguide\ntags: [naming, typescript]\ndescription: Naming conventions',
      );
      writeMd(tmpDir, 'decisions/adr-001.md', 'type: decision\ntags: [architecture]\ndescription: Use ESM');

      await runMemCommand(['index', '--dir', tmpDir]);

      const manifest = JSON.parse(fs.readFileSync(path.join(tmpDir, '.codevoyant', 'mem.json'), 'utf-8'));
      expect(manifest).toHaveLength(2);
      const names = manifest.map((e: { path: string }) => e.path).sort();
      expect(names).toContain('decisions/adr-001.md');
      expect(names).toContain('styleguide/naming.md');
    });

    it('skips files without type or tags', async () => {
      writeMd(tmpDir, 'valid.md', 'type: guide\ntags: [setup]\ndescription: Valid');
      writeMd(tmpDir, 'no-type.md', 'tags: [orphan]\ndescription: Missing type');
      writeMd(tmpDir, 'no-tags.md', 'type: guide\ndescription: Missing tags');
      writeMd(tmpDir, 'no-frontmatter.md', '', 'Just a plain markdown file.');

      await runMemCommand(['index', '--dir', tmpDir]);

      const manifest = JSON.parse(fs.readFileSync(path.join(tmpDir, '.codevoyant', 'mem.json'), 'utf-8'));
      expect(manifest).toHaveLength(1);
      expect(manifest[0].path).toBe('valid.md');
    });

    it('omits archived docs, treats missing status as active', async () => {
      writeMd(tmpDir, 'active.md', 'type: guide\ntags: [setup]\nstatus: active');
      writeMd(tmpDir, 'no-status.md', 'type: guide\ntags: [setup]');
      writeMd(tmpDir, 'archived.md', 'type: guide\ntags: [setup]\nstatus: archived');

      await runMemCommand(['index', '--dir', tmpDir]);

      const manifest = JSON.parse(fs.readFileSync(path.join(tmpDir, '.codevoyant', 'mem.json'), 'utf-8'));
      expect(manifest).toHaveLength(2);
      const paths = manifest.map((e: { path: string }) => e.path).sort();
      expect(paths).toContain('active.md');
      expect(paths).toContain('no-status.md');
    });

    it('output has only path, type, tags, description — no status/date/updated', async () => {
      writeMd(tmpDir, 'doc.md', 'type: styleguide\ntags: [ts]\ndescription: Test\nstatus: active\ndate: 2024-01-01');

      await runMemCommand(['index', '--dir', tmpDir]);

      const manifest = JSON.parse(fs.readFileSync(path.join(tmpDir, '.codevoyant', 'mem.json'), 'utf-8'));
      expect(manifest).toHaveLength(1);
      const entry = manifest[0];
      expect(Object.keys(entry).sort()).toEqual(['description', 'path', 'tags', 'type']);
    });

    it('excludes node_modules, .codevoyant, docs, .git', async () => {
      writeMd(tmpDir, 'root.md', 'type: guide\ntags: [setup]');
      writeMd(tmpDir, 'node_modules/pkg/README.md', 'type: guide\ntags: [npm]');
      writeMd(tmpDir, '.codevoyant/internal.md', 'type: guide\ntags: [internal]');
      writeMd(tmpDir, 'docs/public.md', 'type: guide\ntags: [public]');
      writeMd(tmpDir, '.git/hooks/readme.md', 'type: guide\ntags: [git]');
      writeMd(tmpDir, 'subdir/nested.md', 'type: guide\ntags: [nested]');

      await runMemCommand(['index', '--dir', tmpDir]);

      const manifest = JSON.parse(fs.readFileSync(path.join(tmpDir, '.codevoyant', 'mem.json'), 'utf-8'));
      const paths = manifest.map((e: { path: string }) => e.path);
      expect(paths).toContain('root.md');
      expect(paths).toContain('subdir/nested.md');
      expect(paths).not.toContain(expect.stringContaining('node_modules'));
      expect(paths).not.toContain(expect.stringContaining('.codevoyant'));
      expect(paths).not.toContain(expect.stringContaining('docs'));
      expect(paths).not.toContain(expect.stringContaining('.git'));
    });
  });

  describe('mem find', () => {
    it('filters by tag (AND logic) and type', async () => {
      writeMd(tmpDir, 'a.md', 'type: styleguide\ntags: [naming, typescript]\ndescription: A');
      writeMd(tmpDir, 'b.md', 'type: styleguide\ntags: [naming]\ndescription: B');
      writeMd(tmpDir, 'c.md', 'type: decision\ntags: [naming, typescript]\ndescription: C');

      await runMemCommand(['index', '--dir', tmpDir]);

      // AND logic: both tags must match
      const output = await runMemCommand(['find', '--tag', 'naming', '--tag', 'typescript', '--dir', tmpDir]);
      expect(output.trim().split('\n').sort()).toEqual(['a.md', 'c.md']);

      // With type filter
      const filtered = await runMemCommand([
        'find',
        '--tag',
        'naming',
        '--tag',
        'typescript',
        '--type',
        'styleguide',
        '--dir',
        tmpDir,
      ]);
      expect(filtered.trim()).toBe('a.md');
    });

    it('handles missing mem.json gracefully (auto-indexes)', async () => {
      writeMd(tmpDir, 'doc.md', 'type: guide\ntags: [setup]\ndescription: Test');
      // No prior index — find should auto-index
      const output = await runMemCommand(['find', '--tag', 'setup', '--dir', tmpDir]);
      expect(output.trim()).toBe('doc.md');
    });

    it('--json returns full entry objects', async () => {
      writeMd(tmpDir, 'doc.md', 'type: guide\ntags: [setup]\ndescription: My guide');

      await runMemCommand(['index', '--dir', tmpDir]);

      const output = await runMemCommand(['find', '--tag', 'setup', '--json', '--dir', tmpDir]);
      const parsed = JSON.parse(output);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toEqual({
        path: 'doc.md',
        type: 'guide',
        tags: ['setup'],
        description: 'My guide',
      });
    });
  });
});
