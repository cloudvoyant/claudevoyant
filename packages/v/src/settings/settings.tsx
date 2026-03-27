import React from 'react';
import { Box, Text } from 'ink';
import type { ModeProps } from '../core/types.js';
import { Logo } from '../shell/components/logo.js';

export function Settings(_props: ModeProps) {
  return (
    <Box flexDirection="column" flexGrow={1} overflow="hidden" alignItems="center" justifyContent="center">
      <Logo dimColor />
      <Text bold>Settings</Text>
      <Text dimColor>Coming soon</Text>
    </Box>
  );
}
