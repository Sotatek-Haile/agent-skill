---
name: lcp
description: >-
  Bootstrap Layered Context Protocol (LCP) for new projects from requirements + WBS.
  Auto-generates wiki, L1/L2/L3 context files, installs hook infrastructure,
  scaffolds shared packages/contracts/ for all project types (fullstack/fe-only/be-only),
  and validates/updates existing LCP context against codebase drift.
  Use when starting a new project or onboarding AI into an existing codebase.
argument-hint: "[requirements-file] [wbs-file] [--be|--fe|--fullstack] [--with-spec-kit] [--validate]"
metadata:
  author: hai.le
  version: "2.0.0"
---

# LCP Bootstrap

Automatically sets up the Layered Context Protocol for a new or existing project:
- Reads requirements + WBS → extracts domain, actors, features, tech stack, shared packages, rules
- Generates L1/L2/L3 context files + wiki docs
- Installs hook infrastructure (context-injector + settings)
- Scaffolds `packages/contracts/` for all project types (fullstack scans BE code; fe-only creates example stub)
- Validates existing LCP context for drift and updates selectively
- Optionally runs spec-kit to generate feature specs

## Usage

```
/lcp [requirements-file] [wbs-file] [--be|--fe|--fullstack] [--with-spec-kit] [--validate]
```

**Arguments:**
- `requirements-file` — path to requirements file (md, pdf, docx, txt); optional in validate mode
- `wbs-file` — (optional) path to WBS file (xlsx, md, csv)
- `--be` — backend-only project
- `--fe` — frontend-only project
- `--fullstack` — project with both BE + FE (default if not specified)
- `--with-spec-kit` — run spec-kit after LCP generation to create feature specs
- `--validate` — validate existing LCP context against codebase, update selectively

**No arguments → interactive wizard** — skill asks questions step by step, no flags needed.

**Examples:**
```
/lcp                                     ← wizard mode (recommended)
/lcp requirements.md --fullstack --with-spec-kit
/lcp docs/prd.pdf wbs.xlsx --be
/lcp requirements.md --fe
/lcp --validate                          ← validate + selective update
```

---

## Mode Detection

*Runs before Step 1. Skipped if explicit flags are provided.*

If `/lcp` is invoked **without arguments**, you MUST ask the user questions before doing anything else — do NOT proceed without user answers.

**Prerequisite:** `AskUserQuestion` is a deferred tool. Before calling it, run:
```
ToolSearch({ query: "select:AskUserQuestion" })
```
Then use the loaded schema to call `AskUserQuestion`.

**Step 1 — Auto-detect from codebase, then call `AskUserQuestion` with Q1:**
- `.claude/hooks/` already exists → set default suggestion: Validate
- `backend/` + `frontend/` dirs present → default project type: fullstack
- Only `backend/` or `src/` without frontend → default: be-only
- Only `app/`, `pages/`, `components/` → default: fe-only

**Q1 call — `AskUserQuestion`:**
```
header: "LCP Bootstrap"
question: "What would you like to do?"
options:
  - label: "Bootstrap"       description: "Set up LCP for the first time"
  - label: "Validate"        description: "LCP already exists — check for context drift"
multiSelect: false
```

**Q2 call — `AskUserQuestion`:** *(only if Bootstrap selected in Q1)*
```
header: "Project Type"
question: "What type of project is this? (auto-detected: {detected})"
options:
  - label: "Fullstack"   description: "Has both backend + frontend"
  - label: "BE only"     description: "Backend only"
  - label: "FE only"     description: "Frontend only"
multiSelect: false
```

**Q3 call — `AskUserQuestion`:** *(only if Bootstrap selected in Q1)*
```
header: "Spec-kit"
question: "Run spec-kit after LCP generation to create feature specs?"
options:
  - label: "Yes"   description: "Generate feature specs after LCP setup"
  - label: "No"    description: "Skip spec-kit"
multiSelect: false
```

**Q4 call — `AskUserQuestion`:** *(only if Bootstrap selected in Q1)*
```
header: "Requirements File"
question: "Do you have a requirements document? (PRD, spec, .md / .pdf / .docx / .txt)"
options:
  - label: "Yes — I have a file"   description: "AI will read it to extract project context"
  - label: "No — auto-detect"      description: "AI will scan codebase, docs/, and package.json"
multiSelect: false
```

