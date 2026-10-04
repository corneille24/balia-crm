/* eslint-disable no-console */
// ---------------------------------------------------------------------------
// Access model — internal-only invariants (§1, §32).
// Run: npx tsx --tsconfig tsconfig.app.json src/lib/access.test.ts
// ---------------------------------------------------------------------------
import { ROLES } from '@/data/catalog';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) { passed++; console.log(`  \u2713 ${name}`); }
  else { failed++; console.error(`  \u2717 ${name}`); }
}

console.log('\nInternal-only access model');
check('no "client" role exists', !ROLES.some((r) => r.id === 'client'));
check('no role is named for client/portal access', !ROLES.some((r) => /client|portal/i.test(r.name)));
check('no non-wildcard role grants the "portal" permission',
  !ROLES.some((r) => r.permissions.includes('portal')));
check('the internal roles are present', ['super_admin', 'admin', 'consultant', 'finance', 'sales', 'training'].every((id) => ROLES.some((r) => r.id === id)));

console.log(`\n${failed === 0 ? 'ALL PASSED' : 'FAILURES'} — ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
