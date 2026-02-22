Process `@change(...)` annotations in a plan's files and apply the requested edits.

The user writes `@change(request)` directly inside plan files — inline on a line, or
on their own line before/after the relevant content. This command finds every annotation,
applies the change, and removes the marker.

## Usage

```
/spec:update [plan-name]
```

If no plan name is given, auto-select the most recently updated active plan.

## What @change looks like

**Inline — applies to that line:**
```markdown
1. [ ] Implement JWT tokens @change(mark complete)
2. [ ] Add refresh tokens @change(remove this task, we're not doing it)
```

**Own line — applies to the block immediately below or above it:**
```markdown
@change(rewrite this overview — we switched to OAuth, remove all JWT references)
## Overview
This phase implements custom JWT token generation...
```

**Multi-line request — bracket spans multiple lines:**
```markdown
@change(
  Replace this entire phase.
  New approach: use Passport.js with GitHub OAuth.
  Keep the testing task but update it to cover OAuth flow.
)
### Phase 2 - Auth
```

## Step 0: Select Plan

Check for plan name argument. If not provided:
1. Read `.spec/plans/README.md`, sort active plans by Last Updated
2. Auto-select the most recently updated plan
3. Report: "Updating plan: {plan-name}"
4. If no plans exist, inform user to create one with `/new`

Verify `.spec/plans/{plan-name}/plan.md` exists.

## Step 1: Scan All Plan Files for @change Annotations

Search every file in the plan directory for `@change(`:

```bash
grep -rn "@change(" .spec/plans/{plan-name}/
```

Files to scan:
- `.spec/plans/{plan-name}/plan.md`
- `.spec/plans/{plan-name}/implementation/phase-*.md`

**Parse each annotation:**

For each match, extract:
- `FILE` — which file contains the annotation
- `LINE_NUM` — line number of the `@change(` opener
- `REQUEST` — full text inside the brackets (may span multiple lines until the closing `)`)
- `POSITION` — `inline` (annotation on same line as content) or `standalone` (annotation on its own line)
- `CONTEXT` — surrounding lines to understand what the change targets:
  - If inline: the rest of the line the annotation is on
  - If standalone: up to 10 lines before and after the annotation line

Collect all annotations into a list ordered by file then line number.

If no annotations found:
```
No @change(...) annotations found in plan: {plan-name}

To use this command, open a plan file and add @change(...) where you want edits.
Example: @change(mark this task complete)
         @change(rewrite this section — we changed approach)
```

## Step 2: Apply Each Change

Work through annotations **in order, bottom-to-top within each file** (so line numbers stay valid as edits are made).

For each annotation:

1. **Read the request and context** — understand what is being asked based on:
   - The request text inside `@change(...)`
   - The line(s) the annotation sits on or adjacent to
   - Surrounding content in the file

2. **Determine the edit type** from the request wording:

   | Request says...                        | Action                                           |
   |----------------------------------------|--------------------------------------------------|
   | "mark complete", "done", "check"       | Change `[ ]` → `[x]` on the target task; update phase ✅ if all done |
   | "uncheck", "mark incomplete", "reopen" | Change `[x]` → `[ ]`; remove ✅ from phase header if present |
   | "remove", "delete", "drop"             | Delete the target line(s) or section             |
   | "rewrite", "replace", "update"         | Rewrite the target content per the request       |
   | "add", "insert", "append"             | Insert new content at the annotated location     |
   | "rename"                               | Update the label/title at the annotated location |
   | Free-form instructions                 | Interpret and apply as a direct edit             |

3. **Apply the edit** to the file, replacing or modifying the target content as requested.

4. **Remove the `@change(...)` annotation** — delete the marker (the entire annotation text including brackets). If the annotation was on its own line and no other content remains on that line after removal, delete the line entirely.

5. **Log the change** for the summary report.

## Step 3: Post-Edit Consistency Pass

After all annotations are processed:

- For `plan.md`: re-run phase-completion logic — verify ✅ markers match actual task completion for any phase that was touched
- Update `.spec/plans/README.md` progress stats and Last Updated timestamp

## Step 4: Report

Print a summary of every change applied:

```
✓ Updated plan: {plan-name}
  {FILE}:{LINE} — {brief description of what changed}
  {FILE}:{LINE} — {brief description of what changed}
  ...
  {N} change(s) applied.
```

If any annotation was ambiguous or could not be applied cleanly, report it:
```
⚠️  Could not apply change at {FILE}:{LINE}: {reason}
    Annotation preserved in file — please resolve manually.
```
