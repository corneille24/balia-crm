import React, { useMemo, useState } from 'react';
import {
  Landmark, Mail, Phone, Globe2, Star, Calendar, ExternalLink, Plus,
} from 'lucide-react';
import { useApp } from '@/store';
import {
  PageHeader, Section, Badge, Button, StatusBadge, DataTable, Drawer, Toolbar,
  SearchInput, Select, Stat, Avatar, EmptyState, Tabs, Timeline, Modal, Field, Input, Textarea,
} from '@/components/kit';
import { money, fmtDate, relativeDays, TODAY_ISO } from '@/lib/derive';
import { opportunityFit, deadlineInfo } from '@/lib/funding';
import { FUNDER_ORG_TYPES, FUNDER_CATEGORIES, FUNDER_STATUSES, FUNDING_MECHANISMS } from '@/data/funding';
import { cn } from '@/lib/utils';

// ===========================================================================
// Shared small pieces used across the funding module
// ===========================================================================

export function Rating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`${value} / ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} className={cn('size-3', i < value ? 'fill-gold text-gold' : 'text-border')} strokeWidth={1.7} />
      ))}
    </span>
  );
}

export function FitBadge({ score, band, tone }: { score: number; band: string; tone: 'success' | 'info' | 'warning' | 'danger' }) {
  return <Badge tone={tone} dot>{score} · {band}</Badge>;
}

export function DeadlinePill({ deadline }: { deadline?: string }) {
  const d = deadlineInfo(deadline);
  return (
    <span className={cn('tnum inline-flex items-center gap-1 text-[12px]',
      d.tone === 'danger' ? 'text-danger' : d.tone === 'warning' ? 'text-warning' : 'text-muted-foreground')}>
      <Calendar className="size-3" />{fmtDate(deadline)} · {d.label}
    </span>
  );
}

// ===========================================================================
// Funder 360 — related records for the detail drawer
// ===========================================================================

function useFunder360(funderId?: string) {
  const { state } = useApp();
  return useMemo(() => {
    if (!funderId) return null;
    const funder = state.funders.find((f) => f.id === funderId);
    if (!funder) return null;
    const contacts = state.funderContacts.filter((c) => c.funderId === funderId);
    const opportunities = state.fundingOpportunities.filter((o) => o.funderId === funderId);
    const applications = state.fundingApplications.filter((a) => a.funderId === funderId);
    const comms = state.funderCommunications.filter((c) => c.funderId === funderId);
    const findings = state.businessFindings.filter((f) => f.relatedFunderId === funderId);
    const outcomes = state.fundingOutcomes.filter((o) => o.funderId === funderId);

    const timeline = [
      { id: `add-${funder.id}`, at: funder.created, title: 'Funder added to database', detail: funder.orgType, tone: 'muted' as const },
      ...comms.map((c) => ({ id: c.id, at: c.date, title: `${c.type}: ${c.subject}`, detail: c.summary, tone: (c.direction === 'Inbound' ? 'info' : 'gold') as 'info' | 'gold' })),
      ...opportunities.map((o) => ({ id: o.id, at: o.discovered, title: `Opportunity identified: ${o.name}`, detail: `${o.status} · ${money(o.estimatedValue, o.currency, true)}`, tone: 'forest' as const })),
      ...applications.filter((a) => a.submissionDate).map((a) => ({ id: a.id, at: a.submissionDate!, title: `Application submitted: ${a.projectTitle}`, detail: money(a.fundingRequested, a.currency, true), tone: 'info' as const })),
      ...outcomes.map((o) => ({ id: o.id, at: o.date, title: `Outcome: ${o.outcome}`, detail: `${money(o.amount, o.currency, true)} · ${o.reason}`, tone: (o.outcome === 'Awarded' ? 'success' : 'muted') as 'success' | 'muted' })),
    ].sort((a, b) => (a.at < b.at ? 1 : -1));

    const pipelineValue = opportunities
      .filter((o) => !['Rejected', 'Withdrawn', 'Expired', 'Not Eligible', 'Archived'].includes(o.status))
      .reduce((s, o) => s + o.estimatedValue, 0);
    const secured = outcomes.filter((o) => o.outcome === 'Awarded').reduce((s, o) => s + o.amount, 0);

    return { funder, contacts, opportunities, applications, comms, findings, outcomes, timeline, pipelineValue, secured };
  }, [funderId, state]);
}

// ===========================================================================
// Funder detail drawer
// ===========================================================================

export function FunderRecord({ funderId, onClose }: { funderId: string; onClose: () => void }) {
  const data = useFunder360(funderId);
  const { userById, setFocusId, setModule } = useApp();
  const [tab, setTab] = useState('overview');
  if (!data) return null;
  const { funder } = data;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'eligibility', label: 'Eligibility & terms' },
    { id: 'contacts', label: 'Contacts', count: data.contacts.length },
    { id: 'opportunities', label: 'Opportunities', count: data.opportunities.length },
    { id: 'findings', label: 'Findings', count: data.findings.length },
    { id: 'timeline', label: 'Timeline' },
  ];

  return (
    <Drawer open onClose={onClose} width="max-w-4xl" title={funder.name}
      subtitle={<span className="flex flex-wrap items-center gap-2">
        <StatusBadge status={funder.status} />
        <Rating value={funder.internalRating} />
        <span>{funder.orgType} · {funder.headquarters}</span>
      </span>}
      footer={<>
        <Button variant="outline" onClick={() => window.open(`https://${funder.website}`, '_blank')}>Visit website<ExternalLink className="size-3.5" /></Button>
        <Button variant="outline" onClick={() => setFocusId(null)}>Close</Button>
      </>}>
      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-4" />

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { l: 'Typical funding', v: money(funder.typicalFunding, funder.currency, true) },
              { l: 'Pipeline value', v: money(data.pipelineValue, 'XAF', true) },
              { l: 'Secured to date', v: money(data.secured, 'XAF', true), tone: data.secured > 0 ? 'text-success' : '' },
              { l: 'Opportunities', v: String(data.opportunities.length) },
            ].map((m) => (
              <div key={m.l} className="panel-flat bg-secondary/40 px-3 py-2.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{m.l}</p>
                <p className={cn('tnum mt-1 font-display text-[17px] font-semibold', m.tone)}>{m.v}</p>
              </div>
            ))}
          </div>

          <div className="panel-flat bg-secondary/30 p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Funding focus</p>
            <p className="text-[12.5px] leading-relaxed">{funder.fundingFocus}</p>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
            <Stat label="Organisation type" value={funder.orgType} />
            <Stat label="Category" value={funder.category} />
            <Stat label="Country / region" value={`${funder.country} · ${funder.region}`} />
            <Stat label="Website" value={funder.website} />
            <Stat label="Funding range" value={`${money(funder.minFunding, funder.currency, true)} – ${money(funder.maxFunding, funder.currency, true)}`} />
            <Stat label="Mechanisms" value={funder.mechanisms.join(', ')} />
            <Stat label="Relationship" value={funder.relationshipStatus} />
            <Stat label="Owner" value={userById(funder.owner)?.name} />
            <Stat label="Last contact" value={funder.lastContact ? `${fmtDate(funder.lastContact)} (${relativeDays(funder.lastContact)})` : '—'} />
            <Stat label="Next contact" value={funder.nextContact ? `${fmtDate(funder.nextContact)} (${relativeDays(funder.nextContact)})` : '—'} />
          </dl>

          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Geographic focus</span>
            {funder.geographicFocus.map((g) => <Badge key={g} tone="info">{g}</Badge>)}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Industry focus</span>
            {funder.industryFocus.map((g) => <Badge key={g} tone="muted">{g}</Badge>)}
          </div>
          {funder.notes && <p className="text-[12.5px] leading-relaxed text-muted-foreground">{funder.notes}</p>}
        </div>
      )}

      {tab === 'eligibility' && (
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
          <Stat label="Target beneficiaries" value={funder.targetBeneficiaries} className="sm:col-span-2" />
          <Stat label="Eligible business types" value={funder.eligibleBusinessTypes.join(', ')} />
          <Stat label="Eligible countries" value={funder.eligibleCountries.join(', ')} />
          <Stat label="Registration requirements" value={funder.registrationRequirements} className="sm:col-span-2" />
          <Stat label="Eligibility requirements" value={funder.eligibilityRequirements} className="sm:col-span-2" />
          <Stat label="Required documents" value={funder.requiredDocuments.join(', ')} className="sm:col-span-2" />
          <Stat label="Matching contribution" value={funder.matchingRequirement} />
          <Stat label="Co-financing" value={funder.coFinancingRequirement} />
          <Stat label="Application method" value={funder.applicationMethod} />
          <Stat label="Reporting requirements" value={funder.reportingRequirements} className="sm:col-span-2" />
        </dl>
      )}

      {tab === 'contacts' && (
        <ul className="space-y-2.5">
          {data.contacts.map((c) => (
            <li key={c.id} className="panel-flat flex items-start gap-3 p-3">
              <Avatar name={c.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{c.name}</p>
                  {c.primary && <Badge tone="gold">Primary</Badge>}
                </div>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{c.position}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
                  {c.email && <span className="flex items-center gap-1"><Mail className="size-3" />{c.email}</span>}
                  {c.phone && <span className="flex items-center gap-1"><Phone className="size-3" />{c.phone}</span>}
                  {c.linkedin && <span className="flex items-center gap-1"><Globe2 className="size-3" />{c.linkedin}</span>}
                </div>
                {c.notes && <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{c.notes}</p>}
              </div>
            </li>
          ))}
          {!data.contacts.length && <EmptyState title="No contacts yet" detail="Add a contact to start tracking the relationship." />}
        </ul>
      )}

      {tab === 'opportunities' && (
        <div className="space-y-2.5">
          {data.opportunities.map((o) => {
            const fit = opportunityFit(o);
            return (
              <button key={o.id} onClick={() => setModule('funding-opportunities', o.id)} className="panel-flat w-full p-3 text-left transition hover:border-gold/50">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-medium">{o.name}</p>
                  <div className="flex items-center gap-1.5">
                    <FitBadge score={fit.score} band={fit.band} tone={fit.tone} />
                    <StatusBadge status={o.status} />
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="tnum text-[12px] text-muted-foreground">{money(o.estimatedValue, o.currency, true)}</span>
                  <DeadlinePill deadline={o.deadline} />
                </div>
              </button>
            );
          })}
          {!data.opportunities.length && <EmptyState title="No opportunities yet" detail="Opportunities linked to this funder will appear here." />}
        </div>
      )}

      {tab === 'findings' && (
        <div className="space-y-2.5">
          {data.findings.map((f) => (
            <button key={f.id} onClick={() => setModule('business-findings', f.id)} className="panel-flat w-full p-3 text-left transition hover:border-gold/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13px] font-medium">{f.title}</p>
                <div className="flex items-center gap-1.5"><Badge tone="muted">{f.type}</Badge><StatusBadge status={f.status} /></div>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">{f.description}</p>
            </button>
          ))}
          {!data.findings.length && <EmptyState title="No findings yet" detail="Business findings linked to this funder will appear here." />}
        </div>
      )}

      {tab === 'timeline' && (
        <Timeline items={data.timeline} />
      )}
    </Drawer>
  );
}

