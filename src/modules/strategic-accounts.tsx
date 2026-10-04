import React, { useState } from 'react';
import { ArrowRight, Plus, TrendingUp } from 'lucide-react';
import { useApp } from '@/store';
import {
  PageHeader, Section, Badge, Button, DataTable, Drawer, Toolbar, SearchInput,
  Select, KpiCard, EmptyState, Tabs, Stat, Modal, Field, Input, Textarea,
} from '@/components/kit';
import { cn } from '@/lib/utils';
import { money, fmtDate, relativeDays, clientHealth, TODAY_ISO } from '@/lib/derive';
import { crossSellFor, purchasedServiceIds } from '@/lib/crosssell';
import { SERVICES } from '@/data/catalog';
import { STRATEGIC_PRIORITIES, EXPANSION_LEVELS, ACCOUNT_PLAN_STATUSES } from '@/data/account-plans';
import type { AccountPlan } from '@/data/account-plans';

const PRIORITY_TONE: Record<string, 'danger' | 'gold' | 'info' | 'muted'> = { Critical: 'danger', High: 'gold', Medium: 'info', Low: 'muted' };

function useAccountView() {
  const { state } = useApp();
  return (state.accountPlans as AccountPlan[]).map((plan) => {
    const company = state.companies.find((c) => c.id === plan.companyId);
    const lastContact = state.communications.filter((x) => x.companyId === plan.companyId).map((x) => x.at).sort().slice(-1)[0];
    const health = company ? clientHealth(company, { invoices: state.invoices, payments: state.payments, projects: state.projects, tasks: state.tasks, lastContact }) : null;
    const crossSell = crossSellFor(plan.companyId, state);
    const crossSellValue = crossSell.reduce((s, r) => s + r.valueXAF, 0);
    return { id: plan.id, plan, company, health, crossSell, crossSellValue };
  });
}

