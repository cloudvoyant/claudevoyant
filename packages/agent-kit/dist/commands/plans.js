import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { readConfig, writeConfig, getConfigPath } from '../config.js';
export function plansCommand() {
    const plans = new Command('plans').description('Manage codevoyant plans');
    plans
        .command('register')
        .description('Register a new plan')
        .requiredOption('--name <name>', 'Plan name')
        .requiredOption('--plugin <plugin>', 'Plugin that owns this plan')
        .requiredOption('--description <description>', 'Plan description')
        .option('--total <total>', 'Total tasks', '0')
        .option('--branch <branch>', 'Associated branch')
        .option('--worktree <worktree>', 'Associated worktree path')
        .option('--registry <path>', 'Path to codevoyant.json')
        .action((opts) => {
        const configPath = getConfigPath(opts.registry);
        const config = readConfig(configPath);
        const existing = config.activePlans.find((p) => p.name === opts.name);
        if (existing) {
            console.error(`Plan "${opts.name}" already exists`);
            process.exit(1);
        }
        const now = new Date().toISOString();
        const entry = {
            name: opts.name,
            plugin: opts.plugin,
            description: opts.description,
            status: 'Active',
            progress: { completed: 0, total: parseInt(opts.total, 10) },
            created: now,
            lastUpdated: now,
            path: `.codevoyant/plans/${opts.name}/`,
            branch: opts.branch ?? null,
            worktree: opts.worktree ?? null,
        };
        config.activePlans.push(entry);
        writeConfig(configPath, config);
        console.log(`Registered plan: ${opts.name}`);
    });
    plans
        .command('update-progress')
        .description('Update plan progress')
        .requiredOption('--name <name>', 'Plan name')
        .requiredOption('--completed <n>', 'Completed tasks')
        .option('--total <n>', 'Total tasks')
        .option('--registry <path>', 'Path to codevoyant.json')
        .action((opts) => {
        const configPath = getConfigPath(opts.registry);
        const config = readConfig(configPath);
        const plan = config.activePlans.find((p) => p.name === opts.name);
        if (!plan) {
            console.error(`Plan "${opts.name}" not found`);
            process.exit(1);
        }
        plan.progress.completed = parseInt(opts.completed, 10);
        if (opts.total !== undefined) {
            plan.progress.total = parseInt(opts.total, 10);
        }
        plan.lastUpdated = new Date().toISOString();
        writeConfig(configPath, config);
        console.log(`Updated progress: ${plan.progress.completed}/${plan.progress.total}`);
    });
    plans
        .command('update-status')
        .description('Update plan status')
        .requiredOption('--name <name>', 'Plan name')
        .requiredOption('--status <status>', 'New status')
        .option('--registry <path>', 'Path to codevoyant.json')
        .action((opts) => {
        const configPath = getConfigPath(opts.registry);
        const config = readConfig(configPath);
        const plan = config.activePlans.find((p) => p.name === opts.name);
        if (!plan) {
            console.error(`Plan "${opts.name}" not found`);
            process.exit(1);
        }
        plan.status = opts.status;
        plan.lastUpdated = new Date().toISOString();
        writeConfig(configPath, config);
        console.log(`Updated status: ${opts.status}`);
    });
    plans
        .command('archive')
        .description('Archive a plan')
        .requiredOption('--name <name>', 'Plan name')
        .option('--status <status>', 'Final status', 'Complete')
        .option('--registry <path>', 'Path to codevoyant.json')
        .action((opts) => {
        const configPath = getConfigPath(opts.registry);
        const config = readConfig(configPath);
        const idx = config.activePlans.findIndex((p) => p.name === opts.name);
        if (idx === -1) {
            console.error(`Plan "${opts.name}" not found in active plans`);
            process.exit(1);
        }
        const [plan] = config.activePlans.splice(idx, 1);
        plan.status = opts.status;
        plan.lastUpdated = new Date().toISOString();
        config.archivedPlans.push(plan);
        writeConfig(configPath, config);
        console.log(`Archived plan: ${opts.name}`);
    });
    plans
        .command('delete')
        .description('Delete a plan')
        .requiredOption('--name <name>', 'Plan name')
        .option('--registry <path>', 'Path to codevoyant.json')
        .action((opts) => {
        const configPath = getConfigPath(opts.registry);
        const config = readConfig(configPath);
        let found = false;
        const activeIdx = config.activePlans.findIndex((p) => p.name === opts.name);
        if (activeIdx !== -1) {
            config.activePlans.splice(activeIdx, 1);
            found = true;
        }
        const archiveIdx = config.archivedPlans.findIndex((p) => p.name === opts.name);
        if (archiveIdx !== -1) {
            config.archivedPlans.splice(archiveIdx, 1);
            found = true;
        }
        if (!found) {
            console.error(`Plan "${opts.name}" not found`);
            process.exit(1);
        }
        writeConfig(configPath, config);
        console.log(`Deleted plan: ${opts.name}`);
    });
    plans
        .command('rename')
        .description('Rename a plan')
        .requiredOption('--name <name>', 'Current plan name')
        .requiredOption('--new-name <newName>', 'New plan name')
        .option('--registry <path>', 'Path to codevoyant.json')
        .action((opts) => {
        const configPath = getConfigPath(opts.registry);
        const config = readConfig(configPath);
        const plan = config.activePlans.find((p) => p.name === opts.name);
        if (!plan) {
            console.error(`Plan "${opts.name}" not found`);
            process.exit(1);
        }
        plan.name = opts.newName;
        plan.path = `.codevoyant/plans/${opts.newName}/`;
        plan.lastUpdated = new Date().toISOString();
        writeConfig(configPath, config);
        console.log(`Renamed plan: ${opts.name} -> ${opts.newName}`);
    });
    plans
        .command('get')
        .description('Get a single plan as JSON')
        .requiredOption('--name <name>', 'Plan name')
        .option('--registry <path>', 'Path to codevoyant.json')
        .action((opts) => {
        const configPath = getConfigPath(opts.registry);
        const config = readConfig(configPath);
        const plan = config.activePlans.find((p) => p.name === opts.name) || config.archivedPlans.find((p) => p.name === opts.name);
        if (!plan) {
            console.error(`Plan "${opts.name}" not found`);
            process.exit(1);
        }
        console.log(JSON.stringify(plan, null, 2));
    });
    plans
        .command('list')
        .description('List plans as JSON')
        .option('--status <status>', 'Filter by status')
        .option('--plugin <plugin>', 'Filter by plugin')
        .option('--archived', 'Include archived plans', false)
        .option('--registry <path>', 'Path to codevoyant.json')
        .action((opts) => {
        const configPath = getConfigPath(opts.registry);
        const config = readConfig(configPath);
        let plans;
        const statusLower = opts.status?.toLowerCase();
        if (statusLower === 'archived') {
            plans = [...config.archivedPlans];
        }
        else if (statusLower === 'all' || opts.archived) {
            plans = [...config.activePlans, ...config.archivedPlans];
        }
        else {
            plans = [...config.activePlans];
        }
        if (opts.status && statusLower !== 'archived' && statusLower !== 'all') {
            plans = plans.filter((p) => p.status.toLowerCase() === statusLower);
        }
        if (opts.plugin) {
            plans = plans.filter((p) => p.plugin === opts.plugin);
        }
        console.log(JSON.stringify(plans, null, 2));
    });
    plans
        .command('migrate')
        .description('Migrate plans.json or spec.json to codevoyant.json')
        .option('--dir <dir>', 'Directory containing .codevoyant/', '.')
        .option('--registry <path>', 'Path to codevoyant.json')
        .action((opts) => {
        const base = path.join(opts.dir, '.codevoyant');
        const configPath = opts.registry ?? path.join(base, 'codevoyant.json');
        if (fs.existsSync(configPath)) {
            console.log('codevoyant.json already exists, skipping migration');
            return;
        }
        const sources = [
            { file: path.join(base, 'plans.json'), type: 'plans' },
            { file: path.join(base, 'spec.json'), type: 'spec' },
        ];
        for (const source of sources) {
            if (!fs.existsSync(source.file))
                continue;
            console.log(`Migrating ${path.basename(source.file)} to codevoyant.json`);
            const raw = JSON.parse(fs.readFileSync(source.file, 'utf-8'));
            const config = readConfig(configPath); // returns default
            // Handle both array format and object-with-activePlans format
            const entries = Array.isArray(raw) ? raw : (raw.activePlans ?? []);
            for (const entry of entries) {
                if (!entry.plugin) {
                    entry.plugin = 'spec';
                }
            }
            config.activePlans = entries;
            if (raw.archivedPlans) {
                for (const entry of raw.archivedPlans) {
                    if (!entry.plugin) {
                        entry.plugin = 'spec';
                    }
                }
                config.archivedPlans = raw.archivedPlans;
            }
            writeConfig(configPath, config);
            fs.unlinkSync(source.file);
            console.log(`Migrated ${path.basename(source.file)} to codevoyant.json`);
            return;
        }
        console.error('No plans.json or spec.json found to migrate');
        process.exit(1);
    });
    return plans;
}
//# sourceMappingURL=plans.js.map