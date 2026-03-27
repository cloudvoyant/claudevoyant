import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Box, Text } from 'ink';
import { ScrollView } from 'ink-scroll-view';
import type { ScrollViewRef } from 'ink-scroll-view';
import { useTerminalSize } from '../../core/use-terminal-size.js';
import { logger } from '../../core/logger.js';

export interface StyledLine {
  text: string;
  color?: string;
  bold?: boolean;
  dimColor?: boolean;
}

export interface HistoryRef {
  scrollToBottom: () => void;
  scrollBy: (delta: number) => void;
  remeasure: () => void;
}

interface HistoryProps {
  lines: StyledLine[];
  height: number;
}

export const History = forwardRef<HistoryRef, HistoryProps>(
  ({ lines, height }, ref) => {
    const scrollRef = useRef<ScrollViewRef>(null);
    const [scrolledUp, setScrolledUp] = useState(false);
    const { columns } = useTerminalSize(({ columns: c, rows: r }) => {
      logger.debug({ columns: c, rows: r }, 'history: terminal resized');
    });

    useImperativeHandle(ref, () => ({
      scrollToBottom: () => scrollRef.current?.scrollToBottom(),
      scrollBy: (delta) => scrollRef.current?.scrollBy(delta),
      remeasure: () => scrollRef.current?.remeasure(),
    }));

    // Welcome state
    if (lines.length === 0) {
      return (
        <Box flexDirection="column" height={height} width={columns} borderStyle="single" borderColor="cyan" alignItems="center" justifyContent="center">
          <Text bold>Welcome to v</Text>
          <Text dimColor>◈ codevoyant</Text>
          <Text dimColor>{'↑↓ scroll  Ctrl+K palette  Ctrl+C exit'}</Text>
        </Box>
      );
    }

    // Border consumes 2 rows (top+bottom) and 2 cols (left+right).
    const innerHeight = height - 2;
    const innerWidth = columns - 2;

    return (
      <Box borderStyle="single" borderColor="cyan" height={height} width={columns}>
      <ScrollView
        ref={scrollRef}
        height={innerHeight}
        width={innerWidth}
        onScroll={(offset) => {
          const sv = scrollRef.current;
          const atBottom = sv ? offset >= sv.getBottomOffset() : true;
          setScrolledUp(!atBottom);
          logger.debug(
            { offset, bottomOffset: sv?.getBottomOffset(), atBottom },
            'history: scroll',
          );
        }}
        onContentHeightChange={(newHeight) => {
          // Auto-scroll as content grows (streaming), unless the user has
          // manually scrolled up to read earlier messages.
          logger.debug({ newHeight, scrolledUp }, 'history: content height changed');
          if (!scrolledUp) {
            scrollRef.current?.scrollToBottom();
          }
        }}
      >
        {lines.map((line, i) => (
          <Box key={i} flexDirection="row">
            <Text
              wrap="wrap"
              color={line.color as Parameters<typeof Text>[0]['color']}
              bold={line.bold}
              dimColor={line.dimColor}
            >
              {line.text}
            </Text>
            {scrolledUp && i === lines.length - 1 && (
              <Text dimColor> ↑ scrolled</Text>
            )}
          </Box>
        ))}
      </ScrollView>
      </Box>
    );
  }
);

History.displayName = 'History';
