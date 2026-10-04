// ---------------------------------------------------------------------------
// Business Intelligence & Funding — derived calculations (pure logic).
//
// Three engines used across the module:
//   1. Fit-score      — 0-100 weighted score + band + strengths/gaps, with a
//                       verified-vs-assumed distinction.
//   2. Completion     — application checklist %, with a mandatory-blocking rule
//                       that prevents 100% until every mandatory item is done.
//   3. Deadline math  — days remaining/overdue + urgency band and colour tone.
//
// No React, no side effects — safe to unit-test and reuse anywhere.
// ---------------------------------------------------------------------------

import { FIT_CRITERIA, APPLICATION_REQUIREMENTS } from '@/data/funding';
import type {
  FundingOpportunity, FundingApplication, FundingRequirementState, BusinessFinding,
  Funder, FundingApplication as FApp,
} from '@/data/funding';
import { daysFromToday, parseDate } from '@/lib/derive';

// ===========================================================================
// 1. Fit-score engine
// ===========================================================================

export type FitBand = 'Poor Fit' | 'Possible Fit' | 'Good Fit' | 'Strong Fit' | 'Excellent Fit';

export interface FitCriterionResult {
  key: string; label: string; weight: number;
  value: number;        // 0-100 raw input for this criterion
  contribution: number; // weighted points contributed to the total
  verified: boolean;    // has the team actually verified this criterion?
  band: 'strength' | 'gap' | 'neutral';
}

export interface FitResult {
  score: number;             // 0-100
  band: FitBand;
  tone: 'success' | 'info' | 'warning' | 'danger';
  criteria: FitCriterionResult[];
  strengths: FitCriterionResult[];
  gaps: FitCriterionResult[];
  verifiedShare: number;     // % of weight that is verified rather than assumed
  hasUnverified: boolean;    // any criterion contributing but not verified
}

export function fitBand(score: number): FitBand {
  if (score >= 90) return 'Excellent Fit';
  if (score >= 75) return 'Strong Fit';
  if (score >= 60) return 'Good Fit';
  if (score >= 40) return 'Possible Fit';
  return 'Poor Fit';
}

export function fitTone(score: number): FitResult['tone'] {
  if (score >= 75) return 'success';
  if (score >= 60) return 'info';
  if (score >= 40) return 'warning';
  return 'danger';
}

/**
 * Compute the fit score for a funding opportunity from its per-criterion
 * inputs (0-100) and the weighted criteria definition. A criterion scoring
 * >= 75 is a strength; <= 45 is a gap; the rest are neutral. verifiedCriteria
 * marks which inputs the team has actually confirmed vs assumed.
 */
export function computeFitScore(
  inputs: Record<string, number>,
  verifiedCriteria: string[] = [],
): FitResult {
  const totalWeight = FIT_CRITERIA.reduce((s, c) => s + c.weight, 0) || 1;
  const verified = new Set(verifiedCriteria);

  const criteria: FitCriterionResult[] = FIT_CRITERIA.map((c) => {
    const value = clamp(inputs[c.key] ?? 0);
    const contribution = (value / 100) * c.weight;
    const band: FitCriterionResult['band'] = value >= 75 ? 'strength' : value <= 45 ? 'gap' : 'neutral';
    return { key: c.key, label: c.label, weight: c.weight, value, contribution, verified: verified.has(c.key), band };
  });

  const score = Math.round(criteria.reduce((s, c) => s + c.contribution, 0) / totalWeight * 100);
  const verifiedWeight = criteria.filter((c) => c.verified).reduce((s, c) => s + c.weight, 0);
  const verifiedShare = Math.round((verifiedWeight / totalWeight) * 100);

  return {
    score,
    band: fitBand(score),
    tone: fitTone(score),
    criteria,
    strengths: criteria.filter((c) => c.band === 'strength').sort((a, b) => b.contribution - a.contribution),
    gaps: criteria.filter((c) => c.band === 'gap').sort((a, b) => a.value - b.value),
    verifiedShare,
    hasUnverified: criteria.some((c) => c.value > 0 && !c.verified),
  };
}