export function StrategicAccounts() {
  const { setFocusId, focusId, can } = useApp();
  const rows0 = useAccountView();
  const [q, setQ] = useState('');
  const [priority, setPriority] = useState('');
  const [scope, setScope] = useState('all');
  const [addOpen, setAddOpen] = useState(false);

  let rows = rows0.filter((r) => {
    if (q && !`${r.company?.tradingName} ${r.company?.country} ${r.company?.industry} ${r.plan.objectives}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (priority && r.plan.strategicPriority !== priority) return false;
    return true;
  }).sort((a, b) => b.plan.estimatedAnnualValue - a.plan.estimatedAnnualValue);
  if (scope === 'top10') rows = rows.slice(0, 10);
  else if (scope === 'top25') rows = rows.slice(0, 25);

  const totalValue = rows0.reduce((s, r) => s + r.plan.estimatedAnnualValue, 0);
  const totalExpansion = rows0.reduce((s, r) => s + r.crossSellValue, 0);
  const critical = rows0.filter((r) => ['Critical', 'High'].includes(r.plan.strategicPriority)).length;

  return (
    <div className="enter-up">
      <PageHeader title="Strategic Accounts" subtitle="Account plans for BALIA's most important clients and prospects — objectives, relationship strength, expansion potential and the next strategic move, with live commercial facts pulled from each account."
        actions={can('record.edit') ? <Button onClick={() => setAddOpen(true)}><Plus className="size-3.5" />New account plan</Button> : undefined}
        meta={<Badge tone="forest" dot>{rows0.length} plans</Badge>} />

      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <KpiCard label="Account plans" value={String(rows0.length)} />
        <KpiCard label="Critical / High" value={String(critical)} tone={critical ? 'gold' : undefined} />
        <KpiCard label="Est. annual value" value={money(totalValue, 'XAF', true)} />
        <KpiCard label="Expansion potential" value={money(totalExpansion, 'XAF', true)} tone="success" sub="cross-sell across accounts" />
      </div>

      <Tabs tabs={[{ id: 'all', label: `All (${rows0.length})` }, { id: 'top10', label: 'Top 10' }, { id: 'top25', label: 'Top 25' }]} active={scope} onChange={setScope} />
      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search accounts…" className="w-full sm:w-56" />
        <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-auto"><option value="">All priorities</option>{STRATEGIC_PRIORITIES.map((p) => <option key={p}>{p}</option>)}</Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} shown</span>
      </Toolbar>

      <Section flush>
        {rows.length === 0 ? <EmptyState title="No account plans" detail="Create a plan for a key client or prospect." action={can('record.edit') ? <Button onClick={() => setAddOpen(true)}><Plus className="size-3.5" />New account plan</Button> : undefined} /> : (
          <DataTable rows={rows} onRowClick={(r) => setFocusId(r.plan.id)} columns={[
            { key: 'a', header: 'Account', sort: (r) => r.company?.tradingName ?? '', cell: (r) => (
              <div className="min-w-0"><p className="truncate font-medium">{r.company?.tradingName ?? '—'}</p><p className="truncate text-[11.5px] text-muted-foreground">{r.company?.city}, {r.company?.country} · {r.company?.industry}</p></div>
            ) },
            { key: 'p', header: 'Priority', cell: (r) => <Badge tone={PRIORITY_TONE[r.plan.strategicPriority]}>{r.plan.strategicPriority}</Badge> },
            { key: 'rs', header: 'Relationship', align: 'center', cell: (r) => (
              <div className="flex items-center justify-center gap-1.5"><div className="h-1.5 w-12 overflow-hidden rounded-full bg-secondary"><div className={cn('h-full rounded-full', r.plan.relationshipStrength >= 70 ? 'bg-forest' : r.plan.relationshipStrength >= 45 ? 'bg-gold' : 'bg-danger/70')} style={{ width: `${r.plan.relationshipStrength}%` }} /></div><span className="tnum text-[11.5px]">{r.plan.relationshipStrength}</span></div>
            ), sort: (r) => r.plan.relationshipStrength, hideBelow: 'md' },
            { key: 'h', header: 'Health', cell: (r) => r.health ? <Badge tone={r.health.tone}>{r.health.label}</Badge> : '—', hideBelow: 'lg' },
            { key: 'v', header: 'Annual value', align: 'right', cell: (r) => <span className="tnum">{money(r.plan.estimatedAnnualValue, r.plan.currency, true)}</span>, sort: (r) => r.plan.estimatedAnnualValue },
            { key: 'x', header: 'Expansion', align: 'center', cell: (r) => <Badge tone={r.plan.expansionPotential === 'High' ? 'success' : r.plan.expansionPotential === 'Medium' ? 'gold' : 'muted'}>{r.plan.expansionPotential}</Badge>, hideBelow: 'lg' },
            { key: 'nr', header: 'Next review', cell: (r) => relativeDays(r.plan.nextReview), hideBelow: 'lg' },
          ]} />
        )}
      </Section>

      {focusId && rows0.some((r) => r.plan.id === focusId) && <AccountPlanDrawer planId={focusId} onClose={() => setFocusId(null)} />}
      <AccountPlanModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function AccountPlanDrawer({ planId, onClose }: { planId: string; onClose: () => void }) {
  const { state, userById, setModule, can } = useApp();
  const view = useAccountView().find((r) => r.plan.id === planId);
  const [edit, setEdit] = useState(false);
  if (!view) return null;
  const { plan, company, health, crossSell, crossSellValue } = view;
  const purchased = purchasedServiceIds(plan.companyId, state).map((id) => SERVICES.find((s) => s.id === id)?.name).filter(Boolean);
  const projects = state.projects.filter((p) => p.companyId === plan.companyId);
  const contracts = state.contracts.filter((c) => c.companyId === plan.companyId);
  const dms = state.contacts.filter((c) => c.companyId === plan.companyId && c.decisionMaker);

  return (
    <Drawer open onClose={onClose} width="max-w-3xl" title={company?.tradingName ?? 'Account plan'}
      subtitle={<span className="flex flex-wrap items-center gap-2"><Badge tone={PRIORITY_TONE[plan.strategicPriority]}>{plan.strategicPriority}</Badge>{health && <Badge tone={health.tone} dot>{health.label} · {health.score}</Badge>}<Badge tone="muted">{plan.status}</Badge></span>}
      footer={<>{can('record.edit') && <Button variant="outline" onClick={() => setEdit(true)}>Edit plan</Button>}<Button onClick={() => { setModule('companies', plan.companyId); onClose(); }}>Open account<ArrowRight className="size-3.5" /></Button></>}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="panel-flat bg-secondary/40 px-3 py-2.5"><p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Est. annual value</p><p className="tnum mt-0.5 font-display text-[16px] font-semibold">{money(plan.estimatedAnnualValue, plan.currency, true)}</p></div>
          <div className="panel-flat bg-secondary/40 px-3 py-2.5"><p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Relationship</p><p className="tnum mt-0.5 font-display text-[16px] font-semibold">{plan.relationshipStrength}/100</p></div>
          <div className="panel-flat bg-secondary/40 px-3 py-2.5"><p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Expansion value</p><p className="tnum mt-0.5 font-display text-[16px] font-semibold text-forest">{money(crossSellValue, 'XAF', true)}</p></div>
          <div className="panel-flat bg-secondary/40 px-3 py-2.5"><p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Owner</p><p className="mt-0.5 truncate text-[13px] font-medium">{userById(plan.owner)?.name}</p></div>
        </div>

        <PlanBlock title="Strategic objectives" text={plan.objectives} />
        <PlanBlock title="Current challenges" text={plan.challenges} />
        <div className="grid gap-3 sm:grid-cols-2">
          <PlanBlock title="Competitors" text={plan.competitors} />
          <PlanBlock title="Relationship risks" text={plan.relationshipRisks} tone="warning" />
        </div>
        <div className="panel-flat border-l-forest/50 bg-forest-soft/25 p-3.5">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.055em] text-forest">Next strategic action</p>
          <p className="text-[12.5px] leading-relaxed">{plan.nextAction}</p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Next review: {fmtDate(plan.nextReview)} · {relativeDays(plan.nextReview)}</p>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Live commercial picture</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            <Stat label="Current services" value={purchased.length ? purchased.join(', ') : '—'} className="col-span-2 sm:col-span-3" />
            <Stat label="Active projects" value={String(projects.filter((p) => p.status !== 'Completed').length)} />
            <Stat label="Contracts" value={String(contracts.length)} />
            <Stat label="Decision-makers" value={dms.length ? dms.map((c) => `${c.firstName} ${c.lastName}`).join(', ') : '—'} />
          </dl>
        </div>

        {crossSell.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground"><TrendingUp className="size-3" />Cross-sell opportunities</p>
            <div className="space-y-1.5">{crossSell.slice(0, 5).map((r) => (
              <div key={r.serviceId} className="flex items-center justify-between gap-2 text-[12.5px]"><span className="truncate"><span className="font-medium">{r.name}</span> <span className="text-muted-foreground">· {r.reason}</span></span><span className="tnum shrink-0 text-muted-foreground">{money(r.valueXAF, 'XAF', true)}</span></div>
            ))}</div>
          </div>
        )}

        {plan.notes && <PlanBlock title="Account notes" text={plan.notes} />}
      </div>
      {edit && <AccountPlanModal open onClose={() => setEdit(false)} plan={plan} />}
    </Drawer>
  );
}

function PlanBlock({ title, text, tone }: { title: string; text: string; tone?: string }) {
  if (!text) return null;
  return (
    <div className={cn('panel-flat p-3.5', tone === 'warning' && 'bg-warning-soft/40')}>
      <p className={cn('mb-1 text-[11px] font-semibold uppercase tracking-[0.055em]', tone === 'warning' ? 'text-warning' : 'text-muted-foreground')}>{title}</p>
      <p className="text-[12.5px] leading-relaxed">{text}</p>
    </div>
  );
}

function AccountPlanModal({ open, onClose, plan }: { open: boolean; onClose: () => void; plan?: AccountPlan }) {
  const { state, dispatch, user, toast } = useApp();
  const clients = state.companies.filter((c) => ['Client', 'Prospect'].includes(c.status));
  const [form, setForm] = useState({
    companyId: plan?.companyId ?? clients[0]?.id ?? state.companies[0]?.id ?? '',
    owner: plan?.owner ?? user.id, strategicPriority: plan?.strategicPriority ?? 'High', status: plan?.status ?? 'Active',
    relationshipStrength: String(plan?.relationshipStrength ?? 60), estimatedAnnualValue: String(plan?.estimatedAnnualValue ?? 0),
    expansionPotential: plan?.expansionPotential ?? 'Medium', objectives: plan?.objectives ?? '', challenges: plan?.challenges ?? '',
    competitors: plan?.competitors ?? '', relationshipRisks: plan?.relationshipRisks ?? '', nextAction: plan?.nextAction ?? '',
    nextReview: plan?.nextReview ?? TODAY_ISO, notes: plan?.notes ?? '',
  });
  const save = () => {
    if (!form.companyId) return;
    const rec = { ...form, relationshipStrength: Number(form.relationshipStrength) || 0, estimatedAnnualValue: Number(form.estimatedAnnualValue) || 0, currency: 'XAF' };
    if (plan) {
      dispatch({ type: 'patch', collection: 'accountPlans', id: plan.id, changes: rec });
      dispatch({ type: 'audit', entry: { user: user.id, action: 'Account plan updated', record: plan.id, detail: state.companies.find((c) => c.id === form.companyId)?.tradingName ?? '' } });
      toast('Account plan updated.', 'success');
    } else {
      const id = `ACP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      dispatch({ type: 'add', collection: 'accountPlans', record: { id, ...rec, created: TODAY_ISO } });
      dispatch({ type: 'audit', entry: { user: user.id, action: 'Account plan created', record: id, detail: state.companies.find((c) => c.id === form.companyId)?.tradingName ?? '' } });
      toast('Account plan created.', 'success');
    }
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={plan ? 'Edit account plan' : 'New account plan'} width="max-w-2xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>{plan ? 'Save' : 'Create plan'}</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        {!plan && <Field label="Account" className="sm:col-span-2"><Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>{clients.map((c) => <option key={c.id} value={c.id}>{c.tradingName}</option>)}</Select></Field>}
        <Field label="Strategic priority"><Select value={form.strategicPriority} onChange={(e) => setForm({ ...form, strategicPriority: e.target.value })}>{STRATEGIC_PRIORITIES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
        <Field label="Status"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{ACCOUNT_PLAN_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Relationship strength (0-100)"><Input type="number" value={form.relationshipStrength} onChange={(e) => setForm({ ...form, relationshipStrength: e.target.value })} /></Field>
        <Field label="Est. annual value (XAF)"><Input type="number" value={form.estimatedAnnualValue} onChange={(e) => setForm({ ...form, estimatedAnnualValue: e.target.value })} /></Field>
        <Field label="Expansion potential"><Select value={form.expansionPotential} onChange={(e) => setForm({ ...form, expansionPotential: e.target.value })}>{EXPANSION_LEVELS.map((p) => <option key={p}>{p}</option>)}</Select></Field>
        <Field label="Next review"><Input type="date" value={form.nextReview} onChange={(e) => setForm({ ...form, nextReview: e.target.value })} /></Field>
        <Field label="Strategic objectives" className="sm:col-span-2"><Textarea rows={2} value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} /></Field>
        <Field label="Current challenges" className="sm:col-span-2"><Textarea rows={2} value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} /></Field>
        <Field label="Competitors"><Input value={form.competitors} onChange={(e) => setForm({ ...form, competitors: e.target.value })} /></Field>
        <Field label="Relationship risks"><Input value={form.relationshipRisks} onChange={(e) => setForm({ ...form, relationshipRisks: e.target.value })} /></Field>
        <Field label="Next strategic action" className="sm:col-span-2"><Textarea rows={2} value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} /></Field>
        <Field label="Account notes" className="sm:col-span-2"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}
