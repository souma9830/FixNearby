#!/usr/bin/env node
/**
 * verifyI18nKeys.js — i18n regression check (issue #1154, #1165 style verification).
 *
 * Verifies:
 *  1. en / hi / bn translation files expose IDENTICAL key sets (leaf-level).
 *     Any divergence means a language silently falls back to English.
 *  2. Every t('...') / t("...") key referenced in client/src exists in the
 *     dictionaries (default namespace "translation").
 *  3. Reports (warning only) components that render text but never import
 *     useTranslation — a canary for future hardcoded strings.
 *
 * Exits 1 on failures 1-2; exits 0 with warnings for 3.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LOCALES = path.join(ROOT, 'client', 'src', 'i18n', 'locales');
const SRC = path.join(ROOT, 'client', 'src');

function leafKeys(obj, prefix = '') {
  const out = new Set();
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') {
      for (const lk of leafKeys(v, p)) out.add(lk);
    } else {
      out.add(p);
    }
  }
  return out;
}

const dicts = {};
for (const lang of ['en', 'hi', 'bn']) {
  const file = path.join(LOCALES, lang, 'translation.json');
  if (!fs.existsSync(file)) {
    console.error(`MISSING locale file: ${file}`);
    process.exit(1);
  }
  dicts[lang] = leafKeys(JSON.parse(fs.readFileSync(file, 'utf8')));
}

let failures = 0;

// 1. Key-set parity
const en = dicts.en;
for (const lang of ['hi', 'bn']) {
  const missing = [...en].filter((k) => !dicts[lang].has(k));
  const extra = [...dicts[lang]].filter((k) => !en.has(k));
  if (missing.length || extra.length) {
    failures += 1;
    console.error(`[FAIL] ${lang} diverges from en:`);
    missing.forEach((k) => console.error(`  missing: ${k}`));
    extra.forEach((k) => console.error(`  extra:   ${k}`));
  } else {
    console.log(`[ok] ${lang} key set matches en (${en.size} keys)`);
  }
}

// 2. Every referenced t() key exists
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', 'tests'].includes(entry.name)) out.push(...walk(full));
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const used = new Set();
for (const file of walk(SRC)) {
  const content = fs.readFileSync(file, 'utf8');
  for (const m of content.matchAll(/[^a-zA-Z]t\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    used.add(m[1]);
  }
}

const missingKeys = [...used].filter((k) => !en.has(k));
if (missingKeys.length) {
  failures += 1;
  console.error(`[FAIL] ${missingKeys.length} t() key(s) missing from en/translation.json:`);
  missingKeys.forEach((k) => console.error(`  ${k}`));
} else {
  console.log(`[ok] all ${used.size} referenced t() keys exist`);
}

// 3. Canary: JSX with visible text that never wires useTranslation (warn-only)
const wired = new Set();
for (const file of walk(SRC)) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('useTranslation') || content.includes('from "../i18n"')) wired.add(file);
}
const unwired = walk(SRC).filter(
  (f) => !wired.has(f) && /[a-zA-Z]/.test(fs.readFileSync(f, 'utf8'))
);
if (unwired.length) {
  console.warn(
    `[warn] ${unwired.length} files did not reference useTranslation (canary, informational):`
  );
  unwired.slice(0, 5).forEach((f) => console.warn(`  ${path.relative(ROOT, f)}`));
  console.warn(`  ... and ${unwired.length - 5} more`);
}

if (failures) {
  console.error(`\ni18n verification failed with ${failures} issue(s).`);
  process.exit(1);
}
console.log('\ni18n verification passed.');
