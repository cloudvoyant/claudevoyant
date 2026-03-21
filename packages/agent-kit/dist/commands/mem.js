/**
 * mem — Index and query project knowledge docs.
 *
 * Convention: plugin skills scope their mem find calls using per-plugin config
 * declared in .codevoyant/settings.json. A skill reads its relevant types/tags via:
 *
 *   npx @codevoyant/agent-kit settings get docs
 *
 * Then passes those types/tags as --type and --tag flags to mem find.
 */
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { readSettings } from '../config.js';
const EXCLUDED_DIRS = ['node_modules', '.codevoyant', '.git'];
function parseFrontmatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match)
        return null;
    const yaml = match[1];
    const result = {};
    for (const line of yaml.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#'))
            continue;
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx === -1)
            continue;
        const key = trimmed.slice(0, colonIdx).trim();
        const rawValue = trimmed.slice(colonIdx + 1).trim();
        if (key === 'type') {
            result.type = rawValue;
        }
        else if (key === 'description') {
            result.description = rawValue;
        }
        else if (key === 'status') {
            result.status = rawValue;
        }
        else if (key === 'tags') {
            // Handle inline array: [tag1, tag2]
            const bracketMatch = rawValue.match(/^\[(.*)\]$/);
            if (bracketMatch) {
                result.tags = bracketMatch[1].split(',').map((t) => t.trim());
            }
            else if (rawValue === '') {
                // tags on next lines as YAML list
                result.tags = [];
            }
        }
    }
    // Handle YAML list-style tags (- item lines after tags:)
    if (result.tags !== undefined && result.tags.length === 0) {
        const tagsIdx = yaml.indexOf('tags:');
        if (tagsIdx !== -1) {
            const afterTags = yaml.slice(tagsIdx + 'tags:'.length);
            const lines = afterTags.split('\n').slice(1);
            const items = [];
            for (const line of lines) {
                const listMatch = line.match(/^\s*-\s+(.+)/);
                if (listMatch) {
                    items.push(listMatch[1].trim());
                }
                else if (line.trim() !== '' && !line.match(/^\s*-/)) {
                    break;
                }
            }
            if (items.length > 0) {
                result.tags = items;
            }
        }
    }
    return result;
}
function collectMdFiles(dir, rootDir) {
    const results = [];
    function walk(currentDir) {
        let entries;
        try {
            entries = fs.readdirSync(currentDir, { withFileTypes: true });
        }
        catch {
            return;
        }
        for (const entry of entries) {
            if (entry.isDirectory()) {
                if (currentDir === rootDir && EXCLUDED_DIRS.includes(entry.name))
                    continue;
                walk(path.join(currentDir, entry.name));
            }
            else if (entry.isFile() && entry.name.endsWith('.md')) {
                results.push(path.join(currentDir, entry.name));
            }
        }
    }
    walk(dir);
    return results;
}
function getManifestPath(projectRoot) {
    const settings = readSettings(path.join(projectRoot, '.codevoyant'));
    const manifestFile = settings.mem?.manifestPath ?? 'mem.json';
    return path.join(projectRoot, '.codevoyant', manifestFile);
}
export function memCommand() {
    const mem = new Command('mem').description('Index and query project knowledge docs');
    mem
        .command('index')
        .description('Scan project .md files with frontmatter, write .codevoyant/mem.json')
        .option('--dir <dir>', 'Project root directory', '.')
        .action((opts) => {
        const projectRoot = path.resolve(opts.dir);
        const mdFiles = collectMdFiles(projectRoot, projectRoot);
        const entries = [];
        for (const filePath of mdFiles) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const fm = parseFrontmatter(content);
            if (!fm)
                continue;
            if (!fm.type || !fm.tags || fm.tags.length === 0)
                continue;
            if (fm.status === 'archived')
                continue;
            entries.push({
                path: path.relative(projectRoot, filePath),
                type: fm.type,
                tags: fm.tags,
                description: fm.description ?? '',
            });
        }
        const manifestPath = getManifestPath(projectRoot);
        fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
        fs.writeFileSync(manifestPath, JSON.stringify(entries, null, 2) + '\n');
        console.log(`Indexed ${entries.length} doc(s) → ${path.relative(projectRoot, manifestPath)}`);
    });
    mem
        .command('find')
        .description('Query mem.json and return matching entries')
        .option('--tag <tag...>', 'Filter by tag (multiple = AND logic)')
        .option('--type <type>', 'Filter by type')
        .option('--json', 'Output full JSON entries', false)
        .option('--dir <dir>', 'Project root directory', '.')
        .action((opts) => {
        const projectRoot = path.resolve(opts.dir);
        const manifestPath = getManifestPath(projectRoot);
        if (!fs.existsSync(manifestPath)) {
            // Auto-index if manifest missing
            const mdFiles = collectMdFiles(projectRoot, projectRoot);
            const entries = [];
            for (const filePath of mdFiles) {
                const content = fs.readFileSync(filePath, 'utf-8');
                const fm = parseFrontmatter(content);
                if (!fm)
                    continue;
                if (!fm.type || !fm.tags || fm.tags.length === 0)
                    continue;
                if (fm.status === 'archived')
                    continue;
                entries.push({
                    path: path.relative(projectRoot, filePath),
                    type: fm.type,
                    tags: fm.tags,
                    description: fm.description ?? '',
                });
            }
            fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
            fs.writeFileSync(manifestPath, JSON.stringify(entries, null, 2) + '\n');
        }
        const raw = fs.readFileSync(manifestPath, 'utf-8');
        let entries = JSON.parse(raw);
        if (opts.tag && opts.tag.length > 0) {
            const tags = opts.tag;
            entries = entries.filter((e) => tags.every((t) => e.tags.includes(t)));
        }
        if (opts.type) {
            entries = entries.filter((e) => e.type === opts.type);
        }
        if (opts.json) {
            console.log(JSON.stringify(entries, null, 2));
        }
        else {
            for (const entry of entries) {
                console.log(entry.path);
            }
        }
    });
    mem
        .command('list')
        .description('Print terse table of all indexed team knowledge')
        .option('--dir <dir>', 'Project root directory', '.')
        .action((opts) => {
        const projectRoot = path.resolve(opts.dir);
        const manifestPath = getManifestPath(projectRoot);
        // Auto-index if mem.json missing
        if (!fs.existsSync(manifestPath)) {
            const mdFiles = collectMdFiles(projectRoot, projectRoot);
            const entries = [];
            for (const filePath of mdFiles) {
                const content = fs.readFileSync(filePath, 'utf-8');
                const fm = parseFrontmatter(content);
                if (!fm)
                    continue;
                if (!fm.type || !fm.tags || fm.tags.length === 0)
                    continue;
                if (fm.status === 'archived')
                    continue;
                entries.push({
                    path: path.relative(projectRoot, filePath),
                    type: fm.type,
                    tags: fm.tags,
                    description: fm.description ?? '',
                });
            }
            fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
            fs.writeFileSync(manifestPath, JSON.stringify(entries, null, 2) + '\n');
        }
        const raw = fs.readFileSync(manifestPath, 'utf-8');
        const entries = JSON.parse(raw);
        if (entries.length === 0) {
            console.log('No team knowledge indexed yet — run /mem:learn or use npx @codevoyant/agent-kit mem learn');
            return;
        }
        console.log('## Team Knowledge');
        for (const entry of entries) {
            const tags = entry.tags.join(', ');
            console.log(`${entry.path}  [${tags}]  ${entry.description}`);
        }
    });
    return mem;
}
//# sourceMappingURL=mem.js.map