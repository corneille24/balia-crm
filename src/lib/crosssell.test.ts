/* eslint-disable no-console */
// npx tsx --tsconfig tsconfig.app.json src/lib/crosssell.test.ts
import { crossSellFor, purchasedServiceIds, topCrossSell, crossSellValue } from '@/lib/crosssell';
import { initialState } from '@/store';

let passed = 0; let failed = 0;
const check = (n: string, c: boolean) => { if (c) { passed++; console.log(`  \u2713 ${n}`); } else { failed++; console.error(`  \u2717 ${n}`); } };

console.log('\n[1] Purchased services from example data');
// Telcar (CMP-EX1) has EUDR project SVC-10 + won opp SVC-10 + accepted proposal SVC-10
const telcar = purchasedServiceIds('CMP-EX1', initialState);
check('Telcar shows SVC-10 as purchased', telcar.includes('SVC-10'));

console.log('\n[2] Cross-sell recommendations');
const recs = crossSellFor('CMP-EX1', initialState);
check('Telcar (Regulatory/EUDR) gets recommendations', recs.length > 0);
check('recommendations exclude already-purchased SVC-10', recs.every((r) => r.serviceId !== 'SVC-10'));
check('each rec has a reason and value', recs.every((r) => !!r.reason && r.valueXAF >= 0));
check('recs sorted by value desc', recs.length < 2 || recs[0].valueXAF >= recs[1].valueXAF);
console.log('   Telcar recs:', recs.map((r) => `${r.name} (${Math.round(r.valueXAF / 1000)}k)`).join(', '));

console.log('\n[3] No purchases -> no recs');
check('a lead-only company with no won services gets none', crossSellFor('CMP-EX7', initialState).length === 0 || purchasedServiceIds('CMP-EX7', initialState).length > 0);

console.log('\n[4] Top cross-sell across clients');
const top = topCrossSell(initialState);
check('top cross-sell returns client expansion list', top.length >= 1);
check('sorted by total value desc', top.length < 2 || top[0].totalValueXAF >= top[1].totalValueXAF);
check('crossSellValue matches sum', top.length === 0 || crossSellValue(top[0].companyId, initialState) === top[0].totalValueXAF);
console.log('   Top:', top.slice(0, 3).map((t) => `${t.companyName} (${Math.round(t.totalValueXAF / 1000)}k, ${t.recs.length} svcs)`).join(' · '));

console.log(`\n${failed === 0 ? 'ALL PASSED' : 'FAILURES'} — ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
