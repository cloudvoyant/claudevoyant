import { Command } from 'commander';
export type CIProvider = 'github' | 'gitlab' | 'unknown';
export interface CIInfo {
    provider: CIProvider;
    remote: string | null;
}
/** Detect the CI provider from the git remote URL, with CLI fallback. */
export declare function detectCIProvider(cwd?: string): CIInfo;
export declare function ciCommand(): Command;
//# sourceMappingURL=ci.d.ts.map