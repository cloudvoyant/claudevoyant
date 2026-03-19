import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node-notifier', () => ({ default: { notify: vi.fn() } }));

import notifier from 'node-notifier';
import { notifyCommand } from '../../src/commands/notify.js';

describe('notifyCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call notifier.notify when --silent is not set', async () => {
    const cmd = notifyCommand();
    await cmd.parseAsync(['--title', 'Test', '--message', 'Hello'], { from: 'user' });

    expect(notifier.notify).toHaveBeenCalledWith({ title: 'Test', message: 'Hello' });
  });

  it('should NOT call notifier.notify when --silent is set', async () => {
    const cmd = notifyCommand();
    await cmd.parseAsync(['--title', 'Test', '--message', 'Hello', '--silent'], { from: 'user' });

    expect(notifier.notify).not.toHaveBeenCalled();
  });
});
