export interface PlanEntry {
    name: string;
    plugin: 'spec' | 'em' | 'pm' | string;
    description: string;
    status: 'Active' | 'Executing' | 'Paused' | 'Complete' | 'Abandoned';
    progress: {
        completed: number;
        total: number;
    };
    created: string;
    lastUpdated: string;
    path: string;
    branch: string | null;
    worktree: string | null;
}
export interface WorktreeEntry {
    branch: string;
    path: string;
    planName: string | null;
    createdAt: string;
}
export interface StyleContext {
    name: string;
    description: string;
    learnedAt: string;
    examples: string[];
}
export interface CodevoyantConfig {
    version: string;
    activePlans: PlanEntry[];
    archivedPlans: PlanEntry[];
    worktrees: WorktreeEntry[];
    style: StyleContext[];
}
export interface CodevoyantSettings {
    notifications?: boolean;
    defaultPlugin?: string;
    [key: string]: unknown;
}
//# sourceMappingURL=types.d.ts.map