<script setup>
import { withBase } from 'vitepress'
</script>

<img :src="withBase('/icons/em.svg')" width="64" height="64" style="margin-bottom: 1rem" />

# EM Plugin <Badge type="warning" text="Experimental" />

Engineering management — roadmap planning, epic breakdowns, team sync, and architecture design.

The em plugin gives AI agents structured workflows for planning engineering work: single-epic or multi-epic roadmaps with ASCII architecture diagrams, detailed task breakdowns with estimates, bidirectional sync with Linear/Notion/GitHub, and doc generation from plan artifacts.

## Installation

**Claude Code:**
```bash
/plugin marketplace add cloudvoyant/codevoyant
/plugin install em
```

**OpenCode / VS Code Copilot:** See the [installation guide](/user-guide#installation).

## Typical Workflows

### Plan a roadmap

```bash
/em:plan "migrate auth to OAuth2"         # single epic
/em:plan "Q3 infrastructure roadmap"      # multi-epic — auto-invokes em:breakdown per epic
```

Produces `roadmap.md` in `.codevoyant/em/plans/{slug}/` with ASCII architecture diagrams, data flows, failure modes, and task breakdowns. `em:review` launches automatically in the background on completion.

### Break down an epic manually

```bash
/em:breakdown {slug} "epic name"          # standalone; writes to breakdowns/{epic}.md
```

### Review a roadmap

```bash
/em:review {slug}                         # capacity, dependencies, risks, phasing
/em:review {slug} --bg                    # background — notifies when done
```

### Sync with your tracker

```bash
/em:sync {slug} --push                    # push roadmap to Linear/Notion/GitHub
/em:sync {slug} --pull                    # pull updates back into plan files
```

Detects your team's work style (epic-based, project-based, milestone-based) and tracker on first run; caches to `.codevoyant/em/team-config.json`.

### Generate planning docs

```bash
/em:docs {slug}                           # writes docs/planning/ from plan artifacts
```

## Skills

| Skill | Description |
|---|---|
| `em:plan` | Roadmap planning with architecture design and epic breakdowns |
| `em:breakdown` | Detailed task breakdown for an epic (sub-tasks, estimates, acceptance criteria) |
| `em:review` | Review a roadmap for capacity, dependencies, risks, and phasing |
| `em:sync` | Bidirectional sync with Linear, Notion, or GitHub |
| `em:docs` | Generate `docs/planning/` from plan artifacts |
| `em:allow` | Pre-approve em plugin permissions for uninterrupted agent execution |
| `em:help` | List all em commands |

## Plan Artifacts

```
.codevoyant/em/plans/{slug}/
├── roadmap.md          # high-level roadmap with ASCII diagrams
├── breakdowns/
│   └── {epic}.md       # per-epic task breakdown
├── review.md           # latest review report
└── research/           # analysis agents' findings
```
