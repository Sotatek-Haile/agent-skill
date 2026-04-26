---
name: lcp:bootstrap
description: >-
  Bootstrap Layered Context Protocol (LCP) for new projects from requirements + WBS.
  Auto-generates wiki, L1/L2 context files, and installs hook infrastructure.
  Use when starting a new project or onboarding AI into an existing codebase.
argument-hint: "<requirements-file> [wbs-file] [--be|--fe|--fullstack] [--with-spec-kit]"
metadata:
  author: hai.le
  version: "1.0.0"
---

# LCP Bootstrap

Automatically sets up the Layered Context Protocol for a new or existing project:
- Reads requirements + WBS → extracts domain, actors, features, tech stack, rules
- Generates L1/L2 context files + wiki docs
- Installs hook infrastructure (context-injector + settings)
- Optionally runs spec-kit to generate feature specs

## Usage

```
/lcp:bootstrap <requirements-file> [wbs-file] [--be|--fe|--fullstack] [--with-spec-kit]
```

**Arguments:**
- `requirements-file` — path to requirements file (md, pdf, docx, txt)
- `wbs-file` — (optional) path to WBS file (xlsx, md, csv)
- `--be` — backend-only project
- `--fe` — frontend-only project
- `--fullstack` — project with both BE + FE (default if not specified)
- `--with-spec-kit` — run spec-kit after LCP generation to create feature specs

**Examples:**
```
/lcp:bootstrap requirements.md --fullstack --with-spec-kit
/lcp:bootstrap docs/prd.pdf wbs.xlsx --be
/lcp:bootstrap requirements.md --fe
```

---

## Step 1: Read Input Files

Read the requirements file first:
- If `.pdf` or `.xlsx`: use the `ck:ai-multimodal` skill to extract content
- If `.md` / `.txt` / `.docx`: read directly with the Read tool

If a WBS file is provided, read it to extract: feature IDs, timeline, team structure.

If `--be/--fe/--fullstack` is not specified, auto-detect from requirements content:
- Mentions "API", "backend", "server", "database" → BE
- Mentions "UI", "frontend", "React", "Next.js", "web app", "mobile" → FE
- Both present → fullstack

---

## Step 2: Extract Project Information

Analyze requirements to extract:

**Project Identity:**
- Project name (from title or first header)
- Domain/industry (healthcare, fintech, logistics, ecommerce, etc.)
- Short description of what the system does and who it serves

**Actors:**
- List of actors/users (name, portal/app, permissions)

**Feature Map:**
- List features from WBS or requirements
- Organize by dependency (which features depend on which)
- Distinguish WRITE features from READ-ONLY features

**Tech Stack:**
- Backend: framework, DB, cache, queue
- Frontend: framework, UI library, state management
- Shared: type system, monorepo tool

**Cross-Feature Dependencies:**
- Shared entities/tables used by multiple features
- Shared services/validators
- Important data flows between features

**Critical Rules:**
- Infer from tech stack (see `references/l1-generation-guide.md`)
- Extract explicit constraints from requirements

---

## Step 3: Generate Wiki

### 3a. `wiki/global/project-overview.md` (from requirements + WBS)
- Full domain + business context description
- Actors and use cases in detail
- Feature descriptions (3-5 sentences per feature)
- Important business rules
- Data flows between features
- Glossary (domain-specific terminology)

Target: 300-600 lines.

### 3b. `wiki/global/architecture.md` (from existing codebase)

**Source reading — in priority order:**
1. If `wiki/global/architecture.md` already exists → read and use as base, enrich further
2. If `docs/system-architecture.md` or `docs/*.md` exists → extract information
3. Scan actual project directory structure (monorepo layout, package names, config files)
4. Read `package.json` / `tsconfig.json` / `docker-compose.yml` for stack and ports
5. Fall back to requirements if nothing else is available

**Content required:**
- Monorepo/directory structure (actual, not theoretical)
- Tech stack with specific versions
- Package dependency graph (which packages can import which)
- API contracts / type sharing strategy
- DB schema overview (main entities and relations)
- Auth flow
- Port mapping / deployment topology
- Design system / color palette (if FE)

Target: 500-1000 lines. This file is referenced directly by the constitution.

