import React from 'react';
import { Shell } from './shell/shell.js';
import type { ShellProps } from './shell/shell.js';

export type AppProps = ShellProps;

export function App({ modelInfo, onSend, onReady }: AppProps) {
  return <Shell modelInfo={modelInfo} onSend={onSend} onReady={onReady} />;
}
