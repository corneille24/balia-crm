import React, { useState } from 'react';
import { ShieldCheck, Download, Plus } from 'lucide-react';
import { useApp } from '@/store';
import { PageHeader, Section, Badge, Button, KpiCard, DataTable, Tabs, EmptyState, Modal, Field, Input, Textarea, Select } from '@/components/kit';
import { money, fmtDate, TODAY_ISO } from '@/lib/derive';
import { intelAnalytics, oppIntel, needsVerification, deadlineBand } from '@/lib/opportunity-intel';
import { buildIntelReport } from '@/lib/intel-report';
import type { FundingOpportunity } from '@/data/funding';

const DL_TONE: Record<string, 'danger' | 'warning' | 'info' | 'success' | 'muted'> = {
  CRITICAL: 'danger', URGENT: 'warning', ACTIVE: 'info', PLANNING: 'success', FUTURE: 'success', ROLLING: 'muted', CLOSED: 'muted',
};
const PRIORITY_TONE: Record<string, 'success' | 'info' | 'gold' | 'muted' | 'danger'> = {
  'Apply Now': 'success', Develop: 'info', Partner: 'gold', Watch: 'muted', 'Client Referral': 'info', 'Do Not Pursue': 'danger',
};

export function OpportunityIntel() {
  const { state, setModule, setFocusId } = useApp();
  const opps = state.fundingOpportunities as FundingOpportunity[];
  const a = intelAnalytics(opps);
  const [tab, setTab] = useState('direct');

  const cat = (name: string) => a.byCategory[name] ?? 0;

  const open = (id: string) => { setModule('funding-opportunities'); setFocusId(id); };

  const downloadReport = () => {
    const md = buildIntelReport(opps, state.funders, state.researchLog);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BALIA-Opportunity-Intelligence-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const columns = (valueKey: 'rank' | 'revenue' | 'client', rankPos: Map<string, number>) => [
    {
      key: 'rk', header: '#', align: 'center' as const, cell: (o: FundingOpportunity) => <span className="tnum text-muted-foreground">{rankPos.get(o.id) ?? ''}</span>,
    },
    {
      key: 'n', header: 'Opportunity', sort: (o: FundingOpportunity) => o.name, cell: (o: FundingOpportunity) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{o.name}</p>
          <p className="truncate text-[11.5px] text-muted-foreground">{state.funders.find((f) => f.id === o.funderId)?.name} · {o.baliaCategory ?? '—'}</p>
        </div>
      ),
    },
    { key: 'fit', header: 'Fit', align: 'center' as const, cell: (o: FundingOpportunity) => { const f = oppIntel(o).fit; return <Badge tone={f.tone}>{f.score}</Badge>; }, sort: (o: FundingOpportunity) => oppIntel(o).fit.score },
    { key: 'cmp', header: 'Compete', align: 'center' as const, cell: (o: FundingOpportunity) => <span className="tnum">{o.competitiveness ?? 0}%</span>, sort: (o: FundingOpportunity) => o.competitiveness ?? 0, hideBelow: 'md' as const },
    ...(valueKey === 'client'
      ? [{ key: 'cv', header: 'Client value', align: 'center' as const, cell: (o: FundingOpportunity) => <span className="tnum">{o.clientAdvisoryPotential ?? 0}</span>, sort: (o: FundingOpportunity) => o.clientAdvisoryPotential ?? 0 }]
      : valueKey === 'revenue'
        ? [{ key: 'rv', header: 'Revenue', align: 'center' as const, cell: (o: FundingOpportunity) => <span className="tnum">{o.revenuePotential ?? 0}</span>, sort: (o: FundingOpportunity) => o.revenuePotential ?? 0 }]
        : [{ key: 'v', header: 'Value', align: 'right' as const, cell: (o: FundingOpportunity) => <span className="tnum">{money(o.estimatedValue, o.currency, true)}</span>, sort: (o: FundingOpportunity) => o.estimatedValue, hideBelow: 'md' as const }]),
    { key: 'dl', header: 'Deadline', cell: (o: FundingOpportunity) => { const d = oppIntel(o).deadline; return <Badge tone={DL_TONE[d.band]}>{d.band}{d.days != null && d.days >= 0 ? ` · ${d.days}d` : ''}</Badge>; }, hideBelow: 'lg' as const },
    { key: 'pr', header: 'Action', cell: (o: FundingOpportunity) => { const p = oppIntel(o).priority; return <Badge tone={PRIORITY_TONE[p]}>{p}</Badge>; } },
  ];

  const lists: Record<string, { rows: FundingOpportunity[]; valueKey: 'rank' | 'revenue' | 'client'; empty: string }> = {
    direct: { rows: a.top20Direct, valueKey: 'rank', empty: 'No direct BALIA opportunities yet.' },
    consulting: { rows: a.top20Consulting, valueKey: 'revenue', empty: 'No consulting / technical-assistance opportunities yet.' },
    client: { rows: a.top20Client, valueKey: 'client', empty: 'No client funding opportunities yet.' },
  };
  const active = lists[tab];

  return (
    <div className="enter-up">
      <PageHeader
        title="Opportunity Intelligence"
        subtitle="Where BALIA can realistically win business, obtain funding, deliver services, partner, or help clients access funding — scored by strategic fit, competitiveness and revenue, not treated as a generic grant list."
        actions={<Button variant="outline" onClick={downloadReport}><Download className="size-3.5" />Download report</Button>}
        meta={<>
          <Badge tone="forest" dot>{a.total} opportunities</Badge>
          <Badge tone="success" dot>{a.verified} verified</Badge>
          {a.needsVerification > 0 && <Badge tone="gold" dot>{a.needsVerification} need verification</Badge>}
        </>} />

      <div className="mb-3 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <KpiCard label="Verified opportunities" value={String(a.verified)} tone="success" sub={`of ${a.total} total`} onClick={() => setModule('funding-opportunities')} />
        <KpiCard label="Closing ≤ 30 days" value={String(a.closing30)} tone={a.closing30 ? 'warning' : undefined} sub={`${a.closing7} within 7 days`} onClick={() => setModule('funding-opportunities')} />
        <KpiCard label="Competitiveness > 50%" value={String(a.comp50)} sub={`${a.comp70} above 70%`} />
        <KpiCard label="Need a partner" value={String(a.needsPartner)} sub="consortium / subcontract" />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2.5 md:grid-cols-6">
        <KpiCard dense label="Direct" value={String(cat('Direct BALIA Funding'))} />
        <KpiCard dense label="Consulting" value={String(cat('Consulting Contract'))} />
        <KpiCard dense label="Tech. assist." value={String(cat('Technical Assistance'))} />
        <KpiCard dense label="Training" value={String(cat('Training Contract'))} />
        <KpiCard dense label="Research" value={String(cat('Research Contract'))} />
        <KpiCard dense label="Procurement" value={String(cat('Procurement / Tender'))} />
        <KpiCard dense label="Consortium" value={String(cat('Consortium Opportunity'))} />
        <KpiCard dense label="Subcontracting" value={String(cat('Subcontracting'))} />
        <KpiCard dense label="Partnership" value={String(cat('Partnership'))} />
        <KpiCard dense label="Client funding" value={String(cat('Client Funding'))} />
        <KpiCard dense label="Open" value={String(a.open)} />
        <KpiCard dense label="Rolling" value={String(a.rolling)} />
      </div>

      <Tabs tabs={[
        { id: 'direct', label: `Top 20 · Direct BALIA (${a.top20Direct.length})` },
        { id: 'consulting', label: `Top 20 · Consulting & TA (${a.top20Consulting.length})` },
        { id: 'client', label: `Top 20 · Client funding (${a.top20Client.length})` },
        { id: 'audit', label: `Data audit (${a.needsVerification})` },
        { id: 'research', label: `Research log (${state.researchLog.length})` },
      ]} active={tab} onChange={setTab} />

      {tab === 'audit' ? <AuditView opps={opps} onOpen={open} />
        : tab === 'research' ? <ResearchLogView />
        : (
      <Section flush>
        {active.rows.length === 0 ? (
          <EmptyState title="Nothing here yet" detail={active.empty} />
        ) : (
          <DataTable rows={active.rows} onRowClick={(o) => open(o.id)} columns={columns(active.valueKey, new Map(active.rows.map((o, i) => [o.id, i + 1])))} />
        )}
      </Section>
      )}

      <p className="mt-3 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-px size-3.5 shrink-0" />
        Scores are computed from each opportunity's recorded strategic-fit factors, competitiveness estimate and revenue potential. Competitiveness is BALIA's estimated position, not the funder's official selection rate. Always confirm the official source and deadline before committing effort.
      </p>
    </div>
  );
}

