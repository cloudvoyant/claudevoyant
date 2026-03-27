import React from 'react';
import { render } from 'ink';
import { AgentSession } from '../core/agent-session.js';
import { loadConfig, validateConfig } from '../core/config.js';
import type { ChatState } from '../core/types.js';
import { App } from '../app.js';

function enterFullscreen() {
  process.stdout.write('\x1b[?1049h'); // switch to alternate screen buffer
  process.stdout.write('\x1b[?25l'); // hide cursor (we draw our own block cursor)
}

function exitFullscreen() {
  process.stdout.write('\x1b[?25h'); // restore cursor
  process.stdout.write('\x1b[?1049l'); // switch back to normal screen
}

export async function chatCommand(): Promise<void> {
  const config = loadConfig();
  const configError = validateConfig(config);
  if (configError) {
    process.stderr.write(configError + '\n');
    process.exit(1);
  }
  const session = new AgentSession(config);

  enterFullscreen();

  // Restore terminal on unexpected exit (crash, SIGTERM, etc.)
  process.once('exit', exitFullscreen);
  process.once('SIGTERM', () => {
    exitFullscreen();
    process.exit(0);
  });

  let updateChat: ((fn: (s: ChatState) => ChatState) => void) | null = null;

  const handleSend = async (text: string) => {
    updateChat?.((s) => ({
      ...s,
      messages: [...s.messages, { role: 'assistant' as const, content: '', streaming: true }],
    }));

    try {
      for await (const event of session.send(text)) {
        switch (event.type) {
          case 'text_delta':
            updateChat?.((s) => {
              const messages = [...s.messages];
              const last = messages[messages.length - 1];
              if (last?.role === 'assistant') {
                messages[messages.length - 1] = { ...last, content: last.content + event.delta };
              }
              return { ...s, messages };
            });
            break;
          case 'done':
            updateChat?.((s) => {
              const messages = [...s.messages];
              const last = messages[messages.length - 1];
              if (last?.role === 'assistant') {
                messages[messages.length - 1] = { ...last, streaming: false };
              }
              return { ...s, messages, isStreaming: false };
            });
            break;
          case 'error':
            updateChat?.((s) => ({ ...s, isStreaming: false, error: event.error.message }));
            break;
        }
      }
    } catch (err) {
      updateChat?.((s) => ({
        ...s,
        isStreaming: false,
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  };

  const { waitUntilExit } = render(
    React.createElement(App, {
      modelInfo: session.modelInfo,
      onSend: handleSend,
      onReady: (fn: (fn: (s: ChatState) => ChatState) => void) => {
        updateChat = fn;
      },
    }),
    { exitOnCtrlC: false, patchConsole: true }, // App handles Ctrl+C via useInput
  );

  await waitUntilExit();
  exitFullscreen();
}
