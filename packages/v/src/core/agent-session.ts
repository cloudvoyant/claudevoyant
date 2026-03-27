import {
  getModel,
  stream,
  type Api,
  type Context,
  type Model,
  type UserMessage,
  type Message as PiMessage,
} from '@mariozechner/pi-ai';
import type { AgentEvent } from './types.js';

export interface AgentSessionConfig {
  provider: string;
  model: string;
  systemPrompt?: string;
}

export class AgentSession {
  private messages: PiMessage[] = [];
  private config: AgentSessionConfig;
  private piModel: Model<Api>;

  constructor(config: AgentSessionConfig) {
    this.config = config;
    this.piModel = getModel(
      // Runtime validation happens inside pi-ai; we cast to satisfy the strict generics
      config.provider as 'anthropic',
      config.model as 'claude-sonnet-4-20250514',
    ) as Model<Api>;
  }

  get modelInfo() {
    return { provider: this.config.provider, model: this.config.model };
  }

  async *send(text: string): AsyncIterable<AgentEvent> {
    const userMessage: UserMessage = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    this.messages.push(userMessage);

    const context: Context = {
      systemPrompt: this.config.systemPrompt ?? 'You are a helpful assistant.',
      messages: this.messages,
    };

    try {
      const s = stream(this.piModel, context);

      for await (const event of s) {
        switch (event.type) {
          case 'text_delta':
            yield { type: 'text_delta', delta: event.delta };
            break;
          case 'done':
            this.messages.push(event.message);
            yield { type: 'done' };
            return;
          case 'error':
            yield {
              type: 'error',
              error: new Error(event.error.errorMessage ?? 'Unknown streaming error'),
            };
            return;
        }
      }

      // If we exit the loop without a done/error event, still yield done
      yield { type: 'done' };
    } catch (err) {
      yield {
        type: 'error',
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  }
}
