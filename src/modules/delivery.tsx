import React, { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Clock, FileUp, FilePlus2, ShieldAlert, ArrowRight, LayoutGrid, List, Paperclip, Upload } from 'lucide-react';
import { useApp } from '@/store';
import { SERVICES, DOCUMENT_CATEGORIES } from '@/data/catalog';
import {
  PageHeader, Section, Badge, Button, StatusBadge, DataTable, Drawer, Toolbar, SearchInput,
  Select, Stat, Avatar, EmptyState, Tabs, Progress, Modal, Field, Input, Textarea, Timeline,
} from '@/components/kit';
import { money, fmtDate, relativeDays, daysFromToday, projectProgress, projectHealth, projectMargin, TODAY_ISO, addDays } from '@/lib/derive';
import { cn } from '@/lib/utils';

// ===========================================================================
export function Projects() {
  const { state, dispatch, focusId, setFocusId, user, userById, setModule, toast, companyById, can, users } = useApp();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const rows = state.projects.filter((p) =>
    (!status || p.status === status) &&
    (!q || `${p.name} ${companyById(p.companyId)?.tradingName ?? ''}`.toLowerCase().includes(q.toLowerCase())));
  const project = state.projects.find((p) => p.id === focusId);

  return (
    <div className="enter-up">
      <PageHeader title="Projects"
        subtitle="Delivery engagements, each running the workflow defined by its service. Progress is computed from completed workflow steps, never typed in."
        actions={can('record.edit') ? <Button onClick={() => setAddOpen(true)}><FilePlus2 className="size-3.5" />New project</Button> : undefined}
        meta={<>
          <Badge tone="forest" dot>{state.projects.filter((p) => p.status === 'Active').length} active</Badge>
          <Badge tone="warning" dot>{state.projects.filter((p) => p.status === 'Waiting for Client').length} blocked</Badge>
          <Badge tone="success" dot>{state.projects.filter((p) => p.status === 'Completed').length} completed</Badge>
        </>} />

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search projects…" className="w-full sm:w-64" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto">
          <option value="">All statuses</option>
          {['Not Started', 'Planning', 'Active', 'Waiting for Client', 'Under Review', 'Completed', 'On Hold'].map((s) => <option key={s}>{s}</option>)}
        </Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} projects</span>
      </Toolbar>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((p) => {
          const h = projectHealth(p);
          const m = projectMargin(p);
          const co = companyById(p.companyId);
          return (
            <button key={p.id} onClick={() => setFocusId(p.id)} className="panel lift flex flex-col p-4 text-left">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium leading-snug">{p.name}</p>
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{co?.tradingName}</p>
                </div>
                <Badge tone={h.tone} dot>{h.label}</Badge>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-baseline justify-between text-[11.5px]">
                  <span className="text-muted-foreground">{p.workflow.filter((w) => w.done).length} of {p.workflow.length} steps</span>
                  <span className="tnum font-medium">{projectProgress(p)}%</span>
                </div>
                <Progress value={projectProgress(p)} tone={h.tone === 'danger' ? 'danger' : h.tone === 'warning' ? 'warning' : 'forest'} />
              </div>

              <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-[11.5px]">
                <div><dt className="text-muted-foreground">Budget</dt><dd className="tnum mt-0.5 font-medium">{money(p.budget, p.currency, true)}</dd></div>
                <div><dt className="text-muted-foreground">Margin</dt><dd className={cn('tnum mt-0.5 font-medium', m.margin < 40 ? 'text-warning' : 'text-success')}>{m.margin.toFixed(0)}%</dd></div>
                <div><dt className="text-muted-foreground">Due</dt><dd className={cn('mt-0.5 font-medium', daysFromToday(p.end) < 0 && p.status !== 'Completed' ? 'text-danger' : '')}>{fmtDate(p.end)}</dd></div>
              </dl>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
                <StatusBadge status={p.status} />
                <span className="flex -space-x-1.5">
                  {p.consultants.map((c) => <Avatar key={c} size="xs" name={userById(c)?.name} />)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {rows.length === 0 && <Section><EmptyState title="No projects match" detail="Clear the filters, or accept a proposal to generate a project automatically." /></Section>}

      {project && <ProjectDrawer projectId={project.id} onClose={() => setFocusId(null)} />}
      <NewProjectModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function NewProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, user, users, setModule, toast } = useApp();
  const clients = state.companies.filter((c) => c.status === 'Client');
  const firstCompany = (clients[0] ?? state.companies[0])?.id ?? '';
  const blank = {
    name: '', companyId: firstCompany, serviceId: SERVICES[0].id, manager: user.id,
    start: TODAY_ISO, end: addDays(TODAY_ISO, 60), budget: '5000000', currency: 'XAF',
    priority: 'Medium', status: 'Active', billingModel: 'Fixed fee', estimatedHours: '120', notes: '',
  };
  const [form, setForm] = useState(blank);

  const create = () => {
    if (!form.name.trim() || !form.companyId) return;
    const service = SERVICES.find((s) => s.id === form.serviceId);
    const id = `PRJ-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const project = {
      id, name: form.name, companyId: form.companyId, serviceId: form.serviceId,
      manager: form.manager, consultants: [form.manager], start: form.start, end: form.end,
      budget: Number(form.budget) || 0, currency: form.currency, status: form.status,
      priority: form.priority, billingModel: form.billingModel,
      estimatedHours: Number(form.estimatedHours) || 0, actualHours: 0,
      workflow: (service?.workflow ?? ['Client onboarding', 'Delivery', 'Final report', 'Project completion']).map((name) => ({ name, done: false })),
      notes: form.notes, cost: 0,
    };
    dispatch({ type: 'add', collection: 'projects', record: project });
    dispatch({ type: 'notify', note: { category: 'Delivery', title: 'New project created', detail: form.name, tone: 'success', link: { module: 'projects', recordId: id } } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Project created', record: id, detail: form.name } });
    toast('Project created with its service workflow. Progress tracks as you complete steps.', 'success');
    setForm(blank);
    setModule('projects', id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New project" width="max-w-xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Create project</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Project name" className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. EUDR Readiness Programme" /></Field>
        <Field label="Client"><Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>{state.companies.map((c) => <option key={c.id} value={c.id}>{c.tradingName}</option>)}</Select></Field>
        <Field label="Service"><Select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>{SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
        <Field label="Manager"><Select value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })}>{users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></Field>
        <Field label="Billing model"><Select value={form.billingModel} onChange={(e) => setForm({ ...form, billingModel: e.target.value })}>{['Fixed fee', 'Time & materials', 'Retainer', 'Milestone-based'].map((m) => <option key={m}>{m}</option>)}</Select></Field>
        <Field label="Start"><Input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Field>
        <Field label="Target end"><Input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Field>
        <Field label="Budget"><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></Field>
        <Field label="Currency"><Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{['XAF', 'USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Priority"><Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}</Select></Field>
        <Field label="Est. hours"><Input type="number" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} /></Field>
        <Field label="Notes" className="sm:col-span-2"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

function ProjectDrawer({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const { state, dispatch, user, userById, setModule, toast, companyById } = useApp();
  const [tab, setTab] = useState('workflow');
  const p = state.projects.find((x) => x.id === projectId)!;
  const co = companyById(p.companyId);
  const service = SERVICES.find((s) => s.id === p.serviceId);
  const tasks = state.tasks.filter((t) => t.projectId === p.id);
  const docs = state.documents.filter((d) => d.projectId === p.id);
  const invoices = state.invoices.filter((i) => i.projectId === p.id);
  const time = state.timeEntries.filter((t) => t.projectId === p.id);
  const h = projectHealth(p);
  const m = projectMargin(p);
  const progress = projectProgress(p);

  return (
    <Drawer open onClose={onClose} width="max-w-3xl" title={p.name}
      subtitle={<span className="flex flex-wrap items-center gap-2">
        <StatusBadge status={p.status} /><Badge tone={h.tone} dot>{h.label}</Badge>
        <span>{co?.tradingName} · {service?.name}</span>
      </span>}
      footer={<>
        <Button variant="outline" onClick={() => { setModule('documents'); onClose(); }}>Request documents</Button>
        <Button variant="outline" onClick={() => { setModule('invoices'); onClose(); }}>Raise invoice</Button>
        {p.status !== 'Completed' && (
          <Button disabled={progress < 100} title={progress < 100 ? 'Complete every workflow step first' : undefined}
            onClick={() => { dispatch({ type: 'completeProject', projectId: p.id, user: user.id }); toast('Project completed. Feedback request and a follow-on opportunity have been created.'); onClose(); }}>
            Complete project<ArrowRight className="size-3.5" />
          </Button>
        )}
      </>}>
      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { l: 'Progress', v: `${progress}%` },
          { l: 'Budget', v: money(p.budget, p.currency, true) },
          { l: 'Hours', v: `${p.actualHours} / ${p.estimatedHours}` },
          { l: 'Margin', v: `${m.margin.toFixed(0)}%`, tone: m.margin < 40 ? 'text-warning' : 'text-success' },
        ].map((s) => (
          <div key={s.l} className="panel-flat bg-secondary/40 px-3 py-2.5">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{s.l}</p>
            <p className={cn('tnum mt-1 font-display text-[17px] font-semibold', s.tone)}>{s.v}</p>
          </div>
        ))}
      </div>

      <Tabs active={tab} onChange={setTab} className="mb-4" tabs={[
        { id: 'workflow', label: 'Workflow', count: p.workflow.length },
        { id: 'tasks', label: 'Tasks', count: tasks.length },
        { id: 'docs', label: 'Documents', count: docs.length },
        { id: 'finance', label: 'Finance', count: invoices.length },
        { id: 'detail', label: 'Detail' },
      ]} />

      {tab === 'workflow' && (
        <div>
          <p className="mb-3 text-[12.5px] leading-relaxed text-muted-foreground">
            Steps come from the {service?.name} template. Ticking a step recalculates progress and moves the project out of Not Started.
          </p>
          <ol className="space-y-0">
            {p.workflow.map((w, i) => {
              const isNext = !w.done && p.workflow.slice(0, i).every((x) => x.done);
              return (
                <li key={w.name}>
                  <button onClick={() => dispatch({ type: 'toggleWorkflowStep', projectId: p.id, index: i, user: user.id })}
                    className={cn('flex w-full items-center gap-3 border-b border-border/70 px-1 py-2.5 text-left transition-colors last:border-0 hover:bg-secondary/60',
                      isNext && 'bg-forest-soft/40')}>
                    {w.done
                      ? <CheckCircle2 className="size-4 shrink-0 text-success" strokeWidth={2} />
                      : <Circle className={cn('size-4 shrink-0', isNext ? 'text-forest' : 'text-muted-foreground/50')} strokeWidth={1.8} />}
                    <span className={cn('flex-1 text-[13px]', w.done ? 'text-muted-foreground line-through decoration-muted-foreground/40' : 'text-foreground')}>{w.name}</span>
                    {isNext && <Badge tone="forest">Next</Badge>}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {tab === 'tasks' && (
        <ul className="divide-y divide-border">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-start gap-3 py-2.5">
              <button onClick={() => dispatch({ type: 'patch', collection: 'tasks', id: t.id, changes: { status: t.status === 'Completed' ? 'To Do' : 'Completed' } })}
                className="mt-0.5 shrink-0" aria-label="Toggle task">
                {t.status === 'Completed' ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-muted-foreground/60" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={cn('text-[13px]', t.status === 'Completed' && 'text-muted-foreground line-through')}>{t.name}</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">{userById(t.assignee)?.name} · due {fmtDate(t.due)}</p>
              </div>
              <StatusBadge status={t.status} />
            </li>
          ))}
          {!tasks.length && <li><EmptyState title="No tasks yet" detail="Tasks generate automatically when a project is created from an accepted proposal." /></li>}
        </ul>
      )}

      {tab === 'docs' && (
        <DataTable rows={docs} columns={[
          { key: 'n', header: 'Document', cell: (d) => <div><p className="font-medium">{d.name}</p><p className="text-[11.5px] text-muted-foreground">{d.category}</p></div> },
          { key: 's', header: 'Status', cell: (d) => <StatusBadge status={d.status} /> },
          { key: 'u', header: 'Uploaded', cell: (d) => (d.uploaded ? fmtDate(d.uploaded) : '—') },
        ]} empty={<EmptyState title="No documents linked" />} />
      )}

      {tab === 'finance' && (
        <div className="space-y-4">
          <DataTable rows={invoices} columns={[
            { key: 'n', header: 'Invoice', cell: (i) => <span className="font-medium">{i.number}</span> },
            { key: 'i', header: 'Issued', cell: (i) => fmtDate(i.issued) },
            { key: 't', header: 'Amount', align: 'right', cell: (i) => money(i.items.reduce((s, it) => s + it.qty * it.rate, 0), i.currency) },
            { key: 's', header: 'Status', cell: (i) => <StatusBadge status={i.status} /> },
          ]} empty={<EmptyState title="Nothing invoiced yet" />} />
          <div className="panel-flat bg-secondary/40 p-3.5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Profitability</p>
            <dl className="grid grid-cols-3 gap-3">
              <Stat label="Budget" value={money(m.revenue, 'XAF')} />
              <Stat label="Recorded cost" value={money(m.cost, 'XAF')} />
              <Stat label="Margin" value={<span className={m.margin < 40 ? 'text-warning' : 'text-success'}>{m.margin.toFixed(1)}%</span>} />
            </dl>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Time entries</p>
            {time.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 border-b border-border py-2 text-[12.5px] last:border-0">
                <span>{t.description}</span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  {t.billable ? <Badge tone="forest">Billable</Badge> : <Badge tone="muted">Internal</Badge>}
                  <span className="tnum">{t.hours}h</span>
                </span>
              </div>
            ))}
            {!time.length && <p className="text-[12.5px] text-muted-foreground">No time recorded.</p>}
          </div>
        </div>
      )}

      {tab === 'detail' && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
          <Stat label="Client" value={co?.legalName} className="col-span-2" />
          <Stat label="Service" value={service?.name} />
          <Stat label="Project manager" value={userById(p.manager)?.name} />
          <Stat label="Team" value={p.consultants.map((c) => userById(c)?.name).join(', ')} />
          <Stat label="Billing model" value={p.billingModel} />
          <Stat label="Start" value={fmtDate(p.start)} />
          <Stat label="End" value={`${fmtDate(p.end)} · ${relativeDays(p.end)}`} />
          <Stat label="Contract" value={state.contracts.find((c) => c.id === p.contractId)?.number} />
          <Stat label="Proposal" value={state.proposals.find((x) => x.id === p.proposalId)?.number} />
          <Stat label="Deliverables" value={service?.deliverables.join(' · ')} className="col-span-2" />
          <Stat label="Notes" value={p.notes} className="col-span-2" />
        </dl>
      )}
    </Drawer>
  );
}

// ===========================================================================
export function Tasks() {
  const { state, dispatch, focusId, setFocusId, user, userById, companyById, toast, can } = useApp();
  const [view, setView] = useState<'board' | 'list'>('board');
  const [scope, setScope] = useState<'all' | 'mine' | 'overdue'>('all');
  const [q, setQ] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const rows = state.tasks
    .filter((t) => (scope === 'all' || (scope === 'mine' && t.assignee === user.id) || (scope === 'overdue' && daysFromToday(t.due) < 0 && !['Completed', 'Cancelled'].includes(t.status))))
    .filter((t) => !q || t.name.toLowerCase().includes(q.toLowerCase()));

  const columns = ['To Do', 'In Progress', 'Waiting', 'Completed'];
  const task = state.tasks.find((t) => t.id === focusId);

  const setStatus = (id: string, status: string) => {
    dispatch({ type: 'patch', collection: 'tasks', id, changes: { status } });
    if (status === 'Completed') toast('Task completed.');
  };

  return (
    <div className="enter-up">
      <PageHeader title="Tasks"
        subtitle="Work generated by project workflows, automations and follow-ups — plus anything the team adds."
        meta={<>
          <Badge tone="danger" dot>{state.tasks.filter((t) => daysFromToday(t.due) < 0 && !['Completed', 'Cancelled'].includes(t.status)).length} overdue</Badge>
          <Badge tone="info" dot>{state.tasks.filter((t) => t.status === 'In Progress').length} in progress</Badge>
        </>}
        actions={<div className="flex items-center gap-2">
          {can('record.edit') && <Button onClick={() => setAddOpen(true)}><FilePlus2 className="size-3.5" />New task</Button>}
          <div className="flex rounded-md border border-input p-0.5">
            <button onClick={() => setView('board')} className={cn('rounded px-2 py-1 text-[12px]', view === 'board' ? 'bg-secondary font-medium' : 'text-muted-foreground')}><LayoutGrid className="mr-1 inline size-3" />Board</button>
            <button onClick={() => setView('list')} className={cn('rounded px-2 py-1 text-[12px]', view === 'list' ? 'bg-secondary font-medium' : 'text-muted-foreground')}><List className="mr-1 inline size-3" />List</button>
          </div>
        </div>} />

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search tasks…" className="w-full sm:w-56" />
        <div className="flex rounded-md border border-input p-0.5">
          {(['all', 'mine', 'overdue'] as const).map((s) => (
            <button key={s} onClick={() => setScope(s)} className={cn('rounded px-2.5 py-1 text-[12px] capitalize', scope === s ? 'bg-secondary font-medium' : 'text-muted-foreground')}>
              {s === 'mine' ? 'My tasks' : s}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} tasks</span>
      </Toolbar>

      {view === 'board' ? (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-3">
          {columns.map((col) => {
            const list = rows.filter((t) => t.status === col);
            return (
              <div key={col} className="flex w-[270px] shrink-0 flex-col">
                <div className="mb-2 flex items-baseline justify-between px-0.5">
                  <span className="text-[12.5px] font-semibold">{col}</span>
                  <span className="tnum text-[11.5px] text-muted-foreground">{list.length}</span>
                </div>
                <div className="flex flex-1 flex-col gap-2 rounded-lg bg-secondary/45 p-2">
                  {list.map((t) => {
                    const late = daysFromToday(t.due) < 0 && t.status !== 'Completed';
                    return (
                      <div key={t.id} className="panel lift p-2.5">
                        <button onClick={() => setFocusId(t.id)} className="block w-full text-left">
                          <p className="text-[12.5px] font-medium leading-snug">{t.name}</p>
                          {t.projectId && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{state.projects.find((p) => p.id === t.projectId)?.name}</p>}
                        </button>
                        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                          <span className="flex items-center gap-1.5">
                            <Avatar size="xs" name={userById(t.assignee)?.name} />
                            <Badge tone={t.priority === 'High' ? 'danger' : t.priority === 'Medium' ? 'gold' : 'muted'}>{t.priority}</Badge>
                          </span>
                          <span className={cn('tnum text-[11px]', late ? 'font-medium text-danger' : 'text-muted-foreground')}>{fmtDate(t.due).slice(0, 6)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {!list.length && <p className="px-2 py-6 text-center text-[11.5px] text-muted-foreground">Nothing here</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Section flush>
          <DataTable rows={rows} onRowClick={(t) => setFocusId(t.id)} columns={[
            { key: 'n', header: 'Task', sort: (t) => t.name, cell: (t) => (
              <div className="flex items-start gap-2.5">
                <button onClick={(e) => { e.stopPropagation(); setStatus(t.id, t.status === 'Completed' ? 'To Do' : 'Completed'); }} className="mt-0.5">
                  {t.status === 'Completed' ? <CheckCircle2 className="size-4 text-success" /> : <Circle className="size-4 text-muted-foreground/60" />}
                </button>
                <div className="min-w-0">
                  <p className={cn('font-medium', t.status === 'Completed' && 'text-muted-foreground line-through')}>{t.name}</p>
                  {t.projectId && <p className="truncate text-[11.5px] text-muted-foreground">{state.projects.find((p) => p.id === t.projectId)?.name}</p>}
                </div>
              </div>
            ) },
            { key: 'c', header: 'Client', cell: (t) => companyById(t.companyId)?.tradingName ?? '—', hideBelow: 'lg' },
            { key: 'p', header: 'Priority', cell: (t) => <Badge tone={t.priority === 'High' ? 'danger' : t.priority === 'Medium' ? 'gold' : 'muted'}>{t.priority}</Badge>, hideBelow: 'md' },
            { key: 'd', header: 'Due', sort: (t) => t.due, cell: (t) => <span className={daysFromToday(t.due) < 0 && t.status !== 'Completed' ? 'font-medium text-danger' : ''}>{fmtDate(t.due)}</span> },
            { key: 's', header: 'Status', cell: (t) => <StatusBadge status={t.status} /> },
            { key: 'a', header: 'Owner', align: 'center', cell: (t) => <Avatar size="xs" name={userById(t.assignee)?.name} /> },
          ]} />
        </Section>
      )}

      <Drawer open={!!task} onClose={() => setFocusId(null)} title={task?.name ?? ''}
        subtitle={task && <span className="flex items-center gap-2"><StatusBadge status={task.status} /><Badge tone={task.priority === 'High' ? 'danger' : 'muted'}>{task.priority} priority</Badge></span>}
        footer={task && <>
          {task.status !== 'Completed'
            ? <Button onClick={() => { setStatus(task.id, 'Completed'); setFocusId(null); }}>Mark complete</Button>
            : <Button variant="outline" onClick={() => setStatus(task.id, 'To Do')}>Reopen</Button>}
        </>}>
        {task && (
          <div className="space-y-5">
            {task.description && <p className="prose-editorial">{task.description}</p>}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
              <Stat label="Assignee" value={userById(task.assignee)?.name} />
              <Stat label="Due" value={`${fmtDate(task.due)} · ${relativeDays(task.due)}`} />
              <Stat label="Project" value={state.projects.find((p) => p.id === task.projectId)?.name} />
              <Stat label="Client" value={companyById(task.companyId)?.tradingName} />
              <Stat label="Estimated" value={`${task.estimatedHours}h`} />
              <Stat label="Actual" value={`${task.actualHours}h`} />
            </dl>
            {task.checklist.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Checklist</p>
                {task.checklist.map((c, i) => (
                  <label key={i} className="flex items-center gap-2.5 border-b border-border py-2 text-[13px] last:border-0">
                    <input type="checkbox" checked={c.done} className="size-3.5 accent-[hsl(var(--forest))]"
                      onChange={() => dispatch({ type: 'patch', collection: 'tasks', id: task.id, changes: { checklist: task.checklist.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) } })} />
                    <span className={c.done ? 'text-muted-foreground line-through' : ''}>{c.text}</span>
                  </label>
                ))}
              </div>
            )}
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Move to</p>
              <div className="flex flex-wrap gap-1.5">
                {['To Do', 'In Progress', 'Waiting', 'Completed', 'Cancelled'].filter((s) => s !== task.status).map((s) => (
                  <button key={s} onClick={() => setStatus(task.id, s)} className="rounded-md border border-border bg-card px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:border-forest/30 hover:bg-forest-soft hover:text-forest">{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
      <NewTaskModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function NewTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, user, users, setModule, toast } = useApp();
  const blank = {
    name: '', description: '', projectId: '', assignee: user.id,
    priority: 'Medium', due: addDays(TODAY_ISO, 7), status: 'To Do', estimatedHours: '2',
  };
  const [form, setForm] = useState(blank);

  const create = () => {
    if (!form.name.trim()) return;
    const project = state.projects.find((p) => p.id === form.projectId);
    const id = `TSK-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const task = {
      id, name: form.name, description: form.description,
      projectId: form.projectId || undefined, companyId: project?.companyId,
      assignee: form.assignee, priority: form.priority, due: form.due, status: form.status,
      estimatedHours: Number(form.estimatedHours) || 0, actualHours: 0, checklist: [], comments: [],
    };
    dispatch({ type: 'add', collection: 'tasks', record: task });
    dispatch({ type: 'notify', note: { category: 'Delivery', title: 'New task assigned', detail: form.name, tone: 'info', link: { module: 'tasks', recordId: id } } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Task created', record: id, detail: form.name } });
    toast('Task created.', 'success');
    setForm(blank);
    setModule('tasks', id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New task" width="max-w-xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Create task</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Task" className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="What needs doing?" /></Field>
        <Field label="Project (optional)"><Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}><option value="">— None —</option>{state.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
        <Field label="Assignee"><Select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}>{users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></Field>
        <Field label="Priority"><Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}</Select></Field>
        <Field label="Status"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{['To Do', 'In Progress', 'Waiting'].map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Due"><Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} /></Field>
        <Field label="Est. hours"><Input type="number" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} /></Field>
        <Field label="Description" className="sm:col-span-2"><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

// ===========================================================================
export function Documents() {
  const { state, dispatch, focusId, setFocusId, user, companyById, toast } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [status, setStatus] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);

  const rows = state.documents.filter((d) =>
    (!q || `${d.name} ${d.type}`.toLowerCase().includes(q.toLowerCase())) &&
    (!cat || d.category === cat) && (!status || d.status === status));
  const doc = state.documents.find((d) => d.id === focusId);

  const expiring = state.documents.filter((d) => d.expiry && daysFromToday(d.expiry) <= 30);
  const requested = state.documents.filter((d) => d.status === 'Requested');

  return (
    <div className="enter-up">
      <PageHeader title="Document vault"
        subtitle="Client documents, permissioned by confidentiality level. Requested items appear in the client portal until they are uploaded and reviewed."
        meta={<>
          <Badge tone="warning" dot>{requested.length} outstanding requests</Badge>
          <Badge tone="danger" dot>{expiring.length} expiring within 30 days</Badge>
          <Badge tone="info" dot>{state.documents.filter((d) => d.status === 'Under Review').length} awaiting review</Badge>
        </>}
        actions={<Button onClick={() => setRequestOpen(true)}><FilePlus2 className="size-3.5" />Request documents</Button>} />

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search documents…" className="w-full sm:w-64" />
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="w-auto"><option value="">All categories</option>{Object.keys(DOCUMENT_CATEGORIES).map((c) => <option key={c}>{c}</option>)}</Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto"><option value="">All statuses</option>{['Requested', 'Uploaded', 'Under Review', 'Approved', 'Rejected', 'Expired'].map((s) => <option key={s}>{s}</option>)}</Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} documents</span>
      </Toolbar>

      <Section flush>
        <DataTable rows={rows} onRowClick={(d) => setFocusId(d.id)} columns={[
          { key: 'n', header: 'Document', sort: (d) => d.name, cell: (d) => (
            <div className="flex items-center gap-2.5">
              <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-md',
                d.status === 'Requested' ? 'bg-warning-soft text-warning' : d.status === 'Rejected' ? 'bg-danger-soft text-danger' : 'bg-secondary text-muted-foreground')}>
                <Paperclip className="size-3.5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium">{d.name}</p>
                <p className="truncate text-[11.5px] text-muted-foreground">{d.type} · {d.size}</p>
              </div>
            </div>
          ) },
          { key: 'co', header: 'Client', cell: (d) => companyById(d.companyId)?.tradingName, hideBelow: 'md' },
          { key: 'c', header: 'Category', cell: (d) => <Badge tone="muted">{d.category}</Badge>, hideBelow: 'lg' },
          { key: 'conf', header: 'Confidentiality', cell: (d) => <Badge tone={d.confidentiality === 'Restricted' ? 'danger' : d.confidentiality === 'Confidential' ? 'gold' : 'muted'}>{d.confidentiality}</Badge>, hideBelow: 'lg' },
          { key: 'x', header: 'Expiry', sort: (d) => d.expiry ?? 'zzz', cell: (d) => (d.expiry ? <span className={daysFromToday(d.expiry) <= 30 ? 'font-medium text-warning' : ''}>{fmtDate(d.expiry)}</span> : '—'), hideBelow: 'md' },
          { key: 's', header: 'Status', cell: (d) => <StatusBadge status={d.status} /> },
        ]} />
      </Section>

      <Drawer open={!!doc} onClose={() => setFocusId(null)} title={doc?.name ?? ''}
        subtitle={doc && <span className="flex items-center gap-2"><StatusBadge status={doc.status} />{companyById(doc.companyId)?.tradingName} · v{doc.version}</span>}
        footer={doc && (
          doc.status === 'Requested'
            ? <Button variant="outline" onClick={() => { dispatch({ type: 'clientUploadDocument', documentId: doc.id, contactId: doc.requestedFrom ?? 'CON-01' }); toast('Document marked as received — now awaiting your review.'); }}>
                <Upload className="size-3.5" />Mark as received
              </Button>
            : ['Uploaded', 'Under Review'].includes(doc.status)
              ? <>
                  <Button variant="outline" onClick={() => { dispatch({ type: 'reviewDocument', documentId: doc.id, approve: false, user: user.id }); toast('Document rejected — logged with your reason.', 'warning'); }}>Reject</Button>
                  <Button onClick={() => { dispatch({ type: 'reviewDocument', documentId: doc.id, approve: true, user: user.id }); toast('Document approved.'); }}>Approve</Button>
                </>
              : <Button variant="outline" onClick={() => downloadTextFile(`${doc.name.replace(/\s+/g, '-')}-v${doc.version}.txt`, `${doc.name}\nStatus: ${doc.status}\nVersion: ${doc.version}\nCompany: ${companyById(doc.companyId)?.tradingName ?? '—'}\nCategory: ${doc.category ?? '—'}\nUploaded: ${doc.uploaded ? fmtDate(doc.uploaded) : '—'}\n\n(Document summary export — this build has no binary file store.)`)}>Download</Button>
        )}>
        {doc && (
          <div className="space-y-5">
            {doc.status === 'Requested' && (
              <div className="panel-flat bg-warning-soft/60 p-3">
                <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-warning"><ShieldAlert className="size-3.5" />Awaiting client upload</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-warning">{doc.note}</p>
              </div>
            )}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
              <Stat label="Category" value={doc.category} />
              <Stat label="Type" value={doc.type} />
              <Stat label="Client" value={companyById(doc.companyId)?.legalName} className="col-span-2" />
              <Stat label="Project" value={state.projects.find((p) => p.id === doc.projectId)?.name} className="col-span-2" />
              <Stat label="Version" value={`v${doc.version}`} />
              <Stat label="Size" value={doc.size} />
              <Stat label="Uploaded" value={doc.uploaded ? fmtDate(doc.uploaded) : '—'} />
              <Stat label="Expiry" value={doc.expiry ? `${fmtDate(doc.expiry)} · ${relativeDays(doc.expiry)}` : 'No expiry'} />
              <Stat label="Confidentiality" value={<Badge tone={doc.confidentiality === 'Restricted' ? 'danger' : 'gold'}>{doc.confidentiality}</Badge>} />
              <Stat label="Requested from" value={state.contacts.find((c) => c.id === doc.requestedFrom)?.firstName} />
              {doc.note && <Stat label="Note" value={doc.note} className="col-span-2" />}
            </dl>
          </div>
        )}
      </Drawer>

      <RequestDocumentsModal open={requestOpen} onClose={() => setRequestOpen(false)} />
    </div>
  );
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function RequestDocumentsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, user, toast } = useApp();
  const [companyId, setCompanyId] = useState('CMP-01');
  const [projectId, setProjectId] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const contacts = state.contacts.filter((c) => c.companyId === companyId);
  const [contactId, setContactId] = useState(contacts[0]?.id ?? '');

  const toggle = (name: string) => setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));

  const submit = () => {
    if (!picked.length) return;
    const docs = picked.map((name) => {
      const category = Object.keys(DOCUMENT_CATEGORIES).find((k) => DOCUMENT_CATEGORIES[k].includes(name)) ?? 'Corporate';
      return { name, category, type: name };
    });
    dispatch({ type: 'requestDocuments', companyId, projectId: projectId || undefined, docs, contactId: contactId || contacts[0]?.id || '', user: user.id });
    toast(`${docs.length} documents requested. The client sees them in their portal immediately.`);
    setPicked([]);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Request documents" width="max-w-2xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={!picked.length}>Request {picked.length || ''} document{picked.length === 1 ? '' : 's'}</Button></>}>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Field label="Client">
          <Select value={companyId} onChange={(e) => { setCompanyId(e.target.value); setProjectId(''); }}>
            {state.companies.map((c) => <option key={c.id} value={c.id}>{c.tradingName}</option>)}
          </Select>
        </Field>
        <Field label="Project">
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Not project-specific</option>
            {state.projects.filter((p) => p.companyId === companyId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Send to">
          <Select value={contactId} onChange={(e) => setContactId(e.target.value)}>
            {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
          </Select>
        </Field>
      </div>
      <div className="space-y-3">
        {Object.entries(DOCUMENT_CATEGORIES).map(([cat, list]) => (
          <div key={cat}>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{cat}</p>
            <div className="flex flex-wrap gap-1.5">
              {list.map((name) => (
                <button key={name} onClick={() => toggle(name)}
                  className={cn('rounded-md border px-2 py-1 text-[12px] transition-colors',
                    picked.includes(name) ? 'border-forest bg-forest-soft font-medium text-forest' : 'border-border bg-card text-muted-foreground hover:border-forest/30')}>
                  {name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
