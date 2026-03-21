# Installation

## Claude Code

Install skills:

```bash
npx skills add cloudvoyant/codevoyant
```

For local development or testing:

```bash
npx skills add /path/to/codevoyant
```

## OpenCode

Skills install globally to `~/.config/opencode/skills/`:

```bash
curl -fsSL https://raw.githubusercontent.com/cloudvoyant/codevoyant/main/scripts/install-opencode.sh | bash
```

Single plugin:

```bash
curl -fsSL https://raw.githubusercontent.com/cloudvoyant/codevoyant/main/scripts/install-opencode.sh | bash -s spec
```

Uninstall:

```bash
curl -fsSL https://raw.githubusercontent.com/cloudvoyant/codevoyant/main/scripts/install-opencode.sh | bash -s -- --uninstall
```

> **Note:** If codevoyant is already installed for Claude Code, OpenCode picks up skills from `.claude/skills/` automatically.

## VS Code Copilot

Skills install globally to `~/.copilot/skills/`:

```bash
curl -fsSL https://raw.githubusercontent.com/cloudvoyant/codevoyant/main/scripts/install-vscode.sh | bash
```

Single plugin:

```bash
curl -fsSL https://raw.githubusercontent.com/cloudvoyant/codevoyant/main/scripts/install-vscode.sh | bash -s spec
```

Uninstall:

```bash
curl -fsSL https://raw.githubusercontent.com/cloudvoyant/codevoyant/main/scripts/install-vscode.sh | bash -s -- --uninstall
```

Restart VS Code or reload the Copilot extension after installing.

## Versions

Skills follow semantic versioning. To update:

```bash
npx skills add cloudvoyant/codevoyant
```

To install a specific version:

```bash
npx skills add cloudvoyant/codevoyant@v1.0.3
```

## Troubleshooting

**Commands not showing up:**

```bash
npx skills add cloudvoyant/codevoyant   # reinstall
```

**Updates not applying:**

```bash
npx skills add cloudvoyant/codevoyant   # re-fetch latest
```

For anything else: [open an issue](https://github.com/cloudvoyant/codevoyant/issues).
