---
description: Generate and apply the permission config needed for uninterrupted autonomous agent execution — prevents mid-run permission prompts when using /spec:bg, /spec:go, or any background agent. Triggers on keywords like allow agent, agent permissions, pre-approve, permission config, allow tools, stop asking for permission, autonomous execution permissions, unblock agent, dev allow, agent interrupted, perms.
argument-hint: "[--plan plan-name] [--agent agent-name] [--global] [--apply]"
disable-model-invocation: true
model: claude-haiku-4-5-20251001
---

> **Compatibility**: If `AskUserQuestion` is unavailable, present options as a numbered list and wait for the user's reply.

Generate the minimal permission configuration needed for autonomous agent execution without mid-run interruptions. Outputs ready-to-apply config for every detected AI coding tool (Claude Code, OpenCode, VS Code Copilot).

## Flags

- `--plan <name>`: Scope to the tools required by a specific plan's agents
- `--agent <name>`: Scope to a specific agent (e.g. `spec-executor`, `spec-planner`)
- `--global`: Apply to global config instead of project-level (default: project-level for Claude Code)
- `--apply`: Write the config directly after confirmation instead of just showing it

## Step 0: Parse Arguments

```bash
PLAN_NAME=""       # from --plan flag
AGENT_NAME=""      # from --agent flag
GLOBAL=false       # from --global flag
APPLY=false        # from --apply flag
```

If neither `--plan` nor `--agent` is given, default scope is **all codevoyant background agents** (`spec-executor`, `spec-planner`, `spec-explorer`).

## Step 1: Determine Required Tool Set

Build the set of operations the agent(s) will perform:

**If `--agent` is given:** Read `plugins/*/agents/{agent-name}.md` (or search installed agent dirs) to get the `tools:` frontmatter field. That is the exact tool set.

**If `--plan` is given:** Read `.codevoyant/plans/{plan-name}/plan.md` to understand what phases exist. Then use `spec-executor` as the agent (it runs the plan). Also check if the plan has proposals (use `spec-explorer` tool set) or was created with `spec-planner`.

**Default (all background agents):** Use the union of tools from `spec-executor`, `spec-planner`, and `spec-explorer`:

```
Core read tools:    Read, Glob, Grep
Core write tools:   Write, Edit
Task tracking:      TodoWrite
Bash operations:    git, task-runner commands, build/test/lint tools
Web tools:          WebFetch, WebSearch
Orchestration:      TaskCreate, TaskOutput
```

**Detect project task runners:**

```bash
if [ -f justfile ]; then TASK_RUNNER="just"; TASK_CMD="just *"
elif [ -f Makefile ]; then TASK_RUNNER="make"; TASK_CMD="make *"
elif [ -f package.json ]; then
  TASK_RUNNER="npm"
  TASK_CMD="npm run *"
  # Also check for yarn/pnpm
  [ -f yarn.lock ] && TASK_CMD="yarn *"
  [ -f pnpm-lock.yaml ] && TASK_CMD="pnpm *"
fi
```

## Step 2: Detect Installed Platforms

Check which AI coding tools are present in this environment:

```bash
# Claude Code
HAS_CLAUDE=false
[ -d ".claude" ] || [ -f "$HOME/.claude/settings.json" ] && HAS_CLAUDE=true

# OpenCode
HAS_OPENCODE=false
[ -d "$HOME/.config/opencode" ] && HAS_OPENCODE=true

# VS Code Copilot
HAS_VSCODE=false
[ -d ".github/agents" ] && HAS_VSCODE=true
```

Report which platforms were detected.

## Step 3: Build Platform Configs

### Claude Code

**Scope:** Project-level (`.claude/settings.json`) unless `--global` is set, which writes to `~/.claude/settings.json`.

Build the `permissions.allow` array. Start with the base set, then add task-runner patterns:

```json
{
  "permissions": {
    "allow": [
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git log:*)",
      "Bash(git rev-parse:*)",
      "Bash(git worktree:*)",
      "Bash(git stash:*)",
      "Bash(git checkout:*)",
      "Bash(git push:*)",
      "Bash(git pull:*)",
      "Bash(git rebase:*)",
      "Bash(git fetch:*)",
      "Bash(gh run:*)",
      "Bash(gh issue:*)",
      "{TASK_CMD}",
      "Bash(mkdir:*)",
      "Bash(cp:*)",
      "Bash(mv:*)",
      "Bash(cat:*)",
      "Bash(find:*)",
      "Bash(ls:*)",
      "Bash(echo:*)",
      "Bash(date:*)",
      "Bash(jq:*)",
      "WebSearch",
      "WebFetch"
    ]
  }
}
```

