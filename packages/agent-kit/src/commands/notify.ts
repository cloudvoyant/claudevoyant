import { Command } from 'commander';
import { spawnSync } from 'child_process';

function sendNotification(title: string, message: string): void {
  if (process.platform === 'darwin') {
    spawnSync('osascript', ['-e', `display notification "${message}" with title "${title}"`]);
  } else if (process.platform === 'linux') {
    spawnSync('notify-send', [title, message]);
  } else if (process.platform === 'win32') {
    spawnSync('powershell', [
      '-Command',
      `[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('${message}', '${title}')`,
    ]);
  }
}

export function notifyCommand(): Command {
  return new Command('notify')
    .description('Send a cross-platform desktop notification')
    .requiredOption('--title <title>', 'Notification title')
    .requiredOption('--message <message>', 'Notification message')
    .option('--silent', 'Suppress notification (no-op)', false)
    .action((opts) => {
      if (opts.silent) return;
      sendNotification(opts.title, opts.message);
    });
}
