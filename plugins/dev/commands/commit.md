Create a git commit following conventional commit standards with a professional, concise message.

## Rules

### Choosing the right type

1. Does it add new functionality users can use? → `feat`
2. Does it fix broken behavior? → `fix`
3. Does it change existing behavior (breaking)? → `feat!` or `fix!`
4. Does it only improve code structure? → `refactor`
5. Does it only update documentation? → `docs`
6. Does it only affect tests? → `test`
7. Does it only affect build/CI? → `chore`

### Special consideration for template projects

- **Template files are distributed to users** (workflows, configs, scripts,
  etc.)
- Changes to template files that improve user experience → `feat`
- Examples:
  - Faster CI builds (workflow caching) → `feat` (users benefit)
  - Better error messages in scripts → `feat` (users benefit)
  - Internal refactoring of template-only code → `refactor` (users don't see it)
- If users scaffold projects with these files, improvements are features!

### Never commit secrets

- Secrets or credentials (.env files, API keys, passwords)
- Warn user if such files are staged

### Formatting

- Always use HEREDOC format for commit messages to ensure proper formatting.
- First line max 72 characters
- Use imperative mood: "add feature" not "added feature" or "adds feature"
- No period at end of first line
- Be professional and concise
- Do NOT include self-attribution (no "Generated with Claude Code", no
  "Co-Authored-By: Claude")
- Body is optional - only add if the "why" isn't obvious from the type and
  description
- Keep body lines under 72 characters

## Examples

Good:

```text
docs: remove bold formatting from markdown headings

Improves readability by using plain text for structural elements
and reserving bold for emphasis within content.
```

```text
feat: add user authentication with JWT
```

```text
fix: prevent memory leak in connection pool
```

Bad:

```text
Update documentation files and also added new commit command
```

(Too long, mixed changes, wrong mood)

```text
docs: updated the markdown files to make them look better

I went through all the markdown files and removed the bold formatting
from the headings because it looks better in code editors.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

(Casual tone, self-attribution, obvious explanation)

## Workflow

### Step 1: Check Git Status

Run these commands in parallel to understand what's being committed:

```bash
git status
git diff --stat
git log --oneline -5
```

Analyze:

- What files changed (from git status)
- Summary of changes (from git diff --stat)
- Recent commit message style (from git log)

If you need to see detailed changes, read the modified files directly using the Read tool rather than running `git diff` (which can trigger permission checks on diff content).

### Step 2: Review Session History & Plan

Review the following to add meaningful context:

1. `.claude/plan.md` if one was recently implemented
2. Session/chat history

### Step 3: Draft Commit Message

Create a conventional commit message following this format:

```text
<type>: <short description>

[optional body paragraph explaining why, not what]
```

Type must be one of:

- `feat`: New feature → **triggers MINOR version bump** (1.x.0)
- `fix`: Bug fix → **triggers PATCH version bump** (1.0.x)
- `docs`: Documentation changes → no version bump (appears in changelog)
- `refactor`: Code refactoring (no functionality change) → no version bump
  (appears in changelog)
- `test`: Test additions or changes → no version bump (appears in changelog)
- `chore`: Build, CI, or tooling changes → no version bump (hidden from
  changelog)
- `feat!` or `fix!`: Breaking change → **triggers MAJOR version bump** (x.0.0)

### Step 3: Review with User

Show the proposed commit message:

```
Proposed commit:

<show commit message>

This will trigger a MINOR version bump (e.g., 1.2.0 → 1.3.0)
```

Or:

```
Proposed commit:

<show commit message>

This will NOT trigger a version bump (changelog only)
```

ASK USER: "Does this commit message look good?"

Wait for:

- Approval -> Proceed to Step 4
- Changes requested -> Revise and show again
- Cancel -> Exit without committing

### Step 4: Stage and Commit

Stage all changes and create the commit:

```bash
git add -A && git commit -m "$(cat <<'EOF'
<type>: <description>

[optional body]
EOF
)"
```
