Create a new plan by exploring requirements and building a structured plan. The
goal is to create a high quality implementation plan that can be executed
autonomously.

## Step 1: Check for Existing Plan

Check if `.claude/plan.md` already exists:

- If it exists, read the plan to check completion status
- Run `/refresh` logic to verify if all tasks are complete
- Based on status:
  - If plan is complete (all phases have ✅):
    - Inform user the plan is complete.
    - ASK USER whether to:
      1.  Replace with new plan (no archiving needed)
      2.  Create an adr with `/adr:capture` before replacement
      3.  Cancel the operation
  - If plan is incomplete:
    - Inform user there's an incomplete plan.
    - ASK USER whether to:
      1.  Delete existing plan and replace with the new plan
      2.  Capture work done via `/adr:capture` before replacement
      3.  Continue with the existing plan (redirect to `/go`)
      4.  Cancel the operation
- WAIT FOR USER decision before proceeding

## Step 2: Initialize Template

Create `.claude/plan.md` with the following template structure:

```markdown
# [New Plan Name]

## Objective

[What are you trying to accomplish?]

## Design

[High level solution design]

## Plan

### Phase 1 - [Phase Name]

1. [ ] Task 1
2. [ ] Task 2
3. [ ] Task 3

### Phase 2 - [Phase Name]

1. [ ] Task 1
2. [ ] Task 2

## Implementation

[Will be filled in post-planning]

## Resources

1. [Example Resource](example.com/how-to-article.html)
```

## Step 3: Understand the Goal

Ask: "What are you planning to build, implement, or accomplish?"

Wait for the user's response describing their objective.

## Step 4: Explore Requirements

1. Clarify Requirements

   - Ask follow-up questions to understand scope and constraints
   - Identify key components or areas that need work
   - Identify whether to lean towards lightweight prototyping or hardcore
     enterprise style engineering for the plan
   - Understand dependencies and order of operations

2. Research Context

   - Search codebase for relevant files and patterns
   - Review existing architecture and structure
   - Identify files/systems that will be affected
   - THINK HARD about how to systematically implement the gathered requirements
     - Research existing libraries and solutions that could meet users needs
       based on the project's language/stack
     - Research architectural and design patterns that could be useful for
       implementation
     - Research existing libraries that implement similar solutions
     - Keep track of URLs for any resources you are relying on

3. ASK USER FOLLOW UP QUESTIONS.

   - Ask any questions needed to make architectural or important implementation
     choices.
   - Ask any questions needed to unblock autonomous execution by Claude.

4. Break Down Work

   - Identify logical phases or groupings of work
   - For each phase, identify specific tasks
   - Consider dependencies between phases
   - Estimate complexity and risks

## Step 5: Create Structured Plan

Update `.claude/plan.md` with:

1. Objective Section

   - Concise 2-4 bullet points summarizing the goal
   - Focus on what, not how

2. Design Section

- Explain high level design for the solution. List any major classes or
  functions that will be created, or abstract concepts that will be encoded.
- Any changes to the project or directory structure should be explained here as
  well.

3. Plan Section
   - Group related tasks into phases
   - Name phases descriptively (e.g., "Phase 1 - Setup Infrastructure")
   - List specific, actionable tasks as numbered unchecked items `1. [ ]`
   - Break complex tasks into smaller tasks, but do not exceed 2 levels of
     nesting
   - Keep tasks terse, avoiding implementation details for the plan checklists
   - Order tasks logically within each phase

Format Requirements:

- Use `## Phase N - Description` for phase headers
- Use `1. [ ]` for unchecked tasks
- Use `1. [x]` for checked tasks (all start unchecked)
- Keep task descriptions concise (one line each)
- Add ✅ to phase header only when all tasks in that phase are complete

4. Detailed Implementation Plan

- For every phase and task in the Plan section, write a detailed execution plan
- Any dependencies that will be added or removed should be specified.
- Any code that will be added or removed should be specified here with target
  filenames. Any files that will be added or removed should be specified as
  well.
- Specify what tests will be added, removed or updated
- Always specify that testing will be done at the end of each phase to ensure
  there are no regressions and new functionality is robust
- ENSURE THAT implementation plans fall under proper markdown headings related
  to phase and numbered tasks.

## Step 6: Review

Present the plan and ask: "Does this plan cover everything? Any changes needed?"

Wait for confirmation or adjustments.

## Best Practices

- Terse but Clear: Tasks should be concise one-liners
- Actionable: Each task should be a specific action, not a vague goal
- Ordered: Tasks within phases should follow logical dependencies
- Grouped: Related tasks should be in the same phase
- Progressive: Phases should build on each other when possible
