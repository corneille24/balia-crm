// ===========================================================================
// BALIA Opportunity Intelligence — pure scoring engines (§18–§32).
//
// These layer on top of the existing funding model. They are deliberately
// pure and data-driven so they can be unit-tested and reused by the
// dashboards and the AI intent. Nothing here fetches, invents, or verifies
// data — verification is a human action recorded on the record.
// ===========================================================================
import type { FundingOpportunity } from '@/data/funding';
import { daysFromToday } from '@/lib/derive';

// --- §18 Strategic fit: nine weighted factors, weights sum to 100 ----------
export interface FitFactorDef { key: string; label: string; weight: number }
export const BALIA_FIT_FACTORS: FitFactorDef[] = [
  { key: 'trade', label: 'Trade alignment', weight: 20 },
  { key: 'customs', label: 'Customs / compliance alignment', weight: 15 },
  { key: 'export', label: 'Export / market-access alignment', weight: 15 },
  { key: 'geo', label: 'Geographic alignment', weight: 10 },
  { key: 'eligibility', label: 'Applicant eligibility', weight: 10 },
  { key: 'revenue', label: 'Consulting / revenue potential', weight: 10 },
  { key: 'capability', label: 'BALIA capability alignment', weight: 10 },
  { key: 'brand', label: 'Strategic brand value', weight: 5 },
  { key: 'timing', label: 'Timing', weight: 5 },
];
const FIT_WEIGHT_TOTAL = BALIA_FIT_FACTORS.reduce((s, f) => s + f.weight, 0);

export type FitTone = 'success' | 'info' | 'warning' | 'danger';
export interface StrategicFit {
  score: number;                 // 0-100
  band: string;
  tone: FitTone;
  factors: { key: string; label: string; weight: number; value: number; contribution: number }[];
  strengths: string[];
  gaps: string[];
}

export function fitBand(score: number): string {
  if (score >= 90) return 'Exceptional';
  if (score >= 80) return 'High priority';
  if (score >= 70) return 'Strong';
  if (score >= 60) return 'Watchlist';
  if (score >= 40) return 'Low priority';
  return 'Do not pursue';
}
function fitTone(score: number): FitTone {
  if (score >= 70) return 'success';
  if (score >= 60) return 'info';
  if (score >= 40) return 'warning';
  return 'danger';
}

export function strategicFit(o: Pick<FundingOpportunity, 'fitFactors'>): StrategicFit {
  const inputs = o.fitFactors ?? {};
  const factors = BALIA_FIT_FACTORS.map((f) => {
    const value = Math.max(0, Math.min(100, Number(inputs[f.key]) || 0));
    return { key: f.key, label: f.label, weight: f.weight, value, contribution: (value / 100) * f.weight };
  });
  const score = Math.round((factors.reduce((s, f) => s + f.contribution, 0) / FIT_WEIGHT_TOTAL) * 100);
  return {
    score, band: fitBand(score), tone: fitTone(score), factors,
    strengths: factors.filter((f) => f.value >= 75).map((f) => f.label),
    gaps: factors.filter((f) => f.value <= 40).map((f) => f.label),
  };
}

// --- §20 Competitiveness bands ---------------------------------------------
export function competitivenessBand(pct: number): string {
  if (pct <= 10) return 'Very Low';
  if (pct <= 20) return 'Low';
  if (pct <= 35) return 'Moderate-Low';
  if (pct <= 50) return 'Moderate';
  if (pct <= 65) return 'Good';
  if (pct <= 80) return 'Strong';
  if (pct <= 90) return 'Very Strong';
  return 'Exceptional';
}

