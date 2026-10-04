import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, Flame, ArrowRight, Download, Building2 } from 'lucide-react';
import { useApp } from '@/store';
import {
  PageHeader, Section, Badge, Button, DataTable, Drawer, Toolbar,
  SearchInput, Select, KpiCard, EmptyState, Tabs, Stat, Avatar,
} from '@/components/kit';
import { cn } from '@/lib/utils';
import { TODAY_ISO, addDays } from '@/lib/derive';
import {
  prospectIntel, prospectScore, scoreBreakdown, prospectAnalytics, prospectClass,
} from '@/lib/prospect-intel';
import { buildProspectReport } from '@/lib/prospect-report';
import { PROSPECT_SEGMENTS, CEMAC_COUNTRIES } from '@/data/prospects';
import type { ClientProspect } from '@/data/prospects';

const OUTREACH_TONE: Record<string, 'success' | 'info' | 'gold' | 'muted' | 'danger'> = {
  'Contact Now': 'success', 'Research First': 'info', Nurture: 'gold', Partnership: 'info', Watch: 'muted', 'Do Not Pursue': 'danger',
};
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

// Promote a prospect into the CRM (dedup-aware): create/link a Company, add a
// Contact when a real name is known, create a Lead + follow-up task, and mark
// the prospect converted. Returns the companyId, or null if already promoted.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function promoteProspect(p: ClientProspect, state: any, dispatch: any, userId: string): string | null {
  if (p.addedToCrm) return null;
  const existing = state.companies.find((c: any) => c.tradingName.toLowerCase() === p.name.toLowerCase() || (!!p.website && c.website && c.website.toLowerCase().includes(p.website.toLowerCase())));
  let companyId = p.companyId || existing?.id;
  if (!companyId) {
    companyId = rid('CMP');
    dispatch({ type: 'add', collection: 'companies', record: {
      id: companyId, legalName: p.legalName || p.name, tradingName: p.name, regNumber: '',
      country: p.country, city: p.city, address: p.headquarters || '', website: p.website || '',
      industry: p.industry, size: p.size || 'Medium', employees: 0, turnover: '',
      products: p.products ? [p.products] : [], currentMarkets: [], targetMarkets: p.exportMarkets || [], interests: p.services || [],
      owner: p.owner, status: 'Prospect', health: 'Healthy', tags: ['Prospect intelligence'],
      since: TODAY_ISO, notes: p.whyBalia, currency: 'XAF',
    } });
  }
  const named = p.contacts.find((c) => c.name);
  const contactName = named?.name || '—';
  if (named?.name) {
    const [firstName, ...rest] = named.name.split(' ');
    dispatch({ type: 'add', collection: 'contacts', record: {
      id: rid('CON'), companyId, firstName, lastName: rest.join(' ') || '', position: named.title || named.role, type: 'Executive',
      department: '', email: named.email || '', phone: named.phone || '', decisionMaker: true,
      preferred: 'Email', notes: `From prospect intelligence (${named.confidence} confidence). ${named.source || ''}`, tags: [],
    } });
  }
  const leadId = rid('LED');
  const score = prospectScore(p);
  dispatch({ type: 'add', collection: 'leads', record: {
    id: leadId, companyName: p.name, contactName, email: '', phone: p.generalPhone || '',
    country: p.country, city: p.city, website: p.website || '', industry: p.industry, companySize: p.size || 'Medium',
    source: 'Prospect Intelligence', serviceInterest: p.services?.[0] || 'International Trade Advisory',
    targetMarket: (p.exportMarkets || [])[0] || '', currentMarket: p.country, exportExperience: '',
    estimatedBudget: 0, currency: 'XAF', value: 0, scoreFlags: [], owner: p.owner, status: 'New',
    priority: score >= 75 ? 'High' : 'Medium', created: TODAY_ISO, lastContact: '', nextFollowUp: addDays(TODAY_ISO, 7),
    notes: `${p.whyBalia}\n\nWhy now: ${p.whyNow}`, tags: ['Prospect intelligence'], campaign: '', companyId,
  } });
  dispatch({ type: 'add', collection: 'tasks', record: {
    id: rid('TSK'), name: `Qualify ${p.name}`,
    description: `Outreach to ${p.name} (${prospectIntel(p).outreach}). Target: ${p.contacts[0]?.role || 'decision-maker'}. ${p.whyNow}`,
    companyId, assignee: p.owner, priority: score >= 75 ? 'High' : 'Medium',
    due: addDays(TODAY_ISO, 7), status: 'To Do', estimatedHours: 1, actualHours: 0, checklist: [], comments: [],
  } });
  dispatch({ type: 'patch', collection: 'prospects', id: p.id, changes: { addedToCrm: true, companyId } });
  dispatch({ type: 'audit', entry: { user: userId, action: 'Prospect added to CRM', record: p.id, detail: `${p.name} → company ${companyId} + lead + task` } });
  return companyId;
}

