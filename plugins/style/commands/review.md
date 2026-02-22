Run a full style guide validation and write a structured violation report to `.style/REVIEW.md` so a follow-up agent can fix every issue without further input.

Unlike `/style:validate`, this command never interacts with the user and never auto-fixes — it only produces the report file.

## Usage

```
/style:review                    # current branch vs base (default)
/style:review branch             # current branch vs base
/style:review dir                # current directory tree
/style:review dir path/to/subdir # specific directory
/style:review repo               # all tracked files in repo
```

## Step 0: Parse Arguments

```bash
SCOPE="branch"        # default
SCOPE_DIR="."         # for dir scope (defaults to cwd)
SCOPE_BASE=""         # auto-detected for branch scope
```

- First non-flag argument: `branch`, `dir`, or `repo` — sets SCOPE
- For `dir`: optional second argument is the target path (defaults to `.`)
- For `branch`: auto-detect base branch from git

## Step 1: Load Style Rules

Read CLAUDE.md and `.style/config.json` to load all active rules with their contexts and severity levels.

Build a rule index:
```json
{
  "rules": [
    {
      "id": "rule-slug",
      "text": "Full rule text",
      "contexts": ["code", "typescript"],
      "severity": "violation | warning | suggestion"
    }
  ]
}
```

If no rules are found, write a minimal REVIEW.md noting the issue and exit.

## Step 2: Determine Scope and Collect Files

| SCOPE    | What to collect                                                          |
|----------|--------------------------------------------------------------------------|
| `repo`   | All tracked files: `git ls-files`                                        |
| `dir`    | All tracked files under `SCOPE_DIR`: `git ls-files {SCOPE_DIR}`          |
| `branch` | Files changed on this branch vs base: `git diff {SCOPE_BASE}...HEAD --name-only` |

For `branch` scope, detect the base:
```bash
BASE=$(git rev-parse --verify origin/main 2>/dev/null && echo origin/main || \
       git rev-parse --verify origin/master 2>/dev/null && echo origin/master || \
       echo main)
```

For each file, record: file path, full content, detected file type (ts, md, justfile, etc.).

## Step 3: Launch Parallel Review Agents

Notify the user: `🔍 Launching parallel style review agents...`

Dispatch one background agent per section **in a single message** (all at once, truly parallel).
Pass each agent: the full rules list from Step 1, the file list from Step 2, and the raw content of every file in scope.

### Agent definitions

**Agent A — Build & Tools** (`description: "style review: build & tools"`)
```
You are a style guide reviewer checking build tool usage only.

Rules (context: build, tools):
{rules filtered to context: build, tools}

Files in scope:
{file list with content}

Check: Are raw npm/yarn/npx/tsc/node commands used in places where a justfile recipe exists?
Check: Are Makefile targets bypassed in favour of direct shell commands?

Return findings as JSON:
{
  "section": "build-tools",
  "findings": [
    {
      "severity": "violation|warning|suggestion",
      "rule": "<rule text>",
      "file": "<path>",
      "line": <N>,
      "found": "<offending snippet>",
      "expected": "<corrected snippet>",
      "fix": "<one-line agent instruction>"
    }
  ]
}
Return {"section":"build-tools","findings":[]} if nothing found.
```

**Agent B — Commit Messages** (`description: "style review: commits"`)
```
You are a style guide reviewer checking commit messages only.

Rules (context: git, commit):
{rules filtered to context: git, commit}

{if SCOPE == "branch"}
Commits on this branch:
{output of: git log {SCOPE_BASE}...HEAD --pretty=format:"%H %s%n%b"}
{else}
No branch scope — return {"section":"commits","findings":[]}.
{endif}

Check: conventional commit format (type(scope): subject)
Check: subject line ≤ 72 chars
Check: Co-Authored-By present for AI-assisted commits

Return findings as JSON using the same schema as Agent A, with "section":"commits".
```

