import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const archDocPath = path.join(rootDir, 'ARCHITECTURE.md');

console.log('[Test] Verifying Root ARCHITECTURE.md documentation (#847)...');

// 1. Verify file exists at root
assert(fs.existsSync(archDocPath), 'ARCHITECTURE.md must exist in root directory');

// 2. Read content
const content = fs.readFileSync(archDocPath, 'utf8');

// 3. Verify key sections
assert(content.includes('# 🛠️ FixNearby System Architecture'), 'Doc contains main title');
assert(content.includes('## 🏗️ High-Level System Architecture'), 'Doc contains High-Level System Architecture section');
assert(content.includes('## 💻 Technology Stack Breakdown'), 'Doc contains Tech Stack section');
assert(content.includes('## 📁 Repository Directory Structure'), 'Doc contains Directory Structure section');
assert(content.includes('## 🔄 Core Application Data Flows'), 'Doc contains Data Flows section');
assert(content.includes('## 🔒 Security Architecture & Resilience'), 'Doc contains Security section');
assert(content.includes('## 🚀 Onboarding Quick Start for Contributors'), 'Doc contains Contributor Onboarding section');

// 4. Verify Mermaid diagrams & tech stack mentions
assert(content.includes('mermaid'), 'Doc includes Mermaid architectural diagrams');
assert(content.includes('React'), 'Doc mentions React frontend');
assert(content.includes('Express'), 'Doc mentions Express backend');
assert(content.includes('MongoDB'), 'Doc mentions MongoDB database');

console.log('✅ PASS: Root ARCHITECTURE.md documentation verified successfully (#847)!');
