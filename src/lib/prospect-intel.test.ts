/* eslint-disable no-console */
// Run: npx tsx --tsconfig tsconfig.app.json src/lib/prospect-intel.test.ts
import {
  prospectScore, prospectClass, conversionBand, outreachPriority, prospectAnalytics,
  PROSPECT_FACTORS,
} from '@/lib/prospect-intel';
import { CLIENT_PROSPECTS } from '@/data/prospects';

let passed = 0; let failed = 0;
const check = (n: string, c: boolean) => { if (c) { passed++; console.log(`  \u2713 ${n}`); } else { failed++; console.error(`  \u2717 ${n}`); } };

console.log('\n[1] Score weights (§17)');
check('nine factors, weights sum to 100', PROSPECT_FACTORS.length === 9 && PROSPECT_FACTORS.reduce((s, f) => s + f.weight, 0) === 100);
const full = { scoreInputs: Object.fromEntries(PROSPECT_FACTORS.map((f) => [f.key, 100])) } as never;
check('all-100 -> 100', prospectScore(full) === 100);
check('empty -> 0', prospectScore({ scoreInputs: {} } as never) === 0);
check('serviceFit-only (w20) -> 20', prospectScore({ scoreInputs: { serviceFit: 100 } } as never) === 20);

console.log('\n[2] Classification (§18) + conversion (§19)');
check('92 -> Hot', prospectClass(92).label === 'Hot / Priority');
check('80 -> High Potential', prospectClass(80).label === 'High Potential');
check('65 -> Qualified', prospectClass(65).label === 'Qualified');
check('50 -> Nurture', prospectClass(50).label === 'Nurture');
check('conv 75 -> Strong', conversionBand(75) === 'Strong');

console.log('\n[3] Seed data integrity');
check('18 prospects seeded', CLIENT_PROSPECTS.length === 18);
check('all have whyBalia and whyNow', CLIENT_PROSPECTS.every((p) => p.whyBalia && p.whyNow));
check('all have >=1 source', CLIENT_PROSPECTS.every((p) => p.sources.length >= 1));
check('no invented personal emails', CLIENT_PROSPECTS.every((p) => p.contacts.every((c) => !c.email || c.confidence === 'Verified' || c.confidence === 'High')));
check('verified ones are labelled Verified only when researched', CLIENT_PROSPECTS.filter((p) => p.verificationStatus === 'Verified').every((p) => p.sources.some((s) => s.type !== 'Requires verification')));

console.log('\n[4] Analytics (§31/§33)');
const a = prospectAnalytics(CLIENT_PROSPECTS);
check('total 18', a.total === 18);
check('cameroon + cemac = total', a.cameroon + a.cemac === a.total);
check('cameroon majority (>=50%)', a.cameroon >= a.total / 2);
check('verified count matches', a.verified === CLIENT_PROSPECTS.filter((p) => p.verificationStatus === 'Verified').length);
check('topCameroon sorted by score', a.topCameroon.length >= 2 && prospectScore(a.topCameroon[0]) >= prospectScore(a.topCameroon[1]));
check('Telcar is a top Cameroon prospect', a.topCameroon.slice(0, 3).some((p) => p.id === 'PRO-01'));

console.log('\n[5] Outreach priority (§21)');
const telcar = CLIENT_PROSPECTS.find((p) => p.id === 'PRO-01')!;
console.log('  Telcar:', prospectScore(telcar), prospectClass(prospectScore(telcar)).label, '->', outreachPriority(telcar));
check('unverified prospect -> Research First', outreachPriority(CLIENT_PROSPECTS.find((p) => p.id === 'PRO-05')!) === 'Research First');

console.log(`\n${failed === 0 ? 'ALL PASSED' : 'FAILURES'} — ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
