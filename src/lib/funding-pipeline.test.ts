/* eslint-disable no-console */
// ---------------------------------------------------------------------------
// Funding pipeline — Funded / Rejected behaviour tests.
//
// Dependency-free: run with the tsx tool (no test framework is installed):
//     npx tsx --tsconfig tsconfig.app.json src/lib/funding-pipeline.test.ts
//
// Covers the acceptance criteria for the completed-opportunity feature:
//   1. Moving an opportunity to Funded
//   2. Moving an opportunity to Rejected
//   3. Both statuses leave the default active pipeline (no duplication)
//   4. Funded and rejected opportunities are viewable separately
//   5. Status changes persist across a reload (state round-trip)
//   6. The existing award / reject reducer flows still work
// ---------------------------------------------------------------------------

import { reducer, initialState } from '@/store';
import { inOppScope, isCompletedOpportunity } from '@/lib/funding';
import type { AppState } from '@/store';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) { passed++; console.log(`  \u2713 ${name}`); }
  else { failed++; console.error(`  \u2717 ${name}`); }
}

const activeList = (s: AppState) => s.fundingOpportunities.filter((o) => inOppScope(o, 'active'));
const fundedList = (s: AppState) => s.fundingOpportunities.filter((o) => inOppScope(o, 'funded'));
const rejectedList = (s: AppState) => s.fundingOpportunities.filter((o) => inOppScope(o, 'rejected'));

// Pick two distinct active seed opportunities to drive through the board.
const seedActive = activeList(initialState);
const targetFund = seedActive[0];
const targetReject = seedActive[1];
console.log(`\nStarting from ${seedActive.length} active opportunities.`);
console.log(`  Funding: ${targetFund.id} (${targetFund.status})`);
console.log(`  Rejecting: ${targetReject.id} (${targetReject.status}, stage "${targetReject.stage}")`);

// --- 1. Move an opportunity to Funded (the drag-to-Funded path = patch) -----
console.log('\n[1] Move to Funded');
let s: AppState = reducer(initialState, {
  type: 'patch', collection: 'fundingOpportunities', id: targetFund.id,
  changes: { status: 'Funded', stage: 'Funded' },
} as never);
const funded = s.fundingOpportunities.find((o) => o.id === targetFund.id)!;
check('status becomes Funded', funded.status === 'Funded');
check('isCompletedOpportunity is true', isCompletedOpportunity(funded));
check('leaves the active pipeline', !inOppScope(funded, 'active'));
check('appears in the Funded view', inOppScope(funded, 'funded'));

// --- 2. Move an opportunity to Rejected (drag-to-Rejected path = patch) ------
console.log('\n[2] Move to Rejected');
const stageBefore = targetReject.stage;
s = reducer(s, {
  type: 'patch', collection: 'fundingOpportunities', id: targetReject.id,
  changes: { status: 'Rejected' },
} as never);
const rejected = s.fundingOpportunities.find((o) => o.id === targetReject.id)!;
check('status becomes Rejected', rejected.status === 'Rejected');
check('leaves the active pipeline', !inOppScope(rejected, 'active'));
check('appears in the Rejected view', inOppScope(rejected, 'rejected'));
check('stage is preserved (history kept)', rejected.stage === stageBefore);

// --- 3. Both leave the default active pipeline, with no duplication ----------
console.log('\n[3] Removed from the active pipeline, no duplication');
check('active count dropped by exactly 2', activeList(s).length === seedActive.length - 2);
check('funded opp not in active list', !activeList(s).some((o) => o.id === targetFund.id));
check('rejected opp not in active list', !activeList(s).some((o) => o.id === targetReject.id));
// Active / Funded / Rejected are mutually exclusive and exhaustive.
const noDuplication = s.fundingOpportunities.every((o) => {
  const memberships = [inOppScope(o, 'active'), inOppScope(o, 'funded'), inOppScope(o, 'rejected')].filter(Boolean).length;
  return memberships === 1;
});
check('every opportunity is in exactly one of active/funded/rejected', noDuplication);