**Agent C — Code Style** (`description: "style review: code style"`)
```
You are a style guide reviewer checking code style only.

Rules (context: code, typescript, javascript):
{rules filtered to those contexts}

Files in scope (code files only: .ts, .tsx, .js, .jsx):
{filtered file list with content}

Check every applicable rule. Common checks:
- let used where const is possible
- : any type annotations
- Explicit return undefined instead of bare return
- Other rules from the list above

Return findings as JSON using the same schema, with "section":"code-style".
```

**Agent D — Documentation** (`description: "style review: documentation"`)
```
You are a style guide reviewer checking documentation only.

Rules (context: docs, documentation):
{rules filtered to those contexts}

Files in scope (.md, .mdx, plus code files with changed public APIs):
{filtered file list with content}

Check: are docs updated when behaviour-changing code files are modified?
Check: are public functions/exports documented?
Check: any broken markdown links or outdated examples?

Return findings as JSON using the same schema, with "section":"docs".
```

**Agent E — Custom Rules** (`description: "style review: custom rules"`)
```
You are a style guide reviewer checking all project-specific custom rules that don't fit other categories.

Rules (all contexts NOT covered by agents A–D — i.e. not: build, tools, git, commit, code, typescript, javascript, docs, documentation):
{remaining rules}

Files in scope:
{full file list with content}

Evaluate each rule against the content semantically and via pattern matching.

Return findings as JSON using the same schema, with "section":"custom".
```

### Launch and wait

After dispatching all five agents simultaneously, collect results:

```
For each agent (A–E):
  Use TaskOutput tool with block=true to wait for completion
  Parse the returned JSON findings array
  Append all findings to COMBINED_FINDINGS[]
```

If any agent errors or returns invalid JSON, log a warning in REVIEW.md under a `## Agent Errors` section and continue with results from the others.

## Step 4: Build the REVIEW.md Report

Merge all findings from `COMBINED_FINDINGS[]`.
Sort: violations first, then warnings, then suggestions.
Assign sequential global IDs (V1, V2… W1, W2… S1, S2…).

Create or overwrite `.style/REVIEW.md` with the following structure:

```markdown
# Style Guide Review

**Generated:** {ISO-8601 UTC timestamp}
**Scope:** {repo | dir: {path} | branch: {branch} vs {base}}
**Rules loaded:** {N}

## Summary

| Severity   | Count |
|------------|-------|
| Violation  | X     |
| Warning    | Y     |
| Suggestion | Z     |
| **Total**  | N     |

{If 0 findings:}
✅ No violations found. All checks passed.

---

## Violations

{For each violation, one block:}

### V{N}: {Rule Name}

- **Severity:** Violation
- **Rule:** {Full rule text from CLAUDE.md}
- **File:** `{relative/path/to/file}` (line {N})
- **Context tags:** {tag1}, {tag2}

**Found:**
```
{exact offending line(s) with surrounding context, max 5 lines}
```

**Expected:**
```
{what the corrected version should look like}
```

**Fix:** {One-line plain-English instruction for an agent, e.g. "Replace `let user` with `const user` on line 42 of src/auth.ts"}

---

## Warnings

{Same block format as Violations, using W{N} prefix}

---

## Suggestions

{Same block format, using S{N} prefix, but no "Expected" block — just a "Note:" field with the recommendation}

---

## Fix Instructions for Agent

The following is an ordered action list. A follow-up agent should execute these top-to-bottom:

{N}. [{severity}] {Fix instruction} — `{file}:{line}`
{N}. [{severity}] {Fix instruction} — `{file}:{line}`
...

Violations must be fixed. Warnings should be fixed. Suggestions are optional.
```

## Step 5: Update Compliance History

Append an entry to `.style/compliance.json`:

```json
{
  "timestamp": "{ISO-8601 UTC}",
  "scope": "{scope}",
  "violations": N,
  "warnings": N,
  "suggestions": N,
  "reviewFile": ".style/REVIEW.md"
}
```

## Step 6: Report to User

Print a brief summary — do not reprint the full report:

```
✓ Review complete — .style/REVIEW.md written

  Violations : {N}
  Warnings   : {N}
  Suggestions: {N}

  To fix all issues, run a follow-up agent with:
    "Read .style/REVIEW.md and apply every fix listed in the Fix Instructions section."
```
