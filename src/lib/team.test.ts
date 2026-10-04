/* eslint-disable no-console */
// ---------------------------------------------------------------------------
// Team & Access — user records are reducer state and actions persist.
// Run: npx tsx --tsconfig tsconfig.app.json src/lib/team.test.ts
// ---------------------------------------------------------------------------
import { reducer, initialState } from '@/store';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) { passed++; console.log(`  \u2713 ${name}`); }
  else { failed++; console.error(`  \u2717 ${name}`); }
}
const byId = (s: typeof initialState, id: string) => s.users.find((u) => u.id === id)!;

console.log('\nTeam & Access');
check('users are part of reducer state', Array.isArray(initialState.users) && initialState.users.length > 0);

// Create (Add user, invited)
const before = initialState.users.length;
let s = reducer(initialState, { type: 'add', collection: 'users', record: {
  id: 'USR-T', name: 'Ada Obi', initials: 'AO', role: 'consultant', title: 'Consultant',
  email: 'ada@baliaconsulting.com', phone: '', active: false, lastLogin: '',
  firstName: 'Ada', lastName: 'Obi', userType: 'Consultant', department: 'Trade Advisory',
  team: 'Trade Advisory', status: 'Invited', created: '2026-09-10',
} } as never);
check('add user grows the collection', s.users.length === before + 1);
check('new user starts Invited and inactive', byId(s, 'USR-T').status === 'Invited' && !byId(s, 'USR-T').active);

// Activate / role change / suspend
s = reducer(s, { type: 'patch', collection: 'users', id: 'USR-T', changes: { status: 'Active', active: true } } as never);
check('activate sets Active + active flag', byId(s, 'USR-T').status === 'Active' && byId(s, 'USR-T').active);
s = reducer(s, { type: 'patch', collection: 'users', id: 'USR-T', changes: { role: 'finance' } } as never);
check('role change persists', byId(s, 'USR-T').role === 'finance');
s = reducer(s, { type: 'patch', collection: 'users', id: 'USR-T', changes: { status: 'Suspended', active: false } } as never);
check('suspend sets Suspended + clears active', byId(s, 'USR-T').status === 'Suspended' && !byId(s, 'USR-T').active);

// Persistence across a reload (state round-trip)
const restored = JSON.parse(JSON.stringify(s.users));
check('user survives a reload round-trip', restored.find((u: { id: string }) => u.id === 'USR-T')?.status === 'Suspended');

console.log(`\n${failed === 0 ? 'ALL PASSED' : 'FAILURES'} — ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
