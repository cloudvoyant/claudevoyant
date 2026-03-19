# Library API Reference

`@codevoyant/agent-kit` exports config utilities and TypeScript types for programmatic access to codevoyant state.

## Installation

```bash
npm install @codevoyant/agent-kit
```

## Usage

```ts
import { readConfig, writeConfig, getConfigPath } from '@codevoyant/agent-kit';
import type { CodevoyantConfig, PlanEntry } from '@codevoyant/agent-kit';

const configPath = getConfigPath();
const config = readConfig(configPath);

console.log(config.activePlans);
```

## Functions

### `getConfigPath`

```ts
function getConfigPath(registry?: string): string
```

Returns the resolved path to `codevoyant.json`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `registry` | `string \| undefined` | `undefined` | Custom path. If omitted, returns `.codevoyant/codevoyant.json` |

**Returns:** `string` -- absolute or relative path to the config file.

---

### `readConfig`

```ts
function readConfig(configPath: string): CodevoyantConfig
```

Read and parse a `codevoyant.json` file. Returns the default empty config if the file does not exist.

| Parameter | Type | Description |
|-----------|------|-------------|
| `configPath` | `string` | Path to the config file |

**Returns:** [`CodevoyantConfig`](#codevoyantconfig)

---

### `writeConfig`

```ts
function writeConfig(configPath: string, config: CodevoyantConfig): void
```

Write a config object to disk using atomic write (tmp + rename). Creates parent directories if needed.

| Parameter | Type | Description |
|-----------|------|-------------|
| `configPath` | `string` | Path to the config file |
| `config` | [`CodevoyantConfig`](#codevoyantconfig) | Config object to write |

**Returns:** `void`

---

### `readSettings`

```ts
function readSettings(dir?: string): CodevoyantSettings
```

Read user preferences from `settings.json`. Returns an empty object if the file does not exist.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `dir` | `string` | `".codevoyant"` | Directory containing `settings.json` |

**Returns:** [`CodevoyantSettings`](#codevoyantsettings)

---

## Types

### `CodevoyantConfig`

Top-level config stored in `.codevoyant/codevoyant.json`.

```ts
interface CodevoyantConfig {
  version: string;          // Schema version (currently "1.0")
  activePlans: PlanEntry[]; // Plans currently in progress
  archivedPlans: PlanEntry[]; // Completed or abandoned plans
  worktrees: WorktreeEntry[]; // Registered git worktrees
  style: StyleContext[];    // Learned style preferences
}
```

---

### `PlanEntry`

A single plan record.

```ts
interface PlanEntry {
  name: string;             // Unique plan identifier
  plugin: string;           // Owning plugin ("spec", "em", "pm", etc.)
  description: string;      // Human-readable description
  status: 'Active' | 'Executing' | 'Paused' | 'Complete' | 'Abandoned';
  progress: {
    completed: number;      // Tasks completed
    total: number;          // Total tasks
  };
  created: string;          // ISO 8601 timestamp
  lastUpdated: string;      // ISO 8601 timestamp
  path: string;             // Relative path to plan directory
  branch: string | null;    // Associated git branch
  worktree: string | null;  // Associated worktree path
}
```

---

### `WorktreeEntry`

A registered git worktree.

```ts
interface WorktreeEntry {
  branch: string;           // Branch name
  path: string;             // Worktree directory path
  planName: string | null;  // Associated plan name
  createdAt: string;        // ISO 8601 timestamp
}
```

---

### `StyleContext`

A learned coding style preference.

```ts
interface StyleContext {
  name: string;             // Style rule name
  description: string;      // Human-readable description
  learnedAt: string;        // ISO 8601 timestamp
  examples: string[];       // Code examples demonstrating the style
}
```

---

### `CodevoyantSettings`

User preferences stored in `.codevoyant/settings.json`.

```ts
interface CodevoyantSettings {
  notifications?: boolean;  // Enable/disable desktop notifications
  defaultPlugin?: string;   // Default plugin for new plans
  [key: string]: unknown;   // Additional user-defined settings
}
```
