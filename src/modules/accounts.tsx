import React, { useMemo, useState } from 'react';
import { Building2, Mail, Phone, MessageSquare, ArrowRight, Globe2, ShieldCheck, Plus } from 'lucide-react';
import { useApp } from '@/store';
import { SERVICES, COUNTRIES } from '@/data/catalog';
import {
  PageHeader, Section, Badge, Button, StatusBadge, DataTable, Drawer, Toolbar, SearchInput,
  Select, Stat, Avatar, EmptyState, Tabs, Progress, Timeline, Collapse, Modal, Field, Input, Textarea,
} from '@/components/kit';
import { money, fmtDate, fmtDateTime, relativeDays, daysFromToday, invoiceTotals, projectProgress, projectHealth, clientHealth, assessmentScore, toXAF, TODAY_ISO } from '@/lib/derive';
import { readinessBand } from '@/data/catalog';
import { cn } from '@/lib/utils';
import { crossSellFor } from '@/lib/crosssell';

// ===========================================================================
function useCompany360(companyId?: string) {
  const { state } = useApp();
  return useMemo(() => {
    if (!companyId) return null;
    const company = state.companies.find((c) => c.id === companyId);
    if (!company) return null;
    const contacts = state.contacts.filter((c) => c.companyId === companyId);
    const projects = state.projects.filter((p) => p.companyId === companyId);
    const invoices = state.invoices.filter((i) => i.companyId === companyId);
    const documents = state.documents.filter((d) => d.companyId === companyId);
    const proposals = state.proposals.filter((p) => p.companyId === companyId);
    const contracts = state.contracts.filter((c) => c.companyId === companyId);
    const opportunities = state.opportunities.filter((o) => o.companyId === companyId);
    const consultations = state.consultations.filter((c) => c.companyId === companyId);
    const comms = state.communications.filter((c) => c.companyId === companyId);
    const products = state.products.filter((p) => p.companyId === companyId);
    const assessments = state.assessments.filter((a) => a.companyId === companyId);
    const enrollments = state.enrollments.filter((e) => e.companyId === companyId);
    const payments = state.payments.filter((p) => invoices.some((i) => i.id === p.invoiceId));
    const expenses = state.expenses.filter((e) => e.companyId === companyId);

    const billed = invoices.filter((i) => i.status !== 'Draft').map((i) => invoiceTotals(i, state.payments));
    const invoicedXAF = invoices.filter((i) => i.status !== 'Draft').reduce((s, i) => s + toXAF(invoiceTotals(i, state.payments).total, i.currency), 0);
    const paidXAF = invoices.reduce((s, i) => s + toXAF(invoiceTotals(i, state.payments).paid, i.currency), 0);
    const balanceXAF = invoices.filter((i) => i.status !== 'Draft').reduce((s, i) => s + toXAF(invoiceTotals(i, state.payments).balance, i.currency), 0);
    const lastContact = comms.map((c) => c.at).sort().slice(-1)[0];

    const health = clientHealth(company, { invoices: state.invoices, payments: state.payments, projects: state.projects, tasks: state.tasks, lastContact });

    const timeline = [
      ...comms.map((c) => ({ id: c.id, at: c.at, title: `${c.type}: ${c.subject}`, detail: c.summary, tone: 'muted' as const })),
      ...proposals.map((p) => ({ id: p.id, at: p.sent ?? p.created, title: `Proposal ${p.number} ${p.status.toLowerCase()}`, detail: p.title, tone: (p.status === 'Accepted' ? 'success' : 'gold') as 'success' | 'gold' })),
      ...contracts.map((c) => ({ id: c.id, at: c.start, title: `Contract ${c.number} signed`, detail: `${c.type} · ${money(c.value, c.currency)}`, tone: 'forest' as const })),
      ...projects.map((p) => ({ id: p.id, at: p.start, title: `Project started: ${p.name}`, detail: `${p.status} · ${projectProgress(p)}% complete`, tone: 'info' as const })),
      ...invoices.filter((i) => i.sent).map((i) => ({ id: i.id, at: i.sent!, title: `Invoice ${i.number} issued`, detail: money(invoiceTotals(i, state.payments).total, i.currency), tone: 'muted' as const })),
      ...payments.filter((p) => p.amount > 0).map((p) => ({ id: p.id, at: p.date, title: `Payment received`, detail: `${money(p.amount, p.currency)} via ${p.method}`, tone: 'success' as const })),
      ...documents.filter((d) => d.uploaded).map((d) => ({ id: d.id, at: d.uploaded, title: `Document: ${d.name}`, detail: `${d.category} · ${d.status}`, tone: 'muted' as const })),
      ...consultations.map((c) => ({ id: c.id, at: c.date, title: `Consultation: ${c.type}`, detail: c.challenge, tone: 'gold' as const })),
    ].sort((a, b) => (a.at < b.at ? 1 : -1));

    return { company, contacts, projects, invoices, documents, proposals, contracts, opportunities, consultations, comms, products, assessments, enrollments, payments, expenses, invoicedXAF, paidXAF, balanceXAF, health, timeline, lastContact };
  }, [companyId, state]);
}

