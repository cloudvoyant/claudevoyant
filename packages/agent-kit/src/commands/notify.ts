import { Command } from 'commander';
import notifier from 'node-notifier';

export function notifyCommand(): Command {
  return new Command('notify')
    .description('Send a cross-platform desktop notification')
    .requiredOption('--title <title>', 'Notification title')
    .requiredOption('--message <message>', 'Notification message')
    .option('--silent', 'Suppress notification (no-op)', false)
    .action((opts) => {
      if (opts.silent) return;
      notifier.notify({ title: opts.title, message: opts.message });
    });
}
