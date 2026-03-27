import React from 'react';
import { Box, Text, useInput } from 'ink';

interface PromptProps {
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
}

export function Prompt({ value, disabled, onChange, onSubmit }: PromptProps) {
  useInput((input, key) => {
    if (disabled) return;
    if (key.return) {
      const text = value.trim();
      if (text) onSubmit(text);
    } else if (key.backspace || key.delete) {
      onChange(value.slice(0, -1));
    } else if (
      !key.ctrl &&
      !key.meta &&
      !key.escape &&
      !key.upArrow &&
      !key.downArrow &&
      !key.pageUp &&
      !key.pageDown &&
      input
    ) {
      onChange(value + input);
    }
  });

  return (
    <Box borderStyle="single">
      <Box paddingX={1}>
        <Text bold color="green">{disabled ? '...' : '>'}</Text>
        <Text> </Text>
        <Text>{value}</Text>
        {!disabled && <Text inverse> </Text>}
        {!value && !disabled && <Text dimColor>Type a message...</Text>}
        {!value && disabled && <Text dimColor>Waiting for response...</Text>}
      </Box>
    </Box>
  );
}
