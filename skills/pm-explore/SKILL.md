---
description: 'Research a product topic or feature area before planning or writing a PRD. Triggers on: "pm explore", "explore product area", "research feature", "pm research", "ideate on feature".'
name: pm:explore
license: MIT
compatibility: 'Designed for Claude Code. On OpenCode and VS Code Copilot, AskUserQuestion falls back to numbered list; context: fork runs inline.'
argument-hint: '[topic] [--deep] [--bg] [--silent]'
context: fork
model: claude-opus-4-6
---

> **Compatibility**: AskUserQuestion falls back to numbered list on non-Claude-Code platforms.

## Skill Requirements

```bash
command -v npx >/dev/null 2>&1 || echo "MISSING: npx"
```

## Critical Rules

- Never invent market data — research agents must cite sources or flag gaps explicitly
- One research artifact per topic slug
- Research artifacts are inputs for pm:plan and pm:prd — deposit them faithfully
- No markdown tables in output — use bullets and definition lists

## Guiding Principles

These principles govern all pm:explore output. The research agent and synthesis step must both conform.

- **Web-grounded only** — every claim must be sourced from a real URL, document, or internal file. Never synthesize facts from training knowledge alone.
- **Behaviors over preferences** — when available, behavioral data (usage patterns, purchase decisions, churn signals) outweighs stated preferences from surveys or interviews.
- **5–8 strong findings** — present the most impactful findings, not an exhaustive list. Quality over completeness.
- **Confidence levels required** — tag each finding as High / Medium / Low confidence based on source quality and corroboration.
- **Contradictions are signal** — when sources disagree, flag it as a segment distinction, not noise. Different users may experience the problem differently.
- **Cite every claim** — every bullet in the output must end with a source reference (URL, file path, or "Internal: {filename}").
- **No speculation on facts** — if a research question cannot be answered with evidence, list it as a gap. Do not fill data gaps with Claude's own judgment.
- **Yes, executive decisions on design** — when research is absent or ambiguous, the agent should make confident product design choices. The guiding question is always: _what is most likely to create a sticky, resonant product?_ Prefer depth over breadth, clear value over feature parity, and opinionated design over safe hedging. Label these choices `[DESIGN DECISION]` so the user can override them.

## Research Standards

### Source quality tiers

- **Tier 1 (High confidence)** — peer-reviewed research, analyst reports (Gartner, Forrester), primary user interviews, A/B test results, official product changelogs
- **Tier 2 (Medium confidence)** — reputable tech press (TechCrunch, Wired, The Verge), vendor blog posts with data, G2/Capterra reviews, Stack Overflow surveys
- **Tier 3 (Low confidence)** — social media posts, Reddit threads, individual blog opinions, unattributed claims

Every finding must state its source tier.

### Citation format

{finding} — [{Source Name}]({URL}) [Tier N, {date if available}]

### Research agent constraints

- Must call WebSearch at least once before writing any findings
- Must call WebFetch on at least 2 URLs per research dimension
- Must not state any market size, growth rate, or user behavior claim without a source URL
- Gaps section is mandatory — empty gaps means insufficient research, not complete coverage

## Step 0: Parse arguments and select mode

```bash
TOPIC="${1:-}"
BG_FLAG=false; SILENT=false; DEEP=false
[[ "$*" =~ --bg|-b ]] && BG_FLAG=true
[[ "$*" =~ --silent ]] && SILENT=true
[[ "$*" =~ --deep ]] && DEEP=true
```

`--deep` escalates research: more searches, more sources fetched, stricter source tier requirements. Use for high-stakes decisions where shallow research isn't enough.

Ask the user to select their exploration mode(s):

```
AskUserQuestion:
  question: "What kind of exploration do you want to do?"
  header: "Explore mode"
  multiSelect: true
  options:
    - label: "Open-ended ideation"
      description: "Problem-seeking and idea generation — discover what's worth building"
    - label: "Feature/idea validation"
      description: "Validate a specific hypothesis with market research and competitive analysis"
    - label: "Competitor deep-dive"
      description: "Focused analysis of specific named competitors"
    - label: "User problem discovery"
      description: "JTBD-style research — surface jobs, pains, and gains from real sources"
```

Store selected modes as MODES (array). If multiple modes selected, all will be run in parallel.

If TOPIC is empty, ask:

```
AskUserQuestion:
  question: "What topic, product area, or feature are you exploring?"
  header: "Topic"
  options:
    - label: "I'll type the topic below"
    - label: "Browse recent research artifacts"
```

