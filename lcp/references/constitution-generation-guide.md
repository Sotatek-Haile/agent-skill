# Constitution Generation Guide

`.specify/memory/constitution.md` = single source of truth cho spec-kit.
Mọi `/speckit.*` command đọc file này trước khi generate spec/plan/tasks.

Khác với L1 (AI context chung), constitution chứa:
- Chi tiết đầy đủ về implementation patterns
- Danh sách entities/models hiện có
- Shared services & cách dùng
- Checklist tạo feature mới
- Feature dependency graph chi tiết

---

## Structure Template

```markdown
# {Project Name} Constitution

This constitution is the **single source of truth** for all coding rules, architecture, and conventions.
Every spec-kit command (`/speckit.specify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement`) **MUST** comply with these principles.

High-level domain context & business flows: `wiki/global/project-overview.md`
Technical architecture details: `wiki/global/architecture.md`

## Core Principles

### I. {Data/API Contract Strategy}
{Mô tả cách types/contracts được định nghĩa và chia sẻ giữa BE/FE}

**If monorepo with shared types package:**
- Package: `@{project}/contracts` at `packages/contracts/`
- Import pattern: `import { CreateXRequest, XResponse } from '@{project}/contracts'`
- Structure: `packages/contracts/api/{feature}.ts` per feature, `packages/contracts/index.ts` barrel
- Common types: `packages/contracts/api/common.ts` (ApiResponse<T>, PageMeta, ...)
- Enums: `packages/contracts/api/enums.ts`
- ABI (if blockchain): `packages/contracts/abi/`
- Rule: BE và FE KHÔNG tự tạo types riêng — mọi API contract đi qua package này
- Rule: package là standalone — KHÔNG import package khác trong monorepo
- When adding a new feature: create `packages/contracts/api/{feature}.ts` + re-export in `index.ts`

**If separate repos (OpenAPI / tRPC / GraphQL):**
- {mô tả cách generate và consume schema}

### II. Database — Already Created (use existing, update if needed)
{Liệt kê tất cả entities/models theo feature}
- {Feature 001}: {table1}, {table2}
- {Feature 002}: {table3}, {table4}

### III. Shared Infrastructure (USE, DO NOT recreate)
{Liệt kê shared services, validators, utilities đã có}
- {ServiceName}: location, mục đích, cách dùng
- {Middleware}: location, khi nào dùng

### IV. Error Codes & Enums — Already Centralized
{Đường dẫn file error codes và enums}
{Convention thêm mới (chỉ append, không xóa)}

### V. Dependency Isolation
| Package | Can import | CANNOT import |
|---|---|---|
| `@{pkg}/contracts` | (standalone) | All other packages |
| `@{pkg}/backend` | `@{pkg}/contracts` | FE packages, `@{pkg}/commons` |
| FE apps | `@{pkg}/contracts`, `@{pkg}/commons` | Backend, other FE apps |
| `@{pkg}/commons` | (standalone) | All other packages |

### VI. Backend Architecture ({Framework})
{3-5 điểm architecture quan trọng nhất}
- Layer structure
- Module/DI pattern
- Response convention
- Auth pattern
- Env var validation

### VII. Frontend Architecture ({Framework})
{3-5 điểm architecture quan trọng nhất}
- Component source (shared library vs app-local)
- State management pattern
- API call pattern
- Form pattern
- Styling convention

### VIII. Naming Conventions
{File, class, function, DB table, column, API endpoint conventions}

## What You Need to Create per Feature

### Backend
{Numbered checklist các file/class cần tạo cho mỗi feature}

### Frontend
{Numbered checklist các file/component cần tạo}

### Contracts (if monorepo)
1. Create `packages/contracts/api/{feature-slug}.ts` with request/response interfaces
2. Re-export in `packages/contracts/index.ts`
3. Import in BE service and FE API layer from `@{project}/contracts`

### Already exists (use & update, do NOT recreate)
{Liệt kê những gì đã có, dev chỉ cần update}

### Post-generation (REQUIRED after every /speckit.specify)

After creating `wiki/specs/{id}-{name}/spec.md`, you MUST:

1. **Update L3 index** — append the new spec entry to `wiki/global/ai-context/L3-reference/L3-index.md`:
   ```
   - [spec.md](../../../specs/{id}-{name}/spec.md) — {feature title} ({N} lines)
   ```

2. **Sync project-overview.md** — read the new spec, then check `wiki/global/project-overview.md`:
   - New feature not described → add feature description to the Features section
   - New actor not listed → add actor to the Actors section
   - New business rule → add to Business Rules section
   - If nothing new → skip (do not rewrite existing content)

## Feature Dependency Graph

```
{Feature map dạng ASCII tree, tương tự L1 nhưng chi tiết hơn}
```

{Cross-feature dependencies prose}

## Governance

This constitution is automatically injected into every spec-kit command.
Any amendment requires updating:
1. `.specify/memory/constitution.md` (this file)
2. `wiki/global/project-overview.md`
3. `wiki/global/architecture.md`
4. `CLAUDE.md`

**Version**: 1.0.0 | **Ratified**: {date}
```