// §34 — Existing-records audit: verification state + data-quality flags.
function AuditView({ opps, onOpen }: { opps: FundingOpportunity[]; onOpen: (id: string) => void }) {
  const nameCounts: Record<string, number> = {};
  for (const o of opps) nameCounts[o.name.trim().toLowerCase()] = (nameCounts[o.name.trim().toLowerCase()] ?? 0) + 1;

  const flagsFor = (o: FundingOpportunity) => {
    const f: string[] = [];
    const dl = deadlineBand(o.deadline);
    if (dl.band === 'CLOSED') f.push('Expired');
    if (!o.baliaCategory) f.push('Unclassified');
    if (needsVerification(o)) f.push('Needs verification');
    if (o.urlStatus === 'Broken Link') f.push('Broken link');
    if (nameCounts[o.name.trim().toLowerCase()] > 1) f.push('Possible duplicate');
    return f;
  };

  const verified = opps.filter((o) => o.urlStatus === 'Verified' || o.verificationStatus === 'Verified').length;
  const needV = opps.filter(needsVerification).length;
  const expired = opps.filter((o) => deadlineBand(o.deadline).band === 'CLOSED').length;
  const unclassified = opps.filter((o) => !o.baliaCategory).length;
  const dupes = Object.values(nameCounts).filter((n) => n > 1).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-5">
        <KpiCard dense label="Verified" value={String(verified)} tone="success" />
        <KpiCard dense label="Need verification" value={String(needV)} tone={needV ? 'warning' : undefined} />
        <KpiCard dense label="Expired" value={String(expired)} tone={expired ? 'danger' : undefined} />
        <KpiCard dense label="Unclassified" value={String(unclassified)} />
        <KpiCard dense label="Duplicate names" value={String(dupes)} />
      </div>
      <Section flush>
        <DataTable rows={opps} onRowClick={(o) => onOpen(o.id)} columns={[
          { key: 'n', header: 'Opportunity', sort: (o) => o.name, cell: (o) => <span className="font-medium">{o.name}</span> },
          { key: 'u', header: 'URL status', cell: (o) => <Badge tone={o.urlStatus === 'Verified' ? 'success' : o.urlStatus === 'Broken Link' ? 'danger' : 'gold'}>{o.urlStatus ?? 'Requires Verification'}</Badge> },
          { key: 'sc', header: 'Source conf.', align: 'center', cell: (o) => <span className="tnum">{o.sourceConfidence ?? 0}</span>, sort: (o) => o.sourceConfidence ?? 0, hideBelow: 'md' },
          { key: 'lv', header: 'Last verified', cell: (o) => (o.lastVerified ? fmtDate(o.lastVerified) : '—'), hideBelow: 'lg' },
          { key: 'nv', header: 'Re-verify', cell: (o) => (o.nextVerification ? fmtDate(o.nextVerification) : '—'), hideBelow: 'lg' },
          { key: 'fl', header: 'Flags', cell: (o) => { const f = flagsFor(o); return f.length ? <div className="flex flex-wrap gap-1">{f.map((x) => <Badge key={x} tone={x === 'Expired' || x === 'Broken link' ? 'danger' : 'gold'}>{x}</Badge>)}</div> : <Badge tone="success">OK</Badge>; } },
        ]} />
      </Section>
      <p className="text-[11.5px] text-muted-foreground">Duplicate detection is by opportunity name. Verification is a human action — open a record and use the BALIA intel tab to record URL status and source confidence. This build cannot auto-crawl URLs.</p>
    </div>
  );
}

