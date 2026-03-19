import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnCLI, mkTmpDir, cleanTmpDir } from './helpers.js';

describe('notify command', () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = mkTmpDir();
  });

  afterAll(() => {
    cleanTmpDir(tmpDir);
  });

  it('should exit 0 with --silent', () => {
    const result = spawnCLI(['notify', '--title', 'Test', '--message', 'Hello', '--silent'], tmpDir);
    expect(result.status).toBe(0);
  });

  it('should exit non-zero when --title is missing', () => {
    const result = spawnCLI(['notify', '--message', 'Hello'], tmpDir);
    expect(result.status).not.toBe(0);
  });

  it('should exit non-zero when --message is missing', () => {
    const result = spawnCLI(['notify', '--title', 'Test'], tmpDir);
    expect(result.status).not.toBe(0);
  });
});