// ===========================================================================
// Funders list
// ===========================================================================

export function Funders() {
  const { state, focusId, setFocusId, userById, can } = useApp();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [orgType, setOrgType] = useState('');
  const [mechanism, setMechanism] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const rows = state.funders
    .filter((f) => (!q || `${f.name} ${f.orgType} ${f.country} ${f.fundingFocus} ${f.tags.join(' ')} ${f.industryFocus.join(' ')}`.toLowerCase().includes(q.toLowerCase())))
    .filter((f) => (!status || f.status === status))
    .filter((f) => (!orgType || f.orgType === orgType))
    .filter((f) => (!mechanism || f.mechanisms.includes(mechanism)));

  const activeStatuses = ['Active Opportunity', 'Relationship Established', 'Application Submitted'];
  const active = state.funders.filter((f) => activeStatuses.includes(f.status)).length;
  const allMechanisms = Array.from(new Set(state.funders.flatMap((f) => f.mechanisms)));

  return (
    <div className="enter-up">
      <PageHeader
        title="Funders"
        subtitle="The BALIA funder intelligence database — grant makers, DFIs, donors and challenge funds, with eligibility, terms and relationship history."
        actions={can('record.edit') ? <Button onClick={() => setAddOpen(true)}><Plus className="size-3.5" />New funder</Button> : undefined}
        meta={<>
          <Badge tone="forest" dot>{state.funders.length} funders</Badge>
          <Badge tone="gold" dot>{active} active relationships</Badge>
        </>} />

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search funders…" className="w-full sm:w-64" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto">
          <option value="">All statuses</option>{FUNDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Select value={orgType} onChange={(e) => setOrgType(e.target.value)} className="w-auto">
          <option value="">All types</option>{FUNDER_ORG_TYPES.map((t) => <option key={t}>{t}</option>)}
        </Select>
        <Select value={mechanism} onChange={(e) => setMechanism(e.target.value)} className="w-auto">
          <option value="">All mechanisms</option>{allMechanisms.map((m) => <option key={m}>{m}</option>)}
        </Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} funders</span>
      </Toolbar>

      <Section flush>
        <DataTable rows={rows} onRowClick={(f) => setFocusId(f.id)}
          columns={[
            {
              key: 'n', header: 'Funder', sort: (f) => f.name,
              cell: (f) => (
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground"><Landmark className="size-4" strokeWidth={1.7} /></span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{f.name}</p>
                    <p className="truncate text-[11.5px] text-muted-foreground">{f.orgType} · {f.country}</p>
                  </div>
                </div>
              ),
            },
            { key: 'cat', header: 'Category', cell: (f) => <span className="text-muted-foreground">{f.category}</span>, sort: (f) => f.category, hideBelow: 'lg' },
            { key: 'typ', header: 'Typical', align: 'right', cell: (f) => <span className="tnum">{money(f.typicalFunding, f.currency, true)}</span>, sort: (f) => f.typicalFunding, hideBelow: 'md' },
            { key: 'mech', header: 'Mechanisms', cell: (f) => <div className="flex flex-wrap gap-1">{f.mechanisms.slice(0, 2).map((m) => <Badge key={m} tone="muted">{m}</Badge>)}{f.mechanisms.length > 2 ? <Badge tone="muted">+{f.mechanisms.length - 2}</Badge> : null}</div>, hideBelow: 'lg' },
            { key: 'r', header: 'Rating', align: 'center', cell: (f) => <Rating value={f.internalRating} />, sort: (f) => f.internalRating, hideBelow: 'md' },
            { key: 's', header: 'Status', cell: (f) => <StatusBadge status={f.status} /> },
            { key: 'o', header: 'Owner', align: 'center', cell: (f) => <Avatar size="xs" name={userById(f.owner)?.name} /> },
          ]} />
      </Section>

      {focusId && state.funders.some((f) => f.id === focusId) && <FunderRecord funderId={focusId} onClose={() => setFocusId(null)} />}
      <NewFunderModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function NewFunderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch, user, users, setModule, toast } = useApp();
  const blank = {
    name: '', orgType: FUNDER_ORG_TYPES[0] as string, category: FUNDER_CATEGORIES[0] as string,
    country: 'Cameroon', region: 'Africa', website: '', fundingFocus: '',
    mechanism: FUNDING_MECHANISMS[0] as string, typical: '50000000', currency: 'XAF',
    status: 'Prospect' as string, owner: user.id, notes: '',
  };
  const [form, setForm] = useState(blank);

  const create = () => {
    if (!form.name.trim()) return;
    const id = `FND-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const funder = {
      id, name: form.name, orgType: form.orgType, category: form.category,
      country: form.country, region: form.region, headquarters: form.country, website: form.website,
      generalEmail: '', telephone: '', fundingFocus: form.fundingFocus, geographicFocus: [form.region],
      industryFocus: [], targetBeneficiaries: '', eligibleBusinessTypes: [], eligibleCountries: [form.country],
      minFunding: 0, maxFunding: 0, typicalFunding: Number(form.typical) || 0, currency: form.currency,
      mechanisms: [form.mechanism], applicationMethod: '', registrationRequirements: '', eligibilityRequirements: '',
      requiredDocuments: [], matchingRequirement: '', coFinancingRequirement: '', reportingRequirements: '',
      internalRating: 3, relationshipStatus: form.status, status: form.status,
      owner: form.owner, notes: form.notes, tags: [], created: TODAY_ISO, updated: TODAY_ISO,
    };
    dispatch({ type: 'add', collection: 'funders', record: funder });
    dispatch({ type: 'notify', note: { category: 'Funding', title: 'New funder added', detail: form.name, tone: 'success', link: { module: 'funders', recordId: id } } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Funder created', record: id, detail: form.name } });
    toast('Funder added to the database.', 'success');
    setForm(blank);
    setModule('funders', id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New funder" width="max-w-xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Add funder</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Funder name" className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mastercard Foundation" /></Field>
        <Field label="Organisation type"><Select value={form.orgType} onChange={(e) => setForm({ ...form, orgType: e.target.value })}>{FUNDER_ORG_TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="Category"><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{FUNDER_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Country"><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
        <Field label="Region"><Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></Field>
        <Field label="Website" className="sm:col-span-2"><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="example.org" /></Field>
        <Field label="Funding focus" className="sm:col-span-2"><Textarea rows={2} value={form.fundingFocus} onChange={(e) => setForm({ ...form, fundingFocus: e.target.value })} placeholder="What they fund and prioritise" /></Field>
        <Field label="Primary mechanism"><Select value={form.mechanism} onChange={(e) => setForm({ ...form, mechanism: e.target.value })}>{FUNDING_MECHANISMS.map((m) => <option key={m}>{m}</option>)}</Select></Field>
        <Field label="Typical funding"><Input type="number" value={form.typical} onChange={(e) => setForm({ ...form, typical: e.target.value })} /></Field>
        <Field label="Currency"><Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{['XAF', 'USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Status"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{FUNDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Owner" className="sm:col-span-2"><Select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}>{users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></Field>
      </div>
    </Modal>
  );
}
