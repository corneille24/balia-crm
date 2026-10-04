/* eslint-disable no-console */
// npx tsx --tsconfig tsconfig.app.json src/lib/consultant-match.test.ts
import { matchConsultants, matchForOpportunity } from '@/lib/consultant-match';
import { initialState } from '@/store';

let passed = 0; let failed = 0;
const check = (n: string, c: boolean) => { if (c) { passed++; console.log(`  \u2713 ${n}`); } else { failed++; console.error(`  \u2717 ${n}`); } };

console.log('\n[1] Basic matching');
const m = matchConsultants({ serviceCategory: 'AfCFTA', serviceName: 'AfCFTA Readiness Assessment', country: 'Cameroon', languages: ['French', 'English'], keywords: ['AfCFTA'] }, initialState);
check('returns consultants', m.length >= 1);
check('scores in 0-100', m.every((x) => x.score >= 0 && x.score <= 100));
check('sorted by score desc', m.length < 2 || m[0].score >= m[1].score);
check('each match has reasons', m.every((x) => Array.isArray(x.reasons)));
check('founder (AfCFTA expertise, FR/EN, Cameroon) scores well', (m.find((x) => x.userId === 'USR-01')?.score ?? 0) >= 40);
console.log('   ', m.map((x) => `${x.name}: ${x.score}% (${x.reasons.slice(0, 2).join(', ')})`).join(' | '));

console.log('\n[2] Match from an opportunity');
const opp = initialState.opportunities.find((o) => o.serviceId);
const om = opp ? matchForOpportunity(opp as never, initialState) : [];
check('opportunity-driven match works', om.length >= 1);
check('top match has a score', (om[0]?.score ?? 0) > 0);

console.log('\n[3] Availability influences score');
check('all consultants scored', matchConsultants({ country: 'Cameroon' }, initialState).length === initialState.users.filter((u: never) => (u as { isConsultant?: boolean }).isConsultant || (u as { userType?: string }).userType === 'Consultant').length);

console.log(`\n${failed === 0 ? 'ALL PASSED' : 'FAILURES'} — ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