export function ClientProspects() {
  const { state, dispatch, user, focusId, setFocusId, can, toast } = useApp();
  const all = state.prospects as ClientProspect[];
  const a = prospectAnalytics(all);
  const pending = all.filter((p) => !p.addedToCrm).length;
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [segment, setSegment] = useState('');

  const downloadReport = () => {
    const md = buildProspectReport(all);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BALIA-Client-Pipeline-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const addAllToCrm = () => {
    const todo = all.filter((p) => !p.addedToCrm);
    if (todo.length === 0) { toast('All prospects are already in the CRM.', 'info'); return; }
    let n = 0;
    for (const p of todo) { if (promoteProspect(p, state, dispatch, user.id)) n += 1; }
    dispatch({ type: 'notify', note: { category: 'Sales', title: 'Prospects added to CRM', detail: `${n} companies + leads created`, tone: 'success', link: { module: 'companies' } } });
    toast(`${n} prospects added to Companies as leads with follow-up tasks.`, 'success');
  };

  const base = tab === 'cameroon' ? a.topCameroon : tab === 'cemac' ? a.topCemac
    : tab === 'contact' ? a.contactNow : tab === 'conversion' ? a.topConversion : all;
  const rows = base.filter((p) => {
    if (q && !`${p.name} ${p.industry} ${p.city} ${p.segment} ${(p.services || []).join(' ')}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (country && p.country !== country) return false;
    if (segment && p.segment !== segment) return false;
    return true;
  }).sort((x, y) => prospectScore(y) - prospectScore(x));

  return (
    <div className="enter-up">
      <PageHeader
        title="Client Prospect Intelligence"
        subtitle="Real Cameroon & CEMAC organisations with a credible commercial need for BALIA — scored on service fit, trade exposure and current triggers, with the decision-maker role to target and the evidence behind every entry."
        actions={<div className="flex items-center gap-2">
          {can('record.edit') && pending > 0 && <Button onClick={addAllToCrm}><Building2 className="size-3.5" />Add all to CRM ({pending})</Button>}
          <Button variant="outline" onClick={downloadReport}><Download className="size-3.5" />Download pipeline report</Button>
        </div>}
        meta={<>
          <Badge tone="forest" dot>{a.total} prospects</Badge>
          <Badge tone="success" dot>{a.cameroon} Cameroon</Badge>
          <Badge tone="gold" dot>{a.needFollowUp} to contact now</Badge>
        </>} />

      <div className="mb-3 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <KpiCard label="Contact now" value={String(a.needFollowUp)} tone={a.needFollowUp ? 'success' : undefined} sub="strong fit + trigger + DM" onClick={() => setTab('contact')} />
        <KpiCard label="Hot / High potential" value={String(a.hot + a.high)} sub={`${a.hot} hot · ${a.high} high`} />
        <KpiCard label="Verified" value={String(a.verified)} tone="success" sub={`of ${a.total}`} />
        <KpiCard label="With a current trigger" value={String(a.withTrigger)} />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2.5 md:grid-cols-6">
        <KpiCard dense label="Cameroon" value={String(a.cameroon)} />
        <KpiCard dense label="CEMAC (other)" value={String(a.cemac)} />
        <KpiCard dense label="Exporters" value={String(a.bySegment['Exporter'] ?? 0)} />
        <KpiCard dense label="Importers" value={String(a.bySegment['Importer'] ?? 0)} />
        <KpiCard dense label="Manufacturers" value={String(a.bySegment['Manufacturer'] ?? 0)} />
        <KpiCard dense label="Logistics" value={String(a.bySegment['Logistics / Freight'] ?? 0)} />
        <KpiCard dense label="Agribusiness" value={String(a.bySegment['Agribusiness'] ?? 0)} />
        <KpiCard dense label="With decision-maker" value={String(a.withDecisionMaker)} />
        <KpiCard dense label="EUDR service fit" value={String(a.byService['EUDR Advisory'] ?? 0)} />
        <KpiCard dense label="Customs fit" value={String(a.byService['Customs Advisory'] ?? 0)} />
        <KpiCard dense label="Export dev. fit" value={String(a.byService['Export Development'] ?? 0)} />
        <KpiCard dense label="Requires verification" value={String(a.total - a.verified)} />
      </div>

      <Tabs tabs={[
        { id: 'all', label: `All (${all.length})` },
        { id: 'cameroon', label: `Top Cameroon (${a.topCameroon.length})` },
        { id: 'cemac', label: `Top CEMAC (${a.topCemac.length})` },
        { id: 'contact', label: `Contact now (${a.contactNow.length})` },
        { id: 'conversion', label: 'By conversion' },
      ]} active={tab} onChange={setTab} />

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search prospects…" className="w-full sm:w-56" />
        <Select value={country} onChange={(e) => setCountry(e.target.value)} className="w-auto"><option value="">All countries</option>{CEMAC_COUNTRIES.map((c) => <option key={c}>{c}</option>)}</Select>
        <Select value={segment} onChange={(e) => setSegment(e.target.value)} className="w-auto"><option value="">All segments</option>{PROSPECT_SEGMENTS.map((s) => <option key={s}>{s}</option>)}</Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} of {all.length}</span>
      </Toolbar>

      <Section flush>
        {rows.length === 0 ? <EmptyState title="No prospects match" detail="Clear the search or filters." /> : (
          <DataTable rows={rows} onRowClick={(p) => setFocusId(p.id)} columns={[
            {
              key: 'n', header: 'Company', sort: (p) => p.name, cell: (p) => (
                <div className="flex items-center gap-2.5">
                  <Avatar size="sm" name={p.name} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="truncate text-[11.5px] text-muted-foreground">{p.city}, {p.country} · {p.industry}</p>
                  </div>
                </div>
              ),
            },
            { key: 'seg', header: 'Segment', cell: (p) => p.segment, hideBelow: 'lg' },
            { key: 'sc', header: 'Score', align: 'center', cell: (p) => { const c = prospectClass(prospectScore(p)); return <Badge tone={c.tone}>{prospectScore(p)}</Badge>; }, sort: (p) => prospectScore(p) },
            { key: 'cl', header: 'Class', cell: (p) => prospectClass(prospectScore(p)).label, hideBelow: 'md' },
            { key: 'cv', header: 'Convert', align: 'center', cell: (p) => <span className="tnum">{p.conversionProbability}%</span>, sort: (p) => p.conversionProbability, hideBelow: 'md' },
            { key: 'v', header: 'Verified', align: 'center', cell: (p) => p.verificationStatus === 'Verified' ? <ShieldCheck className="mx-auto size-4 text-forest" /> : <span className="text-[11px] text-muted-foreground">check</span>, hideBelow: 'lg' },
            { key: 'o', header: 'Action', cell: (p) => { const o = prospectIntel(p).outreach; return <Badge tone={OUTREACH_TONE[o]}>{o}</Badge>; } },
          ]} />
        )}
      </Section>

      {focusId && all.some((p) => p.id === focusId) && <ProspectDrawer prospectId={focusId} onClose={() => setFocusId(null)} />}
    </div>
  );
}

function ProspectDrawer({ prospectId, onClose }: { prospectId: string; onClose: () => void }) {
  const { state, dispatch, user, users, can, toast, setModule } = useApp();
  const p = (state.prospects as ClientProspect[]).find((x) => x.id === prospectId)!;
  const intel = prospectIntel(p);
  const bars = scoreBreakdown(p);
  const existing = state.companies.find((c) => c.tradingName.toLowerCase() === p.name.toLowerCase() || (!!p.website && c.website && c.website.toLowerCase().includes(p.website.toLowerCase())));

  const addToCrm = () => {
    promoteProspect(p, state, dispatch, user.id);
    toast(`${p.name} added to the CRM as a lead with a follow-up task.`, 'success');
  };

  return (
    <Drawer open onClose={onClose} width="max-w-3xl" title={p.name}
      subtitle={<span className="flex flex-wrap items-center gap-2"><Badge tone={intel.classification.tone}>{prospectScore(p)} · {intel.classification.label}</Badge><Badge tone={OUTREACH_TONE[intel.outreach]}>{intel.outreach}</Badge>{p.verificationStatus !== 'Verified' && <Badge tone="gold">Requires verification</Badge>}</span>}
      footer={can('record.edit') && (p.addedToCrm
        ? <Button variant="outline" onClick={() => setModule('companies', p.companyId)}>View in CRM<ArrowRight className="size-3.5" /></Button>
        : <Button onClick={addToCrm}>{existing ? 'Link to existing company + create lead' : 'Add to CRM'}</Button>)}>
      <div className="space-y-5">
        <p className="prose-editorial text-[13px]">{p.description}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="panel-flat border-l-forest/50 bg-forest-soft/30 p-3.5">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.055em] text-forest">Why BALIA?</p>
            <p className="text-[12.5px] leading-relaxed">{p.whyBalia}</p>
          </div>
          <div className="panel-flat border-l-gold/50 bg-gold-soft/30 p-3.5">
            <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.055em] text-gold-dark"><Flame className="size-3" />Why now?</p>
            <p className="text-[12.5px] leading-relaxed">{p.whyNow}</p>
            {p.trigger && <p className="mt-1.5 text-[11px] text-muted-foreground">Trigger: {p.trigger}{p.triggerSource ? ` · ${p.triggerSource}` : ''}</p>}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Best-fit BALIA services</p>
          <div className="flex flex-wrap gap-1.5">{(p.services || []).map((s) => <Badge key={s} tone="forest">{s}</Badge>)}</div>
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Prospect score — §17</p>
            <span className="text-[12px] text-muted-foreground">Conversion {p.conversionProbability}% ({intel.conversion.band}, {intel.conversion.confidence})</span>
          </div>
          <div className="space-y-1.5">
            {bars.map((b) => (
              <div key={b.key} className="flex items-center gap-2">
                <span className="w-52 shrink-0 text-[12px] text-muted-foreground">{b.label} <span className="opacity-60">·{b.weight}</span></span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"><div className={cn('h-full rounded-full', b.value >= 75 ? 'bg-forest' : b.value >= 45 ? 'bg-gold' : 'bg-danger/70')} style={{ width: `${b.value}%` }} /></div>
                <span className="tnum w-9 text-right text-[12px]">{b.value}</span>
              </div>
            ))}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          <Stat label="Segment" value={p.segment} />
          <Stat label="Commercial potential" value={p.commercialPotential} />
          <Stat label="Employees" value={p.employees || '—'} />
          <Stat label="HQ" value={p.headquarters || `${p.city}, ${p.country}`} />
          <Stat label="Parent" value={p.parent || '—'} />
          <Stat label="Ownership" value={p.ownership || '—'} />
          <Stat label="Export markets" value={(p.exportMarkets || []).join(', ') || '—'} />
          <Stat label="Import markets" value={(p.importMarkets || []).join(', ') || '—'} />
          <Stat label="Owner" value={users.find((u) => u.id === p.owner)?.name || p.owner} />
        </dl>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Decision-makers to target (§22)</p>
          <div className="space-y-2">
            {p.contacts.map((c, i) => (
              <div key={i} className="panel-flat flex flex-wrap items-center gap-x-3 gap-y-1 p-2.5 text-[12.5px]">
                <span className="font-medium">{c.name || c.role}</span>
                {c.name && <span className="text-muted-foreground">{c.title || c.role}</span>}
                <Badge tone={c.confidence === 'Verified' ? 'success' : c.confidence === 'High' ? 'info' : c.confidence === 'Medium' ? 'gold' : 'muted'}>{c.confidence}</Badge>
                {c.email && <a href={`mailto:${c.email}`} className="text-forest hover:underline">{c.email}</a>}
                {c.source && <span className="w-full text-[11px] text-muted-foreground">{c.source}</span>}
              </div>
            ))}
            {(p.generalPhone || p.website) && (
              <p className="text-[11.5px] text-muted-foreground">Company contact: {p.generalPhone && <span>{p.generalPhone} · </span>}{p.website && <a href={`https://${p.website}`} target="_blank" rel="noreferrer" className="text-forest hover:underline">{p.website}<ExternalLink className="ml-0.5 inline size-3" /></a>}</p>
            )}
            <p className="text-[11px] text-muted-foreground">Individual emails are left blank unless published on an official source — never guessed (§14).</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Sources (§16)</p>
          <ul className="space-y-1 text-[12px]">
            {p.sources.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <Badge tone="muted">{s.type}</Badge>
                {s.url ? <a href={`https://${s.url}`} target="_blank" rel="noreferrer" className="truncate text-forest hover:underline">{s.name}<ExternalLink className="ml-0.5 inline size-3" /></a> : <span>{s.name}</span>}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted-foreground">Researched {p.researchDate} · last verified {p.lastVerified}{intel.freshness ? ` · ${intel.freshness.label}` : ''}</p>
        </div>
      </div>
    </Drawer>
  );
}