/** Convenience wrapper straight from an opportunity record. */
export function opportunityFit(o: FundingOpportunity): FitResult {
  return computeFitScore(o.fitInputs, o.verifiedCriteria);
}

// ===========================================================================
// 2. Application completion engine
// ===========================================================================

export interface CompletionResult {
  percent: number;                 // 0-100 overall (mandatory-aware, see below)
  doneCount: number; totalCount: number;
  mandatoryDone: number; mandatoryTotal: number;
  mandatoryComplete: boolean;      // every mandatory item done?
  outstandingMandatory: { key: string; label: string }[];
  blockedAt100: boolean;           // would be 100% by raw count but mandatory gaps remain
  canSubmit: boolean;              // all mandatory done => submission allowed
}

/**
 * Completion % for an application checklist. The percentage is the share of
 * *all* items done, BUT it is capped at 99% whenever any mandatory item is
 * still outstanding — the system must never show 100% until every mandatory
 * requirement is complete (spec §6).
 */
export function applicationCompletion(
  requirements: FundingRequirementState[],
): CompletionResult {
  const defByKey = new Map(APPLICATION_REQUIREMENTS.map((r) => [r.key, r]));
  const total = requirements.length || 1;
  const doneCount = requirements.filter((r) => r.done).length;

  const mandatory = requirements.filter((r) => defByKey.get(r.key)?.mandatory);
  const mandatoryTotal = mandatory.length;
  const mandatoryDone = mandatory.filter((r) => r.done).length;
  const mandatoryComplete = mandatoryTotal === 0 || mandatoryDone === mandatoryTotal;

  const rawPercent = Math.round((doneCount / total) * 100);
  const blockedAt100 = rawPercent >= 100 && !mandatoryComplete;
  const percent = mandatoryComplete ? rawPercent : Math.min(rawPercent, 99);

  const outstandingMandatory = requirements
    .filter((r) => defByKey.get(r.key)?.mandatory && !r.done)
    .map((r) => ({ key: r.key, label: defByKey.get(r.key)?.label ?? r.key }));

  return {
    percent,
    doneCount, totalCount: requirements.length,
    mandatoryDone, mandatoryTotal,
    mandatoryComplete,
    outstandingMandatory,
    blockedAt100,
    canSubmit: mandatoryComplete,
  };
}

export function appCompletion(a: FundingApplication): CompletionResult {
  return applicationCompletion(a.requirements);
}

// ===========================================================================
// 3. Deadline engine
// ===========================================================================

export type UrgencyBand = 'Normal' | 'Attention' | 'Urgent' | 'Critical' | 'Overdue';

export interface DeadlineResult {
  daysRemaining: number;   // negative => overdue
  daysOverdue: number;     // 0 unless passed
  passed: boolean;
  urgency: UrgencyBand;
  tone: 'muted' | 'info' | 'warning' | 'danger';
  label: string;           // human phrase, e.g. "in 12 days" / "3 days overdue"
  month: string;           // e.g. "Oct 2026"
  quarter: string;         // e.g. "Q4 2026"
  /** Alert thresholds crossed today, most urgent first (spec §7). */
  alerts: string[];
}

const URGENCY_TONE: Record<UrgencyBand, DeadlineResult['tone']> = {
  Normal: 'muted', Attention: 'info', Urgent: 'warning', Critical: 'danger', Overdue: 'danger',
};

export function deadlineUrgency(daysRemaining: number): UrgencyBand {
  if (daysRemaining < 0) return 'Overdue';
  if (daysRemaining <= 6) return 'Critical';
  if (daysRemaining <= 14) return 'Urgent';
  if (daysRemaining <= 30) return 'Attention';
  return 'Normal';
}

