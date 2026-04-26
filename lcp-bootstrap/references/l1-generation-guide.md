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
{Monorepo structure nếu có}

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
- Mục tiêu: AI đọc xong biết ngay project làm gì và tổ chức thế nào

---

## File 02-critical-rules.md

Extract từ requirements + suy luận từ tech stack:

```markdown
# Critical Rules — KHÔNG ĐƯỢC VI PHẠM

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

**Format mỗi rule:**
- Tên rule = tên vấn đề ngắn gọn
- Luôn có code example với ✅/❌
- Không quá 5 dòng mô tả
- Chỉ include rule NẾU vi phạm gây ra bug hoặc conflict khó debug
