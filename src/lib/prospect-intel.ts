// ===========================================================================
// BALIA Client Prospect Intelligence — pure scoring engines (§17–§21, §36).
// ===========================================================================
import type { ClientProspect } from '@/data/prospects';
import { daysFromToday } from '@/lib/derive';

// §17 weights (sum 100).
export interface ScoreFactor { key: string; label: string; weight: number }
export const PROSPECT_FACTORS: ScoreFactor[] = [
  { key: 'serviceFit', label: 'BALIA service fit', weight: 20 },
  { key: 'tradeExposure', label: 'International trade exposure', weight: 15 },
  { key: 'trigger', label: 'Current business trigger', weight: 15 },
  { key: 'geoFit', label: 'Cameroon / CEMAC strategic fit', weight: 10 },
  { key: 'capacity', label: 'Commercial capacity', weight: 10 },
  { key: 'decisionMaker', label: 'Decision-maker identified', weight: 10 },
  { key: 'growth', label: 'Growth potential', weight: 10 },
  { key: 'accessibility', label: 'Accessibility', weight: 5 },
  { key: 'strategic', label: 'Strategic value', weight: 5 },
];
const WEIGHT_TOTAL = PROSPECT_FACTORS.reduce((s, f) => s + f.weight, 0);

export type Tone = 'success' | 'info' | 'warning' | 'danger' | 'muted';

export function prospectScore(p: Pick<ClientProspect, 'scoreInputs'>): number {
  const inp = p.scoreInputs ?? {};
  const total = PROSPECT_FACTORS.reduce((s, f) => s + (Math.max(0, Math.min(100, Number(inp[f.key]) || 0)) / 100) * f.weight, 0);
  return Math.round((total / WEIGHT_TOTAL) * 100);
}
export function scoreBreakdown(p: ClientProspect) {
  const inp = p.scoreInputs ?? {};
  return PROSPECT_FACTORS.map((f) => ({ ...f, value: Math.max(0, Math.min(100, Number(inp[f.key]) || 0)) }));
}

// §18 classification.
export function prospectClass(score: number): { label: string; tone: Tone } {
  if (score >= 90) return { label: 'Hot / Priority', tone: 'danger' };
  if (score >= 75) return { label: 'High Potential', tone: 'success' };
  if (score >= 60) return { label: 'Qualified', tone: 'info' };
  if (score >= 40) return { label: 'Nurture', tone: 'warning' };
  return { label: 'Low Priority', tone: 'muted' };
}

// §19 conversion band.
export function conversionBand(pct: number): string {
  if (pct <= 10) return 'Very Low';
  if (pct <= 20) return 'Low';
  if (pct <= 35) return 'Moderate-Low';
  if (pct <= 50) return 'Moderate';
  if (pct <= 65) return 'Good';
  if (pct <= 80) return 'Strong';
  if (pct <= 90) return 'Very Strong';
  return 'Exceptional';
}

// §21 outreach priority (derived).
export function outreachPriority(p: ClientProspect): string {
  const score = prospectScore(p);
  const hasTrigger = !!p.trigger && !/no current trigger/i.test(p.whyNow || '');
  const hasDM = p.contacts?.some((c) => c.confidence === 'Verified' || c.confidence === 'High' || !!c.name);
  if (score < 40) return 'Do Not Pursue';
  if (p.segment === 'Institutional client') return 'Partnership';
  if (score >= 75 && hasTrigger && hasDM) return 'Contact Now';
  if (score >= 75 && hasTrigger) return 'Contact Now';
  if (p.verificationStatus !== 'Verified' || !hasDM) return 'Research First';
  if (!hasTrigger) return 'Nurture';
  return 'Research First';
}

// §36 data freshness.
export function freshness(p: ClientProspect): { label: string; tone: Tone } | null {
  const days = -daysFromToday(p.lastVerified); // days since last verified
  if (days >= 365) return { label: 'Research required', tone: 'danger' };
  if (days >= 180) return { label: 'Stale', tone: 'warning' };
  if (days >= 90) return { label: 'Re-verify', tone: 'warning' };
  return null;
}