// --- 4. Funded and rejected are viewable separately -------------------------
console.log('\n[4] Separate views');
check('Funded view contains the funded opp', fundedList(s).some((o) => o.id === targetFund.id));
check('Rejected view contains the rejected opp', rejectedList(s).some((o) => o.id === targetReject.id));
check('Funded view excludes the rejected opp', !fundedList(s).some((o) => o.id === targetReject.id));
check('All view contains both', s.fundingOpportunities.filter((o) => inOppScope(o, 'all')).length === s.fundingOpportunities.length);

// --- 5. Status persists across a reload (state round-trip) ------------------
console.log('\n[5] Persistence across reload (round-trip)');
const restored: AppState['fundingOpportunities'] = JSON.parse(JSON.stringify(s.fundingOpportunities));
const rFund = restored.find((o) => o.id === targetFund.id)!;
const rReject = restored.find((o) => o.id === targetReject.id)!;
check('funded status survives round-trip', rFund.status === 'Funded' && !inOppScope(rFund, 'active') && inOppScope(rFund, 'funded'));
check('rejected status survives round-trip', rReject.status === 'Rejected' && !inOppScope(rReject, 'active') && inOppScope(rReject, 'rejected'));

// --- 6. Existing award / reject reducer flows still work --------------------
console.log('\n[6] Existing award / reject flows');
const a = activeList(initialState)[2];
let s2 = reducer(initialState, { type: 'awardOpportunity', opportunityId: a.id, amount: 1000, user: 'USR-01' } as never);
const awarded = s2.fundingOpportunities.find((o) => o.id === a.id)!;
check('awardOpportunity sets status Awarded', awarded.status === 'Awarded');
check('Awarded stays in the active pipeline (still needs contracting)', inOppScope(awarded, 'active'));
check('an outcome record is created', s2.fundingOutcomes.some((o) => o.opportunityId === a.id && o.outcome === 'Awarded'));

const r = activeList(initialState)[3];
const tasksBefore = initialState.tasks.length;
s2 = reducer(initialState, { type: 'rejectOpportunity', opportunityId: r.id, reason: 'Out of scope', user: 'USR-01' } as never);
const rej = s2.fundingOpportunities.find((o) => o.id === r.id)!;
check('rejectOpportunity sets status Rejected', rej.status === 'Rejected');
check('rejected opp leaves the active pipeline', !inOppScope(rej, 'active'));
check('a lessons-learned task is created', s2.tasks.length === tasksBefore + 1);
check('a Rejected outcome record is created', s2.fundingOutcomes.some((o) => o.opportunityId === r.id && o.outcome === 'Rejected'));

// --- 7. Reopen a completed opportunity back into the active pipeline --------
console.log('\n[7] Reopen from a completed status (record status editor)');
let s3 = reducer(initialState, {
  type: 'patch', collection: 'fundingOpportunities', id: targetFund.id,
  changes: { status: 'Funded', stage: 'Funded' },
} as never);
const beforeReopen = s3.fundingOpportunities.find((o) => o.id === targetFund.id)!;
check('is completed before reopening', isCompletedOpportunity(beforeReopen) && !inOppScope(beforeReopen, 'active'));
s3 = reducer(s3, {
  type: 'patch', collection: 'fundingOpportunities', id: targetFund.id,
  changes: { status: 'Qualified' },
} as never);
const reopened = s3.fundingOpportunities.find((o) => o.id === targetFund.id)!;
check('reopening returns it to the active pipeline', inOppScope(reopened, 'active'));
check('no longer counted as completed', !isCompletedOpportunity(reopened));
check('no longer in the Funded view', !inOppScope(reopened, 'funded'));

// --- Summary ----------------------------------------------------------------
console.log(`\n${failed === 0 ? 'ALL PASSED' : 'FAILURES'} — ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
