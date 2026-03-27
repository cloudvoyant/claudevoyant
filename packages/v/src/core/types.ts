export interface Message {
  role: 'user' | 'assistant';
  content: string;
  /** True while the assistant message is still streaming */
  streaming?: boolean;
}

export interface ChatState {
  messages: Message[];
  input: string;
  isStreaming: boolean;
  error: string | null;
  modelInfo: { provider: string; model: string };
}

export type AppMode = 'chat' | 'projects' | 'settings';

export interface AppState {
  mode: AppMode;
  chat: ChatState;
}

/**
 * Props passed by the shell to every active mode component.
 * Currently empty — future iterations will add shared state hooks,
 * worktree context, session info, and inter-mode navigation callbacks.
 */
export interface ModeProps {
  // e.g. useSharedState hook refs, session context, etc. — TBD
}

export type AgentEvent = { type: 'text_delta'; delta: string } | { type: 'done' } | { type: 'error'; error: Error };
