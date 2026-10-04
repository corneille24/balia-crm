import React, { useState } from 'react';
import {
  Lightbulb, ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, Link2,
  ExternalLink, Plus,
} from 'lucide-react';
import { useApp } from '@/store';
import {
  PageHeader, Section, Badge, Button, StatusBadge, DataTable, Drawer, Toolbar,
  SearchInput, Select, Stat, Avatar, Tabs, Modal, Field, Input, Textarea,
} from '@/components/kit';
import { money, fmtDate, relativeDays, TODAY_ISO, addDays } from '@/lib/derive';
import { needsVerification, findingNeedsNextAction } from '@/lib/funding';
import {
  FINDING_TYPES, FINDING_CATEGORIES, FINDING_STATUSES, PRIORITIES,
  RESEARCH_SOURCE_TYPES, STRATEGIC_IMPORTANCE, CONFIDENCE_LEVELS,
} from '@/data/funding';
import { cn } from '@/lib/utils';

// Where each converted record lives, for the "view" link.
const CONVERT_TARGET_MODULE: Record<string, string> = {
  funder: 'funders', funding_opportunity: 'funding-opportunities', lead: 'leads',
  opportunity: 'opportunities', task: 'tasks', consultation: 'consultations',
};
const CONVERT_TARGET_LABEL: Record<string, string> = {
  funder: 'Funder', funding_opportunity: 'Funding opportunity', lead: 'Lead',
  opportunity: 'Opportunity', task: 'Task', consultation: 'Consultation',
};

const CONVERT_OPTIONS: { target: 'lead' | 'opportunity' | 'funder' | 'funding_opportunity' | 'task' | 'consultation'; label: string; hint: string }[] = [
  { target: 'funding_opportunity', label: 'Funding opportunity', hint: 'Track through the funding pipeline' },
  { target: 'funder', label: 'Funder', hint: 'Add to the funder database' },
  { target: 'opportunity', label: 'Sales opportunity', hint: 'Add to the sales pipeline' },
  { target: 'lead', label: 'Lead', hint: 'Add to the leads list' },
  { target: 'consultation', label: 'Consultation', hint: 'Schedule a discovery consultation' },
  { target: 'task', label: 'Task', hint: 'Create a follow-up task' },
];

// ===========================================================================
// Convert modal
// ===========================================================================

