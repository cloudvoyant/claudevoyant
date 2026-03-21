# User Guide Template

Write this file to `$PLAN_DIR/user-guide.md` when creating a plan. Fill in what is knowable now; mark the rest with `<!-- TODO: fill in during/after execution -->`. The execution agent must keep this updated as code is built.

```markdown
# {Plan Name} — User Guide

> {One-sentence description of what this does and who it's for.}

## Overview

{2–4 sentences describing what was built. Focus on what it does, not how. No implementation details.}

<!-- TODO: fill in during/after execution -->

## Quick Start

```{language}
{Minimal working example — the simplest possible usage}
```

<!-- TODO: fill in during/after execution -->

## Usage

### {Primary Use Case}

{Describe the most common way to use this. Show a concrete example.}

```{language}
{example code or command}
```

### {Secondary Use Case}

<!-- TODO: fill in during/after execution -->

## API Reference

{List public interfaces, functions, commands, or configuration options. For each:}

### `{functionName / command / config key}`

{What it does in one sentence.}

**Parameters / Options:**
- `{param}` — {type, required/optional, description}

**Returns / Output:**
{What the caller gets back}

**Example:**
```{language}
{example}
```

<!-- TODO: fill in during/after execution -->

## Configuration

{Any config files, environment variables, or flags. Leave empty if none.}

<!-- TODO: fill in during/after execution -->

## Troubleshooting

### {Common Issue}
{How to diagnose and fix it}

<!-- TODO: fill in during/after execution -->
```

**Rules:**
- No implementation details (no class internals, no database schema, no algorithm explanations)
- Focus on what the user sees and interacts with, not how it works inside
- Every code example must be runnable as-is (or clearly marked as pseudo-code)
- Update this file incrementally during execution — don't leave it as a stub
