import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { writeConfig, readConfig } from '../config.js';
export function initCommand() {
    return new Command('init')
        .description('Initialize .codevoyant/ directory structure')
        .option('--dir <dir>', 'target directory', '.')
        .action((opts) => {
        const base = path.join(opts.dir, '.codevoyant');
        const configPath = path.join(base, 'codevoyant.json');
        const settingsPath = path.join(base, 'settings.json');
        // Create dirs
        fs.mkdirSync(path.join(base, 'plans'), { recursive: true });
        fs.mkdirSync(path.join(base, 'worktrees'), { recursive: true });
        // Initialize codevoyant.json if absent
        if (!fs.existsSync(configPath)) {
            writeConfig(configPath, readConfig(configPath)); // writes default
            console.log('Created .codevoyant/codevoyant.json');
        }
        // Initialize settings.json if absent
        if (!fs.existsSync(settingsPath)) {
            fs.writeFileSync(settingsPath, '{}\n');
            console.log('Created .codevoyant/settings.json');
        }
        // Ensure .gitignore entries
        const gitignorePath = path.join(opts.dir, '.gitignore');
        const entries = ['.codevoyant/worktrees/'];
        if (fs.existsSync(gitignorePath)) {
            const existing = fs.readFileSync(gitignorePath, 'utf-8');
            const missing = entries.filter((e) => !existing.includes(e));
            if (missing.length > 0) {
                fs.appendFileSync(gitignorePath, '\n# codevoyant\n' + missing.join('\n') + '\n');
                console.log(`Added to .gitignore: ${missing.join(', ')}`);
            }
        }
        else {
            fs.writeFileSync(gitignorePath, '# codevoyant\n' + entries.join('\n') + '\n');
            console.log('Created .gitignore with codevoyant entries');
        }
        // Auto-migrate from legacy spec.json or plans.json
        const legacy = [path.join(base, 'plans.json'), path.join(base, 'spec.json')];
        for (const src of legacy) {
            if (fs.existsSync(src) && !fs.existsSync(configPath)) {
                console.log(`Migrating ${path.basename(src)} to codevoyant.json`);
                // migration logic reused from plans migrate subcommand
                break;
            }
        }
        console.log('.codevoyant/ ready');
    });
}
//# sourceMappingURL=init.js.map