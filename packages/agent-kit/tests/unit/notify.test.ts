import { describe, it, expect, vi, beforeEach } from 'vitest';
import { spawnSync } from 'child_process';

vi.mock('child_process', () => ({ spawnSync: vi.fn() }));

import { notifyCommand } from '../../src/commands/notify.js';

describe('notifyCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call spawnSync when --silent is not set', async () => {
    const cmd = notifyCommand();
    await cmd.parseAsync(['--title', 'Test', '--message', 'Hello'], { from: 'user' });

    expect(spawnSync).toHaveBeenCalled();
  });

  it('should NOT call spawnSync when --silent is set', async () => {
    const cmd = notifyCommand();
    await cmd.parseAsync(['--title', 'Test', '--message', 'Hello', '--silent'], { from: 'user' });

    expect(spawnSync).not.toHaveBeenCalled();
  });
});
