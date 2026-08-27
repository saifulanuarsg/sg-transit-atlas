# Singapore Transit Atlas
Interactive map of Singapore's bus + MRT/LRT network with catchment, POI and a modelled
target-audience impressions layer (LTA DataMall passenger volume × SingStat Census 2020).
Open-data, client-side, no backend. Live: https://saifulanuarsg.github.io/sg-transit-atlas/

## Repository layout

```
index.html                    the whole application — no build step
data/*.json                   network, stops, catchment and POI layers
tools/qc_poi.py               data invariants gate (run after any data/poi_*.json edit)
docs/user-stories.md          dated simulation runs, each story marked with its evidence
docs/access-setup.md          runbook for the Moove-only access gate (configured, not active)
infra/                        Cloudflare Access policy as code + its apply script
.specify/                     Spec Kit: constitution, templates, scripts
.claude/skills/speckit-*      Spec Kit workflow skills for Claude Code
specs/<NNN>-<short-name>/     one directory per feature: spec.md, plan.md, tasks.md
```

## Spec-driven development

This repository follows [GitHub Spec Kit](https://github.com/github/spec-kit). Behaviour
changes are specified before they are built.

| Step | Skill | Produces |
|------|-------|----------|
| 1 | `/speckit-constitution` | `.specify/memory/constitution.md` — the project's non-negotiables |
| 2 | `/speckit-specify` | `specs/<NNN>-<short-name>/spec.md` — what and why, no implementation |
| 3 | `/speckit-plan` | `plan.md` — how, including the Constitution Check gate |
| 4 | `/speckit-tasks` | `tasks.md` — ordered, actionable work |
| 5 | `/speckit-implement` | the change itself |

Optional: `/speckit-clarify` before planning, `/speckit-analyze` and `/speckit-checklist`
before implementing, `/speckit-converge` to turn a drifted codebase back into tasks.

Read [`.specify/memory/constitution.md`](.specify/memory/constitution.md) first — it is the
authority on what may and may not change here, and it is what the Constitution Check in
every `plan.md` is checked against.

To re-install or upgrade the toolkit:

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init --here --integration claude --script sh
```

## Local development

No build step. Serve the directory and open it:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

After **any** edit to `data/poi_*.json`:

```bash
python3 tools/qc_poi.py         # must exit clean before you commit
```

Deploys are GitHub Pages from `main` — merging a pull request is the deploy.
