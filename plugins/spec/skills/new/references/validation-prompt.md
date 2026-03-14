# Validation Agent Prompt

Use this prompt verbatim when launching the Task tool for each validation round in Step 5.6.

```
You are validating a software development plan for autonomous execution quality. Read and analyze every plan file, then produce a structured validation report.

Read these files:
1. {PLAN_DIR}/plan.md
2. Every file in {PLAN_DIR}/implementation/
3. {PLAN_DIR}/user-guide.md (if it exists)
4. List files in {PLAN_DIR}/research/ (if directory exists)

Validate the following quality criteria:

**Task Quality**
- Are all tasks specific and actionable (not vague phrases like "implement X", "update Y")?
- Does each task have an implied or explicit success criterion?
- Are tasks appropriately scoped (not so large they require sub-planning)?

**Implementation Completeness**
- Does each phase file have concrete, step-by-step implementation instructions?
- Are file paths specific and unambiguous (not "relevant files" or "appropriate location")?
- Are code examples present for non-trivial logic?
- Is there enough detail for an autonomous agent to execute without asking clarifying questions?

**Task Runner Usage**
- Does plan.md metadata include a "Task Runners" field?
- Does every phase file list its applicable task runner commands in a "Task Runner Commands" section, covering build/test/lint/format/typecheck?
- Are all build/test/lint/format/typecheck/run commands using the project's task runners (not raw `npm test`, `python -m pytest`, `go test ./...` etc. when a task runner wraps them)?
- Does every task's Validation checklist include lint, format, and typecheck steps — not just tests?
- Is there a "Phase Validation" block at the end of each phase file with all five checks (fmt, lint, typecheck, test, build)?
- Is there a note in the phase files that lint/format/typecheck must be run after every task, not only at phase end?

**User Guide**
- Does user-guide.md exist at {PLAN_DIR}/user-guide.md?
- Does each task specify what to update in user-guide.md once complete?
- Are the overview and intended usage patterns filled in (not all TODO)?

**Consistency**
- Does each phase file cover all tasks listed in plan.md for that phase?
- Are phase names and task descriptions consistent between plan.md and implementation files?

**Test Coverage**
- Does each task specify what tests to write or run using the task runner?
- Are acceptance/success criteria testable?
- Is there at least one phase dedicated to or including end-to-end validation?

**Dependencies & Risks**
- Are inter-phase dependencies identified?
- Are external package/library dependencies noted?
- Are potential failure points or edge cases addressed?

Respond ONLY in this exact format:

## Validation Report

### Status: [PASS | NEEDS_IMPROVEMENT]

### Issues
[phase-N, task-X] Description of specific issue
(write "none" if no issues)

### Recommendations
- Specific actionable improvement with the exact file and section to change
(write "none" if no recommendations)

### Missing Details
- What is absent from implementation files that would block autonomous execution
(write "none" if nothing is missing)
```
