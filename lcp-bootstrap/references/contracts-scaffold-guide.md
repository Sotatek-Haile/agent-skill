# Contracts Scaffold Guide — packages/contracts/ JSON Schema Strategy

Used by Step 6.5 in SKILL.md.

## Why JSON Schema (not TypeScript)

JSON Schema is the source of truth for API contracts because:
- **Language-agnostic:** readable by TypeScript, Go, Python, Java consumers
- **Human-readable:** no TypeScript knowledge required to understand shapes
- **AI-parseable:** structured format, no type system ambiguity
- **Tool-compatible:** OpenAPI generators, mock servers, validators all understand JSON Schema Draft 7

## Directory Structure

```
packages/contracts/
  index.json              ← manifest: lists all modules
  api/
    common.json           ← ApiResponse, PageMeta, shared pagination types
    enums.json            ← shared domain enums
    {feature-slug}.json   ← per-feature request/response shapes
```

## JSON Schema File Conventions

### Required header for every contract file
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "{Feature Name} Contracts",
  "_updated": "{YYYY-MM-DD}",
  "definitions": { ... }
}
```

### Naming conventions
| Type | Name pattern |
|---|---|
| Request | `Create{Feature}Request`, `Update{Feature}Request`, `Query{Feature}Params` |
| Response | `{Feature}Response`, `{Feature}ListItem` |
| Enum | `{Domain}{Concept}` (e.g., `ProductStatus`, `ShippingMethod`) |

### Optional fields
Use the `required` array — omit a field from `required` if it is optional:
```json
"properties": {
  "id":    { "type": "number" },
  "notes": { "type": "string" }
},
"required": ["id"]
```
`notes` is optional because it is absent from `required`.

### Enum representation
```json
"ProductStatus": {
  "type": "string",
  "enum": ["active", "inactive", "recalled"],
  "description": "Lifecycle status of a product"
}
```

---

## BE Scan Rules (Fullstack Case Only)

### Scanning *.dto.ts

| TypeScript / Class Validator decorator | JSON Schema mapping |
|---|---|
| `@IsString()` | `"type": "string"` |
| `@IsNumber()` | `"type": "number"` |
| `@IsBoolean()` | `"type": "boolean"` |
| `@IsOptional()` | omit field from `required` array |
| `@IsEnum(SomeEnum)` | `"type": "string", "enum": [...values]` |
| `@IsArray()` | `"type": "array"` |
| `@IsDateString()` | `"type": "string", "format": "date-time"` |
| `@IsUUID()` | `"type": "string", "format": "uuid"` |
| `@Min(n)` | `"minimum": n` |
| `@Max(n)` | `"maximum": n` |
| `@MinLength(n)` | `"minLength": n` |
| `@MaxLength(n)` | `"maxLength": n` |

### Scanning *.entity.ts

| TypeORM decorator | JSON Schema mapping |
|---|---|
| `@PrimaryGeneratedColumn()` | `"id": { "type": "number" }` |
| `@Column({ type: 'varchar' })` | `"type": "string"` |
| `@Column({ type: 'int' })` | `"type": "number"` |
| `@Column({ type: 'boolean' })` | `"type": "boolean"` |
| `@CreateDateColumn()` | `"type": "string", "format": "date-time"` |
| `@UpdateDateColumn()` | `"type": "string", "format": "date-time"` |
| `@ManyToOne`, `@OneToMany` | skip unless used in explicit response DTOs |

### Feature Grouping

Match controller folder names to feature slugs:
- `backend/src/commission/` → `packages/contracts/api/commission.json`
- `backend/src/shipping/` → `packages/contracts/api/shipping.json`
- `backend/src/auth/` → skip (auth types usually not shared with FE as JSON Schema)

If a feature folder has both `*.dto.ts` and a matching entity → generate a full contract file.
If only DTOs exist (no entity) → generate request schema only; leave response as stub.

---

## index.json Format

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "name": "@{project-name}/contracts",
  "version": "1.0.0",
  "_comment": "JSON Schema contracts — source of truth for BE↔FE API shapes",
  "modules": {
    "common":   "./api/common.json",
    "enums":    "./api/enums.json",
    "{feature}": "./api/{feature-slug}.json"
  }
}
```

## FE-only example.json Intent

The example file in Case A serves as a **pattern guide** for the developer:
- Shows the correct JSON Schema Draft 7 format
- Demonstrates `definitions`, `$ref`, `required` usage
- Has a `_comment` explaining the purpose
- Developer replaces `ExampleResponse` with real shapes as BE API is documented

Do NOT generate more than 1 example file for FE-only — the goal is a readable template, not a complete scaffold.