If "Yes": ask the user to type the file path → save as `requirements-file`.
If "No": proceed without requirements file (Step 1 falls back to codebase scan).

**Q5 call — `AskUserQuestion`:** *(only if Q4 = "Yes — I have a file")*
```
header: "WBS File"
question: "Do you have a WBS file? (feature list, timeline — .xlsx / .md / .csv)"
options:
  - label: "Yes — I have a WBS file"   description: "AI will extract feature IDs and timeline"
  - label: "No"                         description: "Skip WBS, features inferred from requirements"
multiSelect: false
```

If "Yes": ask the user to type the WBS file path → save as `wbs-file`.
If "No": skip.

After all answers collected → proceed with Bootstrap (Steps 1–13) or Validate (Step Validate).

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

**Shared Packages (if monorepo):**
- Does a `packages/` directory exist? List all `packages/*/package.json` names.
- Dependency isolation rules: which package can import which?
- Contract strategy: JSON Schema / OpenAPI / tRPC / GraphQL?
- ABI files: does the project have blockchain smart contracts? (→ `packages/contracts/abi/`)

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
5. Scan `packages/*/package.json` to list all shared packages, their names, and roles
6. Fall back to requirements if nothing else is available

**Content required:**
- Monorepo/directory structure (actual, not theoretical) — include `packages/` entries
- Tech stack with specific versions
- Package dependency graph (which packages can import which) — **include isolation table**
- API contracts / type sharing strategy (`packages/contracts/api/` structure if present)
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
- Monorepo structure (if applicable) — **include packages/ entries**
- Actors table
- Feature map with dependency graph
- Key cross-feature dependencies

Create `wiki/global/ai-context/L1-always/02-critical-rules.md`:
- Rules inferred from tech stack
- **Dependency isolation table** (if monorepo with multiple packages)
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

**If fullstack monorepo with shared packages:**
- `wiki/global/ai-context/L2-domain/contracts.md`

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

**`.claude/hooks/context-injector.cjs`**
Read from `references/templates/context-injector.cjs` and write to project.

**`.claude/settings.json`**
If exists: merge hook entry into `hooks.UserPromptSubmit` — do NOT overwrite entire file.
If not present: copy from `references/templates/settings.json`.

---

## Step 6.5: Scaffold packages/contracts/

**Trigger:** `packages/contracts/` does NOT already exist.

*Always scaffold regardless of project type — spec-kit and AI read this directory to stay aligned with API shapes without consuming extra context.*

Read `references/contracts-scaffold-guide.md` for JSON Schema conventions and BE scan rules.

### Case A — FE-only

AI cannot scan BE code yet. Create minimal scaffold with 1 example:

**`packages/contracts/api/example.json`**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Example API Contract",
  "_comment": "Replace with actual BE API response shapes. AI reads this directory when coding FE features.",
  "definitions": {
    "ExampleResponse": {
      "type": "object",
      "properties": {
        "id":        { "type": "number" },
        "name":      { "type": "string" },
        "createdAt": { "type": "string", "format": "date-time" }
      },
      "required": ["id", "name"]
    },
    "ExampleListResponse": {
      "type": "object",
      "properties": {
        "items": { "type": "array", "items": { "$ref": "#/definitions/ExampleResponse" } },
        "total": { "type": "number" }
      }
    }
  }
}
```

**`packages/contracts/index.json`** — from `references/templates/contracts-index.json.tpl`
Replace `{project-name}`. Leave `modules` empty — developer fills in as BE API is documented.

### Case B — Fullstack (BE code exists)

Scan BE source to generate real contracts:

1. **Scan `backend/src/**/*.dto.ts`** → extract class fields + `@IsOptional()` markers → JSON Schema properties
2. **Scan `backend/src/**/*.controller.ts`** → extract route groups → determine feature slugs
3. **Scan `backend/src/database/entities/**/*.ts`** → extract entity fields → response shapes
4. **Group by feature** — match controller folder names to WBS feature IDs
5. For each feature → create `packages/contracts/api/{feature-slug}.json` from `references/templates/contracts-api-feature.json.tpl`

Always create:
- **`packages/contracts/api/common.json`** — from `references/templates/contracts-api-common.json.tpl`
- **`packages/contracts/api/enums.json`** — scan BE enum files → from `references/templates/contracts-api-enums.json.tpl`
- **`packages/contracts/index.json`** — from `references/templates/contracts-index.json.tpl`, list all generated feature files in `modules`

### Case C — BE-only

Create stub for future FE:
- **`packages/contracts/api/common.json`** — from `references/templates/contracts-api-common.json.tpl`
- **`packages/contracts/index.json`** — from `references/templates/contracts-index.json.tpl`
  Add `"_comment": "Frontend will import this package when added to the project"` in root object.

**Update workspace root `package.json`:**
If `packages/contracts` is not listed in `workspaces`, add it.

**If `packages/contracts/` already exists:** skip scaffold entirely.

---

## Step 6.6: Generate L3 Index

Read `references/l3-index-guide.md` for format details and scan rules.

Scan `wiki/` recursively — collect all `.md` files with paths and line counts.
Create `wiki/global/ai-context/L3-reference/L3-index.md`:

```markdown
# L3 Reference Index
<!-- auto-generated by lcp — run with --validate to refresh -->
<!-- updated: {ISO-date} -->