// --- §27 Deadline intelligence ---------------------------------------------
export type DeadlineBand = 'CRITICAL' | 'URGENT' | 'ACTIVE' | 'PLANNING' | 'FUTURE' | 'ROLLING' | 'CLOSED';
export interface DeadlineIntel { band: DeadlineBand; days: number | null; tone: FitTone }
export function deadlineBand(deadline?: string): DeadlineIntel {
  if (!deadline) return { band: 'ROLLING', days: null, tone: 'info' };
  const days = daysFromToday(deadline);
  if (days < 0) return { band: 'CLOSED', days, tone: 'danger' };
  if (days <= 7) return { band: 'CRITICAL', days, tone: 'danger' };
  if (days <= 21) return { band: 'URGENT', days, tone: 'warning' };
  if (days <= 60) return { band: 'ACTIVE', days, tone: 'info' };
  if (days <= 180) return { band: 'PLANNING', days, tone: 'success' };
  return { band: 'FUTURE', days, tone: 'success' };
}

// --- §32 Source confidence bands -------------------------------------------
export function sourceConfidenceBand(score: number): string {
  if (score >= 100) return 'Official application portal';
  if (score >= 90) return 'Official funder page';
  if (score >= 80) return 'Official institution source';
  if (score >= 60) return 'Reputable secondary source';
  if (score >= 40) return 'Third-party source';
  if (score >= 20) return 'Uncorroborated listing';
  return 'Unverifiable';
}

// --- Categories helpers -----------------------------------------------------
const CONSULTING_CATEGORIES = [
  'Consulting Contract', 'Technical Assistance', 'Training Contract', 'Research Contract',
  'Procurement / Tender', 'Framework Agreement',
];
const PARTNER_ELIGIBILITY = ['Eligible with Partner', 'Eligible as Consortium Member', 'Eligible as Subcontractor'];
const OPEN_STATUSES = ['Researching', 'Identified', 'Under Review', 'Qualified', 'Preparing Application',
  'Application in Progress', 'Internal Review', 'Submitted', 'Under Evaluation', 'Shortlisted',
  'Interview/Due Diligence', 'On Hold'];

export function isConsultingOpportunity(o: FundingOpportunity): boolean {
  return CONSULTING_CATEGORIES.includes(o.baliaCategory ?? '');
}
export function isClientOpportunity(o: FundingOpportunity): boolean {
  return o.baliaCategory === 'Client Funding' || o.baliaEligibility === 'Client Opportunity';
}
export function isVerified(o: FundingOpportunity): boolean {
  return o.urlStatus === 'Verified' || o.verificationStatus === 'Verified';
}
export function needsVerification(o: FundingOpportunity): boolean {
  return o.urlStatus === 'Requires Verification' || o.urlStatus === 'Broken Link'
    || o.urlStatus === 'Unverified' || (o.urlStatus == null && o.verificationStatus !== 'Verified');
}

// --- §23 Application priority (derived) -------------------------------------
export function applicationPriority(o: FundingOpportunity): string {
  const fit = strategicFit(o).score;
  const elig = o.baliaEligibility ?? 'Unclear';
  const dl = deadlineBand(o.deadline).band;
  if (elig === 'Not Eligible' || fit < 40) return 'Do Not Pursue';
  if (isClientOpportunity(o)) return 'Client Referral';
  if (PARTNER_ELIGIBILITY.includes(elig)) return 'Partner';
  const open = OPEN_STATUSES.includes(o.status);
  if (fit >= 60 && open && ['CRITICAL', 'URGENT', 'ACTIVE', 'ROLLING'].includes(dl)) return 'Apply Now';
  if (fit >= 55) return 'Develop';
  return 'Watch';
}

// Composite rank for the Top-20 lists (§29): relevance + eligibility +
// probability + revenue + strategic value + timing.
export function rankScore(o: FundingOpportunity): number {
  const fit = strategicFit(o).score;
  const comp = o.competitiveness ?? 40;
  const rev = o.revenuePotential ?? 0;
  const dl = deadlineBand(o.deadline);
  const timing = dl.band === 'ACTIVE' || dl.band === 'URGENT' ? 100 : dl.band === 'CRITICAL' ? 90 : dl.band === 'PLANNING' || dl.band === 'ROLLING' ? 70 : dl.band === 'FUTURE' ? 50 : 0;
  return Math.round(fit * 0.4 + comp * 0.25 + rev * 0.2 + timing * 0.15);
}

