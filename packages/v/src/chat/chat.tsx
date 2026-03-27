import React, { useEffect, useRef } from 'react';
import { Box, useInput } from 'ink';
import type { ChatState, ModeProps, Message } from '../core/types.js';
import { useTerminalSize } from '../core/use-terminal-size.js';
import { logger } from '../core/logger.js';
import { History } from './components/history.js';
import { Prompt } from './components/prompt.js';
import type { StyledLine } from './components/history.js';
import type { HistoryRef } from './components/history.js';

// ─── Flat-line rendering ─────────────────────────────────────────────────────

function flattenMessages(messages: Message[]): StyledLine[] {
  const lines: StyledLine[] = [];

  for (const msg of messages) {
    const isUser = msg.role === 'user';

    lines.push({
      text: isUser ? 'You' : 'AI',
      color: isUser ? 'cyan' : 'magenta',
      bold: true,
    });

    const raw = msg.streaming ? (msg.content || '...') + '█' : msg.content || '';
    let inCode = false;

    for (const line of raw.split('\n')) {
      if (line.startsWith('```')) {
        inCode = !inCode;
        const lang = inCode ? line.slice(3).trim() : '';
        lines.push({
          text: inCode ? (lang ? `╭─ ${lang}` : '╭────') : '╰────',
          dimColor: true,
        });
        continue;
      }
      if (inCode) {
        lines.push({ text: `│ ${line}`, color: 'cyan' });
        continue;
      }
      if (line.startsWith('# ')) lines.push({ text: line.slice(2), bold: true, color: 'yellow' });
      else if (line.startsWith('## ')) lines.push({ text: line.slice(3), bold: true });
      else if (line.startsWith('> ')) lines.push({ text: `│ ${line.slice(2)}`, dimColor: true });
      else lines.push({ text: line || '' });
    }

    lines.push({ text: '' }); // separator
  }

  return lines;
}

// ─── Constants ───────────────────────────────────────────────────────────────

// Rows consumed by shell header (1 top pad + 1 header + 1 bottom pad + 1 divider)
const SHELL_HEADER_ROWS = 4;
// Rows consumed by prompt border + content (borderStyle="single" = 1 top + 1 bottom + 1 content = 3)
const PROMPT_ROWS = 3;

// ─── Chat ────────────────────────────────────────────────────────────────────

interface ChatProps extends ModeProps {
  state: ChatState;
  onInputChange: (v: string) => void;
  onSend: (text: string) => void;
}

export function Chat({ state, onInputChange, onSend }: ChatProps) {
  const historyRef = useRef<HistoryRef>(null);
  const { rows: termRows } = useTerminalSize(({ columns, rows }) => {
    logger.debug({ columns, rows }, 'chat: terminal resized');
    historyRef.current?.remeasure();
    historyRef.current?.scrollToBottom();
  });
  const historyHeight = Math.max(4, termRows - SHELL_HEADER_ROWS - PROMPT_ROWS);

  // Auto-scroll to bottom whenever new messages arrive or streaming updates
  useEffect(() => {
    logger.debug(
      { messageCount: state.messages.length, isStreaming: state.isStreaming, historyHeight },
      'chat: auto-scroll to bottom',
    );
    historyRef.current?.scrollToBottom();
  }, [state.messages.length, state.isStreaming]);

  useInput((_input, key) => {
    if (key.upArrow)   historyRef.current?.scrollBy(-1);
    if (key.downArrow) historyRef.current?.scrollBy(1);
    if (key.pageUp)    historyRef.current?.scrollBy(-Math.floor(historyHeight / 2));
    if (key.pageDown)  historyRef.current?.scrollBy(Math.floor(historyHeight / 2));
  });

  const allLines = flattenMessages(state.messages);
  logger.debug({ totalLines: allLines.length, historyHeight, termRows }, 'chat: render');

  return (
    <Box flexDirection="column" flexGrow={1} overflow="hidden">
      <History ref={historyRef} lines={allLines} height={historyHeight} />
      <Prompt value={state.input} disabled={state.isStreaming} onChange={onInputChange} onSubmit={onSend} />
    </Box>
  );
}