## global
- [architecture.md](../../architecture.md) — Full technical reference ({N} lines)
- [project-overview.md](../../project-overview.md) — Domain & business flows ({N} lines)

## specs
- [001-{feature}/spec.md](../../../specs/001-{feature}/spec.md)
...
```

Update `manifest.json` L3 section: add `"index": "wiki/global/ai-context/L3-reference/L3-index.md"`.

---

## Step 7: Generate manifest.json

Create `.claude/manifest.json`:

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
      }
    },
    "L3": {
      "on_demand": true,
      "index": "wiki/global/ai-context/L3-reference/L3-index.md",
      "hint": "Full reference docs indexed at: wiki/global/ai-context/L3-reference/L3-index.md"
    }
  }
}
```

L2 keywords: use defaults from `references/l2-generation-guide.md` + framework-specific keywords.

---

## Step 8: Configure spec-kit

### 8a. Initialize

```bash
npx speckit init
```

### 8b. Patch spec output → `wiki/specs/`

**`.specify/scripts/bash/create-new-feature.sh`:**
```bash
SPECS_DIR="$REPO_ROOT/specs"   →   SPECS_DIR="$REPO_ROOT/wiki/specs"
```

**`.specify/scripts/bash/common.sh`:**
```bash
local specs_dir="$repo_root/specs"              →   local specs_dir="$repo_root/wiki/specs"
get_feature_dir() { echo "$1/specs/$2"; }        →   get_feature_dir() { echo "$1/wiki/specs/$2"; }
```

```bash
mkdir -p wiki/specs
```

### 8c. Generate Constitution

Read `references/constitution-generation-guide.md`.

Create `.specify/memory/constitution.md` — project-specific + tech-stack patterns.
Reference: `packages/contracts/api/` JSON Schema files are source of truth for API shapes.

Target: 300-600 lines. If `--with-spec-kit` → also run `/speckit.constitution`.

---

## Step 9: Update .gitignore

Append if LCP patterns absent:
```
# Claude Code — ignore personal files, track shared config
.claude/*
!.claude/settings.json
!.claude/hooks
!.claude/manifest.json
```

---

## Step 10: Generate CLAUDE.md

Create or update `CLAUDE.md`:

```markdown
# Project: {Project Name}

## Context
Project context is auto-injected via LCP hooks:
- **L1** (always): project summary + critical rules → `wiki/global/ai-context/L1-always/`
- **L2** (by keyword): {domains} → `wiki/global/ai-context/L2-domain/`
- **L3** (on-demand): see `wiki/global/ai-context/L3-reference/L3-index.md`

## Starting Development
1. Check feature spec under `wiki/specs/{id}-{name}/`
2. Read `spec.md`, `plan.md`, `tasks.md` if they exist
3. API contract shapes are in `packages/contracts/api/{feature}.json` — do NOT redefine elsewhere
4. Confirm correct feature branch
5. Review existing entities to avoid duplication

## Tech Stack
{1-line per layer}

## Wiki
- `wiki/global/architecture.md` — full technical reference
- `wiki/global/project-overview.md` — domain & business flows
- `wiki/global/ai-context/L3-reference/L3-index.md` — index of all reference docs
- `wiki/specs/{id}-{name}/` — per-feature specs
```

