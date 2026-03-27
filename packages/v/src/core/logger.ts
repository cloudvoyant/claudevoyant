import pino from 'pino';
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';

const LOG_DIR = join(process.cwd(), '.codevoyant', 'logs');
mkdirSync(LOG_DIR, { recursive: true });

export const LOG_FILE = join(LOG_DIR, 'v-debug.log');

export const logger = pino(
  { level: 'debug' },
  createWriteStream(LOG_FILE, { flags: 'a' }),
);
