// ===========================================================================
// §12 Business-development forecast — pipeline, weighted pipeline, expected
// revenue, win/loss, conversion, sales cycle, and month/quarter/year outlook.
// Pure + testable. Monetary values normalised to XAF.
// ===========================================================================
import { toXAF } from '@/lib/derive';
import type { AppState } from '@/store';

const daysBetween = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

const oppXAF = (o: { value: number; currency: string }) => toXAF(o.value, o.currency);
const inPeriod = (iso: string, start: Date, end: Date) => { const t = new Date(iso).getTime(); return t >= start.getTime() && t <= end.getTime(); };

export interface Forecast {
  pipelineValue: number; weightedPipeline: number;
  wonRevenue: number; lostRevenue: number;
  winRate: number; avgDealSize: number; salesCycleDays: number;
  proposalConversion: number; leadConversion: number;
  openCount: number; wonCount: number; lostCount: number;
  periods: { label: string; expected: number; won: number; weighted: number }[];
}

export function forecast(state: AppState, today = new Date()): Forecast {
  const opps = state.opportunities;
  const won = opps.filter((o) => o.stage === 'Won');
  const lost = opps.filter((o) => o.stage === 'Lost');
  const open = opps.filter((o) => !['Won', 'Lost'].includes(o.stage));

  const pipelineValue = open.reduce((s, o) => s + oppXAF(o), 0);
  const weightedPipeline = open.reduce((s, o) => s + oppXAF(o) * ((o.probability || 0) / 100), 0);
  const wonRevenue = won.reduce((s, o) => s + oppXAF(o), 0);
  const lostRevenue = lost.reduce((s, o) => s + oppXAF(o), 0);
  const winRate = won.length + lost.length > 0 ? won.length / (won.length + lost.length) : 0;
  const avgDealSize = won.length > 0 ? wonRevenue / won.length : 0;

  // Sales cycle: avg days from opportunity creation to expected close for won deals.
  const cycles = won.map((o) => Math.abs(daysBetween(o.created, o.expectedClose))).filter((n) => n > 0);
  const salesCycleDays = cycles.length ? Math.round(cycles.reduce((s, n) => s + n, 0) / cycles.length) : 0;

  const sentProposals = state.proposals.filter((p) => ['Sent', 'Viewed', 'Accepted', 'Rejected', 'Changes Requested'].includes(p.status));
  const acceptedProposals = state.proposals.filter((p) => p.status === 'Accepted');
  const proposalConversion = sentProposals.length ? acceptedProposals.length / sentProposals.length : 0;
  const convertedLeads = state.leads.filter((l) => l.status === 'Converted' || l.status === 'Qualified').length;
  const leadConversion = state.leads.length ? convertedLeads / state.leads.length : 0;

  // Period outlook: current month, quarter, year.
  const y = today.getFullYear(); const mo = today.getMonth();
  const mkPeriod = (label: string, start: Date, end: Date) => {
    const expected = open.filter((o) => inPeriod(o.expectedClose, start, end)).reduce((s, o) => s + oppXAF(o) * ((o.probability || 0) / 100), 0);
    const wonInP = won.filter((o) => inPeriod(o.expectedClose, start, end)).reduce((s, o) => s + oppXAF(o), 0);
    const weighted = expected + wonInP;
    return { label, expected: Math.round(expected), won: Math.round(wonInP), weighted: Math.round(weighted) };
  };
  const qStart = new Date(y, Math.floor(mo / 3) * 3, 1);
  const qEnd = new Date(y, Math.floor(mo / 3) * 3 + 3, 0, 23, 59, 59);
  const periods = [
    mkPeriod('This month', new Date(y, mo, 1), new Date(y, mo + 1, 0, 23, 59, 59)),
    mkPeriod('This quarter', qStart, qEnd),
    mkPeriod('This year', new Date(y, 0, 1), new Date(y, 11, 31, 23, 59, 59)),
  ];

  return {
    pipelineValue, weightedPipeline, wonRevenue, lostRevenue, winRate, avgDealSize, salesCycleDays,
    proposalConversion, leadConversion, openCount: open.length, wonCount: won.length, lostCount: lost.length, periods,
  };
}
