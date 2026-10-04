// ===========================================================================
// BALIA — Cameroon & CEMAC Client Pipeline Report (§37 report + §39 output).
// Pure: assembled from the live prospect records — nothing invented.
// ===========================================================================
import type { ClientProspect } from '@/data/prospects';
import { prospectScore, prospectIntel, prospectAnalytics, hasDecisionMaker, hasVerifiedEmail } from '@/lib/prospect-intel';

export function buildProspectReport(list: ClientProspect[]): string {
  const a = prospectAnalytics(list);
  const today = new Date().toISOString().slice(0, 10);
  const L: string[] = [];
  const line = (s = '') => L.push(s);

  const row = (p: ClientProspect, i: number) => {
    const it = prospectIntel(p);
    const dm = p.contacts.find((c) => c.name);
    return `${i + 1}. **${p.name}** — ${p.city}, ${p.country} · ${p.segment} · score ${prospectScore(p)} (${it.classification.label}) · conversion ${p.conversionProbability}% · **${it.outreach}** · fit: ${(p.services || []).slice(0, 3).join(', ')}${dm ? ` · contact: ${dm.name} (${dm.title || dm.role})` : ` · target: ${p.contacts[0]?.role || 'decision-maker'}`}${p.verificationStatus !== 'Verified' ? ' · _requires verification_' : ''}`;
  };
  const block = (title: string, rows: ClientProspect[], note = '') => {
    line(`## ${title}`);
    if (note) { line(`_${note}_`); line(); }
    if (rows.length === 0) line('_None in the current set._');
    else rows.forEach((p, i) => line(row(p, i)));
    line();
  };
  const byScore = (x: ClientProspect, y: ClientProspect) => prospectScore(y) - prospectScore(x);

  line('# BALIA CONSULTING — Cameroon & CEMAC Client Pipeline Report');
  line(`_Generated ${today}. Real companies with public, company-level contact points and roles-to-target; individual emails are never guessed. Verify a named decision-maker and current trigger before outreach._`);
  line();

  line('## Executive summary');
  line(`- Prospects: **${a.total}** (Cameroon **${a.cameroon}**, other CEMAC **${a.cemac}**)`);
  line(`- Verified against a source: **${a.verified}** · requiring verification: **${a.total - a.verified}**`);
  line(`- Hot **${a.hot}** · High potential **${a.high}** · Qualified **${a.qualified}**`);
  line(`- With an identified decision-maker: **${a.withDecisionMaker}** · with a verified email: **${a.withEmail}**`);
  line(`- With a current business trigger: **${a.withTrigger}** · to contact now: **${a.needFollowUp}**`);
  line(`- Top sectors: ${Object.entries(a.bySegment).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
  line(`- Top service fits: ${Object.entries(a.byService).sort((x, y) => y[1] - x[1]).slice(0, 6).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
  const converted = list.filter((p) => p.addedToCrm).length;
  line(`- Converted to CRM leads: **${converted}**`);
  line();

  // §39 outputs
  block('A. Top 50 BALIA prospects (by score)', [...list].sort(byScore).slice(0, 50));
  block('B. Top 50 by conversion probability', [...list].sort((x, y) => (y.conversionProbability ?? 0) - (x.conversionProbability ?? 0)).slice(0, 50));
  const rank = { '$100,000+': 5, '$50,000–$100,000': 4, '$15,000–$50,000': 3, '$5,000–$15,000': 2, '<$5,000': 1 } as Record<string, number>;
  block('C. Top 50 by commercial potential', [...list].sort((x, y) => (rank[y.commercialPotential] ?? 0) - (rank[x.commercialPotential] ?? 0) || byScore(x, y)).slice(0, 50), 'Ordered by estimated relationship value band, then score. Unknown bands rank last.');
  block('D. Top prospects by "Why now?" (current trigger)', list.filter((p) => !!p.trigger && !/no current trigger/i.test(p.whyNow || '')).sort(byScore));
  block('E. Cameroon master prospect list', list.filter((p) => p.country === 'Cameroon').sort(byScore));
  block('F. CEMAC master prospect list (outside Cameroon)', list.filter((p) => p.country !== 'Cameroon').sort(byScore));

  line('## Prospects requiring immediate contact');
  a.contactNow.forEach((p, i) => line(row(p, i)));
  line();
  line('## Prospects requiring further research');
  list.filter((p) => prospectIntel(p).outreach === 'Research First').sort(byScore).forEach((p, i) => line(row(p, i)));
  line();

  line('---');
  line(`_Data-quality: ${a.verified}/${a.total} verified; ${list.filter(hasDecisionMaker).length} with a named/high-confidence contact; ${list.filter(hasVerifiedEmail).length} with a verified email. This is a bounded, honestly-verified starter set — extend it with further research passes rather than padding it._`);

  return L.join('\n');
}
