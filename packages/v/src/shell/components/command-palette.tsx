import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import type { AppMode } from '../../core/types.js';
import { useTerminalSize } from '../../core/use-terminal-size.js';

interface CommandPaletteProps {
  isOpen: boolean;
  currentMode: AppMode;
  onClose: () => void;
  onSelect: (mode: AppMode) => void;
}

interface PaletteItem {
  label: string;
  mode: AppMode;
  shortcut: string;
}

const ITEMS: PaletteItem[] = [
  { label: 'Chat', mode: 'chat', shortcut: 'c' },
  { label: 'Projects', mode: 'projects', shortcut: 'p' },
  { label: 'Settings', mode: 'settings', shortcut: 's' },
];

export function CommandPalette({ isOpen, onClose, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const { columns } = useTerminalSize();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setCursor(0);
    }
  }, [isOpen]);

  const filteredItems = ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const clampedCursor = Math.min(cursor, Math.max(0, filteredItems.length - 1));

  useInput(
    (input, key) => {
      if (key.escape) {
        onClose();
        return;
      }

      if (key.return) {
        if (filteredItems.length > 0) {
          onSelect(filteredItems[clampedCursor].mode);
          onClose();
        }
        return;
      }

      if (key.upArrow) {
        setCursor((c) => {
          const len = filteredItems.length;
          if (len === 0) return 0;
          return (c - 1 + len) % len;
        });
        return;
      }

      if (key.downArrow) {
        setCursor((c) => {
          const len = filteredItems.length;
          if (len === 0) return 0;
          return (c + 1) % len;
        });
        return;
      }

      if (key.backspace || key.delete) {
        setQuery((q) => q.slice(0, -1));
        return;
      }

      if (!key.ctrl && !key.meta && input.length === 1) {
        if (!query) {
          const shortcut = ITEMS.find((it) => it.shortcut === input);
          if (shortcut) {
            onSelect(shortcut.mode);
            onClose();
            return;
          }
        }
        setQuery((q) => q + input);
        setCursor(0);
      }
    },
    { isActive: isOpen }
  );

  if (!isOpen) return null;

  const width = Math.min(40, columns - 4);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      width={width}
      paddingX={1}
    >
      <Text bold dimColor>{'⌨  Go to...'}</Text>
      <Box borderStyle="single" borderColor="cyan" paddingX={1}>
        <Text>{query.length > 0 ? query : ''}<Text color="white">{'█'}</Text></Text>
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {filteredItems.length === 0 ? (
          <Text dimColor>{'  No results'}</Text>
        ) : (
          filteredItems.map((item, i) => {
            const isSelected = i === clampedCursor;
            return (
              <Box key={item.mode}>
                {isSelected ? (
                  <Text color="green" bold>{`▶ [${item.shortcut}] ${item.label}`}</Text>
                ) : (
                  <Text dimColor>{`  [${item.shortcut}] ${item.label}`}</Text>
                )}
              </Box>
            );
          })
        )}
      </Box>
      <Box marginTop={1}>
        <Text dimColor wrap="truncate">{'↑↓ navigate · Enter select · Esc close'}</Text>
      </Box>
    </Box>
  );
}
