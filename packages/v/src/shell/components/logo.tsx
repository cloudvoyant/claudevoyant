import React from 'react';
import { Box, Text } from 'ink';

interface LogoBadgeProps {
  color?: string;
}

export function LogoBadge({ color = 'cyan' }: LogoBadgeProps) {
  return (
    <Text color={color}>{'◈ codevoyant'}</Text>
  );
}

interface LogoProps {
  dimColor?: boolean;
}

export function Logo({ dimColor = true }: LogoProps) {
  const lines = [
    '   ╭───╮   ',
    '  ╭╯ ◈ ╰╮  ',
    ' ╭╯       ╰╮',
    ' ╰╮  ◈◈  ╭╯',
    '  ╰╮     ╭╯ ',
    '   ╰─────╯  ',
    '             ',
    ' codevoyant  ',
  ];

  return (
    <Box flexDirection="column">
      {lines.map((line, i) => (
        <Text key={i} dimColor={dimColor}>{line}</Text>
      ))}
    </Box>
  );
}
