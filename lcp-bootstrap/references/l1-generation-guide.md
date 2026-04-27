# L1 Generation Guide

L1 files được inject vào MỌI prompt — phải ngắn gọn, high-signal, không dài quá 150 dòng tổng.

## File 01-project-summary.md

Extract từ requirements/WBS:

```markdown
# Project: {project-name} — Business Context

## Domain
{1-2 câu mô tả hệ thống là gì, giải quyết bài toán gì cho ai}

## Stack
{Backend: framework, DB, cache} / {Frontend: framework, libs}

## Monorepo Structure (if applicable)
```
{dir}/              @{pkg}/backend   — {framework} API (port XXXX)
{dir}/apps/         @{pkg}/frontend  — {framework} app (port XXXX)
{dir}/commons/      @{pkg}/commons   — Shared UI + hooks + utils
packages/contracts/ @{pkg}/contracts — Shared BE↔FE types
```

## Actors
| Actor | Role | Quyền |
|---|---|---|
| {actor} | {portal/app} | {capabilities} |

## Feature Map
{Vẽ dependency graph features theo WBS, dùng ký hiệu →}
{Phân biệt WRITE features vs READ-ONLY features}

## Key Cross-Feature Dependencies
- {entity/table} — dùng bởi feature X, Y, Z
- {shared service} — trigger khi nào, affect gì
```

**Rules khi viết:**
- Feature map: dùng ký hiệu `→` và `├→` cho branching
- Dependencies: chỉ list các dependency CROSS-feature, không list trong-feature
- Stack: chỉ ghi tên, không giải thích dài dòng
- Monorepo structure: chỉ include nếu project thực sự là monorepo với ≥2 packages
- Mục tiêu: AI đọc xong biết ngay project làm gì và tổ chức thế nào

---

## File 02-critical-rules.md

Extract từ requirements + suy luận từ tech stack:

```markdown
# Critical Rules — KHÔNG ĐƯỢC VI PHẠM

## Dependency Isolation (if monorepo)
Nếu project có multiple packages, bắt buộc có bảng này — vi phạm gây circular import hoặc build fail:

| Package | Có thể import | KHÔNG được import |
|---|---|---|
| `@{pkg}/contracts` | (standalone) | Mọi package khác |
| `@{pkg}/backend` | `@{pkg}/contracts` | FE packages, `@{pkg}/commons` |
| FE apps | `@{pkg}/contracts`, `@{pkg}/commons` | Backend, FE apps khác |
| `@{pkg}/commons` | (standalone) | Mọi package khác |

## Backend (nếu có BE)

### {Rule name}
{Code example ✅ ĐÚNG vs ❌ SAI}
{Lý do ngắn gọn — tại sao rule này tồn tại}

## Frontend (nếu có FE)

### {Rule name}
{Code example ✅ ĐÚNG vs ❌ SAI}
{Lý do ngắn gọn}

## Database (nếu có)
{Rules về naming, migration, entity pattern}
```

**Rules phổ biến cần check theo tech stack:**

| Tech | Rules hay bị vi phạm |
|---|---|
| NestJS | Controller prefix double, response self-wrap, module list truncation |
| Next.js | Axios custom instance, hardcode API URL, deep import path |
| TypeORM | Entity naming, migration vs sửa cũ, BaseEntity extension |
| React Query | QueryKey structure, staleTime default, invalidation pattern |
| Tailwind v4 | Inline style, custom color ngoài system |
| Monorepo (packages/) | Import từ sai package, circular dependency, deep path thay vì barrel |

**Format mỗi rule:**
- Tên rule = tên vấn đề ngắn gọn
- Luôn có code example với ✅/❌
- Không quá 5 dòng mô tả
- Chỉ include rule NẾU vi phạm gây ra bug hoặc conflict khó debug

**Dependency Isolation — khi nào thêm:**
- Bắt buộc nếu project là monorepo với ≥2 packages trong `packages/`
- Extract từ `packages/*/package.json` dependencies để xác định allowed imports
- Tự suy luận: package nào không có dependency → standalone (không được import ai)
- Nếu không có `packages/` → bỏ qua section này
