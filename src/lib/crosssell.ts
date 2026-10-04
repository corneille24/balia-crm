// ===========================================================================
// §11 Cross-sell / upsell intelligence — recommend complementary BALIA
// services based on what a client already engages, with an estimated value.
// Pure and testable; reads services actually purchased (won opportunities,
// projects, accepted proposals).
// ===========================================================================
import { SERVICES } from '@/data/catalog';
import { toXAF } from '@/lib/derive';
import type { AppState } from '@/store';

// Category-level affinity (spec §11 logic). If a client has services in the
// key category, recommend services from the value categories.
const AFFINITY: Record<string, string[]> = {
  'Customs & Trade': ['Regulatory Compliance', 'Export Readiness', 'Market Entry', 'Training'],
  'Export Readiness': ['Market Entry', 'Regulatory Compliance', 'Customs & Trade'],
  AfCFTA: ['Market Entry', 'Customs & Trade', 'Export Readiness'],
  'Market Entry': ['Customs & Trade', 'Export Readiness', 'Regulatory Compliance'],
  'Regulatory Compliance': ['Customs & Trade', 'Export Readiness', 'Training'],
  Training: ['Customs & Trade', 'AfCFTA', 'Export Readiness'],
};

const svc = (id: string) => SERVICES.find((s) => s.id === id);
const svcValueXAF = (id: string) => { const s = svc(id); return s ? toXAF(s.price, s.currency) : 0; };

// Services a company has actually engaged (won opps + projects + accepted proposals).
export function purchasedServiceIds(companyId: string, state: AppState): string[] {
  const ids = new Set<string>();
  state.opportunities.forEach((o) => { if (o.companyId === companyId && o.stage === 'Won' && o.serviceId) ids.add(o.serviceId); });
  state.projects.forEach((p) => { if (p.companyId === companyId && p.serviceId) ids.add(p.serviceId); });
  state.proposals.forEach((p) => {
    if (p.companyId === companyId && p.status === 'Accepted') (p.services || []).forEach((s) => { if (s.serviceId) ids.add(s.serviceId); });
  });
  return [...ids];
}

export interface CrossSellRec { serviceId: string; name: string; category: string; valueXAF: number; reason: string }

// Recommended complementary services for one company (not already purchased).
export function crossSellFor(companyId: string, state: AppState): CrossSellRec[] {
  const purchased = purchasedServiceIds(companyId, state);
  if (purchased.length === 0) return [];
  const purchasedCats = new Set(purchased.map((id) => svc(id)?.category).filter(Boolean) as string[]);
  const wantCats = new Set<string>();
  purchasedCats.forEach((c) => (AFFINITY[c] || []).forEach((w) => { if (!purchasedCats.has(w)) wantCats.add(w); }));
  const recs: CrossSellRec[] = [];
  const seen = new Set(purchased);
  SERVICES.forEach((s) => {
    if (seen.has(s.id) || !wantCats.has(s.category)) return;
    const drivenBy = [...purchasedCats].find((c) => (AFFINITY[c] || []).includes(s.category));
    recs.push({ serviceId: s.id, name: s.name, category: s.category, valueXAF: svcValueXAF(s.id), reason: `Clients engaging ${drivenBy} often need ${s.category}` });
  });
  return recs.sort((a, b) => b.valueXAF - a.valueXAF);
}

export function crossSellValue(companyId: string, state: AppState): number {
  return crossSellFor(companyId, state).reduce((sum, r) => sum + r.valueXAF, 0);
}

export interface CompanyCrossSell { companyId: string; companyName: string; recs: CrossSellRec[]; totalValueXAF: number }

// Top expansion opportunities across all client/active companies.
export function topCrossSell(state: AppState): CompanyCrossSell[] {
  return state.companies
    .map((c) => { const recs = crossSellFor(c.id, state); return { companyId: c.id, companyName: c.tradingName, recs, totalValueXAF: recs.reduce((s, r) => s + r.valueXAF, 0) }; })
    .filter((x) => x.recs.length > 0)
    .sort((a, b) => b.totalValueXAF - a.totalValueXAF);
}