Replace `{TASK_CMD}` with the detected task runner pattern (e.g. `"Bash(just:*)"` or `"Bash(npm run:*)"` or both).

**Merge with existing config:** If the target settings.json already exists, read it and merge the `allow` array — deduplicate, do not remove existing entries.

**Note on Read/Write/Edit/Glob/Grep:** These non-Bash tools are auto-approved by default in Claude Code when `skipDangerousModePermissionPrompt` is set or in certain permission modes. Only add them to the allow list if they appear as permission prompts in practice. The most common source of interruption is `Bash(*)` commands.

### OpenCode

Build the `permission` block for `~/.config/opencode/config.json`:

```json
{
  "permission": {
    "read": "allow",
    "edit": "allow",
    "write": "allow",
    "glob": "allow",
    "grep": "allow",
    "list": "allow",
    "bash": "allow",
    "task": "allow",
    "todowrite": "allow",
    "todoread": "allow",
    "webfetch": "allow",
    "websearch": "allow",
    "question": "ask"
  }
}
```

**Note:** `question` is kept as `"ask"` intentionally — this is the `AskUserQuestion` tool that presents choices to the user. Auto-approving it would skip user-facing prompts, which defeats the purpose.

**Merge with existing config:** Read `~/.config/opencode/config.json`, merge the `permission` block — do not overwrite other settings (provider, model, mcp, etc.).

### VS Code Copilot

VS Code's permission model works differently: the agent's `tools:` allowlist in `.github/agents/*.agent.md` is the permission layer. No separate config file needed.

Check `.github/agents/` for codevoyant agent files. For each one, verify the `tools:` field covers what's needed. If any agent file is missing tools it requires (based on the source agent definition in `plugins/*/agents/`), show the corrected `tools:` line.

If the `.github/agents/` directory doesn't exist, note that agent files can be installed with:
```bash
bash scripts/install-vscode.sh
```

## Step 4: Present Config

For each detected platform, show the config with clear section headers. For multi-platform output:

```
## Permission Config for Autonomous Execution

### Claude Code — .claude/settings.json
Prevents mid-run prompts when running /spec:bg or /spec:go

{config block}

### OpenCode — ~/.config/opencode/config.json
Allows all agent tools without per-call approval

{config block}

### VS Code Copilot — .github/agents/ (no changes needed / changes needed)
{status or corrected tools: line per agent file}

---
These permissions allow agents to: read/write files, run git commands,
run {TASK_RUNNER} recipes, search the web, and spawn sub-tasks.
The AskUserQuestion tool (user-facing choices) is NOT auto-approved — it still
asks you. To revoke, remove the entries or set "deny".
```

## Step 5: Apply (if `--apply` or user confirms)

If `--apply` flag is set, proceed directly to writing. Otherwise, ask:

```
question: "Apply these permission configs?"
header: "Apply Permissions"
multiSelect: false
options:
  - label: "Apply all"
    description: "Write config for all detected platforms"
  - label: "Claude Code only"
    description: "Write .claude/settings.json (or ~/.claude/settings.json with --global)"
  - label: "OpenCode only"
    description: "Write ~/.config/opencode/config.json"
  - label: "Show only — don't write"
    description: "I'll apply the config manually"
```

**Writing Claude Code config:**

```bash
TARGET=".claude/settings.json"
[ "$GLOBAL" = "true" ] && TARGET="$HOME/.claude/settings.json"

# Create .claude/ if needed
mkdir -p "$(dirname "$TARGET")"
```

Read existing file (empty object `{}` if absent). Merge the `permissions.allow` array (union, deduplicated, sorted). Write back as formatted JSON.

Report: `✓ Updated $TARGET — added N new allow entries`

**Writing OpenCode config:**

```bash
TARGET="$HOME/.config/opencode/config.json"
```

Read existing file. Merge `permission` block — new keys are added, existing keys with `"deny"` or `"ask"` are upgraded to `"allow"` only if they're in the agent's tool set. Write back as formatted JSON.

Report: `✓ Updated $TARGET — set N tool permissions to allow`

**Writing VS Code agent files:**

If tools fields need updating, write the corrected agent files to `.github/agents/`. Report which files were updated.

## Step 6: Next Steps

After applying (or showing):

```
To start an autonomous run without interruptions:
  /spec:bg {plan-name}

To check current permissions:
  cat .claude/settings.json          # Claude Code (project)
  cat ~/.claude/settings.json        # Claude Code (global)
  cat ~/.config/opencode/config.json # OpenCode

To revoke agent permissions later:
  /dev:allow --revoke                # (removes codevoyant-added entries)
```
