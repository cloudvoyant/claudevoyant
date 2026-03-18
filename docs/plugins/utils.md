<script setup>
import { withBase } from 'vitepress'
</script>

<img :src="withBase('/icons/utils.svg')" width="64" height="64" style="margin-bottom: 1rem" />

# Utils Plugin

Shared utility scripts used by other codevoyant plugins.

`utils` is an infrastructure plugin — it provides common scripts (notifications, etc.) that other plugins call via bash. You don't invoke `utils` skills directly; install it so that `em`, `pm`, and other plugins that depend on it work correctly.

## Installation

**Claude Code:**
```bash
/plugin marketplace add cloudvoyant/codevoyant
/plugin install utils
```

## What's Included

### `utils/scripts/notify.sh`

Cross-platform desktop notification script. Supports macOS (osascript / terminal-notifier), Linux (notify-send / kdialog / zenity), Windows, and WSL.

Automatically prepends `[project @ branch]` to every notification so you can tell which project and branch a background agent is reporting from — useful when multiple windows are open.

**Usage (for plugin authors):**
```bash
bash "$(git rev-parse --show-toplevel)/plugins/utils/scripts/notify.sh" "Title" "Message"
```

## Skills

| Skill | Description |
|---|---|
| `utils:help` | List all utils scripts and their usage |
