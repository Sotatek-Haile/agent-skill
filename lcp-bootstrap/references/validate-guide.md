# Validate Guide — LCP Context Drift Detection

Used by Step Validate (V1–V5) in SKILL.md.

## L1 Drift Detection

### 01-project-summary.md

Compare against:
- `packages/*/package.json` names → check if all packages appear in "Monorepo Structure" section
- `wiki/global/project-overview.md` actor list → check if all actors appear in L1 actors table
- `wiki/specs/` directory → check if all feature IDs are reflected in L1 feature map

Flag as stale if:
- A package exists in filesystem but not in L1 structure table
- A feature directory exists in `wiki/specs/` but not in L1 feature map
- An actor appears in project-overview but not in L1 table

### 02-critical-rules.md

Compare against:
- Root `package.json` or `backend/package.json` → detect framework and version
- `packages/*/package.json` → current package list for isolation table

Flag as stale if:
- New package added but not in isolation table
- Framework major version changed (e.g., NestJS 10 → 11)

---

## L2 Drift Detection

### backend.md

Compare against:
- `backend/package.json` or root `package.json` → framework, ORM, DB versions
- `docker-compose.yml`, `.env.example`, `backend/src/configs/` → port numbers
- `backend/src/` structure → new architectural patterns

Flag as stale if:
- Port number in L2 differs from config files
- Major dependency version changed

### frontend.md

Compare against:
- `frontend/package.json` or `apps/*/package.json` → framework versions
- `next.config.js` / `vite.config.js` → proxy settings and ports
- `lib/axios.ts`, `middleware.ts` → cookie key names, base URL patterns

Flag as stale if:
- Cookie key names changed
- Framework major version changed
- Proxy port differs from L2 mention

### database.md

Compare against:
- `backend/src/database/entities/` → count entity files, check for new entities
- Migration directory → count new migration files since last bootstrap

Flag as stale if:
- New entity files exist not mentioned in L2
- More than 3 new migration files since last bootstrap date (check L2 `_updated` field)

### contracts.md

Compare against:
- `packages/contracts/api/` → list of JSON files
- `packages/contracts/index.json` → registered modules

Flag as stale if:
- New contract files exist not mentioned in L2
- Package name changed in `packages/contracts/package.json`

### style.md

Compare against:
- `tailwind.config.js` / `tailwind.config.ts` → color palette, font config
- `frontend/commons/src/` → new shared components

Flag as stale if:
- New color tokens added to tailwind config not reflected in L2
- Major design system version change

---

## L3 Index Drift Detection

### L3-index.md

Compare against:
- Recursive scan of `wiki/` → all `.md` files with full paths
- Current entries in L3-index.md

Report two categories:
- **Not indexed:** files in `wiki/` but NOT in L3-index → add these
- **Dead links:** entries in L3-index pointing to non-existent files → remove these

---

## Update Strategy

When user selects an item to update in V5:

| Item | Action |
|---|---|
| `L1/01-project-summary.md` | Re-read packages + wiki/specs/ → regenerate structure table + feature map section only |
| `L1/02-critical-rules.md` | Re-check framework + packages → regenerate isolation table + rules section only |
| `L2/{domain}.md` | Re-read relevant config files → update changed sections, preserve custom additions |
| `L3-index.md` | Re-scan `wiki/` → rebuild full index (fast, structural operation) |

**Principle:** Never regenerate an entire file if only one section changed. Identify the stale section, update it, preserve the rest. Developer customizations (added notes, custom rules) must survive a validate run.

---

## Reading Existing Context Files

Before comparing, always read the existing context file to understand its current content:
- Extract the `_updated` date comment if present (helps judge recency)
- Note any custom sections the developer added that are NOT auto-generated
- Preserve those custom sections during selective update

## Edge Cases

| Situation | Handling |
|---|---|
| No L3-index exists yet | Treat as "L3-index.md not indexed" — offer to create |
| `wiki/` directory doesn't exist | Report: "No wiki directory found — run bootstrap first" |
| L2 file for a domain exists but domain no longer applies | Flag as stale: "L2/blockchain.md exists but no blockchain packages found" |
| `packages/contracts/` doesn't exist | Flag in L1 check only if L1 mentions it — suggest running Step 6.5 |