---

## Phân biệt Constitution vs L1

| Khía cạnh | L1 (AI context) | Constitution (spec-kit) |
|---|---|---|
| Inject khi | Mọi prompt | Chỉ /speckit.* commands |
| Token budget | ~300 tokens | Không giới hạn (~500-800 dòng) |
| Nội dung | Summary + critical rules | Full implementation guide |
| Entities | Cross-feature dependencies | Toàn bộ entity list |
| Examples | Code snippets ngắn | Full usage patterns |
| Audience | AI coding assistant | AI spec/plan/tasks generator |

---

## Extraction từ Requirements

Khi generate constitution từ requirements + WBS:

**Section I — Contract Strategy:**
- Nếu monorepo + `packages/contracts/` đã tồn tại → document cấu trúc hiện có
- Nếu monorepo + `packages/contracts/` chưa có → skill đã tạo scaffold ở Step 6.5, reference đó
- Nếu separate repos → OpenAPI / GraphQL schema / tRPC
- Nếu không rõ → đề xuất shared types package, ghi placeholder

**Section II — Database:**
- Extract từ WBS feature list → mỗi feature có entity gì
- Nếu chưa biết chi tiết → ghi placeholder `{feature}: TBD - to be defined during implementation`

**Section III — Shared Infrastructure:**
- Suy luận từ tech stack:
  - NestJS → EpcisCoreModule / ValidationPipeline pattern
  - Auth → JWT/session guard pattern
  - File upload → S3/local storage service
  - Email → Mailer service

**Section V — Dependency Isolation:**
- Bắt buộc nếu monorepo với ≥2 packages
- Extract từ `packages/*/package.json` `dependencies` field để xác định allowed imports
- Nếu không có packages/ → bỏ qua section

**Section VI/VII — Architecture:**
- Copy patterns chuẩn từ tech stack (NestJS = 3-layer, Next.js = App Router conventions)
- Customize theo constraints trong requirements

**Feature Dependency Graph:**
- Extract từ WBS dependency column hoặc suy luận từ data flow trong requirements
- Format giống L1 nhưng thêm shared data dependencies

---

## Điểm khác biệt quan trọng

Constitution KHÔNG được thiếu:
1. **Entity list** — spec-kit dùng để tránh tạo duplicate entities
2. **Shared services** với code example — spec-kit copy pattern này vào generated specs
3. **What to create checklist** — spec-kit dùng làm template cho tasks, bao gồm cả contracts step
4. **Feature dependency graph** — spec-kit dùng để order tasks đúng
5. **Contract strategy** với import path cụ thể — spec-kit dùng để generate đúng import statements

Constitution được phép dài — đây là reference document, không phải injected context.
