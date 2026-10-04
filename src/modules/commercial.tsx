import React, { useMemo, useState } from 'react';
import { Send, FileSignature, Download, Repeat, Plus, ArrowRight, PenLine, ShieldCheck, Printer } from 'lucide-react';
import { useApp } from '@/store';
import { SERVICES, EXPENSE_CATEGORIES } from '@/data/catalog';
import {
  PageHeader, Section, Badge, Button, StatusBadge, DataTable, Drawer, Toolbar, SearchInput,
  Select, Stat, Avatar, EmptyState, Tabs, Progress, Modal, Field, Input, Textarea, KpiCard, Timeline,
} from '@/components/kit';
import { money, fmtDate, relativeDays, daysFromToday, invoiceTotals, toXAF, TODAY_ISO, addDays } from '@/lib/derive';
import { cn } from '@/lib/utils';

import { proposalProfitability } from '@/lib/proposal-profit';

const proposalValue = (p: any) => p.services.reduce((s: number, i: any) => s + i.qty * i.rate, 0);

function ProposalProfitabilityPanel({ p }: { p: any }) {
  const { state, dispatch, user, can, toast } = useApp();
  const opp = state.opportunities.find((o: any) => o.id === p.opportunityId);
  const f = proposalProfitability(p, opp);
  const [edit, setEdit] = React.useState(false);
  const [cost, setCost] = React.useState(String(p.estimatedCost ?? ''));
  const [days, setDays] = React.useState(String(p.consultantDays ?? ''));
  const save = () => {
    dispatch({ type: 'patch', collection: 'proposals', id: p.id, changes: { estimatedCost: Number(cost) || 0, consultantDays: Number(days) || 0 } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Proposal cost estimate updated', record: p.id, detail: `cost ${cost}, ${days} days` } });
    toast('Profitability updated.', 'success'); setEdit(false);
  };
  const m = (n: number) => money(n, p.currency, true);
  const marginTone = f.marginPct >= 0.4 ? 'text-forest' : f.marginPct >= 0.2 ? 'text-gold-dark' : 'text-danger';
  return (
    <div className="mt-5 panel-flat border-l-forest/50 bg-forest-soft/20 p-3.5">
      <div className="mb-2.5 flex items-baseline justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.055em] text-forest">Profitability · §7</p>
        {can('record.edit') && !edit && <button onClick={() => setEdit(true)} className="text-[11.5px] text-forest hover:underline">Edit cost estimate</button>}
      </div>
      {!f.costKnown && !edit && <p className="mb-2 text-[12px] text-warning">No cost estimate set — add one to see gross profit and margin.</p>}
      {edit && (
        <div className="mb-3 grid grid-cols-2 gap-2.5">
          <Field label="Estimated delivery cost"><Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} /></Field>
          <Field label="Consultant days"><Input type="number" value={days} onChange={(e) => setDays(e.target.value)} /></Field>
          <div className="col-span-2 flex gap-2"><Button onClick={save}>Save</Button><Button variant="outline" onClick={() => setEdit(false)}>Cancel</Button></div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {[
          { l: 'Revenue (net)', v: m(f.netRevenue) },
          { l: 'Est. cost', v: f.costKnown ? m(f.cost) : '—' },
          { l: 'Gross profit', v: f.costKnown ? m(f.grossProfit) : '—', tone: f.costKnown ? marginTone : '' },
          { l: 'Margin', v: f.costKnown ? `${Math.round(f.marginPct * 100)}%` : '—', tone: f.costKnown ? marginTone : '' },
          { l: 'Win probability', v: `${f.winProbability}%` },
          { l: 'Expected revenue', v: m(f.expectedRevenue), tone: 'text-forest' },
          { l: 'Expected profit', v: f.costKnown ? m(f.expectedProfit) : '—' },
          { l: 'Avg daily revenue', v: f.consultantDays > 0 ? m(f.avgDailyRevenue) : '—' },
        ].map((x) => (
          <div key={x.l}>
            <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">{x.l}</p>
            <p className={cn('tnum mt-0.5 text-[14px] font-semibold', x.tone)}>{x.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
export function Proposals() {
  const { state, dispatch, focusId, setFocusId, user, userById, setModule, toast, companyById } = useApp();
  const [status, setStatus] = useState('');
  const [signOpen, setSignOpen] = useState(false);
  const [signer, setSigner] = useState({ name: '', email: '' });
  const rows = state.proposals.filter((p) => !status || p.status === status);
  const p = state.proposals.find((x) => x.id === focusId);
  const co = companyById(p?.companyId);

  return (
    <div className="enter-up">
      <PageHeader title="Proposals"
        subtitle="Drafted from the service catalogue, issued as branded documents and accepted electronically. Acceptance builds the project, contract and onboarding tasks."
        meta={<>
          <Badge tone="info" dot>{state.proposals.filter((x) => ['Sent', 'Viewed'].includes(x.status)).length} awaiting decision</Badge>
          <Badge tone="success" dot>{state.proposals.filter((x) => x.status === 'Accepted').length} accepted</Badge>
          <Badge tone="muted">{money(state.proposals.filter((x) => ['Sent', 'Viewed', 'Changes Requested'].includes(x.status)).reduce((s, x) => s + toXAF(proposalValue(x), x.currency), 0), 'XAF', true)} open value</Badge>
        </>} />

      <Toolbar>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto">
          <option value="">All statuses</option>
          {['Draft', 'Internal Review', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Changes Requested', 'Expired'].map((s) => <option key={s}>{s}</option>)}
        </Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} proposals</span>
      </Toolbar>

      <Section flush>
        <DataTable rows={rows} onRowClick={(x) => setFocusId(x.id)} columns={[
          { key: 'n', header: 'Proposal', sort: (x) => x.number, cell: (x) => <div><p className="font-medium">{x.number}</p><p className="truncate text-[11.5px] text-muted-foreground">{x.title}</p></div> },
          { key: 'c', header: 'Client', cell: (x) => companyById(x.companyId)?.tradingName, hideBelow: 'md' },
          { key: 'v', header: 'Value', align: 'right', sort: (x) => proposalValue(x), cell: (x) => money(proposalValue(x), x.currency) },
          { key: 's', header: 'Status', cell: (x) => <StatusBadge status={x.status} /> },
          { key: 'd', header: 'Sent', cell: (x) => (x.sent ? fmtDate(x.sent) : '—'), hideBelow: 'lg' },
          { key: 'val', header: 'Valid until', cell: (x) => <span className={daysFromToday(x.validUntil) < 0 ? 'text-muted-foreground' : ''}>{fmtDate(x.validUntil)}</span>, hideBelow: 'lg' },
          { key: 'o', header: 'Owner', align: 'center', cell: (x) => <Avatar size="xs" name={userById(x.owner)?.name} /> },
        ]} />
      </Section>

      <Drawer open={!!p} onClose={() => setFocusId(null)} width="max-w-3xl" title={p?.number ?? ''}
        subtitle={p && <span className="flex flex-wrap items-center gap-2"><StatusBadge status={p.status} />{p.title}</span>}
        footer={p && <>
          <Button variant="outline" onClick={() => window.print()}><Download className="size-3.5" />PDF</Button>
          {['Draft', 'Internal Review'].includes(p.status) && (
            <Button onClick={() => { dispatch({ type: 'sendProposal', proposalId: p.id, user: user.id }); toast('Proposal sent and a three-day follow-up task created.'); }}>
              <Send className="size-3.5" />Send to client
            </Button>
          )}
          {['Sent', 'Viewed', 'Changes Requested'].includes(p.status) && (
            <>
              <Button variant="outline" onClick={() => { dispatch({ type: 'rejectProposal', proposalId: p.id, reason: 'Client declined on price', user: user.id }); toast('Proposal marked rejected and the opportunity closed as lost.', 'warning'); }}>Record rejection</Button>
              <Button onClick={() => { setSigner({ name: state.contacts.find((c) => c.companyId === p.companyId && c.decisionMaker)?.firstName + ' ' + (state.contacts.find((c) => c.companyId === p.companyId && c.decisionMaker)?.lastName ?? ''), email: state.contacts.find((c) => c.companyId === p.companyId && c.decisionMaker)?.email ?? '' }); setSignOpen(true); }}>
                <PenLine className="size-3.5" />Record acceptance
              </Button>
            </>
          )}
          {p.status === 'Accepted' && (
            <>
              {p.projectId && <Button variant="outline" onClick={() => { setModule('projects', p.projectId); setFocusId(null); }}>Open project</Button>}
              <Button onClick={() => { dispatch({ type: 'proposalToInvoice', proposalId: p.id, user: user.id }); toast('Invoice raised for the first instalment.'); setModule('invoices'); setFocusId(null); }}>Convert to invoice<ArrowRight className="size-3.5" /></Button>
            </>
          )}
        </>}>
        {p && <ProposalDocument p={p} company={co} />}
        {p && <ProposalProfitabilityPanel p={p} />}
      </Drawer>

      <Modal open={signOpen} onClose={() => setSignOpen(false)} title="Record electronic acceptance"
        footer={<><Button variant="outline" onClick={() => setSignOpen(false)}>Cancel</Button>
          <Button onClick={() => { if (p) { dispatch({ type: 'acceptProposal', proposalId: p.id, signer, user: user.id }); toast('Accepted. Client status, project, contract, onboarding tasks and document requests have all been created.'); } setSignOpen(false); setFocusId(null); setModule('projects'); }}>
            <ShieldCheck className="size-3.5" />Confirm acceptance</Button></>}>
        <div className="space-y-3">
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            Acceptance is captured with the signatory's name, email, timestamp, IP address and the document version. The signed record is stored against the proposal and cannot be edited afterwards.
          </p>
          <Field label="Signatory name"><Input value={signer.name} onChange={(e) => setSigner({ ...signer, name: e.target.value })} /></Field>
          <Field label="Signatory email"><Input value={signer.email} onChange={(e) => setSigner({ ...signer, email: e.target.value })} /></Field>
          <div className="panel-flat bg-secondary/50 p-3 text-[12px] leading-relaxed text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Acceptance statement</p>
            I confirm I am authorised to accept this proposal on behalf of {co?.legalName ?? 'the client'}, and that acceptance forms a binding engagement on the terms set out in the document.
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ProposalDocument({ p, company }: { p: any; company: any }) {
  const { state } = useApp();
  const total = proposalValue(p);
  return (
    <div className="space-y-5">
      {/* Document preview */}
      <div className="panel-flat overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b-2 border-forest bg-secondary/40 px-5 py-4">
          <div>
            <p className="font-display text-[17px] font-semibold tracking-tight text-forest">BALIA Consulting</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.13em] text-muted-foreground">International Trade, Customs & Market Entry Advisory</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Proposal</p>
            <p className="tnum font-display text-[14px] font-semibold">{p.number}</p>
            <p className="tnum mt-0.5 text-[11.5px] text-muted-foreground">{fmtDate(p.created)}</p>
          </div>
        </div>
        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Prepared for</p>
              <p className="text-[13px] font-medium">{company?.legalName}</p>
              <p className="text-[12px] text-muted-foreground">{company?.address}</p>
            </div>
            <div>
              <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Valid until</p>
              <p className="text-[13px]">{fmtDate(p.validUntil, 'long')}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">{p.timeline}</p>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Scope of work</p>
            <p className="prose-editorial">{p.scope}</p>
          </div>

          <div>
            <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Deliverables</p>
            <ul className="space-y-1">
              {p.deliverables.map((d: string) => (
                <li key={d} className="flex items-start gap-2 text-[12.5px]"><span className="mt-1.5 size-1 shrink-0 rounded-full bg-gold" />{d}</li>
              ))}
            </ul>
          </div>

          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="border-y border-border">
                <th className="py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Service</th>
                <th className="py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Qty</th>
                <th className="py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Fee</th>
              </tr>
            </thead>
            <tbody>
              {p.services.map((it: any, i: number) => (
                <tr key={i} className="border-b border-border/70">
                  <td className="py-2 pr-3">
                    <p className="font-medium">{SERVICES.find((s) => s.id === it.serviceId)?.name}</p>
                    <p className="text-[11.5px] leading-relaxed text-muted-foreground">{it.description}</p>
                  </td>
                  <td className="py-2 text-right tabular-nums">{it.qty}</td>
                  <td className="py-2 text-right tabular-nums">{money(it.rate, p.currency)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2} className="py-2.5 text-right text-[12px] font-semibold uppercase tracking-wide">Total</td>
                <td className="py-2.5 text-right font-display text-[15px] font-semibold tabular-nums">{money(total, p.currency)}</td>
              </tr>
            </tbody>
          </table>

          <div className="grid gap-4 border-t border-border pt-3 sm:grid-cols-2">
            <Stat label="Payment terms" value={p.paymentTerms} />
            <Stat label="Assumptions" value={p.assumptions} />
          </div>
        </div>
      </div>

      {p.signature && (
        <div className="panel-flat bg-success-soft/50 p-3.5">
          <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-success"><ShieldCheck className="size-3.5" />Electronically accepted</p>
          <p className="text-[12.5px] leading-relaxed text-success">{p.signature.statement}</p>
          <dl className="mt-2.5 grid grid-cols-2 gap-2 border-t border-success/20 pt-2.5 text-[11.5px] text-success">
            <div><dt className="opacity-70">Signed by</dt><dd className="font-medium">{p.signature.name}</dd></div>
            <div><dt className="opacity-70">Email</dt><dd>{p.signature.email}</dd></div>
            <div><dt className="opacity-70">Timestamp</dt><dd className="tnum">{new Date(p.signature.at).toLocaleString('en-GB')}</dd></div>
            <div><dt className="opacity-70">IP address</dt><dd className="tnum">{p.signature.ip}</dd></div>
          </dl>
        </div>
      )}

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Tracking</p>
        <Timeline items={[
          { id: '1', at: fmtDate(p.created), title: 'Proposal created', tone: 'muted' as const },
          ...(p.sent ? [{ id: '2', at: fmtDate(p.sent), title: 'Sent to client', tone: 'info' as const }] : []),
          ...(p.viewed ? [{ id: '3', at: fmtDate(p.viewed), title: 'Opened by client', tone: 'gold' as const }] : []),
          ...(p.accepted ? [{ id: '4', at: fmtDate(p.accepted), title: 'Accepted', detail: 'Project, contract and onboarding tasks generated', tone: 'success' as const }] : []),
          ...(p.rejected ? [{ id: '5', at: fmtDate(p.rejected), title: 'Rejected', tone: 'danger' as const }] : []),
        ].reverse()} />
      </div>
    </div>
  );
}

// ===========================================================================
export function Contracts() {
  const { state, focusId, setFocusId, userById, companyById, setModule } = useApp();
  const c = state.contracts.find((x) => x.id === focusId);
  const reminders = [90, 60, 30, 7];

  return (
    <div className="enter-up">
      <PageHeader title="Contracts"
        subtitle="Engagement letters, statements of work, master agreements and retainers, with renewal monitoring at 90, 60, 30 and 7 days."
        meta={<>
          <Badge tone="forest" dot>{state.contracts.filter((x) => x.status === 'Active').length} active</Badge>
          <Badge tone="warning" dot>{state.contracts.filter((x) => x.status === 'Expiring').length} expiring</Badge>
          <Badge tone="muted">{money(state.contracts.filter((x) => x.status !== 'Expired').reduce((s, x) => s + toXAF(x.value, x.currency), 0), 'XAF', true)} contracted</Badge>
        </>} />

      <Section flush>
        <DataTable rows={state.contracts} onRowClick={(x) => setFocusId(x.id)} columns={[
          { key: 'n', header: 'Contract', sort: (x) => x.number, cell: (x) => <div><p className="font-medium">{x.number}</p><p className="text-[11.5px] text-muted-foreground">{x.type}</p></div> },
          { key: 'c', header: 'Client', cell: (x) => companyById(x.companyId)?.tradingName, hideBelow: 'sm' },
          { key: 'v', header: 'Value', align: 'right', sort: (x) => x.value, cell: (x) => money(x.value, x.currency) },
          { key: 'p', header: 'Period', cell: (x) => `${fmtDate(x.start)} → ${fmtDate(x.end)}`, hideBelow: 'lg' },
          { key: 'r', header: 'Renewal', sort: (x) => x.renewal, cell: (x) => { const d = daysFromToday(x.renewal); return <span className={d <= 30 ? 'font-medium text-warning' : ''}>{fmtDate(x.renewal)} <span className="text-[11px] text-muted-foreground">({relativeDays(x.renewal)})</span></span>; } },
          { key: 's', header: 'Status', cell: (x) => <StatusBadge status={x.status} /> },
        ]} />
      </Section>

      <Drawer open={!!c} onClose={() => setFocusId(null)} title={c?.number ?? ''}
        subtitle={c && <span className="flex items-center gap-2"><StatusBadge status={c.status} />{c.type} · {companyById(c.companyId)?.tradingName}</span>}
        footer={c && <><Button variant="outline" onClick={() => window.print()}><Download className="size-3.5" />Signed PDF</Button><Button onClick={() => { setModule('proposals'); setFocusId(null); }}>Prepare renewal</Button></>}>
        {c && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
              <Stat label="Client" value={companyById(c.companyId)?.legalName} className="col-span-2" />
              <Stat label="Contract value" value={money(c.value, c.currency)} />
              <Stat label="Payment terms" value={c.paymentTerms} />
              <Stat label="Start" value={fmtDate(c.start, 'long')} />
              <Stat label="End" value={fmtDate(c.end, 'long')} />
              <Stat label="Renewal date" value={`${fmtDate(c.renewal)} · ${relativeDays(c.renewal)}`} />
              <Stat label="Responsible" value={userById(c.owner)?.name} />
              <Stat label="Linked projects" value={c.projectIds.map((id) => state.projects.find((p) => p.id === id)?.name).join(', ')} className="col-span-2" />
              <Stat label="Signed document" value={c.signedDoc} className="col-span-2" />
              <Stat label="Notes" value={c.notes} className="col-span-2" />
            </dl>

            {c.signature && (
              <div className="panel-flat bg-secondary/40 p-3.5">
                <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold"><FileSignature className="size-3.5 text-forest" />Signature record</p>
                <dl className="grid grid-cols-2 gap-2 text-[11.5px]">
                  <div><dt className="text-muted-foreground">Signed by</dt><dd className="font-medium">{c.signature.name}</dd></div>
                  <div><dt className="text-muted-foreground">Email</dt><dd>{c.signature.email}</dd></div>
                  <div><dt className="text-muted-foreground">Timestamp</dt><dd className="tnum">{new Date(c.signature.at).toLocaleString('en-GB')}</dd></div>
                  <div><dt className="text-muted-foreground">IP</dt><dd className="tnum">{c.signature.ip}</dd></div>
                </dl>
              </div>
            )}

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Renewal reminder schedule</p>
              <ul className="space-y-1.5">
                {reminders.map((r) => {
                  const days = daysFromToday(c.renewal);
                  const fired = days <= r;
                  return (
                    <li key={r} className="flex items-center gap-2.5 text-[12.5px]">
                      <span className={cn('size-1.5 rounded-full', fired ? 'bg-warning' : 'bg-border')} />
                      <span className={fired ? 'text-foreground' : 'text-muted-foreground'}>{r} days before renewal</span>
                      <span className="ml-auto text-[11.5px] text-muted-foreground">{fired ? 'Sent' : 'Pending'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

// ===========================================================================
export function Invoices() {
  const { state, dispatch, focusId, setFocusId, user, companyById, toast, can } = useApp();
  const [tab, setTab] = useState('all');
  const [payOpen, setPayOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  const facts = state.invoices.map((i) => ({ i, t: invoiceTotals(i, state.payments) }));
  const filtered = facts.filter(({ t, i }) =>
    tab === 'all' ? true :
    tab === 'overdue' ? t.status === 'Overdue' :
    tab === 'unpaid' ? t.balance > 0 && !['Draft', 'Cancelled', 'Void'].includes(i.status) :
    tab === 'draft' ? i.status === 'Draft' : t.status === 'Paid');

  const inv = state.invoices.find((x) => x.id === focusId);
  const invT = inv ? invoiceTotals(inv, state.payments) : null;

  const totalOutstanding = facts.filter((f) => f.i.status !== 'Draft').reduce((s, f) => s + toXAF(f.t.balance, f.i.currency), 0);
  const totalOverdue = facts.filter((f) => f.t.status === 'Overdue').reduce((s, f) => s + toXAF(f.t.balance, f.i.currency), 0);
  const collected = facts.reduce((s, f) => s + toXAF(f.t.paid, f.i.currency), 0);

  return (
    <div className="enter-up">
      <PageHeader title="Invoices"
        subtitle="Numbers are issued sequentially and never reused. Balances update automatically as payments are recorded; overdue status is derived from the due date, not set by hand."
        actions={<>
          <Button variant="outline" onClick={() => { dispatch({ type: 'generateRecurring', recurringId: 'REC-001', user: user.id }); toast('Next retainer invoice generated and the schedule advanced.'); }}>
            <Repeat className="size-3.5" />Run recurring
          </Button>
          {can('record.edit') && <Button onClick={() => setNewOpen(true)}>
            <Plus className="size-3.5" />New invoice
          </Button>}
        </>} />

      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <KpiCard dense label="Collected" value={money(collected, 'XAF', true)} sub="all invoices" />
        <KpiCard dense label="Outstanding" value={money(totalOutstanding, 'XAF', true)} tone={totalOutstanding > 0 ? 'warning' : 'neutral'} />
        <KpiCard dense label="Overdue" value={money(totalOverdue, 'XAF', true)} tone={totalOverdue > 0 ? 'danger' : 'success'} sub={`${facts.filter((f) => f.t.status === 'Overdue').length} invoices`} />
        <KpiCard dense label="Next number" value={`${state.settings.finance.invoicePrefix}${String(state.counters.invoice).padStart(4, '0')}`} sub="sequential" />
      </div>

      <Tabs active={tab} onChange={setTab} className="mb-3" tabs={[
        { id: 'all', label: 'All', count: facts.length },
        { id: 'unpaid', label: 'Unpaid', count: facts.filter((f) => f.t.balance > 0 && !['Draft', 'Cancelled', 'Void'].includes(f.i.status)).length },
        { id: 'overdue', label: 'Overdue', count: facts.filter((f) => f.t.status === 'Overdue').length },
        { id: 'paid', label: 'Paid', count: facts.filter((f) => f.t.status === 'Paid').length },
        { id: 'draft', label: 'Draft', count: facts.filter((f) => f.i.status === 'Draft').length },
      ]} />

      <Section flush>
        <DataTable rows={filtered.map((f) => ({ ...f.i, _t: f.t }))} onRowClick={(x) => setFocusId(x.id)} columns={[
          { key: 'n', header: 'Invoice', sort: (x) => x.number, cell: (x) => <div><p className="font-medium">{x.number}</p><p className="truncate text-[11.5px] text-muted-foreground">{x.items[0]?.description}</p></div> },
          { key: 'c', header: 'Client', cell: (x) => companyById(x.companyId)?.tradingName, hideBelow: 'md' },
          { key: 'i', header: 'Issued', cell: (x) => fmtDate(x.issued), sort: (x) => x.issued, hideBelow: 'lg' },
          { key: 'd', header: 'Due', sort: (x) => x.due, cell: (x) => <span className={(x as any)._t.status === 'Overdue' ? 'font-medium text-danger' : ''}>{fmtDate(x.due)}</span> },
          { key: 't', header: 'Total', align: 'right', sort: (x) => (x as any)._t.total, cell: (x) => money((x as any)._t.total, x.currency) },
          { key: 'p', header: 'Paid', align: 'right', cell: (x) => <span className="text-muted-foreground">{money((x as any)._t.paid, x.currency)}</span>, hideBelow: 'md' },
          { key: 'b', header: 'Balance', align: 'right', cell: (x) => <span className={(x as any)._t.balance > 0 ? 'font-medium' : 'text-muted-foreground'}>{money((x as any)._t.balance, x.currency)}</span> },
          { key: 's', header: 'Status', cell: (x) => <StatusBadge status={(x as any)._t.status} /> },
        ]} />
      </Section>

      <Section className="mt-4" title="Recurring schedules" description="Retainers and repeat billing arrangements" flush>
        <DataTable rows={state.recurring} columns={[
          { key: 'd', header: 'Schedule', cell: (r) => <div><p className="font-medium">{r.description}</p><p className="text-[11.5px] text-muted-foreground">{companyById(r.companyId)?.tradingName}</p></div> },
          { key: 'a', header: 'Amount', align: 'right', cell: (r) => money(r.amount, r.currency) },
          { key: 'f', header: 'Frequency', cell: (r) => r.frequency },
          { key: 'n', header: 'Next run', cell: (r) => `${fmtDate(r.next)} · ${relativeDays(r.next)}` },
          { key: 's', header: 'Status', cell: (r) => <Badge tone={r.status === 'Active' ? 'forest' : 'muted'} dot>{r.status}</Badge> },
          { key: 'x', header: '', align: 'right', cell: (r) => <Button size="sm" variant="outline" onClick={() => { dispatch({ type: 'generateRecurring', recurringId: r.id, user: user.id }); toast('Invoice generated and the next run date advanced.'); }}>Generate now</Button> },
        ]} />
      </Section>

      <Drawer open={!!inv} onClose={() => setFocusId(null)} width="max-w-3xl" title={inv?.number ?? ''}
        subtitle={inv && invT && <span className="flex flex-wrap items-center gap-2"><StatusBadge status={invT.status} />{companyById(inv.companyId)?.tradingName}{invT.status === 'Overdue' && <span className="font-medium text-danger">{invT.overdueDays} days overdue</span>}</span>}
        footer={inv && invT && <>
          <Button variant="outline" onClick={() => window.print()}><Printer className="size-3.5" />Print</Button>
          {inv.status === 'Draft' && <Button onClick={() => { dispatch({ type: 'sendInvoice', invoiceId: inv.id, user: user.id }); toast('Invoice sent and the send date recorded.'); }}><Send className="size-3.5" />Send</Button>}
          {invT.balance > 0 && inv.status !== 'Draft' && <Button onClick={() => setPayOpen(true)}>Record payment</Button>}
        </>}>
        {inv && invT && <InvoiceDocument inv={inv} totals={invT} />}
      </Drawer>

      {inv && <RecordPaymentModal open={payOpen} onClose={() => setPayOpen(false)} invoice={inv} />}
      <NewInvoiceModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}

type DraftItem = { description: string; qty: string; rate: string; tax: string };
function NewInvoiceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, user, companyById, setModule, toast } = useApp();
  const firstCompany = state.companies.find((c) => c.status === 'Client')?.id ?? state.companies[0]?.id ?? '';
  const blankItem: DraftItem = { description: '', qty: '1', rate: '', tax: '19.25' };
  const blank = { companyId: firstCompany, contactId: '', currency: 'XAF', due: addDays(TODAY_ISO, 30), notes: '' };
  const [form, setForm] = useState(blank);
  const [items, setItems] = useState<DraftItem[]>([{ ...blankItem }]);

  const contacts = state.contacts.filter((c) => c.companyId === form.companyId);
  const subtotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
  const taxTotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0) * ((Number(it.tax) || 0) / 100), 0);

  const setItem = (i: number, patch: Partial<DraftItem>) => setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const addItem = () => setItems([...items, { ...blankItem }]);
  const removeItem = (i: number) => setItems(items.length > 1 ? items.filter((_, idx) => idx !== i) : items);

  const create = () => {
    const valid = items.filter((it) => it.description.trim() && Number(it.rate) > 0);
    if (!form.companyId || valid.length === 0) return;
    dispatch({
      type: 'createInvoice',
      invoice: {
        companyId: form.companyId, contactId: form.contactId || contacts[0]?.id || '',
        currency: form.currency, due: form.due, notes: form.notes,
        items: valid.map((it) => ({ description: it.description, qty: Number(it.qty) || 1, unit: 'Item', rate: Number(it.rate) || 0, discount: 0, tax: Number(it.tax) || 0 })),
      },
      user: user.id,
    });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Invoice created', record: companyById(form.companyId)?.tradingName ?? form.companyId, detail: `${money(subtotal + taxTotal, form.currency)}` } });
    toast('Draft invoice created. Open it to review and send.', 'success');
    setForm(blank);
    setItems([{ ...blankItem }]);
    setModule('invoices');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New invoice" width="max-w-2xl"
      footer={<><span className="mr-auto text-[12.5px] text-muted-foreground">Total <span className="tnum font-medium text-foreground">{money(subtotal + taxTotal, form.currency)}</span></span><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Create draft</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Client"><Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value, contactId: '' })}>{state.companies.map((c) => <option key={c.id} value={c.id}>{c.tradingName}</option>)}</Select></Field>
        <Field label="Contact"><Select value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })}><option value="">— Primary —</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}</Select></Field>
        <Field label="Currency"><Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{['XAF', 'USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Due date"><Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} /></Field>
      </div>
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Line items</p>
          <button onClick={addItem} className="flex items-center gap-1 text-[12px] text-forest hover:underline"><Plus className="size-3" />Add line</button>
        </div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-1.5">
              <Input value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} placeholder="Description" />
              <Input type="number" className="w-16" value={it.qty} onChange={(e) => setItem(i, { qty: e.target.value })} title="Qty" />
              <Input type="number" className="w-28" value={it.rate} onChange={(e) => setItem(i, { rate: e.target.value })} placeholder="Rate" />
              <Input type="number" className="w-20" value={it.tax} onChange={(e) => setItem(i, { tax: e.target.value })} title="Tax %" />
              <button onClick={() => removeItem(i)} disabled={items.length === 1} className="px-1 text-muted-foreground hover:text-danger disabled:opacity-30" title="Remove">×</button>
            </div>
          ))}
        </div>
      </div>
      <Field label="Notes" className="mt-3"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
    </Modal>
  );
}

function InvoiceDocument({ inv, totals }: { inv: any; totals: any }) {
  const { state, companyById } = useApp();
  const co = companyById(inv.companyId);
  const contact = state.contacts.find((c) => c.id === inv.contactId);
  const payments = state.payments.filter((p) => p.invoiceId === inv.id && p.amount > 0);
  const s = state.settings;

  return (
    <div className="space-y-5">
      <div className="panel-flat overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b-2 border-forest bg-secondary/40 px-5 py-4">
          <div>
            <p className="font-display text-[17px] font-semibold tracking-tight text-forest">BALIA Consulting</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{s.company.address}</p>
            <p className="text-[11px] text-muted-foreground">{s.company.email} · VAT {s.company.vat}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Invoice</p>
            <p className="tnum font-display text-[15px] font-semibold">{inv.number}</p>
            <p className="tnum mt-0.5 text-[11.5px] text-muted-foreground">Issued {fmtDate(inv.issued)}</p>
            <p className={cn('tnum text-[11.5px]', totals.status === 'Overdue' ? 'font-medium text-danger' : 'text-muted-foreground')}>Due {fmtDate(inv.due)}</p>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Billed to</p>
              <p className="text-[13px] font-medium">{co?.legalName}</p>
              {contact && <p className="text-[12px] text-muted-foreground">{contact.firstName} {contact.lastName} · {contact.email}</p>}
              <p className="text-[12px] text-muted-foreground">{co?.address}</p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Terms</p>
              <p className="text-[12.5px]">{inv.terms}</p>
              {inv.po && <p className="mt-1 text-[12px] text-muted-foreground">PO {inv.po}</p>}
            </div>
          </div>

          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="border-y border-border">
                <th className="py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Description</th>
                <th className="py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Qty</th>
                <th className="py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Rate</th>
                <th className="py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Tax</th>
                <th className="py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((it: any, i: number) => (
                <tr key={i} className="border-b border-border/70">
                  <td className="py-2 pr-3">{it.description}<span className="ml-1.5 text-[11px] text-muted-foreground">({it.unit})</span></td>
                  <td className="py-2 text-right tabular-nums">{it.qty}</td>
                  <td className="py-2 text-right tabular-nums">{money(it.rate, inv.currency)}</td>
                  <td className="py-2 text-right tabular-nums text-muted-foreground">{it.tax ? `${it.tax}%` : '—'}</td>
                  <td className="py-2 text-right font-medium tabular-nums">{money(it.qty * it.rate, inv.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto w-full max-w-[280px] space-y-1.5 text-[12.5px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{money(totals.subtotal, inv.currency)}</span></div>
            {totals.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="tabular-nums">−{money(totals.discount, inv.currency)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="tabular-nums">{money(totals.tax, inv.currency)}</span></div>
            <div className="flex justify-between border-t border-border pt-1.5 font-display text-[15px] font-semibold"><span>Total</span><span className="tabular-nums">{money(totals.total, inv.currency)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Paid</span><span className="tabular-nums">−{money(totals.paid, inv.currency)}</span></div>
            <div className={cn('flex justify-between border-t border-border pt-1.5 font-medium', totals.balance > 0 ? 'text-danger' : 'text-success')}>
              <span>Balance due</span><span className="tabular-nums">{money(totals.balance, inv.currency)}</span>
            </div>
          </div>

          <div className="border-t border-border pt-3 text-[11.5px] leading-relaxed text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Payment instructions</p>
            <p>{s.finance.bank}</p>
            <p className="mt-1">Please quote {inv.number} as the payment reference.</p>
            <p className="mt-2 italic">{s.finance.footer}</p>
          </div>
        </div>
      </div>

      {payments.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Payments applied</p>
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 border-b border-border py-2 text-[12.5px] last:border-0">
              <div><p className="font-medium">{money(p.amount, p.currency)}</p><p className="text-[11.5px] text-muted-foreground">{p.method} · {p.reference}</p></div>
              <span className="tnum text-muted-foreground">{fmtDate(p.date)}</span>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Reminder schedule</p>
        <ul className="space-y-1.5">
          {state.settings.reminders.map((r) => {
            const days = -daysFromToday(inv.due);
            const fired = totals.balance > 0 && days >= r.at;
            return (
              <li key={r.at} className="flex items-center gap-2.5 text-[12.5px]">
                <span className={cn('size-1.5 rounded-full', fired ? (r.at >= 14 ? 'bg-danger' : 'bg-warning') : 'bg-border')} />
                <span className={fired ? 'text-foreground' : 'text-muted-foreground'}>{r.at < 0 ? `${Math.abs(r.at)} days before due` : r.at === 0 ? 'On due date' : `${r.at} days overdue`} — {r.label}</span>
                <Badge tone="muted" className="ml-auto">{r.channel}</Badge>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function RecordPaymentModal({ open, onClose, invoice }: { open: boolean; onClose: () => void; invoice: any }) {
  const { state, dispatch, user, toast } = useApp();
  const totals = invoiceTotals(invoice, state.payments);
  const [form, setForm] = useState({ amount: String(totals.balance.toFixed(2)), date: TODAY_ISO, method: 'Bank transfer', reference: invoice.number, bank: '', transactionId: '', notes: '' });

  const submit = () => {
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return;
    dispatch({
      type: 'recordPayment', invoiceId: invoice.id,
      payment: { invoiceId: invoice.id, date: form.date, amount, currency: invoice.currency, method: form.method, reference: form.reference, bank: form.bank || '—', transactionId: form.transactionId || '—', notes: form.notes, recordedBy: user.id },
    });
    toast(`Payment of ${money(amount, invoice.currency)} recorded. Balance updated automatically.`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Record payment — ${invoice.number}`}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit}>Record payment</Button></>}>
      <div className="mb-4 panel-flat bg-secondary/40 p-3">
        <dl className="grid grid-cols-3 gap-2 text-[12.5px]">
          <div><dt className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Total</dt><dd className="tnum mt-0.5 font-medium">{money(totals.total, invoice.currency)}</dd></div>
          <div><dt className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Paid</dt><dd className="tnum mt-0.5 font-medium">{money(totals.paid, invoice.currency)}</dd></div>
          <div><dt className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Balance</dt><dd className="tnum mt-0.5 font-medium text-danger">{money(totals.balance, invoice.currency)}</dd></div>
        </dl>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={`Amount (${invoice.currency})`}><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
        <Field label="Payment date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="Method">
          <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
            {['Bank transfer', 'Card', 'Mobile money', 'Cash', 'Cheque', 'Payment gateway', 'Other'].map((m) => <option key={m}>{m}</option>)}
          </Select>
        </Field>
        <Field label="Reference"><Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></Field>
        <Field label="Bank / provider"><Input value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} placeholder="e.g. Société Générale" /></Field>
        <Field label="Transaction ID"><Input value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} /></Field>
        <Field label="Notes" className="sm:col-span-2"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </div>
      <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
        Partial payments are supported. The invoice balance and status recalculate immediately, and the entry is written to the audit log with your user against it.
      </p>
    </Modal>
  );
}

// ===========================================================================
export function Payments() {
  const { state, companyById, userById, setModule } = useApp();
  const rows = state.payments.filter((p) => p.amount > 0);
  const total = rows.reduce((s, p) => s + toXAF(p.amount, p.currency), 0);
  const byMethod = Object.entries(rows.reduce((m: Record<string, number>, p) => { m[p.method] = (m[p.method] ?? 0) + toXAF(p.amount, p.currency); return m; }, {}));

  return (
    <div className="enter-up">
      <PageHeader title="Payments"
        subtitle="Every receipt applied against an invoice, including partial settlements. Financial records are never deleted — corrections go through credit notes."
        meta={<><Badge tone="success" dot>{money(total, 'XAF', true)} received</Badge><Badge tone="muted">{rows.length} payments</Badge></>} />

      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {byMethod.map(([m, v]) => <KpiCard key={m} dense label={m} value={money(v, 'XAF', true)} />)}
      </div>

      <Section flush>
        <DataTable rows={rows} columns={[
          { key: 'i', header: 'Invoice', cell: (p) => { const inv = state.invoices.find((x) => x.id === p.invoiceId); return <button onClick={() => setModule('invoices', p.invoiceId)} className="font-medium underline-offset-2 hover:text-forest hover:underline">{inv?.number}</button>; } },
          { key: 'c', header: 'Client', cell: (p) => companyById(state.invoices.find((x) => x.id === p.invoiceId)?.companyId)?.tradingName, hideBelow: 'md' },
          { key: 'd', header: 'Date', sort: (p) => p.date, cell: (p) => fmtDate(p.date) },
          { key: 'a', header: 'Amount', align: 'right', sort: (p) => p.amount, cell: (p) => <span className="font-medium">{money(p.amount, p.currency)}</span> },
          { key: 'm', header: 'Method', cell: (p) => <Badge tone="muted">{p.method}</Badge> },
          { key: 'r', header: 'Reference', cell: (p) => <span className="text-muted-foreground">{p.reference}</span>, hideBelow: 'lg' },
          { key: 'b', header: 'Bank', cell: (p) => <span className="text-muted-foreground">{p.bank}</span>, hideBelow: 'lg' },
          { key: 'u', header: 'Recorded by', align: 'center', cell: (p) => <Avatar size="xs" name={userById(p.recordedBy)?.name} /> },
        ]} />
      </Section>
    </div>
  );
}

// ===========================================================================
export function Expenses() {
  const { state, dispatch, companyById, userById, toast, user, users, can } = useApp();
  const [status, setStatus] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const rows = state.expenses.filter((e) => !status || e.status === status);
  const total = state.expenses.reduce((s, e) => s + toXAF(e.amount, e.currency), 0);
  const pending = state.expenses.filter((e) => e.status === 'Submitted');

  return (
    <div className="enter-up">
      <PageHeader title="Expenses"
        subtitle="Project and business costs, feeding directly into project profitability. Receipts are attached at submission."
        meta={<><Badge tone="muted">{money(total, 'XAF', true)} recorded</Badge><Badge tone="warning" dot>{pending.length} awaiting approval</Badge></>}
        actions={can('record.edit') ? <Button onClick={() => setAddOpen(true)}><Plus className="size-3.5" />Add expense</Button> : undefined} />

      <Toolbar>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto">
          <option value="">All statuses</option>{['Draft', 'Submitted', 'Approved', 'Rejected', 'Reimbursed'].map((s) => <option key={s}>{s}</option>)}
        </Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} expenses</span>
      </Toolbar>

      <Section flush>
        <DataTable rows={rows} columns={[
          { key: 'd', header: 'Expense', sort: (e) => e.date, cell: (e) => <div><p className="font-medium">{e.description}</p><p className="text-[11.5px] text-muted-foreground">{e.vendor} · {fmtDate(e.date)}</p></div> },
          { key: 'c', header: 'Category', cell: (e) => <Badge tone="muted">{e.category}</Badge>, hideBelow: 'md' },
          { key: 'p', header: 'Project', cell: (e) => state.projects.find((p) => p.id === e.projectId)?.name ?? '—', hideBelow: 'lg' },
          { key: 'a', header: 'Amount', align: 'right', sort: (e) => toXAF(e.amount, e.currency), cell: (e) => <span className="font-medium">{money(e.amount, e.currency)}</span> },
          { key: 'r', header: 'Reimbursable', align: 'center', cell: (e) => (e.reimbursable ? <Badge tone="gold">Yes</Badge> : <span className="text-muted-foreground">—</span>), hideBelow: 'lg' },
          { key: 's', header: 'Status', cell: (e) => <StatusBadge status={e.status} /> },
          { key: 'u', header: 'Owner', align: 'center', cell: (e) => <Avatar size="xs" name={userById(e.user)?.name} /> },
          { key: 'x', header: '', align: 'right', cell: (e) => (e.status === 'Submitted' ? (
            <Button size="sm" variant="outline" onClick={() => { dispatch({ type: 'patch', collection: 'expenses', id: e.id, changes: { status: 'Approved' } }); dispatch({ type: 'audit', entry: { user: user.id, action: 'Expense approved', record: e.id, detail: `${e.amount} ${e.currency}` } }); toast('Expense approved.'); }}>Approve</Button>
          ) : null) },
        ]} />
      </Section>
      <NewExpenseModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function NewExpenseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, user, users, toast } = useApp();
  const blank = {
    description: '', vendor: '', category: EXPENSE_CATEGORIES[0] as string, amount: '',
    currency: 'XAF', date: TODAY_ISO, projectId: '', method: 'Card', reimbursable: 'No',
    status: 'Submitted', owner: user.id, notes: '',
  };
  const [form, setForm] = useState(blank);

  const create = () => {
    if (!form.description.trim() || !form.amount) return;
    const project = state.projects.find((p) => p.id === form.projectId);
    const id = `EXP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const expense = {
      id, date: form.date, category: form.category, description: form.description, vendor: form.vendor,
      amount: Number(form.amount) || 0, currency: form.currency, tax: 0,
      projectId: form.projectId || undefined, companyId: project?.companyId,
      user: form.owner, method: form.method, receipt: '', reimbursable: form.reimbursable === 'Yes',
      status: form.status, notes: form.notes,
    };
    dispatch({ type: 'add', collection: 'expenses', record: expense });
    dispatch({ type: 'notify', note: { category: 'Finance', title: 'Expense recorded', detail: `${form.description} — ${money(expense.amount, expense.currency)}`, tone: 'info', link: { module: 'expenses', recordId: id } } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Expense created', record: id, detail: `${expense.amount} ${expense.currency} — ${form.category}` } });
    toast('Expense recorded.', 'success');
    setForm(blank);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add expense" width="max-w-xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Record expense</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Description" className="sm:col-span-2"><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What was the cost for?" /></Field>
        <Field label="Vendor"><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></Field>
        <Field label="Category"><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Amount"><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
        <Field label="Currency"><Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{['XAF', 'USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="Project (optional)"><Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}><option value="">— None —</option>{state.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
        <Field label="Method"><Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>{['Card', 'Bank transfer', 'Cash', 'Mobile money'].map((m) => <option key={m}>{m}</option>)}</Select></Field>
        <Field label="Reimbursable"><Select value={form.reimbursable} onChange={(e) => setForm({ ...form, reimbursable: e.target.value })}>{['No', 'Yes'].map((m) => <option key={m}>{m}</option>)}</Select></Field>
        <Field label="Status"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{['Draft', 'Submitted', 'Approved'].map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Owner"><Select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}>{users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></Field>
        <Field label="Notes" className="sm:col-span-2"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}
