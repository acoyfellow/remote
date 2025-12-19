#!/usr/bin/env node
// Patch for Alchemy D1Database bug: withJurisdiction headers break D1 API calls
// See: https://github.com/alchemy-run/alchemy (report this bug)

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const filePath = join(process.cwd(), 'node_modules/alchemy/lib/cloudflare/d1-database.js');

if (!existsSync(filePath)) {
  console.log('[patch] Alchemy D1 file not found, skipping patch');
  process.exit(0);
}

let content = readFileSync(filePath, 'utf8');

// Check if already patched
if (content.includes('/* PATCHED */')) {
  console.log('[patch] Alchemy D1 already patched');
  process.exit(0);
}

// Patch the createDatabase function to not use withJurisdiction headers
// The compiled JS has different formatting than the TS source
const oldCode = `const createResponse = await api.post(\`/accounts/\${api.accountId}/d1/database\`, createPayload, {
        headers: withJurisdiction(props),
    });`;

const newCode = `/* PATCHED */ const createResponse = await api.post(\`/accounts/\${api.accountId}/d1/database\`, createPayload, {});`;

if (!content.includes(oldCode)) {
  console.log('[patch] Could not find target code in Alchemy D1, may already be patched or version changed');
  process.exit(0);
}

content = content.replace(oldCode, newCode);
writeFileSync(filePath, content);
console.log('[patch] Patched Alchemy D1 (removed withJurisdiction from createDatabase)');
