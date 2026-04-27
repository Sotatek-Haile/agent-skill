#!/usr/bin/env node
/**
 * context-injector.cjs — Layered Context Protocol (LCP)
 *
 * Reads .claude/manifest.json from project CWD.
 * Always injects L1 files, keyword-matches prompt for L2 files.
 * Content files are resolved relative to CWD (paths in manifest are CWD-relative).
 * Outputs injected context to stdout → Claude Code prepends to AI context.
 *
 * Generic: works for any project with .claude/manifest.json
 */

'use strict';

const fs = require('fs');
const path = require('path');

try {
  // Read user prompt from stdin (Claude Code hook protocol)
  const raw = fs.readFileSync(0, 'utf-8').trim();
  const data = raw ? JSON.parse(raw) : {};
  const prompt = (data.prompt || '').toLowerCase();

  const cwd = process.cwd();
  const manifestPath = path.join(cwd, '.claude', 'manifest.json');

  // No manifest in this project — skip silently
  if (!fs.existsSync(manifestPath)) {
    process.exit(0);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const lines = [];

  // L1: always inject — paths in manifest are relative to CWD
  const l1Files = manifest.layers?.L1?.files || [];
  for (const file of l1Files) {
    const filePath = path.join(cwd, file);
    if (fs.existsSync(filePath)) {
      lines.push(fs.readFileSync(filePath, 'utf8').trim());
    }
  }

  // L2: inject by keyword match
  const domains = manifest.layers?.L2?.domains || {};
  const matched = [];
  for (const [domain, config] of Object.entries(domains)) {
    const hit = (config.keywords || []).some((kw) => prompt.includes(kw));
    if (hit) {
      const filePath = path.join(cwd, config.file);
      if (fs.existsSync(filePath)) {
        lines.push(fs.readFileSync(filePath, 'utf8').trim());
        matched.push(domain);
      }
    }
  }

  if (lines.length === 0) {
    process.exit(0);
  }

  // L3: always append hint so AI knows where to find deep-reference docs
  const l3Hint = manifest.layers?.L3?.hint;
  const l3Note = l3Hint ? `\n\n> **L3 on-demand:** ${l3Hint}` : '';

  const domainNote = matched.length ? ` + L2[${matched.join(', ')}]` : '';
  const header = `\n## Injected Context (L1-always${domainNote})\n`;
  process.stdout.write(header + '\n' + lines.join('\n\n---\n\n') + l3Note + '\n');
} catch (_err) {
  // Never crash — silently exit
  process.exit(0);
}
