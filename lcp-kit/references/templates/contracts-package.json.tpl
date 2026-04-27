{
  "name": "@{project-name}/contracts",
  "version": "0.0.1",
  "description": "Shared TypeScript types between backend and frontend — single source of truth for API contracts",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
