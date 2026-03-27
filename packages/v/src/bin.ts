#!/usr/bin/env node
import { Command } from 'commander';
import { chatCommand } from './commands/chat.js';

const program = new Command();

program.name('v').description('Terminal chat interface for LLMs').version('0.1.0');

program
  .command('chat', { isDefault: true })
  .description('Start a chat session')
  .action(async () => {
    await chatCommand();
  });

program.parse();