export function CompanyRecord({ companyId, onClose }: { companyId: string; onClose: () => void }) {
  const data = useCompany360(companyId);
  const { setModule, userById, state } = useApp();
  const [tab, setTab] = useState('overview');
  if (!data) return null;
  const { company, health } = data;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'contacts', label: 'Contacts', count: data.contacts.length },
    { id: 'commercial', label: 'Commercial', count: data.proposals.length + data.contracts.length },
    { id: 'projects', label: 'Projects', count: data.projects.length },
    { id: 'documents', label: 'Documents', count: data.documents.length },
    { id: 'finance', label: 'Finance', count: data.invoices.length },
    { id: 'trade', label: 'Trade profile', count: data.products.length },
    { id: 'timeline', label: 'Timeline' },
  ];

  return (
    <Drawer open onClose={onClose} width="max-w-4xl" title={company.tradingName}
      subtitle={<span className="flex flex-wrap items-center gap-2">
        <StatusBadge status={company.status} />
        <Badge tone={health.tone} dot>{health.label} · {health.score}</Badge>
        <span>{company.legalName} · {company.city}, {company.country}</span>
      </span>}
      footer={<>
        <Button variant="outline" onClick={() => setModule('documents')}>Request documents</Button>
        <Button variant="outline" onClick={() => setModule('proposals')}>New proposal</Button>
        <Button onClick={() => setModule('projects')}>Open projects<ArrowRight className="size-3.5" /></Button>
      </>}>
      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-4" />

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { l: 'Invoiced', v: money(data.invoicedXAF, 'XAF', true) },
              { l: 'Collected', v: money(data.paidXAF, 'XAF', true) },
              { l: 'Outstanding', v: money(data.balanceXAF, 'XAF', true), tone: data.balanceXAF > 0 ? 'text-warning' : '' },
              { l: 'Engagements', v: String(data.projects.length) },
            ].map((m) => (
              <div key={m.l} className="panel-flat bg-secondary/40 px-3 py-2.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{m.l}</p>
                <p className={cn('tnum mt-1 font-display text-[17px] font-semibold', m.tone)}>{m.v}</p>
              </div>
            ))}
          </div>

          {health.reasons.length > 0 && (
            <div className="panel-flat bg-warning-soft/60 p-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.055em] text-warning">Health signals</p>
              <p className="text-[12.5px] leading-relaxed text-warning">{health.reasons.join(' · ')}</p>
            </div>
          )}

          {(() => {
            const recs = crossSellFor(companyId, state);
            if (recs.length === 0) return null;
            const total = recs.reduce((s, r) => s + r.valueXAF, 0);
            return (
              <div className="panel-flat border-l-forest/50 bg-forest-soft/25 p-3.5">
                <div className="mb-2 flex items-baseline justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.055em] text-forest">Expansion opportunities · §cross-sell</p>
                  <span className="tnum text-[12px] font-semibold text-forest">{money(total, 'XAF', true)} potential</span>
                </div>
                <p className="mb-2 text-[11.5px] text-muted-foreground">Based on services this client already engages, these are the strongest complementary services to propose.</p>
                <div className="space-y-1.5">
                  {recs.slice(0, 5).map((r) => (
                    <div key={r.serviceId} className="flex items-center justify-between gap-2 text-[12.5px]">
                      <span className="min-w-0 truncate"><span className="font-medium">{r.name}</span> <span className="text-muted-foreground">· {r.reason}</span></span>
                      <span className="tnum shrink-0 text-muted-foreground">{money(r.valueXAF, 'XAF', true)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
            <Stat label="Legal name" value={company.legalName} className="col-span-2" />
            <Stat label="Registration" value={company.regNumber} />
            <Stat label="Website" value={company.website} />
            <Stat label="Industry" value={company.industry} />
            <Stat label="Size" value={`${company.size} · ${company.employees} employees`} />
            <Stat label="Turnover" value={company.turnover} />
            <Stat label="Account owner" value={userById(company.owner)?.name} />
            <Stat label="Address" value={company.address} className="col-span-2" />
            <Stat label="Products" value={company.products.join(', ')} className="col-span-2" />
            <Stat label="Current markets" value={company.currentMarkets.join(', ')} />
            <Stat label="Target markets" value={company.targetMarkets.join(', ')} />
            <Stat label="Client since" value={fmtDate(company.since)} />
            <Stat label="Last contact" value={data.lastContact ? `${fmtDate(data.lastContact)} · ${relativeDays(data.lastContact)}` : '—'} />
          </dl>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Tags</p>
            <div className="flex flex-wrap gap-1.5">{company.tags.map((t) => <Badge key={t} tone="forest">{t}</Badge>)}</div>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Account notes</p>
            <p className="prose-editorial">{company.notes}</p>
          </div>
        </div>
      )}

      {tab === 'contacts' && (
        <ul className="divide-y divide-border">
          {data.contacts.map((c) => (
            <li key={c.id} className="flex items-start gap-3 py-3">
              <Avatar size="md" name={`${c.firstName} ${c.lastName}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-medium">{c.firstName} {c.lastName}</p>
                  {c.decisionMaker && <Badge tone="gold">Decision maker</Badge>}
                  <Badge tone="muted">{c.type}</Badge>
                </div>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{c.position} · {c.department}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="size-3" />{c.email}</span>
                  <span className="flex items-center gap-1"><Phone className="size-3" />{c.phone}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="size-3" />Prefers {c.preferred}</span>
                </div>
                {c.notes && <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{c.notes}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === 'commercial' && (
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Opportunities</p>
            {data.opportunities.length ? data.opportunities.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
                <div className="min-w-0"><p className="truncate text-[13px] font-medium">{o.name}</p><p className="text-[11.5px] text-muted-foreground">{o.nextAction}</p></div>
                <div className="flex shrink-0 items-center gap-2"><StatusBadge status={o.stage} /><span className="tnum text-[12.5px]">{money(o.value, o.currency, true)}</span></div>
              </div>
            )) : <p className="text-[12.5px] text-muted-foreground">No open opportunities.</p>}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Proposals</p>
            {data.proposals.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
                <div className="min-w-0"><p className="truncate text-[13px] font-medium">{p.number}</p><p className="truncate text-[11.5px] text-muted-foreground">{p.title}</p></div>
                <div className="flex shrink-0 items-center gap-2"><StatusBadge status={p.status} /><span className="tnum text-[12.5px]">{money(p.services.reduce((s, i) => s + i.qty * i.rate, 0), p.currency, true)}</span></div>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Contracts</p>
            {data.contracts.map((c) => (
              <div key={c.id} className="border-b border-border py-2 last:border-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] font-medium">{c.number} · {c.type}</p>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">{fmtDate(c.start)} → {fmtDate(c.end)} · renewal {fmtDate(c.renewal)} ({relativeDays(c.renewal)}) · {money(c.value, c.currency)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'projects' && (
        <div className="space-y-3">
          {data.projects.map((p) => {
            const h = projectHealth(p);
            return (
              <div key={p.id} className="panel-flat p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-medium">{p.name}</p>
                  <div className="flex items-center gap-1.5"><StatusBadge status={p.status} /><Badge tone={h.tone} dot>{h.label}</Badge></div>
                </div>
                <p className="mt-1 text-[11.5px] text-muted-foreground">{SERVICES.find((s) => s.id === p.serviceId)?.name} · {fmtDate(p.start)} → {fmtDate(p.end)} · {money(p.budget, p.currency)}</p>
                <div className="mt-2"><Progress value={projectProgress(p)} tone={h.tone === 'danger' ? 'danger' : 'forest'} showLabel /></div>
              </div>
            );
          })}
          {!data.projects.length && <EmptyState title="No projects yet" detail="Projects are created automatically when a proposal is accepted." />}
        </div>
      )}

      {tab === 'documents' && (
        <DataTable rows={data.documents} columns={[
          { key: 'n', header: 'Document', cell: (d) => <div><p className="font-medium">{d.name}</p><p className="text-[11.5px] text-muted-foreground">{d.category} · v{d.version}</p></div> },
          { key: 's', header: 'Status', cell: (d) => <StatusBadge status={d.status} /> },
          { key: 'e', header: 'Expiry', cell: (d) => (d.expiry ? <span className={daysFromToday(d.expiry) < 30 ? 'text-warning' : ''}>{fmtDate(d.expiry)}</span> : '—'), hideBelow: 'md' },
          { key: 'u', header: 'Uploaded', cell: (d) => (d.uploaded ? fmtDate(d.uploaded) : '—'), hideBelow: 'md' },
        ]} />
      )}

      {tab === 'finance' && (
        <DataTable rows={data.invoices} columns={[
          { key: 'n', header: 'Invoice', cell: (i) => <span className="font-medium">{i.number}</span> },
          { key: 'd', header: 'Issued', cell: (i) => fmtDate(i.issued), hideBelow: 'md' },
          { key: 'due', header: 'Due', cell: (i) => fmtDate(i.due) },
          { key: 't', header: 'Total', align: 'right', cell: (i) => money(invoiceTotals(i, state.payments).total, i.currency) },
          { key: 'b', header: 'Balance', align: 'right', cell: (i) => { const t = invoiceTotals(i, state.payments); return <span className={t.balance > 0 ? 'font-medium text-warning' : 'text-muted-foreground'}>{money(t.balance, i.currency)}</span>; } },
          { key: 's', header: 'Status', cell: (i) => <StatusBadge status={invoiceTotals(i, state.payments).status} /> },
        ]} />
      )}

      {tab === 'trade' && (
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Products</p>
            {data.products.map((p) => (
              <Collapse key={p.id} title={<span>{p.name} <span className="ml-1.5 font-mono text-[11.5px] text-muted-foreground">HS {p.hsCode}</span></span>}
                meta={<Badge tone="muted">{p.targetMarkets.length} markets</Badge>}>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Stat label="Category" value={p.category} />
                  <Stat label="Origin" value={p.origin} />
                  <Stat label="Target markets" value={p.targetMarkets.join(', ')} className="col-span-2" />
                  <Stat label="Requirements" value={p.requirements.join(' · ')} className="col-span-2" />
                  <Stat label="Certifications" value={p.certifications.join(', ') || 'None held'} />
                  <Stat label="Notes" value={p.notes} className="col-span-2" />
                </dl>
              </Collapse>
            ))}
            {!data.products.length && <p className="text-[12.5px] text-muted-foreground">No products registered.</p>}
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Assessments</p>
            {data.assessments.map((a) => {
              const s = a.type === 'Trade Readiness' ? assessmentScore(a.scores).overall : null;
              const band = s !== null ? readinessBand(s) : null;
              return (
                <div key={a.id} className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-0">
                  <div><p className="text-[13px] font-medium">{a.type}</p><p className="text-[11.5px] text-muted-foreground">{fmtDate(a.date)} · {a.targetMarket ?? ''} {a.product ? `· ${a.product}` : ''}</p></div>
                  {s !== null && band ? <div className="flex items-center gap-2"><span className="tnum font-display text-[16px] font-semibold">{s}</span><Badge tone={band.tone} dot>{band.label}</Badge></div> : <Badge tone="muted">Qualitative</Badge>}
                </div>
              );
            })}
            {!data.assessments.length && <p className="text-[12.5px] text-muted-foreground">No assessments recorded.</p>}
          </div>

          {data.enrollments.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Academy</p>
              {data.enrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
                  <div><p className="text-[12.5px] font-medium">{e.learnerName}</p><p className="text-[11.5px] text-muted-foreground">{state.courses.find((c) => c.id === e.courseId)?.title}</p></div>
                  <div className="flex w-32 items-center gap-2"><Progress value={e.progress} showLabel size="sm" />{e.certified && <Badge tone="success">Certified</Badge>}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'timeline' && (
        <div>
          <p className="mb-3 text-[12.5px] leading-relaxed text-muted-foreground">
            The complete relationship record: lead, consultation, proposal, contract, project, documents, invoices, payments and follow-up, in one chronological view.
          </p>
          <Timeline items={data.timeline.map((t) => ({ ...t, at: fmtDate(t.at) }))} />
        </div>
      )}
    </Drawer>
  );
}

// ===========================================================================
export function Companies({ clientsOnly = false }: { clientsOnly?: boolean }) {
  const { state, focusId, setFocusId, userById, can } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [tag, setTag] = useState('');

  const rows = state.companies
    .filter((c) => (!clientsOnly || c.status === 'Client'))
    .filter((c) => (!q || `${c.legalName} ${c.tradingName} ${c.industry} ${c.country} ${c.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())))
    .filter((c) => (!country || c.country === country) && (!tag || c.tags.includes(tag)));

  const allTags = Array.from(new Set(state.companies.flatMap((c) => c.tags)));

  return (
    <div className="enter-up">
      <PageHeader
        title={clientsOnly ? 'Clients' : 'Companies'}
        actions={can('record.edit') ? <Button onClick={() => setAddOpen(true)}><Building2 className="size-3.5" />{clientsOnly ? 'Add client' : 'Add company'}</Button> : undefined}
        subtitle={clientsOnly
          ? 'Engaged clients with live contracts. Each record carries the complete relationship history.'
          : 'Every organisation in the system — leads, prospects, clients and former clients.'}
        meta={<>
          <Badge tone="forest" dot>{state.companies.filter((c) => c.status === 'Client').length} clients</Badge>
          <Badge tone="info" dot>{state.companies.filter((c) => c.status === 'Prospect').length} prospects</Badge>
          <Badge tone="muted" dot>{state.companies.filter((c) => c.status === 'Lead').length} leads</Badge>
        </>} />

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search companies…" className="w-full sm:w-64" />
        <Select value={country} onChange={(e) => setCountry(e.target.value)} className="w-auto">
          <option value="">All countries</option>
          {Array.from(new Set(state.companies.map((c) => c.country))).map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Select value={tag} onChange={(e) => setTag(e.target.value)} className="w-auto">
          <option value="">All tags</option>{allTags.map((t) => <option key={t}>{t}</option>)}
        </Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} records</span>
      </Toolbar>

      <Section flush>
        <DataTable rows={rows} onRowClick={(c) => setFocusId(c.id)}
          columns={[
            {
              key: 'n', header: 'Company', sort: (c) => c.tradingName,
              cell: (c) => (
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground"><Building2 className="size-4" strokeWidth={1.7} /></span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.tradingName}</p>
                    <p className="truncate text-[11.5px] text-muted-foreground">{c.industry} · {c.city}</p>
                  </div>
                </div>
              ),
            },
            { key: 'c', header: 'Country', cell: (c) => c.country, sort: (c) => c.country, hideBelow: 'sm' },
            { key: 's', header: 'Status', cell: (c) => <StatusBadge status={c.status} /> },
            {
              key: 'h', header: 'Health', cell: (c) => {
                const h = clientHealth(c, { invoices: state.invoices, payments: state.payments, projects: state.projects, tasks: state.tasks, lastContact: state.communications.filter((x) => x.companyId === c.id).map((x) => x.at).sort().slice(-1)[0] });
                return <Badge tone={h.tone} dot>{h.label}</Badge>;
              },
              hideBelow: 'md',
            },
            { key: 'm', header: 'Target markets', cell: (c) => <span className="text-muted-foreground">{c.targetMarkets.slice(0, 2).join(', ')}{c.targetMarkets.length > 2 ? ` +${c.targetMarkets.length - 2}` : ''}</span>, hideBelow: 'lg' },
            { key: 't', header: 'Tags', cell: (c) => <div className="flex flex-wrap gap-1">{c.tags.slice(0, 2).map((t) => <Badge key={t} tone="muted">{t}</Badge>)}</div>, hideBelow: 'lg' },
            { key: 'o', header: 'Owner', align: 'center', cell: (c) => <Avatar size="xs" name={userById(c.owner)?.name} /> },
          ]} />
      </Section>

      {focusId && state.companies.some((c) => c.id === focusId) && <CompanyRecord companyId={focusId} onClose={() => setFocusId(null)} />}
      <NewCompanyModal open={addOpen} onClose={() => setAddOpen(false)} defaultClient={clientsOnly} />
    </div>
  );
}

function NewCompanyModal({ open, onClose, defaultClient }: { open: boolean; onClose: () => void; defaultClient?: boolean }) {
  const { dispatch, user, users, setModule, toast } = useApp();
  const blank = {
    tradingName: '', legalName: '', country: 'Cameroon', city: '', industry: '', size: 'Medium',
    status: defaultClient ? 'Client' : 'Prospect', owner: user.id, currency: 'XAF', website: '', notes: '',
  };
  const [form, setForm] = useState(blank);

  const create = () => {
    if (!form.tradingName.trim()) return;
    const id = `CMP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const company = {
      id, legalName: form.legalName || form.tradingName, tradingName: form.tradingName, regNumber: '',
      country: form.country, city: form.city, address: '', website: form.website,
      industry: form.industry || 'Not stated', size: form.size, employees: 0, turnover: '',
      products: [], currentMarkets: [], targetMarkets: [], interests: [],
      owner: form.owner, status: form.status, health: 'Healthy', tags: [],
      since: TODAY_ISO, notes: form.notes, currency: form.currency,
    };
    dispatch({ type: 'add', collection: 'companies', record: company });
    dispatch({ type: 'notify', note: { category: 'Accounts', title: `New ${form.status.toLowerCase()} added`, detail: form.tradingName, tone: 'success', link: { module: 'companies', recordId: id } } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Company created', record: id, detail: `${form.tradingName} (${form.status})` } });
    toast(`${form.tradingName} added.`, 'success');
    setForm(blank);
    setModule('companies', id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={defaultClient ? 'Add client' : 'Add company'} width="max-w-xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Add record</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Trading name" className="sm:col-span-2"><Input value={form.tradingName} onChange={(e) => setForm({ ...form, tradingName: e.target.value })} placeholder="e.g. Kola Agro" /></Field>
        <Field label="Legal name" className="sm:col-span-2"><Input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} placeholder="Registered legal entity (optional)" /></Field>
        <Field label="Country"><Select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>{COUNTRIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}</Select></Field>
        <Field label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
        <Field label="Industry"><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></Field>
        <Field label="Size"><Select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>{['Micro', 'Small', 'Medium', 'Large', 'Enterprise'].map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Status"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{['Lead', 'Prospect', 'Client', 'Former Client'].map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Owner"><Select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}>{users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></Field>
        <Field label="Currency"><Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{['XAF', 'USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Website"><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="example.com" /></Field>
        <Field label="Notes" className="sm:col-span-2"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

// ===========================================================================
export function Contacts() {
  const { state, focusId, setFocusId, can } = useApp();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const rows = state.contacts.filter((c) =>
    (!q || `${c.firstName} ${c.lastName} ${c.email} ${c.position}`.toLowerCase().includes(q.toLowerCase())) &&
    (!type || c.type === type));
  const contact = state.contacts.find((c) => c.id === focusId);
  const company = state.companies.find((c) => c.id === contact?.companyId);

  return (
    <div className="enter-up">
      <PageHeader title="Contacts" subtitle="Individuals across every client and prospect, with their role in the buying decision."
        actions={can('record.edit') ? <Button onClick={() => setAddOpen(true)}><Plus className="size-3.5" />Add contact</Button> : undefined}
        meta={<><Badge tone="gold" dot>{state.contacts.filter((c) => c.decisionMaker).length} decision makers</Badge><Badge tone="muted">{state.contacts.length} total</Badge></>} />
      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search contacts…" className="w-full sm:w-64" />
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-auto">
          <option value="">All roles</option>
          {Array.from(new Set(state.contacts.map((c) => c.type))).map((t) => <option key={t}>{t}</option>)}
        </Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} contacts</span>
      </Toolbar>
      <Section flush>
        <DataTable rows={rows} onRowClick={(c) => setFocusId(c.id)}
          columns={[
            { key: 'n', header: 'Name', sort: (c) => c.lastName, cell: (c) => (
              <div className="flex items-center gap-2.5">
                <Avatar name={`${c.firstName} ${c.lastName}`} />
                <div><p className="font-medium">{c.firstName} {c.lastName}</p><p className="text-[11.5px] text-muted-foreground">{c.position}</p></div>
              </div>
            ) },
            { key: 'co', header: 'Company', cell: (c) => state.companies.find((x) => x.id === c.companyId)?.tradingName, hideBelow: 'sm' },
            { key: 't', header: 'Role', cell: (c) => <Badge tone="muted">{c.type}</Badge>, hideBelow: 'md' },
            { key: 'dm', header: 'Decision', align: 'center', cell: (c) => (c.decisionMaker ? <Badge tone="gold">Yes</Badge> : <span className="text-muted-foreground">—</span>) },
            { key: 'e', header: 'Email', cell: (c) => <span className="text-muted-foreground">{c.email}</span>, hideBelow: 'lg' },
            { key: 'p', header: 'Prefers', cell: (c) => c.preferred, hideBelow: 'lg' },
          ]} />
      </Section>

      <Drawer open={!!contact} onClose={() => setFocusId(null)} title={contact ? `${contact.firstName} ${contact.lastName}` : ''}
        subtitle={contact && <span className="flex items-center gap-2">{contact.decisionMaker && <Badge tone="gold">Decision maker</Badge>}{contact.position} · {company?.tradingName}</span>}>
        {contact && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
              <Stat label="Company" value={company?.legalName} className="col-span-2" />
              <Stat label="Department" value={contact.department} />
              <Stat label="Contact type" value={contact.type} />
              <Stat label="Email" value={contact.email} />
              <Stat label="Phone" value={contact.phone} />
              <Stat label="WhatsApp" value={contact.whatsapp} />
              <Stat label="LinkedIn" value={contact.linkedin} />
              <Stat label="Preferred channel" value={contact.preferred} />
              <Stat label="Notes" value={contact.notes} className="col-span-2" />
            </dl>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Relationship history</p>
              <Timeline items={state.communications.filter((c) => c.contactId === contact.id).map((c) => ({
                id: c.id, at: fmtDateTime(c.at), title: `${c.type}: ${c.subject}`, detail: c.summary, tone: c.direction === 'in' ? 'info' as const : 'muted' as const,
              }))} />
              {state.communications.filter((c) => c.contactId === contact.id).length === 0 && <p className="text-[12.5px] text-muted-foreground">No logged interactions.</p>}
            </div>
          </div>
        )}
      </Drawer>
      <NewContactModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function NewContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, user, setModule, toast } = useApp();
  const firstCompany = state.companies[0]?.id ?? '';
  const blank = {
    firstName: '', lastName: '', companyId: firstCompany, position: '', type: 'Manager',
    department: '', email: '', phone: '', decisionMaker: 'No', preferred: 'Email', notes: '',
  };
  const [form, setForm] = useState(blank);

  const create = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.companyId) return;
    const id = `CON-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const contact = {
      id, companyId: form.companyId, firstName: form.firstName, lastName: form.lastName,
      position: form.position, type: form.type, department: form.department,
      email: form.email, phone: form.phone, decisionMaker: form.decisionMaker === 'Yes',
      preferred: form.preferred, notes: form.notes, tags: [],
    };
    dispatch({ type: 'add', collection: 'contacts', record: contact });
    dispatch({ type: 'notify', note: { category: 'Accounts', title: 'New contact added', detail: `${form.firstName} ${form.lastName}`, tone: 'info', link: { module: 'contacts', recordId: id } } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Contact created', record: id, detail: `${form.firstName} ${form.lastName}` } });
    toast('Contact added.', 'success');
    setForm(blank);
    setModule('contacts', id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add contact" width="max-w-xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Add contact</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First name"><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field>
        <Field label="Last name"><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field>
        <Field label="Company" className="sm:col-span-2"><Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>{state.companies.map((c) => <option key={c.id} value={c.id}>{c.tradingName}</option>)}</Select></Field>
        <Field label="Position"><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="e.g. Export Manager" /></Field>
        <Field label="Department"><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Field>
        <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Contact type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{['CEO', 'Executive', 'Manager', 'Export Manager', 'Finance', 'Operations', 'Technical', 'Other'].map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="Decision maker"><Select value={form.decisionMaker} onChange={(e) => setForm({ ...form, decisionMaker: e.target.value })}>{['No', 'Yes'].map((v) => <option key={v}>{v}</option>)}</Select></Field>
        <Field label="Preferred channel"><Select value={form.preferred} onChange={(e) => setForm({ ...form, preferred: e.target.value })}>{['Email', 'Phone', 'WhatsApp', 'In person'].map((v) => <option key={v}>{v}</option>)}</Select></Field>
        <Field label="Notes" className="sm:col-span-2"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}