const ALERT_THRESHOLDS = [60, 30, 14, 7, 3, 1, 0];

export function deadlineInfo(deadline?: string): DeadlineResult {
  const days = daysFromToday(deadline);
  const daysRemaining = isNaN(days) ? Infinity : days;
  const passed = daysRemaining < 0;
  const daysOverdue = passed ? Math.abs(daysRemaining) : 0;
  const urgency = isNaN(days) ? 'Normal' : deadlineUrgency(daysRemaining);

  const dt = parseDate(deadline);
  const month = dt ? `${MONTH_ABBR[dt.getMonth()]} ${dt.getFullYear()}` : '—';
  const quarter = dt ? `Q${Math.floor(dt.getMonth() / 3) + 1} ${dt.getFullYear()}` : '—';

  let label = '—';
  if (!isNaN(days)) {
    if (daysRemaining === 0) label = 'Due today';
    else if (daysRemaining === 1) label = 'Due tomorrow';
    else if (daysRemaining === -1) label = '1 day overdue';
    else if (daysRemaining < 0) label = `${daysOverdue} days overdue`;
    else label = `in ${daysRemaining} days`;
  }

  const alerts: string[] = [];
  if (!isNaN(days) && daysRemaining >= 0) {
    const crossed = ALERT_THRESHOLDS.find((t) => daysRemaining === t);
    if (crossed === 0) alerts.push('Deadline day');
    else if (crossed != null) alerts.push(`${crossed}-day notice`);
  } else if (passed) {
    alerts.push('Deadline missed');
  }

  return {
    daysRemaining: isNaN(days) ? 0 : daysRemaining,
    daysOverdue, passed, urgency, tone: URGENCY_TONE[urgency],
    label, month, quarter, alerts,
  };
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ===========================================================================
// Small helpers used by the module UI
// ===========================================================================

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

/** Does a finding/opportunity need re-verification (next date passed or missing)? */
export function needsVerification(nextVerification?: string): boolean {
  const days = daysFromToday(nextVerification);
  return isNaN(days) ? true : days <= 0;
}

/** True if an active opportunity is missing a next action — should raise an alert (spec §28). */
export function opportunityNeedsNextAction(o: FundingOpportunity): boolean {
  const closed = ['Funded', 'Rejected', 'Withdrawn', 'Expired', 'Not Eligible', 'Archived'];
  if (closed.includes(o.status)) return false;
  return !o.nextAction?.trim() || !o.nextActionDate?.trim();
}

// ---------------------------------------------------------------------------
// Pipeline scope — which opportunities belong in the active board vs. the
// separate "completed" views. An opportunity is *completed* once its
// application has been Funded or Rejected: completed opportunities leave the
// active pipeline and are viewed only through their own scope (Funded /
// Rejected / All). Pure + data-driven so it can be unit-tested and reused.
// ---------------------------------------------------------------------------

/** Terminal outcomes that remove an opportunity from the active pipeline. */
export const COMPLETED_OPP_STATUSES = ['Funded', 'Rejected'] as const;

/** The pipeline views a user can switch between. */
export type OppScope = 'active' | 'funded' | 'rejected' | 'all';

/** True once the opportunity's application is Funded or Rejected. */
export function isCompletedOpportunity(o: { status: string }): boolean {
  return (COMPLETED_OPP_STATUSES as readonly string[]).includes(o.status);
}

/** Whether an opportunity belongs in the given scope. */
export function inOppScope(o: { status: string }, scope: OppScope): boolean {
  switch (scope) {
    case 'active': return !isCompletedOpportunity(o);
    case 'funded': return o.status === 'Funded';
    case 'rejected': return o.status === 'Rejected';
    case 'all': return true;
    default: return true;
  }
}


/** True if a finding is active but has no next action (spec §28). */
export function findingNeedsNextAction(f: BusinessFinding): boolean {
  const closed = ['Converted', 'Archived', 'Dismissed', 'Dormant'];
  if (closed.includes(f.status)) return false;
  return !f.nextAction?.trim() || !f.nextActionDate?.trim();
}

// ===========================================================================
// Portfolio analytics — funding & findings KPIs and chart series
// ===========================================================================

const OPEN_OPP = ['Rejected', 'Withdrawn', 'Expired', 'Not Eligible', 'Archived'];

export interface FundingAnalytics {
  totalFunders: number; activeFunders: number;
  totalOpportunities: number; qualifiedOpportunities: number;
  applicationsInProgress: number; applicationsSubmitted: number; applicationsUnderReview: number;
  shortlisted: number;
  pipelineValue: number; fundingRequested: number; fundingSecured: number;
  successRate: number; avgFitScore: number;
  dueThisWeek: number; dueThisMonth: number; overdue: number;
  missingDocs: number; activeStrategic: number;
  // chart series
  byFunder: { name: string; value: number }[];
  byCountry: { name: string; value: number }[];
  bySector: { name: string; value: number }[];
  byType: { name: string; value: number }[];
  byStatus: { name: string; value: number }[];
  requestedVsAwarded: { name: string; Requested: number; Awarded: number }[];
  fitDistribution: { name: string; value: number }[];
  byCurrency: { name: string; value: number }[];
  pipelineFunnel: { name: string; value: number }[];
}

function tally(items: string[]): { name: string; value: number }[] {
  const m = new Map<string, number>();
  for (const i of items) if (i) m.set(i, (m.get(i) ?? 0) + 1);
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}
function sumBy(items: FundingOpportunity[], keyFn: (o: FundingOpportunity) => string): { name: string; value: number }[] {
  const m = new Map<string, number>();
  for (const o of items) { const k = keyFn(o); if (k) m.set(k, (m.get(k) ?? 0) + o.estimatedValue); }
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function fundingAnalytics(
  funders: Funder[],
  opportunities: FundingOpportunity[],
  applications: FApp[],
  appDocuments: { applicationId: string; required: boolean; status: string }[],
  outcomes: { outcome: string; amount: number }[],
): FundingAnalytics {
  const open = opportunities.filter((o) => !OPEN_OPP.includes(o.status));
  const activeFunderStatuses = ['Active Opportunity', 'Relationship Established', 'Application Submitted', 'Funded'];

  const decided = outcomes.filter((o) => o.outcome === 'Awarded' || o.outcome === 'Rejected');
  const awarded = outcomes.filter((o) => o.outcome === 'Awarded');
  const successRate = decided.length ? Math.round((awarded.length / decided.length) * 100) : 0;
  const avgFit = open.length ? Math.round(open.reduce((s, o) => s + computeFitScore(o.fitInputs, o.verifiedCriteria).score, 0) / open.length) : 0;

  const funderName = (id: string) => funders.find((f) => f.id === id)?.name ?? 'Unassigned';

  const fitBuckets = [
    { name: 'Poor (0-39)', test: (n: number) => n < 40 },
    { name: 'Possible (40-59)', test: (n: number) => n >= 40 && n < 60 },
    { name: 'Good (60-74)', test: (n: number) => n >= 60 && n < 75 },
    { name: 'Strong (75-89)', test: (n: number) => n >= 75 && n < 90 },
    { name: 'Excellent (90+)', test: (n: number) => n >= 90 },
  ];
  const scores = open.map((o) => computeFitScore(o.fitInputs, o.verifiedCriteria).score);

  return {
    totalFunders: funders.length,
    activeFunders: funders.filter((f) => activeFunderStatuses.includes(f.status)).length,
    totalOpportunities: opportunities.length,
    qualifiedOpportunities: opportunities.filter((o) => ['Qualified', 'Preparing Application', 'Application in Progress', 'Internal Review'].includes(o.status)).length,
    applicationsInProgress: applications.filter((a) => !a.submissionDate).length,
    applicationsSubmitted: applications.filter((a) => a.submissionDate).length,
    applicationsUnderReview: applications.filter((a) => ['Under Evaluation', 'Shortlisted', 'Due Diligence'].includes(a.status)).length,
    shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
    pipelineValue: open.reduce((s, o) => s + o.estimatedValue, 0),
    fundingRequested: applications.reduce((s, a) => s + a.fundingRequested, 0),
    fundingSecured: awarded.reduce((s, o) => s + o.amount, 0),
    successRate, avgFitScore: avgFit,
    dueThisWeek: open.filter((o) => { const d = daysFromToday(o.deadline); return d >= 0 && d <= 7; }).length,
    dueThisMonth: open.filter((o) => { const d = daysFromToday(o.deadline); return d >= 0 && d <= 30; }).length,
    overdue: open.filter((o) => daysFromToday(o.deadline) < 0).length,
    missingDocs: appDocuments.filter((d) => d.required && (d.status === 'Missing' || d.status === 'Requested')).length,
    activeStrategic: open.filter((o) => o.strategicValue && (o.priority === 'Critical' || o.priority === 'High')).length,
    byFunder: sumBy(open, (o) => funderName(o.funderId)),
    byCountry: sumBy(open, (o) => o.countryEligibility[0] ?? 'Multi'),
    bySector: sumBy(open, (o) => o.sectorEligibility[0] ?? 'Cross-sector'),
    byType: sumBy(open, (o) => o.oppType),
    byStatus: tally(opportunities.map((o) => o.status)),
    requestedVsAwarded: applications.map((a) => ({ name: a.projectTitle.slice(0, 18), Requested: a.fundingRequested, Awarded: a.fundingAwarded })),
    fitDistribution: fitBuckets.map((b) => ({ name: b.name, value: scores.filter(b.test).length })),
    byCurrency: sumBy(open, (o) => o.currency),
    pipelineFunnel: [
      { name: 'Identified', value: opportunities.filter((o) => ['Funder Identified', 'Opportunity Identified'].includes(o.stage)).length },
      { name: 'Eligibility', value: opportunities.filter((o) => o.stage === 'Eligibility Review').length },
      { name: 'Qualified', value: opportunities.filter((o) => o.stage === 'Qualified').length },
      { name: 'Preparing', value: opportunities.filter((o) => ['Application Preparation', 'Documents Complete'].includes(o.stage)).length },
      { name: 'Submitted', value: opportunities.filter((o) => o.stage === 'Application Submitted').length },
      { name: 'Evaluation', value: opportunities.filter((o) => ['Evaluation', 'Shortlisted', 'Due Diligence'].includes(o.stage)).length },
      { name: 'Awarded', value: opportunities.filter((o) => ['Awarded', 'Contracting', 'Funded'].includes(o.stage)).length },
    ],
  };
}

export interface FindingsAnalytics {
  total: number; needAction: number; highPriority: number; needVerification: number;
  converted: number; byCategory: { name: string; value: number }[];
  bySource: { name: string; value: number }[]; byCountry: { name: string; value: number }[];
  byType: { name: string; value: number }[];
}

export function findingsAnalytics(findings: BusinessFinding[]): FindingsAnalytics {
  return {
    total: findings.length,
    needAction: findings.filter((f) => findingNeedsNextAction(f) || f.status === 'Action Required').length,
    highPriority: findings.filter((f) => f.priority === 'Critical' || f.priority === 'High').length,
    needVerification: findings.filter((f) => needsVerification(f.nextVerification) && f.status !== 'Converted' && f.status !== 'Archived').length,
    converted: findings.filter((f) => f.status === 'Converted').length,
    byCategory: tally(findings.map((f) => f.category)),
    bySource: tally(findings.map((f) => f.source)),
    byCountry: tally(findings.map((f) => f.country)),
    byType: tally(findings.map((f) => f.type)),
  };
}
