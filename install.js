#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILLS_DIR = path.join(os.homedir(), '.claude', 'skills');
const ROOT_DIR = __dirname;
const RESERVED = ['uninstall', '--list', '--yes'];

// Auto-discover skills: any subdirectory containing a SKILL.md file
function discoverSkills() {
  return fs.readdirSync(ROOT_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(ROOT_DIR, e.name, 'SKILL.md')))
    .map(e => e.name);
}

function getSkillCommand(skill) {
  const skillMd = path.join(ROOT_DIR, skill, 'SKILL.md');
  const match = fs.existsSync(skillMd)
    ? fs.readFileSync(skillMd, 'utf8').match(/^name:\s*(.+)$/m)
    : null;
  return match ? match[1].trim() : skill;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function install(targets, available) {
  const invalid = targets.filter(s => !available.includes(s));
  if (invalid.length > 0) {
    console.error(`\n❌ Unknown skill(s): ${invalid.join(', ')}`);
    printUsage(available);
    process.exit(1);
  }

  const label = targets.length === available.length ? 'all' : targets.length;
  console.log(`\nInstalling ${label} skill(s) into ${SKILLS_DIR}...\n`);
  fs.mkdirSync(SKILLS_DIR, { recursive: true });

  targets.forEach(skill => {
    const destDir = path.join(SKILLS_DIR, skill);
    const isUpdate = fs.existsSync(destDir);
    copyDir(path.join(ROOT_DIR, skill), destDir);
    console.log(`  ${isUpdate ? '🔄 Updated' : '✅ Installed'}  ${skill}`);
  });

  console.log('\nDone! Open Claude Code in any project and try:');
  targets.forEach(s => console.log(`  /${getSkillCommand(s)}`));
  console.log();
}

function uninstall(targets, available) {
  const invalid = targets.filter(s => !available.includes(s));
  if (invalid.length > 0) {
    console.error(`\n❌ Unknown skill(s): ${invalid.join(', ')}`);
    printUsage(available);
    process.exit(1);
  }

  const label = targets.length === available.length ? 'all' : targets.length;
  console.log(`\nUninstalling ${label} skill(s) from ${SKILLS_DIR}...\n`);

  targets.forEach(skill => {
    const destDir = path.join(SKILLS_DIR, skill);
    if (!fs.existsSync(destDir)) {
      console.log(`  ⚠️  Not installed: ${skill} — skipped`);
      return;
    }
    fs.rmSync(destDir, { recursive: true, force: true });
    console.log(`  🗑️  Removed  ${skill}`);
  });

  console.log('\nDone!\n');
}

function printUsage(available) {
  console.log('\nUsage:');
  console.log('  npx github:Sotatek-Haile/agent-skill                          # install all');
  console.log('  npx github:Sotatek-Haile/agent-skill <skill>                  # install one');
  console.log('  npx --yes github:Sotatek-Haile/agent-skill                    # update all');
  console.log('  npx --yes github:Sotatek-Haile/agent-skill <skill>            # update one');
  console.log('  npx github:Sotatek-Haile/agent-skill uninstall                # uninstall all');
  console.log('  npx github:Sotatek-Haile/agent-skill uninstall <skill>        # uninstall one');
  console.log('  npx github:Sotatek-Haile/agent-skill --list                   # list skills');
  console.log('\nAvailable skills:');
  available.forEach(s => console.log(`  - ${s}`));
}

// --- main ---

const available = discoverSkills();
const rawArgs = process.argv.slice(2);
const flags = rawArgs.filter(a => a.startsWith('-'));
const args = rawArgs.filter(a => !a.startsWith('-'));

if (flags.includes('--list')) {
  console.log('\nAvailable skills:');
  available.forEach(s => console.log(`  - ${s}`));
  console.log();
  process.exit(0);
}

if (args[0] === 'uninstall') {
  const targets = args.slice(1).length > 0 ? args.slice(1) : available;
  uninstall(targets, available);
} else {
  const targets = args.length > 0 ? args : available;
  install(targets, available);
}
