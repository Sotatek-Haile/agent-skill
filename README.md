# Agent Skills

A collection of Claude Code skills for AI-assisted development workflows.

## Skills

| Skill | Command | Description |
|-------|---------|-------------|
| [lcp-kit](./lcp-kit/SKILL.md) | `/lcp:bootstrap` | Bootstrap Layered Context Protocol (LCP) for new or existing projects |

---

## Installation

### Prerequisites

- [Claude Code CLI](https://claude.ai/code) installed
- Node.js ≥ 16

### Install

```bash
# All skills
npx github:Sotatek-Haile/agent-skill

# Specific skill
npx github:Sotatek-Haile/agent-skill lcp-kit

# List available skills
npx github:Sotatek-Haile/agent-skill --list
```

### Update

```bash
# All skills
npx --yes github:Sotatek-Haile/agent-skill

# Specific skill
npx --yes github:Sotatek-Haile/agent-skill lcp-kit
```

> `--yes` forces npx to re-fetch from GitHub instead of using local cache.

### Uninstall

```bash
# All skills
npx github:Sotatek-Haile/agent-skill uninstall

# Specific skill
npx github:Sotatek-Haile/agent-skill uninstall lcp-kit
```

---

## Skill: `lcp:bootstrap`

Bootstrap the **Layered Context Protocol (LCP)** — a structured wiki system that helps Claude understand your codebase deeply across sessions.

### Usage

Run without arguments to start the interactive wizard:

```
/lcp:bootstrap
```

Wizard questions:

| # | Question | Options |
|---|----------|---------|
| Q1 | What would you like to do? | Bootstrap / Validate |
| Q2 | What type of project? | Fullstack / BE only / FE only |
| Q3 | Run spec-kit after setup? | Yes / No |
| Q4 | Do you have a requirements file? | Yes (enter path) / No (auto-detect) |
| Q5 | Do you have a WBS file? *(if Q4 = Yes)* | Yes (enter path) / No |

### What it generates

```
.claude/hooks/context-injector.cjs   ← auto-injects context into every prompt
.claude/settings.json                ← hook configuration
.claude/manifest.json                ← LCP layer manifest

wiki/global/project-overview.md      ← domain & business context
wiki/global/architecture.md          ← technical architecture reference
wiki/global/ai-context/L1-always/    ← always-injected context (concise)
wiki/global/ai-context/L2-domain/    ← domain context (BE / FE / DB / style...)
wiki/global/ai-context/L3-reference/ ← on-demand reference index

packages/contracts/api/              ← JSON Schema API contracts
CLAUDE.md                            ← updated with LCP instructions
```

### After bootstrap

1. Review generated files in `wiki/` and `packages/contracts/`
2. Commit:
   ```bash
   git add .claude wiki packages/contracts CLAUDE.md
   git commit -m "feat(ai-tooling): init LCP context protocol"
   ```
3. Open a **new Claude session** — context injection will be active from the first prompt

---

## Contributing

To add a new skill, create a subdirectory with a `SKILL.md` file — the installer auto-discovers it:

```
agent-skill/
├── lcp-kit/
│   └── SKILL.md
├── my-new-skill/
│   └── SKILL.md       ← auto-discovered on next install
└── install.js
```
