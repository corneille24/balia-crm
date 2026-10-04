// ===========================================================================
// §7 Proposal profitability — revenue, cost, gross profit, margin and
// probability-weighted figures for a proposal. Pure + testable.
// Revenue comes from the proposal's service line items; cost and consultant
// days are captured on the proposal (optional fields); win probability comes
// from the linked opportunity (falling back to a status-based estimate).
// ===========================================================================
import type { Proposal, Opportunity } from '@/data/seed';

const STATUS_PROB: Record<string, number> = { Draft: 30, Sent: 45, Viewed: 55, 'Changes Requested': 50, Accepted: 100, Rejected: 0 };

export interface Profitability {
  revenue: number; discountAmt: number; netRevenue: number; taxAmt: number;
  cost: number; grossProfit: number; marginPct: number;
  consultantDays: number; avgDailyRevenue: number;
  winProbability: number; expectedRevenue: number; expectedProfit: number;
  costKnown: boolean;
}

export function proposalProfitability(p: Proposal, opp?: Opportunity | null): Profitability {
  const revenue = (p.services || []).reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0);
  const discountAmt = revenue * ((Number(p.discount) || 0) / 100);
  const netRevenue = revenue - discountAmt;
  const taxAmt = netRevenue * ((Number(p.tax) || 0) / 100);

  const consultantDays = Number((p as { consultantDays?: number }).consultantDays) || 0;
  const costKnown = (p as { estimatedCost?: number }).estimatedCost != null;
  const cost = Number((p as { estimatedCost?: number }).estimatedCost) || 0;

  const grossProfit = netRevenue - cost;
  const marginPct = netRevenue > 0 ? grossProfit / netRevenue : 0;
  const avgDailyRevenue = consultantDays > 0 ? netRevenue / consultantDays : 0;

  const winProbability = opp?.probability != null ? opp.probability : (STATUS_PROB[p.status] ?? 40);
  const expectedRevenue = netRevenue * (winProbability / 100);
  const expectedProfit = grossProfit * (winProbability / 100);

  return { revenue, discountAmt, netRevenue, taxAmt, cost, grossProfit, marginPct, consultantDays, avgDailyRevenue, winProbability, expectedRevenue, expectedProfit, costKnown };
}