Both files = L3, not auto-injected — AI reads on demand.

---

## Step 4: Generate L1 Files

Read `references/l1-generation-guide.md` to understand the format.

Create `wiki/global/ai-context/L1-always/01-project-summary.md`:
- Project identity + domain (2-3 sentences)
- Monorepo structure (if applicable)
- Actors table
- Feature map with dependency graph
- Key cross-feature dependencies

Create `wiki/global/ai-context/L1-always/02-critical-rules.md`:
- Rules inferred from tech stack
- Only include rules where violations cause hard-to-debug bugs or conflicts
- Format: rule name + code example ✅/❌ + brief reason

Total limit: both files must not exceed 150 lines combined.

---

## Step 5: Generate L2 Files

Read `references/l2-generation-guide.md` to determine which domains to create.

Create L2 files appropriate for the project type:

**If BE:**
- `wiki/global/ai-context/L2-domain/backend.md`

**If FE:**
- `wiki/global/ai-context/L2-domain/frontend.md`

**If DB/ORM:**
- `wiki/global/ai-context/L2-domain/database.md`

**If design system / Tailwind:**
- `wiki/global/ai-context/L2-domain/style.md`

**If project has a specialized layer** (blockchain, queue, mobile...):
- Create the corresponding domain file

Limit per file: 100-150 lines.

---

## Step 6: Install Hook Infrastructure

Create directories if not present:
```
.claude/hooks/
wiki/global/ai-context/L1-always/
wiki/global/ai-context/L2-domain/
```

Copy template files:

**`.claude/hooks/context-injector.cjs`**
Read content from `references/templates/context-injector.cjs` and write to the project.

**`.claude/settings.json`**
If file exists: merge hook entry into the `hooks.UserPromptSubmit` array — do NOT overwrite the entire file.
If not present: copy from `references/templates/settings.json`.

---

## Step 7: Generate manifest.json

Create `.claude/manifest.json` with project-specific config:

```json
{
  "version": "1.0",
  "project": "{project-name-kebab-case}",
  "layers": {
    "L1": {
      "always": true,
      "files": [
        "wiki/global/ai-context/L1-always/01-project-summary.md",
        "wiki/global/ai-context/L1-always/02-critical-rules.md"
      ]
    },
    "L2": {
      "domains": {
        // Only include domains created in Step 5
        // Keywords based on the project's specific tech stack
      }
    },
    "L3": {
      "on_demand": true,
      "hint": "Full reference docs: wiki/global/architecture.md ({N} lines), wiki/global/project-overview.md ({N} lines)"
    }
  }
}
```

L2 keywords: use defaults from `references/l2-generation-guide.md` + add framework-specific keywords from the project's tech stack.

---

## Step 8: Configure spec-kit

### 8a. Initialize spec-kit

Run the spec-kit init script to scaffold the `.specify/` directory:
```bash
npx speckit init
# or if spec-kit is installed globally:
speckit init
```

This creates the default structure under `.specify/` with scripts that output specs to `specs/` at the repo root.

### 8b. Patch spec output directory → `wiki/specs/`

By default spec-kit outputs feature specs to `$REPO_ROOT/specs/`. Patch two scripts to redirect output to `wiki/specs/` so specs live alongside wiki docs:

**`.specify/scripts/bash/create-new-feature.sh`** — find and replace:
```bash
# BEFORE (default)
SPECS_DIR="$REPO_ROOT/specs"

# AFTER
SPECS_DIR="$REPO_ROOT/wiki/specs"
```

**`.specify/scripts/bash/common.sh`** — find and replace all occurrences:
```bash
# BEFORE (default)
local specs_dir="$repo_root/specs"
get_feature_dir() { echo "$1/specs/$2"; }

# AFTER
local specs_dir="$repo_root/wiki/specs"
get_feature_dir() { echo "$1/wiki/specs/$2"; }
```

After patching, create the directory:
```bash
mkdir -p wiki/specs
```

### 8c. Generate Constitution

Read `references/constitution-generation-guide.md` to understand the format.

Create `.specify/memory/constitution.md` with two categories of content:

**Project-specific** (extracted from requirements):
- Project name + domain references (wiki paths)
- Contract/types strategy (monorepo shared types vs OpenAPI vs tRPC)
- Database entity list per feature (placeholder if details unknown)
- Feature dependency graph
- Shared services / validation pipelines specific to the project

