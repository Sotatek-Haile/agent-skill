#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILLS_DIR = path.join(os.homedir(), '.claude', 'skills');
const ROOT_DIR = __dirname;

// Auto-discover skills: any subdirectory that contains a SKILL.md file
function discoverSkills() {
  return fs.readdirSync(ROOT_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory() && fs.existsSync(path.join(ROOT_DIR, e.name, 'SKILL.md')))
    .map(e => e.name);
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

function installSkill(skill) {
  const srcDir = path.join(ROOT_DIR, skill);
  const destDir = path.join(SKILLS_DIR, skill);
  const isUpdate = fs.existsSync(destDir);
  copyDir(srcDir, destDir);
  console.log(`  ${isUpdate ? '🔄 Updated' : '✅ Installed'}  ${skill}`);
}

function printUsage(available) {
  console.log('Usage:');
  console.log('  npx github:Sotatek-Haile/agent-skill              # install all skills');
  console.log('  npx github:Sotatek-Haile/agent-skill <skill-name> # install one skill');
  console.log('  npx github:Sotatek-Haile/agent-skill --list       # list available skills');
  console.log('\nAvailable skills:');
  available.forEach(s => console.log(`  - ${s}`));
}

// --- main ---

const available = discoverSkills();
const args = process.argv.slice(2).filter(a => !a.startsWith('-'));
const flags = process.argv.slice(2).filter(a => a.startsWith('-'));

if (flags.includes('--list')) {
  console.log('\nAvailable skills:');
  available.forEach(s => console.log(`  - ${s}`));
  console.log();
  process.exit(0);
}

// Resolve which skills to install
let targets = args.length > 0 ? args : available;

// Validate requested skills
const invalid = targets.filter(s => !available.includes(s));
if (invalid.length > 0) {
  console.error(`\n❌ Unknown skill(s): ${invalid.join(', ')}`);
  printUsage(available);
  process.exit(1);
}

console.log(`\nInstalling ${targets.length === available.length ? 'all' : targets.length} skill(s) into ${SKILLS_DIR}...\n`);

fs.mkdirSync(SKILLS_DIR, { recursive: true });
targets.forEach(installSkill);

console.log('\nDone! Open Claude Code in any project and try:');
targets.forEach(s => {
  // Read the command name from SKILL.md front-matter (name: field)
  const skillMd = path.join(ROOT_DIR, s, 'SKILL.md');
  const match = fs.readFileSync(skillMd, 'utf8').match(/^name:\s*(.+)$/m);
  const cmd = match ? match[1].trim() : s;
  console.log(`  /${cmd}`);
});
console.log();