// §35 — Research log view + add-entry.
const RESEARCH_CATEGORIES = [
  'Consulting & Technical Assistance', 'Trade facilitation / tenders', 'AfCFTA / technical assistance',
  'Cameroon national procurement', 'Client funding / women exporters', 'EU external aid / consortium',
  'Partnership / co-financing', 'Procurement portal', 'Customs', 'Export development', 'Other',
];

function ResearchLogView() {
  const { state, can } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const rows = [...state.researchLog].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] text-muted-foreground">An auditable record of each intelligence-research update — researcher, source, what was verified and the evidence.</p>
        {can('record.edit') && <Button onClick={() => setAddOpen(true)}><Plus className="size-3.5" />Log entry</Button>}
      </div>
      <Section flush>
        {rows.length === 0 ? <EmptyState title="No research logged yet" detail="Log an entry whenever you verify or add an opportunity." /> : (
          <DataTable rows={rows} columns={[
            { key: 'd', header: 'Date', cell: (r) => fmtDate(r.date), sort: (r) => r.date },
            { key: 's', header: 'Source', cell: (r) => <div className="min-w-0"><p className="truncate font-medium">{r.source}</p><a href={`https://${r.sourceUrl}`} target="_blank" rel="noreferrer" className="truncate text-[11.5px] text-forest hover:underline">{r.sourceUrl}</a></div> },
            { key: 'c', header: 'Category', cell: (r) => <Badge tone="muted">{r.category}</Badge>, hideBelow: 'md' },
            { key: 'o', header: 'Discovered / confirmed', cell: (r) => r.discovered, hideBelow: 'lg' },
            { key: 'v', header: 'Status', cell: (r) => <Badge tone={r.verificationStatus === 'Verified' ? 'success' : 'gold'}>{r.verificationStatus}</Badge> },
            { key: 'n', header: 'Notes', cell: (r) => <span className="text-[12px] text-muted-foreground">{r.notes}</span>, hideBelow: 'lg' },
          ]} />
        )}
      </Section>
      <AddResearchModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function AddResearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch, user, toast } = useApp();
  const blank = { source: '', sourceUrl: '', category: RESEARCH_CATEGORIES[0], discovered: '', verificationStatus: 'Verified', changes: '', evidence: '', notes: '' };
  const [form, setForm] = useState(blank);
  const create = () => {
    if (!form.source.trim() || !form.sourceUrl.trim()) return;
    const id = `RL-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    dispatch({ type: 'add', collection: 'researchLog', record: { id, researcher: user.id, date: TODAY_ISO, ...form } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Research log entry', record: id, detail: form.source } });
    toast('Research entry logged.', 'success');
    setForm(blank);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Log research entry" width="max-w-lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Log entry</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Source / funder"><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g. African Development Bank" /></Field>
        <Field label="Category"><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{RESEARCH_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Official source URL" className="sm:col-span-2"><Input value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="afdb.org/..." /></Field>
        <Field label="Verification status"><Select value={form.verificationStatus} onChange={(e) => setForm({ ...form, verificationStatus: e.target.value })}>{['Verified', 'Requires Verification', 'Unverified'].map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Discovered / confirmed"><Input value={form.discovered} onChange={(e) => setForm({ ...form, discovered: e.target.value })} placeholder="Opportunity name / ID" /></Field>
        <Field label="Changes made" className="sm:col-span-2"><Input value={form.changes} onChange={(e) => setForm({ ...form, changes: e.target.value })} /></Field>
        <Field label="Evidence" className="sm:col-span-2"><Input value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} placeholder="What confirmed it on the official page" /></Field>
        <Field label="Notes" className="sm:col-span-2"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}