---

## Step 11: Spec-Kit Init (if --with-spec-kit)

1. Activate `/speckit.constitution`
2. For each WBS feature: activate `/speckit.specify`

---

## Step 12: Verification

```bash
echo '{"prompt":"test"}' | node .claude/hooks/context-injector.cjs
```

`## Injected Context` in output → LCP is working.

---

## Step Validate: Context Validation & Selective Update

*Runs when: `--validate` flag OR wizard selects validate mode.*
*Replaces Steps 1–12 — independent flow.*

### V1: Scan Codebase State

Read:
- `packages/*/package.json` — all package names
- Directory scan: `backend/`, `frontend/`, `packages/`
- `wiki/global/ai-context/L1-always/*.md` — existing L1 files
- `wiki/global/ai-context/L2-domain/*.md` — existing L2 files
- `wiki/global/ai-context/L3-reference/L3-index.md` — existing L3 index (if present)
- `wiki/` — all `.md` files recursively (for L3 diff)

### V2: Compare Against Existing Context

Read `references/validate-guide.md` for per-layer comparison logic.

**L1 drift:** new packages not in structure table? new features not in feature map? isolation rules stale?
**L2 drift:** port numbers changed? major dep versions changed? new layers without L2 file?
**L3 drift:** new wiki files not indexed? dead links in L3-index?

### V3: Report Stale Items

```
Context drift detected — {N} items:

[1] L1/01-project-summary.md  — new package "@{project}/notifications" not in structure table
[2] L2/backend.md             — config shows port 7000, L2 mentions 6600
[3] L3-index.md               — 2 wiki files not indexed

No drift: L2/frontend.md, L2/database.md, L1/02-critical-rules.md
```

If nothing stale → `✅ All LCP context files are up to date.` → exit.

### V4: Selective Update Prompt

```
Select items to update (e.g.: 1,3 | all | none):
```

`none` → exit without changes.

### V5: Apply Selected Updates

For each selected item:
- L1 file → re-run Step 4 logic for that file only
- L2 file → re-run Step 5 logic for that domain only
- L3 index → re-run Step 6.6 (rescan `wiki/`, rebuild index)

**Principle:** update minimum required content — preserve developer customizations in unchanged sections.

---

## Step 13: Summary Report

```
✅ LCP Bootstrap Complete — {project-name}

Infrastructure:
  .claude/hooks/context-injector.cjs
  .claude/settings.json
  .claude/manifest.json

Generated:
  wiki/global/project-overview.md          ← {N} lines
  wiki/global/architecture.md              ← {N} lines
  wiki/global/ai-context/L1-always/        ← 2 files
  wiki/global/ai-context/L2-domain/        ← {N} files ({domains})
  wiki/global/ai-context/L3-reference/L3-index.md  ← {N} entries indexed
  .specify/memory/constitution.md          ← {N} lines
  CLAUDE.md                                ← updated

packages/contracts/ ({case: fullstack|fe-only|be-only}):
  packages/contracts/index.json
  packages/contracts/api/common.json
  packages/contracts/api/enums.json        ← fullstack/be-only only
  packages/contracts/api/{feature}.json   ← {N} contracts (fullstack only)

Test result: {PASS/FAIL}

Next steps:
  1. Review generated files
  2. git add + commit: feat(ai-tooling): init LCP context protocol
  3. Open new Claude session to verify context injection
  4. Run `/lcp --validate` periodically to keep context fresh
```

---

## References

- `references/l1-generation-guide.md` — format + rules for L1 files
- `references/l2-generation-guide.md` — domain selection + content guide
- `references/l3-index-guide.md` — L3 index format + scan rules
- `references/validate-guide.md` — drift detection logic per layer
- `references/contracts-scaffold-guide.md` — BE scan rules + JSON Schema patterns
- `references/constitution-generation-guide.md` — .specify/memory/constitution.md structure
- `references/templates/context-injector.cjs` — hook script template
- `references/templates/settings.json` — settings template
- `references/templates/contracts-index.json.tpl` — packages/contracts/index.json
- `references/templates/contracts-api-common.json.tpl` — ApiResponse, PageMeta JSON Schema
- `references/templates/contracts-api-enums.json.tpl` — shared enums
- `references/templates/contracts-api-feature.json.tpl` — per-feature contract stub
