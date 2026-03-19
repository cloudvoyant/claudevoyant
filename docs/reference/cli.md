# CLI Reference

CLI for managing codevoyant plans, worktrees, and config.

## Installation

```bash
npm install -g @codevoyant/agent-kit
# or use without installing:
npx @codevoyant/agent-kit <command>
```

## Global Options

| Option | Description |
|--------|-------------|
| `-V, --version` | Show version number |
| `-h, --help` | Show help |

## Commands

### `init`

Initialize the `.codevoyant/` directory structure. Creates `codevoyant.json`, `settings.json`, `plans/` and `worktrees/` directories, and adds `.codevoyant/worktrees/` to `.gitignore`. Auto-migrates legacy `spec.json` or `plans.json` if found.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--dir <dir>` | `string` | `.` | Target directory |

```bash
npx @codevoyant/agent-kit init
npx @codevoyant/agent-kit init --dir /path/to/project
```

---

### `plans register`

Register a new plan in the registry.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--name <name>` | `string` | **(required)** | Plan name |
| `--plugin <plugin>` | `string` | **(required)** | Plugin that owns this plan |
| `--description <desc>` | `string` | **(required)** | Plan description |
| `--total <total>` | `string` | `"0"` | Total tasks |
| `--branch <branch>` | `string` | `null` | Associated branch |
| `--worktree <worktree>` | `string` | `null` | Associated worktree path |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit plans register \
  --name my-feature --plugin spec \
  --description "Add new feature" --total 5
```

---

### `plans update-progress`

Update the progress of an active plan.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--name <name>` | `string` | **(required)** | Plan name |
| `--completed <n>` | `string` | **(required)** | Completed tasks |
| `--total <n>` | `string` | *(unchanged)* | Total tasks |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit plans update-progress --name my-feature --completed 3
```

---

### `plans update-status`

Update the status of an active plan.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--name <name>` | `string` | **(required)** | Plan name |
| `--status <status>` | `string` | **(required)** | New status (e.g. `Active`, `Executing`, `Paused`, `Complete`, `Abandoned`) |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit plans update-status --name my-feature --status Executing
```

---

### `plans archive`

Move an active plan to the archived list.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--name <name>` | `string` | **(required)** | Plan name |
| `--status <status>` | `string` | `"Complete"` | Final status |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit plans archive --name my-feature
```

---

### `plans delete`

Delete a plan from both active and archived lists.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--name <name>` | `string` | **(required)** | Plan name |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit plans delete --name my-feature
```

---

### `plans rename`

Rename an active plan and update its path.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--name <name>` | `string` | **(required)** | Current plan name |
| `--new-name <newName>` | `string` | **(required)** | New plan name |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit plans rename --name old-name --new-name new-name
```

---

### `plans get`

Get a single plan as JSON. Searches both active and archived plans.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--name <name>` | `string` | **(required)** | Plan name |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit plans get --name my-feature
```

---

### `plans list`

List plans as JSON.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--status <status>` | `string` | *(all active)* | Filter by status. Special values: `archived` (archived only), `all` (active + archived) |
| `--plugin <plugin>` | `string` | *(any)* | Filter by plugin |
| `--archived` | `boolean` | `false` | Include archived plans |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit plans list
npx @codevoyant/agent-kit plans list --status Executing --plugin spec
```

---

### `plans migrate`

Migrate legacy `plans.json` or `spec.json` to `codevoyant.json`. Adds a `plugin` field (defaulting to `"spec"`) to entries that lack one. Removes the old file after successful migration.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--dir <dir>` | `string` | `.` | Directory containing `.codevoyant/` |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit plans migrate
```

---

### `notify`

Send a cross-platform desktop notification.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--title <title>` | `string` | **(required)** | Notification title |
| `--message <message>` | `string` | **(required)** | Notification message |
| `--silent` | `boolean` | `false` | Suppress notification (no-op) |

```bash
npx @codevoyant/agent-kit notify --title "Build Complete" --message "All tests passed"
```

---

### `worktrees create`

Create a new git worktree under `.codevoyant/worktrees/` and register it in the config.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--branch <branch>` | `string` | **(required)** | Branch name |
| `--base <base>` | `string` | `"HEAD"` | Base branch or commit |
| `--plan <plan>` | `string` | `null` | Associated plan name |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit worktrees create --branch feat/new-thing --plan my-feature
```

---

### `worktrees remove`

Remove a git worktree and unregister it from the config.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--branch <branch>` | `string` | **(required)** | Branch name |
| `--delete-branch` | `boolean` | `false` | Also delete the branch |
| `--force` | `boolean` | `false` | Force removal (even with uncommitted changes) |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit worktrees remove --branch feat/new-thing --delete-branch
```

---

### `worktrees prune`

Prune stale worktrees from both git and the config registry.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit worktrees prune
```

---

### `worktrees list`

List all git worktrees with enriched information (plan association, dirty status).

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--json` | `boolean` | `false` | Output as JSON |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit worktrees list
npx @codevoyant/agent-kit worktrees list --json
```

---

### `worktrees export`

Export a plan from a worktree to the main repository. Copies the plan directory and upserts the plan entry in the main repo config.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--plan <plan>` | `string` | *(auto-detected)* | Plan name to export |
| `--force` | `boolean` | `false` | Overwrite existing plan in main repo |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit worktrees export --plan my-feature
```

---

### `worktrees register`

Register a worktree in the config registry without performing any git operations.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--branch <branch>` | `string` | **(required)** | Branch name |
| `--path <path>` | `string` | **(required)** | Worktree path |
| `--plan <plan>` | `string` | `null` | Associated plan name |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit worktrees register \
  --branch feat/existing --path .codevoyant/worktrees/feat/existing
```

---

### `worktrees unregister`

Remove a worktree from the config registry without performing any git operations.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--branch <branch>` | `string` | **(required)** | Branch name |
| `--registry <path>` | `string` | `.codevoyant/codevoyant.json` | Path to codevoyant.json |

```bash
npx @codevoyant/agent-kit worktrees unregister --branch feat/existing
```
