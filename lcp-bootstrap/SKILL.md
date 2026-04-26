---
name: lcp:bootstrap
description: >-
  Bootstrap Layered Context Protocol (LCP) cho project mới từ requirements + WBS.
  Tự động generate wiki, L1/L2 context files, cài hook infrastructure.
  Dùng khi bắt đầu project mới hoặc onboard AI vào project hiện có.
argument-hint: "<requirements-file> [wbs-file] [--be|--fe|--fullstack] [--with-spec-kit]"
metadata:
  author: team
  version: "1.0.0"
---

# LCP Bootstrap

Tự động thiết lập Layered Context Protocol cho project mới:
- Đọc requirements + WBS → extract domain, actors, features, tech stack, rules
- Generate L1/L2 context files + wiki
- Cài hook infrastructure (context-injector + settings)
- Optionally chạy spec-kit để generate feature specs

## Usage

```
/lcp:bootstrap <requirements-file> [wbs-file] [--be|--fe|--fullstack] [--with-spec-kit]
```

**Arguments:**
- `requirements-file` — đường dẫn tới file requirements (md, pdf, docx, txt)
- `wbs-file` — (optional) đường dẫn tới WBS file (xlsx, md, csv)
- `--be` — project chỉ có backend
- `--fe` — project chỉ có frontend
- `--fullstack` — project có cả BE + FE (default nếu không chỉ định)
- `--with-spec-kit` — chạy spec-kit sau khi generate LCP để tạo feature specs

**Examples:**
```
/lcp:bootstrap requirements.md --fullstack --with-spec-kit
/lcp:bootstrap docs/prd.pdf wbs.xlsx --be
/lcp:bootstrap requirements.md --fe
```

---

## Bước 1: Đọc Input Files

Đọc requirements file trước:
- Nếu file là `.pdf` hoặc `.xlsx`: dùng `ck:ai-multimodal` skill để extract nội dung
- Nếu là `.md` / `.txt` / `.docx`: đọc trực tiếp bằng Read tool

Nếu có WBS file, đọc thêm để lấy: danh sách feature IDs, timeline, team structure.

Nếu chưa có `--be/--fe/--fullstack`, auto-detect từ nội dung requirements:
- Có mention "API", "backend", "server", "database" → BE
- Có mention "UI", "frontend", "React", "Next.js", "web app", "mobile" → FE
- Có cả hai → fullstack

---

## Bước 2: Extract Project Information

Phân tích requirements để extract:

**Project Identity:**
- Tên project (từ title hoặc header đầu tiên)
- Domain/industry (healthcare, fintech, logistics, ecommerce, etc.)
- Mô tả ngắn hệ thống làm gì, cho ai

**Actors:**
- Danh sách actors/users (tên, portal/app, quyền hạn)

**Feature Map:**
- List features từ WBS hoặc requirements
- Tổ chức theo dependency (feature nào cần feature nào trước)
- Phân biệt WRITE features vs READ-ONLY features

**Tech Stack:**
- Backend: framework, DB, cache, queue
- Frontend: framework, UI library, state management
- Shared: type system, monorepo tool

**Cross-Feature Dependencies:**
- Shared entities/tables dùng bởi nhiều features
- Shared services/validators
- Data flow quan trọng giữa các features

**Critical Rules:**
- Suy luận từ tech stack (xem `references/l1-generation-guide.md`)
- Extract từ requirements nếu có constraint rõ ràng

---

## Bước 3: Generate Wiki

Tạo `wiki/global/project-overview.md`:
- Mô tả đầy đủ domain + business context
- Actors và use cases chi tiết
- Feature descriptions (mỗi feature 3-5 câu)
- Business rules quan trọng
- Data flow giữa các features
- Glossary (thuật ngữ domain-specific)

File này = L3, không inject tự động, AI đọc khi cần.
Target: 300-600 dòng.

---

## Bước 4: Generate L1 Files

Đọc `references/l1-generation-guide.md` để hiểu format.

Tạo `wiki/global/ai-context/L1-always/01-project-summary.md`:
- Project identity + domain (2-3 câu)
- Monorepo structure (nếu có)
- Actors table
- Feature map với dependency graph
- Key cross-feature dependencies

Tạo `wiki/global/ai-context/L1-always/02-critical-rules.md`:
- Suy luận rules từ tech stack
- Chỉ include rules mà vi phạm gây bug/conflict khó debug
- Format: tên rule + code example ✅/❌ + lý do ngắn

Giới hạn tổng: 2 file không quá 150 dòng.

---

## Bước 5: Generate L2 Files

Đọc `references/l2-generation-guide.md` để hiểu domain nào cần tạo.

Tạo L2 files phù hợp với project type:

**Nếu có BE:**
- `wiki/global/ai-context/L2-domain/backend.md`

**Nếu có FE:**
- `wiki/global/ai-context/L2-domain/frontend.md`

**Nếu có DB/ORM:**
- `wiki/global/ai-context/L2-domain/database.md`

**Nếu có design system / Tailwind:**
- `wiki/global/ai-context/L2-domain/style.md`

**Nếu project có layer đặc thù** (blockchain, queue, mobile...):
- Tạo thêm domain tương ứng

Giới hạn mỗi file: 100-150 dòng.

---

## Bước 6: Cài Hook Infrastructure

Tạo thư mục nếu chưa có:
```
.claude/hooks/
wiki/global/ai-context/L1-always/
wiki/global/ai-context/L2-domain/
```

Copy template files:

