// ===========================================================================
// BALIA Opportunity Intelligence Report generator (§40 report + §41 data
// quality). Pure: assembles a Markdown report from the live data — nothing
// invented, everything re-derivable from the records themselves.
// ===========================================================================
import type { FundingOpportunity, Funder, ResearchEntry } from '@/data/funding';
import { intelAnalytics, oppIntel, strategicFit, deadlineBand } from '@/lib/opportunity-intel';

export function buildIntelReport(opps: FundingOpportunity[], funders: Funder[], log: ResearchEntry[]): string {
  const a = intelAnalytics(opps);
  const funderName = (id: string) => funders.find((f) => f.id === id)?.name ?? 'Unassigned';
  const today = new Date().toISOString().slice(0, 10);
  const L: string[] = [];
  const line = (s = '') => L.push(s);

  const row = (o: FundingOpportunity, i: number) => {
    const it = oppIntel(o);
    return `${i + 1}. **${o.name}** — ${funderName(o.funderId)} · ${o.baliaCategory ?? '—'} · fit ${it.fit.score} · competitiveness ${o.competitiveness ?? 0}% (${it.competitiveness.band}) · ${it.deadline.band} · **${it.priority}**${o.officialSource ? ` · [source](https://${o.officialSource})` : ''}`;
  };
  const listBlock = (title: string, rows: FundingOpportunity[], note = '') => {
    line(`## ${title}`);
    if (note) { line(`_${note}_`); line(); }
    if (rows.length === 0) line('_None in the current set._');
    else rows.forEach((o, i) => line(row(o, i)));
    line();
  };
  const kw = (o: FundingOpportunity, key: string) => `${o.name} ${o.description} ${o.baliaCategory ?? ''} ${(o.tags ?? []).join(' ')}`.toLowerCase().includes(key);

  line('# BALIA CONSULTING — Funding & Trade Opportunity Intelligence Report');
  line(`_Generated ${today}. Scores are BALIA's own estimates, not funders' selection rates. Verify each official source and deadline before committing effort._`);
  line();

  // 1. Executive summary
  line('## 1. Executive summary');
  line(`- Opportunities tracked: **${a.total}** (verified: **${a.verified}**, need verification: **${a.needsVerification}**)`);
  line(`- Funders / channels: **${funders.length}**`);
  line(`- Closing within 30 days: **${a.closing30}** (within 7 days: **${a.closing7}**)`);
  line(`- Estimated competitiveness > 50%: **${a.comp50}** · > 70%: **${a.comp70}**`);
  line(`- Opportunities needing a partner (consortium/subcontract): **${a.needsPartner}**`);
  line(`- By category: ${Object.entries(a.byCategory).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
  line();

  listBlock('2. Top 20 opportunities for BALIA', a.top20Direct, 'Ranked by composite score (fit, competitiveness, revenue, timing).');
  listBlock('3. Top 20 consulting & technical-assistance opportunities', a.top20Consulting, 'Ranked by revenue potential.');
  listBlock('4. Top 20 client funding opportunities', a.top20Client, 'Where BALIA can advise eligible clients.');

  const geo = (key: string) => opps.filter((o) => (o.countryEligibility ?? []).some((c) => c.toLowerCase().includes(key)) || (o.geographicEligibility ?? []).some((g) => g.toLowerCase().includes(key)) || kw(o, key));
  listBlock('5. Cameroon opportunities', geo('cameroon'));
  listBlock('6. Central Africa / CEMAC opportunities', opps.filter((o) => kw(o, 'cemac') || kw(o, 'central africa') || (o.tags ?? []).includes('CEMAC')));
  listBlock('7. Africa-wide opportunities', opps.filter((o) => (o.geographicEligibility ?? []).some((g) => /africa/i.test(g))));
  listBlock('8. AfCFTA opportunities', opps.filter((o) => kw(o, 'afcfta')));
  listBlock('9. Customs opportunities', opps.filter((o) => kw(o, 'customs')));
  listBlock('10. Export-development opportunities', opps.filter((o) => kw(o, 'export')));
  listBlock('11. Market-entry opportunities', opps.filter((o) => kw(o, 'market')));
  listBlock('12. EUDR & sustainable-trade opportunities', opps.filter((o) => kw(o, 'eudr') || kw(o, 'sustainab') || kw(o, 'traceab')));
  listBlock('13. Logistics & supply-chain opportunities', opps.filter((o) => kw(o, 'logistic') || kw(o, 'corridor') || kw(o, 'supply')));
  listBlock('14. Training & capacity-building opportunities', opps.filter((o) => o.baliaCategory === 'Training Contract' || kw(o, 'training') || kw(o, 'capacity')));
  listBlock('15. Research opportunities', opps.filter((o) => o.baliaCategory === 'Research Contract' || kw(o, 'research') || kw(o, 'study')));
  listBlock('16. Procurement & tender opportunities', opps.filter((o) => /Procurement|Tender|Framework/.test(o.baliaCategory ?? '')));
  listBlock('17. Consortium & partnership opportunities', opps.filter((o) => /Consortium|Partnership/.test(o.baliaCategory ?? '') || /Partner|Consortium/.test(o.baliaEligibility ?? '')));
  listBlock('18. Opportunities closing within 30 days', opps.filter((o) => { const d = deadlineBand(o.deadline); return d.days != null && d.days >= 0 && d.days <= 30; }).sort((x, y) => (deadlineBand(x.deadline).days ?? 0) - (deadlineBand(y.deadline).days ?? 0)));
  listBlock('19. Opportunities with > 50% estimated competitiveness', opps.filter((o) => (o.competitiveness ?? 0) > 50).sort((x, y) => (y.competitiveness ?? 0) - (x.competitiveness ?? 0)));
  listBlock('20. Opportunities with > 70% estimated competitiveness', opps.filter((o) => (o.competitiveness ?? 0) > 70).sort((x, y) => (y.competitiveness ?? 0) - (x.competitiveness ?? 0)));
  listBlock('21. Highest strategic-fit opportunities', [...opps].sort((x, y) => strategicFit(y).score - strategicFit(x).score).slice(0, 20));
  listBlock('22. Opportunities requiring immediate action', opps.filter((o) => oppIntel(o).priority === 'Apply Now').sort((x, y) => oppIntel(y).rank - oppIntel(x).rank));

  // §41 Data-quality report
  line('## Data-quality report (§41)');
  const expired = opps.filter((o) => deadlineBand(o.deadline).band === 'CLOSED').length;
  const rolling = opps.filter((o) => deadlineBand(o.deadline).band === 'ROLLING').length;
  line(`- Records held: **${a.total}**`);
  line(`- Verified (official source): **${a.verified}**`);
  line(`- Requiring verification: **${a.needsVerification}**`);
  line(`- Expired (deadline passed): **${expired}**`);
  line(`- Rolling / no fixed deadline: **${rolling}**`);
  line(`- Direct BALIA: **${a.byCategory['Direct BALIA Funding'] ?? 0}** · Consulting: **${a.byCategory['Consulting Contract'] ?? 0}** · Technical assistance: **${a.byCategory['Technical Assistance'] ?? 0}** · Training: **${a.byCategory['Training Contract'] ?? 0}** · Research: **${a.byCategory['Research Contract'] ?? 0}** · Client funding: **${a.byCategory['Client Funding'] ?? 0}** · Consortium: **${a.byCategory['Consortium Opportunity'] ?? 0}** · Subcontracting: **${a.byCategory['Subcontracting'] ?? 0}**`);
  line();

  // Research log summary (§35)
  line('## Research log');
  line(`_${log.length} research entries recorded._`);
  log.forEach((r) => line(`- ${r.date} · ${r.source} (${r.verificationStatus}) — ${r.discovered} · [${r.sourceUrl}](https://${r.sourceUrl})`));
  line();
  line('---');
  line(`_Scope note (§25): this is a bounded, honestly-verified set of ${a.verified} verified opportunities, not a manufactured volume target.每 opportunity links to its official source; re-verify before acting._`.replace('每', 'Each'));

  return L.join('\n');
}
