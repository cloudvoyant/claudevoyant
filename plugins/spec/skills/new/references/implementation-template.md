# Implementation Phase File Template

Use this structure for each `implementation/phase-N.md` file created in Step 5.5.

```markdown
# Phase {N} - {Phase Name}

## Overview
{Brief description of what this phase accomplishes and its role in the overall plan}

## Execution Constraints

**Brevity:** Make the smallest change that achieves the task. No drive-by refactors or unrelated fixes.

**Build system preservation:** Do NOT modify the build system, CI config, or dependencies unless this phase is explicitly about them. If the project built before you started, it must build after every task. If a change would require an unplanned build system modification, stop and flag it.

## Task Runner Commands
{List the relevant task runner commands for this phase. ALWAYS use these — never invent equivalent shell commands.}
- Build: `{e.g. just build | make build | task build}`
- Test: `{e.g. just test | make test | task test}`
- Lint: `{e.g. just lint | make lint}`
- Format: `{e.g. just fmt | make format | task fmt}`
- Type check: `{e.g. just typecheck | make typecheck | tsc --noEmit | mypy .}`
- Run: `{e.g. just dev | docker-compose up}`

If no task runner covers a needed operation, note: "Gap: no recipe for X — suggest adding one."

**Hygiene rule:** Run lint + format + type check after every task, not just at phase end. Fix all errors before moving to the next task. Never leave a task in a state where `lint`, `fmt`, or `typecheck` fails.

## Tasks

{For each task in this phase from plan.md:}

### Task {X}: {Task Description}

**Implementation Steps:**
1. {Detailed step-by-step instructions}
2. {Be specific about what to do}
3. {Include exact commands, file paths, code patterns}
4. Validate with: `{task runner command}` — expected output: {describe expected output}

**Files to Modify:**
- `path/to/file.ext` - {Specific changes to make}

**Files to Create:**
- `path/to/newfile.ext` - {Purpose and key content}

**Code Examples:**
```{language}
// Show concrete code examples that should be implemented
```

**Validation (run after every task — do not skip):**
- [ ] `{fmt command}` — no formatting changes outstanding
- [ ] `{lint command}` — zero warnings/errors
- [ ] `{typecheck command}` — no type errors
- [ ] `{test command}` — all tests pass
- [ ] {Manual verification steps if needed}

**Success Criteria:**
- {How to verify this task is complete}
- {Expected behavior or output}

**User Guide Update:**
- {What to add/update in user-guide.md once this task is complete}

---

{Repeat for each task in the phase}

## Phase Validation

After all tasks in this phase are complete, run the full suite in order:

```bash
{fmt command}        # no outstanding formatting changes
{lint command}       # zero warnings or errors
{typecheck command}  # no type errors
{test command}       # all tests pass
{build command}      # clean build
```

Expected: {describe expected output — exit code 0, test count, etc.}

If any command fails, do not mark the phase complete. Fix and re-run. All five must be green before proceeding to the next phase.
```
