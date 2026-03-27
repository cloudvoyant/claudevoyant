import React from 'react';
import { Box, Text } from 'ink';
import type { AppMode } from '../../core/types.js';
import { LogoBadge } from './logo.js';

interface HeaderProps {
  mode: AppMode;
}

const MODES: AppMode[] = ['chat', 'projects', 'settings'];

export function Header({ mode }: HeaderProps) {
  return (
    <Box gap={1} paddingY={1}>
      <LogoBadge />
      <Text dimColor>{'│'}</Text>
      {MODES.map((m) =>
        m === mode ? (
          <Text key={m} color="green" bold>{`[${m}]`}</Text>
        ) : (
          <Text key={m} dimColor>{m}</Text>
        )
      )}
      <Text dimColor>{'(Ctrl K)'}</Text>
    </Box>
  );
}