If browsing: list directories in `.codevoyant/research/` (each directory is a research session) and ask which to review or extend.

Derive SLUG from TOPIC (lowercase, hyphenated). Set OUTPUT_PATH = `.codevoyant/research/{SLUG}.md`.

## Step 1: Scoping questions (mode-adaptive)

Based on MODES, ask targeted questions in a single AskUserQuestion call:

**If "Open-ended ideation" is selected:**
- "What space or user segment are you curious about?"
- "Any early hunches or hypotheses to stress-test, or fully open?"

**If "Feature/idea validation" is selected:**
- "What is the specific idea or hypothesis to validate?"
- "Who is the target user for this feature?"
- "What would make this validation successful?"

**If "Competitor deep-dive" is selected:**
- "Name the competitors to analyze (or 'all in [space]' for a landscape sweep)."
- "What dimensions matter most: pricing, features, positioning, or all?"

**If "User problem discovery" is selected:**
- "What job are users trying to get done? (describe the activity, not the tool)"
- "Which user segments should be prioritized?"

Then present a one-paragraph scope summary and confirm:

```
AskUserQuestion:
  question: "Does this capture what you want to research?"
  header: "Scope check"
  options:
    - label: "Yes — start research"
    - label: "Clarify scope (describe below)"
```

## Step 2: Launch parallel research agents

Tell the user: "Starting parallel research on '{TOPIC}' (modes: {MODES}) — this will take a few minutes."

Launch research agents in a **single message** (all run_in_background: true, model: claude-sonnet-4-6). See `agents/pm-researcher.md`.

**Always launch:**
- Internal prior art agent → `.codevoyant/research/{SLUG}/internal.md`

**Launch based on selected modes:**

| Mode | Agent task | Output path |
|------|-----------|-------------|
| Open-ended ideation | User complaints, unmet needs, market gaps, JTBD signals from forums/reviews/social | `{SLUG}/ideation.md` |
| Feature/idea validation | Market size, user evidence, existing solutions and gaps | `{SLUG}/market.md` |
| Feature/idea validation | Competitive landscape (direct/indirect/adjacent/substitute) | `{SLUG}/competitive.md` |
| Competitor deep-dive | Deep feature/positioning analysis for named competitors | `{SLUG}/competitors.md` |
| User problem discovery | JTBD research: jobs, pains, gains from real sources | `{SLUG}/user-problems.md` |

If multiple modes overlap (e.g., validation + competitor deep-dive), merge into a single agent for the overlapping dimension rather than duplicating.

Do not send agent calls across separate messages — all must be in one message to run in parallel.
Wait for all agents to complete before continuing.

## Step 3: Synthesize and write artifact

Read all sub-artifacts. Write a unified research summary to OUTPUT_PATH:

```markdown
# Research: {TOPIC}

**Modes:** {MODES}
**Date:** {DATE}

## Summary

{2–3 sentence synthesis of key findings — what do we now know that we didn't before?}

## Key Findings

{5–8 most important findings, each with:}
- **{Finding}** — {source} [Tier N] [High/Medium/Low confidence]

<!-- Include sections below only for active modes -->

## Problem Space / JTBD (ideation + user problem discovery modes)

{bullets — jobs users are trying to get done, pains, unmet needs — all web-sourced}

## Market Landscape (validation mode)

{bullets — market size, growth signals, existing solutions and gaps — all cited}

## Competitive Analysis (validation + competitor deep-dive modes)

{For each competitor:}
### {Competitor Name}
- **Category**: Direct / Indirect / Adjacent / Substitute
- **Target customer**: {who they serve}
- **Core claim**: {their positioning}
- **Strengths**: {evidence-based — Strong/Adequate/Weak/Absent on key dimensions}
- **Gaps**: {what they miss or do poorly}
- **Source**: {URL}

## Internal Context

{bullets — relevant prior work, plans, or PRDs in this repo}

## Gaps and Open Questions

{bullets — questions this research couldn't answer, listed by confidence tier}
  - [UNVERIFIED] {claims attempted but not sourced}

## Suggested Next Steps

- Use this research with `/pm:plan` to inform roadmap priorities
- Use this research with `/pm:prd {SLUG}` to draft a PRD
```

## Step 4: Notify

```bash
if [ "$SILENT" != "true" ]; then
  npx @codevoyant/agent-kit notify \
    --title "pm:explore complete" \
    --message "Research for '{TOPIC}' written to {OUTPUT_PATH}"
fi
```

Report: "Research artifact written to `{OUTPUT_PATH}`. Use `/pm:prd {SLUG}` or `/pm:plan` to continue."
