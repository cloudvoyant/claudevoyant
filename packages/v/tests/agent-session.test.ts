import { describe, it, expect } from 'vitest';
import { AgentSession } from '../src/core/agent-session.js';

describe('AgentSession', () => {
  it('can be instantiated with config', () => {
    const session = new AgentSession({
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
    });
    expect(session).toBeDefined();
    expect(session.modelInfo).toEqual({
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
    });
  });
});