// --- Per-record aggregate ---------------------------------------------------
export interface OppIntel {
  fit: StrategicFit;
  deadline: DeadlineIntel;
  priority: string;
  competitiveness: { score: number; band: string; confidence: string };
  revenuePotential: number;
  clientAdvisoryPotential: number;
  sourceConfidence: { score: number; band: string };
  urlStatus: string;
  rank: number;
}
export function oppIntel(o: FundingOpportunity): OppIntel {
  const comp = o.competitiveness ?? 0;
  const sc = o.sourceConfidence ?? 0;
  return {
    fit: strategicFit(o),
    deadline: deadlineBand(o.deadline),
    priority: applicationPriority(o),
    competitiveness: { score: comp, band: competitivenessBand(comp), confidence: o.competitivenessConfidence ?? 'Low' },
    revenuePotential: o.revenuePotential ?? 0,
    clientAdvisoryPotential: o.clientAdvisoryPotential ?? 0,
    sourceConfidence: { score: sc, band: sourceConfidenceBand(sc) },
    urlStatus: o.urlStatus ?? 'Requires Verification',
    rank: rankScore(o),
  };
}

// --- §28 Dashboard analytics + §29–§31 Top-20 lists ------------------------
export interface IntelAnalytics {
  total: number;
  verified: number;
  byCategory: Record<string, number>;
  open: number; rolling: number; upcoming: number;
  closing7: number; closing30: number; closing90: number;
  comp50: number; comp70: number;
  needsPartner: number; needsVerification: number;
  highestValue: FundingOpportunity[];
  top20Direct: FundingOpportunity[];
  top20Consulting: FundingOpportunity[];
  top20Client: FundingOpportunity[];
}

export function intelAnalytics(opportunities: FundingOpportunity[]): IntelAnalytics {
  const byCategory: Record<string, number> = {};
  for (const o of opportunities) {
    const c = o.baliaCategory ?? 'Uncategorised';
    byCategory[c] = (byCategory[c] ?? 0) + 1;
  }
  const closingWithin = (n: number) => opportunities.filter((o) => {
    const d = deadlineBand(o.deadline);
    return d.days != null && d.days >= 0 && d.days <= n;
  }).length;

  const direct = opportunities.filter((o) => !isClientOpportunity(o) && (o.baliaEligibility ?? '') !== 'Not Eligible');
  const consulting = opportunities.filter(isConsultingOpportunity);
  const client = opportunities.filter(isClientOpportunity);
  const byRank = (a: FundingOpportunity, b: FundingOpportunity) => rankScore(b) - rankScore(a);
  const byRevenue = (a: FundingOpportunity, b: FundingOpportunity) => (b.revenuePotential ?? 0) - (a.revenuePotential ?? 0) || byRank(a, b);
  const byClientValue = (a: FundingOpportunity, b: FundingOpportunity) => (b.clientAdvisoryPotential ?? 0) - (a.clientAdvisoryPotential ?? 0);

  return {
    total: opportunities.length,
    verified: opportunities.filter(isVerified).length,
    byCategory,
    open: opportunities.filter((o) => OPEN_STATUSES.includes(o.status)).length,
    rolling: opportunities.filter((o) => deadlineBand(o.deadline).band === 'ROLLING').length,
    upcoming: opportunities.filter((o) => { const d = deadlineBand(o.deadline); return d.days != null && d.days > 0; }).length,
    closing7: closingWithin(7), closing30: closingWithin(30), closing90: closingWithin(90),
    comp50: opportunities.filter((o) => (o.competitiveness ?? 0) > 50).length,
    comp70: opportunities.filter((o) => (o.competitiveness ?? 0) > 70).length,
    needsPartner: opportunities.filter((o) => PARTNER_ELIGIBILITY.includes(o.baliaEligibility ?? '')).length,
    needsVerification: opportunities.filter(needsVerification).length,
    highestValue: [...opportunities].sort((a, b) => b.estimatedValue - a.estimatedValue).slice(0, 20),
    top20Direct: [...direct].sort(byRank).slice(0, 20),
    top20Consulting: [...consulting].sort(byRevenue).slice(0, 20),
    top20Client: [...client].sort(byClientValue).slice(0, 20),
  };
}
