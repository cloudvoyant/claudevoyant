import { useState, useEffect, useRef } from 'react';

export interface TerminalSize {
  columns: number;
  rows: number;
}

/**
 * Returns live terminal dimensions and re-renders the component on resize.
 * The optional `onResize` callback fires after every resize event.
 */
export function useTerminalSize(
  onResize?: (size: TerminalSize) => void,
): TerminalSize {
  const [size, setSize] = useState<TerminalSize>({
    columns: process.stdout.columns ?? 80,
    rows: process.stdout.rows ?? 24,
  });

  // Stable ref so the effect never needs to re-subscribe when the callback changes.
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;

  useEffect(() => {
    const handleResize = () => {
      const next: TerminalSize = {
        columns: process.stdout.columns ?? 80,
        rows: process.stdout.rows ?? 24,
      };
      setSize(next);
      onResizeRef.current?.(next);
    };

    process.stdout.on('resize', handleResize);
    return () => {
      process.stdout.off('resize', handleResize);
    };
  }, []); // subscribe once; callback changes are handled via ref

  return size;
}
