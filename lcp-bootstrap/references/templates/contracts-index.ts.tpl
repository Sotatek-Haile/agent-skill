// ============================================================
// @{project-name}/contracts — Shared types between BE <-> FE
// Single source of truth for all API contracts.
// BE and FE MUST import from here — do NOT create types outside this package.
// ============================================================

// --- Common & Enums (always export) ---
export * from './api/enums';
export * from './api/common';

// --- Feature types (uncomment as features are implemented) ---
// Replace {feature-N} with the actual feature slug from WBS (kebab-case)
// export * from './api/{feature-1}';
// export * from './api/{feature-2}';
// export * from './api/{feature-3}';
// export * from './api/{feature-4}';
// export * from './api/{feature-5}';

// --- Smart Contract ABIs (uncomment if project has blockchain) ---
// export * from './abi';
