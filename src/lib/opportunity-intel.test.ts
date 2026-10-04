/* eslint-disable no-console */
// ---------------------------------------------------------------------------
// BALIA opportunity-intelligence engine tests (§18–§32).
// Run: npx tsx --tsconfig tsconfig.app.json src/lib/opportunity-intel.test.ts
// ---------------------------------------------------------------------------
import {
  strategicFit, fitBand, competitivenessBand, deadlineBand, sourceConfidenceBand,
  applicationPriority, rankScore, intelAnalytics, BALIA_FIT_FACTORS,
} from '@/lib/opportunity-intel';
import { TODAY_ISO, addDays } from '@/lib/derive';

let passed = 0; let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) { passed++; console.log(`  \u2713 ${name}`); }
  else { failed++; console.error(`  \u2717 ${name}`); }
}
// Minimal opportunity factory — only fields the engine reads.
const mk = (o: Record<string, unknown>) => ({
  id: 'X', name: 'X', funderId: 'F', programName: '', oppType: 'Grant', description: '',
  amount: 0, minAmount: 0, maxAmount: 0, currency: 'XAF', fundingDuration: '', openingDate: TODAY_ISO,
  deadline: '', geographicEligibility: [], countryEligibility: [], sectorEligibility: [],
  businessEligibility: '', companyStage: '', revenueRequirement: '', employeeRequirement: '', projectRequirement: '',
  matchingFundsRequired: false, coFinancingRequired: false, matchingPercent: 0, applicationFee: 0,
  applicationUrl: '', officialSource: '', contactPerson: '', contactEmail: '', requiredDocuments: [], evaluationCriteria: [],
  priority: 'Medium', estimatedValue: 0, strategicValue: '', probability: 0, owner: 'USR-01', team: [],
  status: 'Identified', stage: 'Opportunity Identified', fitInputs: {}, verifiedCriteria: [],
  nextAction: '', nextActionDate: '', notes: '', tags: [], discovered: TODAY_ISO, lastVerified: TODAY_ISO,
  nextVerification: TODAY_ISO, verificationStatus: 'Needs Verification', verifiedBy: '', created: TODAY_ISO, updated: TODAY_ISO,
  ...o,
}) as never;

console.log('\n[1] Strategic fit (§18 weights sum to 100)');
check('nine factors, weights total 100', BALIA_FIT_FACTORS.length === 9 && BALIA_FIT_FACTORS.reduce((s, f) => s + f.weight, 0) === 100);
check('all-100 inputs -> 100', strategicFit(mk({ fitFactors: Object.fromEntries(BALIA_FIT_FACTORS.map((f) => [f.key, 100])) })).score === 100);
check('empty inputs -> 0, Do not pursue', (() => { const r = strategicFit(mk({})); return r.score === 0 && r.band === 'Do not pursue'; })());
// Weighted check: only trade=100 (weight 20) -> 20
check('trade-only (w20) -> 20', strategicFit(mk({ fitFactors: { trade: 100 } })).score === 20);

console.log('\n[2] Bands');
check('fitBand 90 -> Exceptional', fitBand(90) === 'Exceptional');
check('competitiveness 75 -> Strong', competitivenessBand(75) === 'Strong');
check('competitiveness 95 -> Exceptional', competitivenessBand(95) === 'Exceptional');
check('source 100 -> official portal', sourceConfidenceBand(100) === 'Official application portal');
check('source 45 -> third-party', sourceConfidenceBand(45) === 'Third-party source');

console.log('\n[3] Deadline intelligence (§27)');
check('no deadline -> ROLLING', deadlineBand(undefined).band === 'ROLLING');
check('+5 days -> CRITICAL', deadlineBand(addDays(TODAY_ISO, 5)).band === 'CRITICAL');
check('+15 days -> URGENT', deadlineBand(addDays(TODAY_ISO, 15)).band === 'URGENT');
check('+45 days -> ACTIVE', deadlineBand(addDays(TODAY_ISO, 45)).band === 'ACTIVE');
check('+120 days -> PLANNING', deadlineBand(addDays(TODAY_ISO, 120)).band === 'PLANNING');
check('+300 days -> FUTURE', deadlineBand(addDays(TODAY_ISO, 300)).band === 'FUTURE');
check('past -> CLOSED', deadlineBand(addDays(TODAY_ISO, -3)).band === 'CLOSED');

console.log('\n[4] Application priority (§23)');
const strong = { fitFactors: Object.fromEntries(BALIA_FIT_FACTORS.map((f) => [f.key, 90])), baliaEligibility: 'Directly Eligible', status: 'Qualified', deadline: addDays(TODAY_ISO, 30) };
check('strong+eligible+open+active -> Apply Now', applicationPriority(mk(strong)) === 'Apply Now');
check('not eligible -> Do Not Pursue', applicationPriority(mk({ ...strong, baliaEligibility: 'Not Eligible' })) === 'Do Not Pursue');
check('partner eligibility -> Partner', applicationPriority(mk({ ...strong, baliaEligibility: 'Eligible with Partner' })) === 'Partner');
check('client funding -> Client Referral', applicationPriority(mk({ ...strong, baliaCategory: 'Client Funding' })) === 'Client Referral');
check('weak fit -> Do Not Pursue', applicationPriority(mk({ fitFactors: { trade: 20 }, baliaEligibility: 'Unclear' })) === 'Do Not Pursue');

console.log('\n[5] Analytics + Top-20 (§28–§31)');
const opps = [
  mk({ id: 'A', baliaCategory: 'Consulting Contract', baliaEligibility: 'Directly Eligible', urlStatus: 'Verified', competitiveness: 72, revenuePotential: 80, estimatedValue: 50000000, deadline: addDays(TODAY_ISO, 20), fitFactors: { trade: 90, customs: 80, export: 70, geo: 80, eligibility: 90, revenue: 80, capability: 80, brand: 60, timing: 80 } }),
  mk({ id: 'B', baliaCategory: 'Client Funding', baliaEligibility: 'Client Opportunity', urlStatus: 'Requires Verification', clientAdvisoryPotential: 88, estimatedValue: 10000000, deadline: addDays(TODAY_ISO, 80) }),
  mk({ id: 'C', baliaCategory: 'Technical Assistance', baliaEligibility: 'Eligible with Partner', urlStatus: 'Verified', competitiveness: 55, revenuePotential: 60, estimatedValue: 30000000, deadline: '' }),
];
const a = intelAnalytics(opps);
check('total 3', a.total === 3);
check('verified 2', a.verified === 2);
check('consulting bucket has A and C', a.top20Consulting.some((o) => o.id === 'A') && a.top20Consulting.some((o) => o.id === 'C'));
check('client bucket has B only', a.top20Client.length === 1 && a.top20Client[0].id === 'B');
check('closing within 30 counts A', a.closing30 === 1);
check('comp>50 is 2 (A,C)', a.comp50 === 2);
check('needsPartner counts C', a.needsPartner === 1);
check('needsVerification counts B', a.needsVerification === 1);
check('rolling counts C', a.rolling === 1);
check('highest value leads with A', a.highestValue[0].id === 'A');
check('rankScore A > C', rankScore(opps[0]) > rankScore(opps[2]));

console.log(`\n${failed === 0 ? 'ALL PASSED' : 'FAILURES'} — ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
