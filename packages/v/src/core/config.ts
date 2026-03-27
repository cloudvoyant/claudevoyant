import type { AgentSessionConfig } from './agent-session.js';

const DEFAULT_PROVIDER = 'anthropic';
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export function loadConfig(): AgentSessionConfig {
  return {
    provider: process.env.V_PROVIDER ?? DEFAULT_PROVIDER,
    model: process.env.V_MODEL ?? DEFAULT_MODEL,
    systemPrompt: process.env.V_SYSTEM_PROMPT,
  };
}

export function validateConfig(config: AgentSessionConfig): string | null {
  const keyMap: Record<string, string> = {
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    google: 'GOOGLE_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
  };
  const expectedKey = keyMap[config.provider];
  if (expectedKey && !process.env[expectedKey]) {
    return `Missing ${expectedKey}. Set it with: export ${expectedKey}=your-key`;
  }
  return null;
}
