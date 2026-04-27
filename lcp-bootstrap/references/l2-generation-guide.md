# L2 Generation Guide

L2 files chỉ inject khi prompt có keyword khớp. Mỗi file ~100-150 dòng.
Chỉ tạo domain nào project thực sự dùng.

---

## Domain: backend

**Tạo khi:** project có BE (NestJS / Express / FastAPI / Spring / etc.)

**Keywords mặc định:**
```json
["api", "service", "controller", "module", "dto", "repository", "endpoint",
 "guard", "interceptor", "middleware", "pipeline", "jwt", "backend",
 "migration", "entity", "swagger", "queue", "redis"]
```
Thêm framework-specific keywords: `"nestjs"`, `"express"`, `"fastapi"`, `"django"`, `"spring"`

**Nội dung cần có:**
- Module/service pattern của framework đang dùng
- Repository/ORM pattern
- Auth pattern (guard, middleware, decorator)
- Request/Response convention
- Error handling convention
- Module registration pattern (nếu có global module)

---

## Domain: frontend

**Tạo khi:** project có FE (Next.js / React / Vue / Angular / etc.)

**Keywords mặc định:**
```json
["component", "page", "hook", "form", "react", "nextjs", "tsx", "frontend",
 "tanstack", "zustand", "axios", "ui", "layout"]
```
Thêm: `"vue"`, `"angular"`, `"nuxt"`, `"vite"` tùy stack

**Nội dung cần có:**
- Component structure pattern
- State management pattern
- API service + data fetching pattern (React Query / SWR / etc.)
- Form handling pattern
- Auth / cookie / token pattern
- Import conventions (barrel import, alias, etc.)
- Common display rules (date format, number format, empty state)

---

## Domain: database

**Tạo khi:** project có ORM hoặc query builder (TypeORM, Prisma, SQLAlchemy, etc.)

**Keywords mặc định:**
```json
["entity", "table", "column", "postgres", "schema", "query",
 "index", "relation", "migration", "seed"]
```
Thêm ORM-specific: `"typeorm"`, `"prisma"`, `"sequelize"`, `"drizzle"`

**Nội dung cần có:**
- Entity/Model pattern (naming, base class, timestamps)
- Repository pattern nếu có
- Migration naming convention
- Existing entities table (tên entity → tên table)
- Relationships phức tạp (cross-entity dependencies)
- Soft delete vs hard delete pattern

---

## Domain: style

**Tạo khi:** project có custom design system hoặc style guide rõ ràng

**Keywords mặc định:**
```json
["color", "font", "style", "design", "tailwind", "css", "theme",
 "spacing", "typography", "figma", "border", "shadow", "palette"]
```

**Nội dung cần có:**
- Color palette (exact hex values, không tự sáng tác)
- Typography scale (font family, size, weight)
- Spacing scale
- Component variants pattern
- Dark mode strategy (nếu có)
- Rules: KHÔNG hardcode màu ngoài system

---

## Domain: contracts

**Tạo khi:** project là fullstack monorepo có shared types package (`packages/contracts/` hoặc tương tự)

**Keywords mặc định:**
```json
["contracts", "packages", "shared types", "interface", "dto",
 "api types", "request", "response", "abi", "barrel"]
```

**Nội dung cần có:**
- Package name và import path: `import { ... } from '@{project}/contracts'`
- `api/` directory structure: mỗi feature → 1 file (`api/{feature}.ts`)
- Barrel export pattern (`index.ts` re-exports tất cả feature files)
- Common types location: `api/common.ts` (ApiResponse<T>, PageMeta, PageQueryParams, ...)
- Enums location: `api/enums.ts` (shared enums dùng across features)
- ABI location: `abi/` (nếu có blockchain smart contracts)
- Rule: BE và FE KHÔNG tự tạo types riêng — mọi API contract đi qua package này
- Rule: package này là standalone — KHÔNG import package khác trong monorepo
- Khi nào thêm type mới: mỗi feature mới → thêm `api/{feature}.ts` + re-export trong `index.ts`

---

## Domain tùy chỉnh

Tạo thêm domain nếu project có layer đặc thù:

| Domain | Keywords gợi ý | Khi nào tạo |
|---|---|---|
| `blockchain` | `chain`, `contract`, `wallet`, `tx`, `anchor`, `merkle` | Có smart contract / on-chain |
| `queue` | `queue`, `worker`, `job`, `bullmq`, `celery`, `kafka` | Có async job processing |
| `testing` | `test`, `jest`, `spec`, `mock`, `e2e`, `cypress` | Có test conventions phức tạp |
| `devops` | `docker`, `ci`, `deploy`, `env`, `nginx`, `k8s` | Có infra setup đặc thù |
| `mobile` | `react-native`, `flutter`, `ios`, `android`, `expo` | Có mobile app |

---

## Manifest entry format

Mỗi domain thêm vào `.claude/manifest.json` theo format:
```json
"{domain}": {
  "keywords": ["keyword1", "keyword2", ...],
  "file": "wiki/global/ai-context/L2-domain/{domain}.md"
}
```
