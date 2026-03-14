# Validation Loop

Run a minimum of 2 validation rounds autonomously (no user prompts). After each round that surfaces issues, apply all fixes before running the next round.

## Validation Prompt

For each round, use the **Task tool** with:
- `subagent_type`: `general-purpose`
- `run_in_background`: `true`
- `description`: "Validate spec plan quality (round N)"
- `prompt`: Read from `references/validation-prompt.md` (in this skill directory), substituting `{PLAN_DIR}` with the actual plan directory path

## Loop

Repeat for **round = 1, 2, ...** (minimum 2 rounds; stop when round ≥ 2 AND status is PASS):

**a.** Notify user: `🔍 Validation round {round} running...`
Launch Task tool (`run_in_background=true`). Wait with TaskOutput (`block=true`).

**b.** Parse result:
- Extract `### Status:` → `PASS` or `NEEDS_IMPROVEMENT`
- Extract issues, recommendations, missing details

**c.** If `NEEDS_IMPROVEMENT`, auto-fix before next round:
- Work through every issue and recommendation
- Edit the relevant `implementation/phase-N.md` files directly
- Rewrite vague plan.md tasks to be specific and actionable
- Report: `🔧 Round {round} — fixed {N} issues: [brief summary]`

**d.** If `PASS` and round ≥ 2: break the loop

**e.** Cap at 3 rounds. After round 3, proceed regardless and note remaining issues in the final summary.

## Final Summary

```
✅ Plan validation complete ({N} rounds)
   Round 1: [PASS|NEEDS_IMPROVEMENT — X issues fixed]
   Round 2: [PASS|NEEDS_IMPROVEMENT — X issues fixed]
   Final status: [PASS | X issues remain (see below)]
   [If issues remain: list them]
```