**`.claude/hooks/context-injector.cjs`**
Đọc nội dung từ `references/templates/context-injector.cjs` và write vào project.

**`.claude/settings.json`**
Nếu file đã tồn tại: merge hook entry vào `hooks.UserPromptSubmit` array, KHÔNG overwrite toàn bộ.
Nếu chưa tồn tại: copy từ `references/templates/settings.json`.

---

## Bước 7: Generate manifest.json

Tạo `.claude/manifest.json` với project-specific config:

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
        // Chỉ include domains đã tạo ở Bước 5
        // Keywords dựa theo tech stack cụ thể của project
      }
    },
    "L3": {
      "on_demand": true,
      "hint": "Full reference docs: wiki/global/project-overview.md ({N} lines)"
    }
  }
}
```

Keywords trong L2: dùng defaults từ `references/l2-generation-guide.md` + thêm framework-specific keywords từ tech stack của project.

---

## Bước 8: Generate Constitution (spec-kit)

Đọc `references/constitution-generation-guide.md` để hiểu format.

Tạo thư mục và file:
```
.specify/memory/constitution.md
```

Constitution có 2 loại nội dung:

**Project-specific** (extract từ requirements):
- Project name + domain references (wiki paths)
- Contract/types strategy (monorepo shared types vs OpenAPI vs tRPC)
- Database entity list theo feature (placeholder nếu chưa biết chi tiết)
- Feature dependency graph
- Shared services / validation pipelines đặc thù của project

**Tech-stack-driven** (pattern chuẩn theo framework):
- Backend architecture (NestJS 3-layer, Express middleware, FastAPI routers...)
- Frontend architecture (Next.js App Router, React Query, form patterns...)
- Naming conventions
- What to create per feature checklist

Format constitution theo structure trong guide. Target: 300-600 dòng.

Nếu project dùng `--with-spec-kit` flag → sau khi generate xong, chạy thêm:
```
/speckit.constitution   # validate & enrich constitution vừa tạo
```

---

## Bước 9: Update .gitignore

Kiểm tra `.gitignore` hiện tại. Nếu chưa có LCP patterns, append:

```
# Claude Code — ignore personal files, track shared config
.claude/*
!.claude/settings.json
!.claude/hooks
!.claude/manifest.json
```

Nếu đã có `.claude` entry cũ (kiểu `.claude/` hoặc `.claude`), replace bằng pattern mới.

---

## Bước 10: Generate CLAUDE.md

Tạo hoặc overwrite `CLAUDE.md` với template slim:

```markdown
# Project: {Project Name}

## Context
Project context (business domain, critical rules, patterns) is auto-injected via LCP hooks:
- **L1** (always): project summary + critical rules → `wiki/global/ai-context/L1-always/`
- **L2** (by keyword): {list domains} → `wiki/global/ai-context/L2-domain/`
- **L3** (on-demand): full docs → `wiki/global/project-overview.md`

## Starting Development
Before writing any code:
1. Check if feature spec exists under `wiki/specs/{id}-{name}/` — if not, create one
2. Read the feature's `spec.md`, `plan.md`, and `tasks.md` if they exist
3. Confirm correct feature branch
4. Review existing entities/models to avoid duplication

## Tech Stack
{1-line per layer: Backend, Frontend, Shared, Package manager}

## Wiki
- `wiki/global/project-overview.md` — domain & business flows
- `wiki/specs/{id}-{name}/` — per-feature specs
```

Nếu `CLAUDE.md` đã tồn tại với content quan trọng: đọc trước, giữ lại phần không trùng với LCP, thêm LCP context block vào đầu.

---

## Bước 11: Spec-Kit Init (nếu --with-spec-kit)

Sau khi LCP infrastructure xong, kích hoạt spec-kit:

1. Activate `/speckit.constitution` để tạo project constitution từ requirements
2. Với mỗi feature trong WBS: activate `/speckit.specify` để tạo feature spec

User có thể bỏ qua bước này và chạy spec-kit riêng sau.

---

## Bước 12: Verification

Chạy kiểm tra:
```bash
echo '{"prompt":"test"}' | node .claude/hooks/context-injector.cjs
```

Nếu output có `## Injected Context` → LCP hoạt động.
Nếu lỗi → debug và fix.

---

## Bước 13: Summary Report

In ra:

```
✅ LCP Bootstrap Complete — {project-name}

Infrastructure:
  .claude/hooks/context-injector.cjs       ← hook script
  .claude/settings.json                    ← hook registration
  .claude/manifest.json                    ← LCP config

Generated:
  wiki/global/project-overview.md          ← {N} lines (L3)
  wiki/global/ai-context/L1-always/        ← 2 files ({N} lines total)
  wiki/global/ai-context/L2-domain/        ← {N} files ({domains})
  .specify/memory/constitution.md          ← {N} lines (spec-kit)
  CLAUDE.md                                ← updated

Test result: {PASS/FAIL}

Next steps:
  1. Review generated files, adjust content nếu cần
  2. git add + commit: feat(ai-tooling): init LCP context protocol
  3. {Nếu --with-spec-kit}: spec-kit đã init → xem wiki/specs/
  4. Mở Claude session mới để verify context injection
```

---

## References

- `references/l1-generation-guide.md` — format + rules khi viết L1 files
- `references/l2-generation-guide.md` — domain selection + content guide
- `references/constitution-generation-guide.md` — structure + extraction guide cho .specify/memory/constitution.md
- `references/templates/context-injector.cjs` — hook script template
- `references/templates/settings.json` — settings template
