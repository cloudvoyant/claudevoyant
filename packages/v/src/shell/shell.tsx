import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import type { AppMode, ChatState, ModeProps } from '../core/types.js';
import { useTerminalSize } from '../core/use-terminal-size.js';
import { Header } from './components/header.js';
import { CommandPalette } from './components/command-palette.js';
import { Chat } from '../chat/chat.js';
import { Projects } from '../projects/projects.js';
import { Settings } from '../settings/settings.js';

export interface ShellProps {
  modelInfo: { provider: string; model: string };
  onSend: (text: string) => void;
  onReady: (update: (fn: (s: ChatState) => ChatState) => void) => void;
}

export function Shell({ modelInfo, onSend, onReady }: ShellProps) {
  const { exit } = useApp();
  const [mode, setMode] = useState<AppMode>('chat');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [chat, setChat] = useState<ChatState>({
    messages: [],
    input: '',
    isStreaming: false,
    error: null,
    modelInfo,
  });

  const modeProps: ModeProps = {};

  useEffect(() => {
    onReady(setChat);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useInput((_input, key) => {
    if (key.ctrl && _input === 'c') { exit(); return; }
    if (key.meta && _input === '1') { setMode('chat'); return; }
    if (key.meta && _input === '2') { setMode('projects'); return; }
    if (key.meta && _input === '3') { setMode('settings'); return; }
    if (key.ctrl && _input === 'k') { setPaletteOpen(true); return; }
    if (key.escape && chat.error) { setChat((s) => ({ ...s, error: null })); return; }
  });

  const handleSend = useCallback((text: string) => {
    setChat((s) => ({
      ...s,
      input: '',
      isStreaming: true,
      messages: [...s.messages, { role: 'user' as const, content: text }],
    }));
    onSend(text);
  }, [onSend]);

  const { columns: cols, rows: termRows } = useTerminalSize();
  const paletteWidth = Math.min(40, cols - 4);
  const paletteLeft = Math.floor((cols - paletteWidth) / 2);

  return (
    <Box flexDirection="column" height={termRows} width={cols} overflow="hidden">
      <Header mode={mode} />
      <Text dimColor>{'─'.repeat(cols)}</Text>

      <Box flexGrow={1} overflow="hidden" position="relative">
        {mode === 'chat' && (
          <Chat
            {...modeProps}
            state={chat}
            onInputChange={(v) => setChat((s) => ({ ...s, input: v }))}
            onSend={handleSend}
          />
        )}
        {mode === 'projects' && <Projects {...modeProps} />}
        {mode === 'settings' && <Settings {...modeProps} />}

        {paletteOpen && (
          <Box
            position="absolute"
            marginTop={2}
            marginLeft={paletteLeft}
            backgroundColor="#111111"
          >
            <CommandPalette
              isOpen={true}
              currentMode={mode}
              onClose={() => setPaletteOpen(false)}
              onSelect={(m) => { setMode(m); setPaletteOpen(false); }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