export function isCameroon(p: ClientProspect): boolean { return p.country === 'Cameroon'; }
export function isVerified(p: ClientProspect): boolean { return p.verificationStatus === 'Verified'; }
export function hasDecisionMaker(p: ClientProspect): boolean {
  return !!p.contacts?.some((c) => !!c.name || c.confidence === 'Verified' || c.confidence === 'High');
}
export function hasVerifiedEmail(p: ClientProspect): boolean {
  return !!p.generalEmail?.trim() || !!p.contacts?.some((c) => !!c.email?.trim() && (c.confidence === 'Verified' || c.confidence === 'High'));
}

export interface ProspectIntel {
  score: number; classification: { label: string; tone: Tone };
  conversion: { pct: number; band: string; confidence: string };
  outreach: string; freshness: { label: string; tone: Tone } | null;
}
export function prospectIntel(p: ClientProspect): ProspectIntel {
  const score = prospectScore(p);
  return {
    score, classification: prospectClass(score),
    conversion: { pct: p.conversionProbability ?? 0, band: conversionBand(p.conversionProbability ?? 0), confidence: p.conversionConfidence ?? 'Low' },
    outreach: outreachPriority(p), freshness: freshness(p),
  };
}

// §31 dashboard analytics + §33 top views.
export interface ProspectAnalytics {
  total: number; cameroon: number; cemac: number; verified: number;
  hot: number; high: number; qualified: number;
  withDecisionMaker: number; withEmail: number; withTrigger: number; needFollowUp: number;
  bySegment: Record<string, number>; byCountry: Record<string, number>; byService: Record<string, number>;
  topCameroon: ClientProspect[]; topCemac: ClientProspect[]; topConversion: ClientProspect[]; contactNow: ClientProspect[];
}
export function prospectAnalytics(list: ClientProspect[]): ProspectAnalytics {
  const bySegment: Record<string, number> = {}; const byCountry: Record<string, number> = {}; const byService: Record<string, number> = {};
  for (const p of list) {
    bySegment[p.segment] = (bySegment[p.segment] ?? 0) + 1;
    byCountry[p.country] = (byCountry[p.country] ?? 0) + 1;
    for (const s of p.services ?? []) byService[s] = (byService[s] ?? 0) + 1;
  }
  const byScore = (a: ClientProspect, b: ClientProspect) => prospectScore(b) - prospectScore(a);
  const byConv = (a: ClientProspect, b: ClientProspect) => (b.conversionProbability ?? 0) - (a.conversionProbability ?? 0);
  const cameroon = list.filter(isCameroon);
  const cemac = list.filter((p) => p.country !== 'Cameroon');
  return {
    total: list.length,
    cameroon: cameroon.length, cemac: cemac.length,
    verified: list.filter(isVerified).length,
    hot: list.filter((p) => prospectScore(p) >= 90).length,
    high: list.filter((p) => { const s = prospectScore(p); return s >= 75 && s < 90; }).length,
    qualified: list.filter((p) => { const s = prospectScore(p); return s >= 60 && s < 75; }).length,
    withDecisionMaker: list.filter(hasDecisionMaker).length,
    withEmail: list.filter(hasVerifiedEmail).length,
    withTrigger: list.filter((p) => !!p.trigger && !/no current trigger/i.test(p.whyNow || '')).length,
    needFollowUp: list.filter((p) => outreachPriority(p) === 'Contact Now').length,
    bySegment, byCountry, byService,
    topCameroon: [...cameroon].sort(byScore).slice(0, 20),
    topCemac: [...cemac].sort(byScore).slice(0, 20),
    topConversion: [...list].sort(byConv).slice(0, 20),
    contactNow: list.filter((p) => outreachPriority(p) === 'Contact Now').sort(byScore),
  };
}