function ConvertModal({ findingId, open, onClose }: { findingId: string; open: boolean; onClose: () => void }) {
  const { state, dispatch, user, toast, setModule } = useApp();
  const finding = state.businessFindings.find((f) => f.id === findingId);
  if (!finding) return null;

  const convert = (target: typeof CONVERT_OPTIONS[number]['target']) => {
    dispatch({ type: 'convertFinding', findingId, target, user: user.id });
    toast(`Finding converted to ${CONVERT_TARGET_LABEL[target].toLowerCase()}.`, 'success');
    onClose();
    setModule(CONVERT_TARGET_MODULE[target]);
  };

  return (
    <Modal open={open} onClose={onClose} title="Convert finding">
      <p className="mb-1 text-[12px] text-muted-foreground">The original finding is preserved and linked to the new record.</p>
      <p className="mb-3 text-[12.5px] text-muted-foreground">Convert <span className="font-medium text-foreground">{finding.title}</span> into:</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CONVERT_OPTIONS.map((o) => (
          <button key={o.target} onClick={() => convert(o.target)}
            className="panel-flat flex items-start gap-2 p-3 text-left transition hover:border-gold/50">
            <ArrowRight className="mt-0.5 size-4 shrink-0 text-gold" />
            <div>
              <p className="text-[13px] font-medium">{o.label}</p>
              <p className="text-[11.5px] text-muted-foreground">{o.hint}</p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ===========================================================================
// Finding detail drawer
// ===========================================================================

export function FindingRecord({ findingId, onClose }: { findingId: string; onClose: () => void }) {
  const { state, userById, setModule } = useApp();
  const [tab, setTab] = useState('overview');
  const [convertOpen, setConvertOpen] = useState(false);
  const f = state.businessFindings.find((x) => x.id === findingId);
  if (!f) return null;

  const source = state.researchSources.find((s) => s.id === f.sourceId);
  const stale = needsVerification(f.nextVerification);
  const assumed = f.confidence === 'Unconfirmed' || f.confidence === 'Low' || f.verificationStatus === 'Needs Verification';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'source', label: 'Source & verification' },
    { id: 'links', label: 'Links', count: (f.convertedTo?.length ?? 0) + [f.relatedFunderId, f.relatedOpportunityId, f.relatedCompanyId, f.relatedProjectId].filter(Boolean).length },
  ];

  return (
    <Drawer open onClose={onClose} width="max-w-4xl" title={f.title}
      subtitle={<span className="flex flex-wrap items-center gap-2">
        <StatusBadge status={f.status} />
        <Badge tone="muted">{f.type}</Badge>
        <span>{f.country} · {f.industry}</span>
      </span>}
      footer={<>
        {f.status !== 'Converted' && <Button onClick={() => setConvertOpen(true)}><ArrowRight className="size-3.5" />Convert…</Button>}
        {f.sourceUrl && <Button variant="outline" onClick={() => window.open(`https://${f.sourceUrl}`, '_blank')}>Open source<ExternalLink className="size-3.5" /></Button>}
      </>}>
      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-4" />

      {tab === 'overview' && (
        <div className="space-y-5">
          {assumed && (
            <div className="panel-flat flex items-center gap-2 bg-warning-soft/60 p-3 text-warning">
              <ShieldAlert className="size-4 shrink-0" />
              <p className="text-[12.5px] font-medium">This finding is {f.confidence.toLowerCase()} confidence / {f.verificationStatus.toLowerCase()} — treat as an assumption until verified.</p>
            </div>
          )}
          {stale && !assumed && (
            <div className="panel-flat flex items-center gap-2 bg-warning-soft/50 p-3 text-warning">
              <AlertTriangle className="size-4 shrink-0" />
              <p className="text-[12.5px] font-medium">Verification is overdue (last verified {fmtDate(f.lastVerified)}).</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { l: 'Type', v: f.type },
              { l: 'Potential value', v: f.potentialValue ? money(f.potentialValue, f.currency, true) : '—' },
              { l: 'Importance', v: f.strategicImportance },
              { l: 'Confidence', v: f.confidence, tone: assumed ? 'text-warning' : 'text-forest' },
            ].map((m) => (
              <div key={m.l} className="panel-flat bg-secondary/40 px-3 py-2.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{m.l}</p>
                <p className={cn('mt-1 font-display text-[14px] font-semibold', m.tone)}>{m.v}</p>
              </div>
            ))}
          </div>

          <div className="panel-flat bg-secondary/30 p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Detailed findings</p>
            <p className="text-[12.5px] leading-relaxed">{f.detail || f.description}</p>
          </div>

          {f.nextAction && (
            <div className={cn('panel-flat p-3', findingNeedsNextAction(f) ? 'bg-warning-soft/60' : 'bg-forest-soft/40')}>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Next action</p>
              <p className="text-[12.5px]">{f.nextAction} <span className="text-muted-foreground">· due {fmtDate(f.nextActionDate)} ({relativeDays(f.nextActionDate)})</span></p>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
            <Stat label="Category" value={f.category} />
            <Stat label="Priority" value={f.priority} />
            <Stat label="Market" value={f.market} />
            <Stat label="Region" value={f.region} />
            <Stat label="Researcher" value={userById(f.researcher)?.name} />
            <Stat label="Responsible" value={userById(f.responsible)?.name} />
            <Stat label="Discovered" value={fmtDate(f.discovered)} />
            <Stat label="Last updated" value={fmtDate(f.updated)} />
          </dl>
          {f.notes && <p className="text-[12.5px] leading-relaxed text-muted-foreground">{f.notes}</p>}
        </div>
      )}

      {tab === 'source' && (
        <div className="space-y-5">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
            <Stat label="Source type" value={f.source} />
            <Stat label="Source organisation" value={f.sourceOrg} />
            <Stat label="Source URL" value={f.sourceUrl} className="col-span-2" />
            {source && <>
              <Stat label="Source name" value={source.name} />
              <Stat label="Reliability" value={`${source.reliability}/5`} />
              <Stat label="Date accessed" value={fmtDate(source.dateAccessed)} />
              <Stat label="Date published" value={source.datePublished ? fmtDate(source.datePublished) : '—'} />
            </>}
          </dl>

          <div className="panel-flat p-3">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">
              {f.verificationStatus === 'Verified' ? <ShieldCheck className="size-3.5 text-forest" /> : <ShieldAlert className="size-3.5 text-warning" />}
              Verification
            </p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Stat label="Status" value={f.verificationStatus} />
              <Stat label="Confidence" value={f.confidence} />
              <Stat label="Last verified" value={fmtDate(f.lastVerified)} />
              <Stat label="Next verification" value={`${fmtDate(f.nextVerification)}${stale ? ' · overdue' : ''}`} />
            </dl>
            <p className="mt-2 text-[11px] text-muted-foreground">Funding and market information changes — findings should be re-verified before being relied upon.</p>
          </div>
        </div>
      )}

      {tab === 'links' && (
        <div className="space-y-4">
          {f.convertedTo && f.convertedTo.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-forest">Converted into</p>
              <div className="space-y-2">
                {f.convertedTo.map((c, i) => (
                  <button key={i} onClick={() => setModule(CONVERT_TARGET_MODULE[c.kind], c.id)}
                    className="panel-flat flex w-full items-center gap-2 p-3 text-left transition hover:border-gold/50">
                    <Link2 className="size-4 shrink-0 text-gold" />
                    <span className="flex-1 text-[12.5px] font-medium">{CONVERT_TARGET_LABEL[c.kind] ?? c.kind}</span>
                    <span className="tnum text-[11.5px] text-muted-foreground">{c.id}</span>
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Related records</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Stat label="Related funder" value={state.funders.find((x) => x.id === f.relatedFunderId)?.name ?? '—'} />
              <Stat label="Related opportunity" value={state.fundingOpportunities.find((x) => x.id === f.relatedOpportunityId)?.name ?? '—'} />
              <Stat label="Related company" value={state.companies.find((x) => x.id === f.relatedCompanyId)?.tradingName ?? '—'} />
              <Stat label="Related service" value={f.relatedService ?? '—'} />
            </dl>
          </div>
        </div>
      )}

      <ConvertModal findingId={f.id} open={convertOpen} onClose={() => setConvertOpen(false)} />
    </Drawer>
  );
}

// ===========================================================================
// Findings list
// ===========================================================================

export function BusinessFindings() {
  const { state, userById, focusId, setFocusId, can } = useApp();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const rows = state.businessFindings
    .filter((f) => (!q || `${f.title} ${f.description} ${f.sourceOrg} ${f.country} ${f.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())))
    .filter((f) => (!type || f.type === type))
    .filter((f) => (!category || f.category === category))
    .filter((f) => (!status || f.status === status));

  const actionRequired = state.businessFindings.filter((f) => findingNeedsNextAction(f) || f.status === 'Action Required').length;
  const needVerify = state.businessFindings.filter((f) => needsVerification(f.nextVerification) && f.status !== 'Converted' && f.status !== 'Archived').length;
  const converted = state.businessFindings.filter((f) => f.status === 'Converted').length;

  return (
    <div className="enter-up">
      <PageHeader
        title="Business findings"
        subtitle="The BALIA intelligence log — funding, market, partnership, regulatory and client findings captured as structured records, not lost in notes."
        actions={can('record.edit') ? <Button onClick={() => setAddOpen(true)}><Plus className="size-3.5" />Record finding</Button> : undefined}
        meta={<>
          <Badge tone="forest" dot>{state.businessFindings.length} findings</Badge>
          <Badge tone={actionRequired ? 'warning' : 'muted'} dot>{actionRequired} need action</Badge>
          <Badge tone={needVerify ? 'warning' : 'muted'} dot>{needVerify} need verification</Badge>
          <Badge tone="info" dot>{converted} converted</Badge>
        </>} />

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search findings…" className="w-full sm:w-64" />
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-auto"><option value="">All types</option>{FINDING_TYPES.map((t) => <option key={t}>{t}</option>)}</Select>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-auto"><option value="">All categories</option>{FINDING_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto"><option value="">All statuses</option>{FINDING_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} of {state.businessFindings.length}</span>
      </Toolbar>

      <Section flush>
        <DataTable rows={rows} onRowClick={(f) => setFocusId(f.id)}
          columns={[
            {
              key: 'n', header: 'Finding', sort: (f) => f.title,
              cell: (f) => (
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground"><Lightbulb className="size-4" strokeWidth={1.7} /></span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{f.title}</p>
                    <p className="truncate text-[11.5px] text-muted-foreground">{f.type} · {f.sourceOrg}</p>
                  </div>
                </div>
              ),
            },
            { key: 'c', header: 'Country', cell: (f) => f.country, sort: (f) => f.country, hideBelow: 'lg' },
            { key: 'v', header: 'Value', align: 'right', cell: (f) => <span className="tnum">{f.potentialValue ? money(f.potentialValue, f.currency, true) : '—'}</span>, sort: (f) => f.potentialValue, hideBelow: 'md' },
            {
              key: 'ver', header: 'Verified', align: 'center',
              cell: (f) => (f.verificationStatus === 'Verified' && !needsVerification(f.nextVerification)
                ? <ShieldCheck className="mx-auto size-4 text-forest" aria-label="verified" />
                : <ShieldAlert className="mx-auto size-4 text-warning" aria-label="needs verification" />),
              hideBelow: 'sm',
            },
            { key: 'imp', header: 'Importance', cell: (f) => <Badge tone={f.strategicImportance === 'Critical' ? 'danger' : f.strategicImportance === 'High' ? 'warning' : 'muted'}>{f.strategicImportance}</Badge>, hideBelow: 'lg' },
            { key: 's', header: 'Status', cell: (f) => <StatusBadge status={f.status} /> },
            { key: 'o', header: 'Owner', align: 'center', cell: (f) => <Avatar size="xs" name={userById(f.responsible)?.name} /> },
          ]} />
      </Section>

      {focusId && state.businessFindings.some((f) => f.id === focusId) && <FindingRecord findingId={focusId} onClose={() => setFocusId(null)} />}
      <NewFindingModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function NewFindingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { users, dispatch, user, setModule, toast } = useApp();
  const blank = {
    title: '', type: FINDING_TYPES[0] as string, category: FINDING_CATEGORIES[0] as string,
    description: '', detail: '', source: RESEARCH_SOURCE_TYPES[0] as string, sourceOrg: '', sourceUrl: '',
    country: 'Cameroon', region: 'Africa', industry: '', market: '',
    importance: 'Medium' as string, confidence: 'Medium' as string, potentialValue: '', currency: 'XAF',
    priority: 'Medium' as string, researcher: user.id, responsible: user.id, nextAction: '',
  };
  const [form, setForm] = useState(blank);

  const create = () => {
    if (!form.title.trim()) return;
    const id = `BFN-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const finding = {
      id, title: form.title, type: form.type, category: form.category,
      description: form.description, detail: form.detail,
      source: form.source, sourceUrl: form.sourceUrl, sourceOrg: form.sourceOrg,
      discovered: TODAY_ISO, lastVerified: TODAY_ISO,
      market: form.market || form.country, country: form.country, region: form.region, industry: form.industry,
      strategicImportance: form.importance, potentialValue: Number(form.potentialValue) || 0, currency: form.currency,
      confidence: form.confidence, researcher: form.researcher, responsible: form.responsible,
      status: 'New', priority: form.priority, nextAction: form.nextAction, nextActionDate: addDays(TODAY_ISO, 7),
      verificationStatus: form.confidence === 'Confirmed' ? 'Verified' : 'Needs Verification', nextVerification: addDays(TODAY_ISO, 30),
      notes: '', tags: [], created: TODAY_ISO, updated: TODAY_ISO,
    };
    dispatch({ type: 'add', collection: 'businessFindings', record: finding });
    dispatch({ type: 'notify', note: { category: 'Funding', title: 'New business finding', detail: form.title, tone: 'info', link: { module: 'business-findings', recordId: id } } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Business finding recorded', record: id, detail: form.title } });
    toast('Finding recorded. Convert it to an opportunity or funder when ready.', 'success');
    setForm(blank);
    setModule('business-findings', id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Record finding" width="max-w-xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Record finding</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Finding title" className="sm:col-span-2"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What did you discover?" /></Field>
        <Field label="Type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{FINDING_TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="Category"><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{FINDING_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Summary" className="sm:col-span-2"><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="One-line summary" /></Field>
        <Field label="Detailed findings" className="sm:col-span-2"><Textarea rows={2} value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} /></Field>
        <Field label="Source type"><Select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>{RESEARCH_SOURCE_TYPES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Source organisation"><Input value={form.sourceOrg} onChange={(e) => setForm({ ...form, sourceOrg: e.target.value })} /></Field>
        <Field label="Source URL" className="sm:col-span-2"><Input value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="example.org/page" /></Field>
        <Field label="Country"><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
        <Field label="Industry"><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></Field>
        <Field label="Strategic importance"><Select value={form.importance} onChange={(e) => setForm({ ...form, importance: e.target.value })}>{STRATEGIC_IMPORTANCE.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Confidence"><Select value={form.confidence} onChange={(e) => setForm({ ...form, confidence: e.target.value })}>{CONFIDENCE_LEVELS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Potential value"><Input type="number" value={form.potentialValue} onChange={(e) => setForm({ ...form, potentialValue: e.target.value })} /></Field>
        <Field label="Priority"><Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
        <Field label="Responsible"><Select value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })}>{users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></Field>
        <Field label="Next action"><Input value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} placeholder="e.g. Verify eligibility" /></Field>
      </div>
    </Modal>
  );
}
