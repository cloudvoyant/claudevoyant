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
export interface MemEntry {
    path: string;
    type: string;
    tags: string[];
    description: string;
}
export declare function memCommand(): Command;
//# sourceMappingURL=mem.d.ts.map