**Tech-stack-driven** (standard patterns per framework):
- Backend architecture (NestJS 3-layer, Express middleware, FastAPI routers...)
- Frontend architecture (Next.js App Router, React Query, form patterns...)
- Naming conventions
- What to create per feature checklist

Format the constitution per the guide structure. Target: 300-600 lines.

If the project uses the `--with-spec-kit` flag → after generation, also run:
```
/speckit.constitution   # validate & enrich the just-created constitution
```

---

## Step 9: Update .gitignore

Check the current `.gitignore`. If LCP patterns are absent, append:

```
# Claude Code — ignore personal files, track shared config
.claude/*
!.claude/settings.json
!.claude/hooks
!.claude/manifest.json
```

If an old `.claude` entry exists (e.g. `.claude/` or `.claude`), replace it with the new pattern.

---

## Step 10: Generate CLAUDE.md

Create or overwrite `CLAUDE.md` with the slim template:

```markdown
# Project: {Project Name}

## Context
Project context (business domain, critical rules, patterns) is auto-injected via LCP hooks:
- **L1** (always): project summary + critical rules → `wiki/global/ai-context/L1-always/`
- **L2** (by keyword): {list domains} → `wiki/global/ai-context/L2-domain/`
- **L3** (on-demand): full docs → `wiki/global/architecture.md`, `wiki/global/project-overview.md`

## Starting Development
Before writing any code:
1. Check if feature spec exists under `wiki/specs/{id}-{name}/` — if not, create one
2. Read the feature's `spec.md`, `plan.md`, and `tasks.md` if they exist
3. Confirm correct feature branch
4. Review existing entities/models to avoid duplication

## Tech Stack
{1-line per layer: Backend, Frontend, Shared, Package manager}

## Wiki
- `wiki/global/architecture.md` — full technical reference
- `wiki/global/project-overview.md` — domain & business flows
- `wiki/specs/{id}-{name}/` — per-feature specs
```

If `CLAUDE.md` already exists with important content: read it first, keep parts that don't overlap with LCP, then prepend the LCP context block.

---

## Step 11: Spec-Kit Init (if --with-spec-kit)

After LCP infrastructure is ready, activate spec-kit:

1. Activate `/speckit.constitution` to create the project constitution from requirements
2. For each feature in the WBS: activate `/speckit.specify` to create a feature spec

The user can skip this step and run spec-kit separately later.

---

## Step 12: Verification

Run the check:
```bash
echo '{"prompt":"test"}' | node .claude/hooks/context-injector.cjs
```

If output contains `## Injected Context` → LCP is working.
If error → debug and fix.

---

## Step 13: Summary Report

Print:

```
✅ LCP Bootstrap Complete — {project-name}
   Developed by hai.le

Infrastructure:
  .claude/hooks/context-injector.cjs       ← hook script
  .claude/settings.json                    ← hook registration
  .claude/manifest.json                    ← LCP config

Generated:
  wiki/global/project-overview.md          ← {N} lines (L3, from requirements)
  wiki/global/architecture.md              ← {N} lines (L3, from codebase)
  wiki/global/ai-context/L1-always/        ← 2 files ({N} lines total)
  wiki/global/ai-context/L2-domain/        ← {N} files ({domains})
  .specify/memory/constitution.md          ← {N} lines (spec-kit)
  .specify/scripts/bash/                  ← patched (specs → wiki/specs/)
  wiki/specs/                             ← spec output directory
  CLAUDE.md                                ← updated

Test result: {PASS/FAIL}

Next steps:
  1. Review generated files, adjust content if needed
  2. git add + commit: feat(ai-tooling): init LCP context protocol
  3. {If --with-spec-kit}: spec-kit initialized → see wiki/specs/
  4. Open a new Claude session to verify context injection
```

---

## References

- `references/l1-generation-guide.md` — format + rules for writing L1 files
- `references/l2-generation-guide.md` — domain selection + content guide
- `references/constitution-generation-guide.md` — structure + extraction guide for .specify/memory/constitution.md
- `references/templates/context-injector.cjs` — hook script template
- `references/templates/settings.json` — settings template
