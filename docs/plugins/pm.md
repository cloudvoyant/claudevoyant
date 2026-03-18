<script setup>
import { withBase } from 'vitepress'
</script>

<img :src="withBase('/icons/pm.svg')" width="64" height="64" style="margin-bottom: 1rem" />

# PM Plugin <Badge type="warning" text="Beta" />

Product management — product roadmaps, feature PRDs, prioritization review, and product docs.

The pm plugin structures product planning work: phased roadmaps with market context and feature prioritization, per-feature PRDs with acceptance criteria and metrics, coverage and feasibility review, and doc generation.

## Installation

**Claude Code:**
```bash
/plugin marketplace add cloudvoyant/codevoyant
/plugin install pm
```

**OpenCode / VS Code Copilot:** See the [installation guide](/user-guide#installation).

## Typical Workflows

### Plan a product roadmap

```bash
/pm:plan "mobile onboarding redesign"     # auto-invokes pm:breakdown per feature
```

Produces `roadmap.md` in `.codevoyant/pm/plans/{slug}/` with phased feature prioritization and failure mode analysis. `pm:review` launches automatically in the background.

### Write a PRD for a single feature

```bash
/pm:prd "user authentication"             # standalone PRD in prds/{slug}.md
```

### Break down features from a roadmap

```bash
/pm:breakdown {slug} "feature name"       # calls pm:prd; writes to prds/{feature}.md
```

### Review a roadmap

```bash
/pm:review {slug}                         # coverage, prioritization, PRD quality, strategy
/pm:review {slug} --bg
```

### Generate product docs

```bash
/pm:docs {slug}                           # writes docs/product/ from plan artifacts
```

## Skills

| Skill | Description |
|---|---|
| `pm:plan` | Product roadmap planning with feature prioritization and market context |
| `pm:breakdown` | Feature breakdown using pm:prd (one PRD per feature) |
| `pm:prd` | Structured PRD from a feature description or ticket |
| `pm:review` | Review a product roadmap for coverage, prioritization, and feasibility |
| `pm:docs` | Generate `docs/product/` from plan artifacts |
| `pm:help` | List all pm commands |

## Plan Artifacts

```
.codevoyant/pm/plans/{slug}/
├── roadmap.md          # phased product roadmap
├── prds/
│   └── {feature}.md    # per-feature PRD
├── review.md           # latest review report
└── research/           # analysis agents' findings
```
