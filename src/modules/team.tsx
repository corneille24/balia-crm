import React, { useState } from 'react';
import { UserPlus, ShieldCheck, Briefcase, UsersRound, Building2, KeyRound, Monitor } from 'lucide-react';
import { useApp } from '@/store';
import { ROLES, USER_TYPES, DEPARTMENTS, USER_STATUSES, SERVICES } from '@/data/catalog';
import {
  PageHeader, Section, Badge, Button, StatusBadge, DataTable, Drawer, Toolbar,
  SearchInput, Select, Field, Input, Textarea, Avatar, EmptyState, Modal, KpiCard, Stat,
} from '@/components/kit';
import { fmtDate, fmtDateTime, money, TODAY_ISO } from '@/lib/derive';

// A sensible default RBAC role for each user type (admin can still override).
const TYPE_TO_ROLE: Record<string, string> = {
  'Super Admin': 'super_admin', Administrator: 'admin', Consultant: 'consultant',
  Finance: 'finance', 'Sales / Business Development': 'sales', 'Training Manager': 'training',
  Instructor: 'training', Researcher: 'consultant', Operations: 'admin', 'External Expert': 'consultant',
};

function statusOf(u: { status?: string; active: boolean }): string {
  return u.status ?? (u.active ? 'Active' : 'Inactive');
}

function FormGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function BadgeRow({ label, items, inline }: { label: string; items?: string[]; inline?: boolean }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={inline ? 'flex flex-wrap items-baseline gap-2' : ''}>
      <p className={inline ? 'w-24 shrink-0 text-[11.5px] text-muted-foreground' : 'mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground'}>{label}</p>
      <div className="flex flex-wrap gap-1.5">{items.map((it) => <Badge key={it} tone="muted">{it}</Badge>)}</div>
    </div>
  );
}

export function TeamAccess() {
  const { state, focusId, setFocusId, can } = useApp();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [consultantOpen, setConsultantOpen] = useState(false);
  const [tab, setTab] = useState<'people' | 'teams' | 'departments' | 'access' | 'sessions'>('people');
  const [teamOpen, setTeamOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);

  const editable = can('users.manage');

  const assignedClients = (id: string) => state.companies.filter((c) => c.owner === id && c.status === 'Client').length;
  const assignedProjects = (id: string) => state.projects.filter((p) => p.manager === id || p.consultants.includes(id)).length;
  const workload = (id: string) => state.tasks.filter((t) => t.assignee === id && !['Completed', 'Cancelled'].includes(t.status)).length;

  const rows = state.users.filter((u) => {
    if (q && !`${u.name} ${u.email} ${u.title}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (type && (u.userType ?? '') !== type) return false;
    if (status && statusOf(u) !== status) return false;
    return true;
  });

  const activeCount = state.users.filter((u) => statusOf(u) === 'Active').length;
  const invitedCount = state.users.filter((u) => statusOf(u) === 'Invited').length;
  const suspendedCount = state.users.filter((u) => ['Suspended', 'Deactivated', 'Locked'].includes(statusOf(u))).length;

  return (
    <div className="enter-up">
      <PageHeader
        title="Team & Access"
        subtitle="The internal directory of BALIA staff and consultants — their role, department, team, access status and current workload. Every change here is written to the audit log."
        actions={editable ? <div className="flex items-center gap-2">
          {tab === 'people' && <>
            <Button variant="outline" onClick={() => setAddOpen(true)}><UserPlus className="size-3.5" />Add user</Button>
            <Button onClick={() => setConsultantOpen(true)}><Briefcase className="size-3.5" />Add consultant</Button>
          </>}
          {tab === 'teams' && <Button onClick={() => setTeamOpen(true)}><UsersRound className="size-3.5" />New team</Button>}
          {tab === 'departments' && <Button onClick={() => setDeptOpen(true)}><Building2 className="size-3.5" />New department</Button>}
          {tab === 'access' && <Button onClick={() => setReqOpen(true)}><KeyRound className="size-3.5" />New request</Button>}
        </div> : undefined}
        meta={<>
          <Badge tone="forest" dot>{state.users.length} people</Badge>
          <Badge tone="success" dot>{activeCount} active</Badge>
          {invitedCount > 0 && <Badge tone="info" dot>{invitedCount} invited</Badge>}
        </>} />

      <div className="mb-4 flex flex-wrap rounded-md border border-input p-0.5 w-fit">
        {([['people', 'People', state.users.length], ['teams', 'Teams', state.teams.length], ['departments', 'Departments', state.departments.length], ['access', 'Access requests', state.accessRequests.filter((r) => r.status === 'Pending').length], ['sessions', 'Sessions', state.sessions.filter((s) => s.active).length]] as const).map(([t, label, count]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded px-3 py-1 text-[12.5px] transition-colors ${tab === t ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {label}<span className="tnum ml-1.5 text-[11px] opacity-70">{count}</span>
          </button>
        ))}
      </div>

      {tab === 'people' && (<>
      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <KpiCard label="Total people" value={String(state.users.length)} />
        <KpiCard label="Active" value={String(activeCount)} tone="success" />
        <KpiCard label="Invited" value={String(invitedCount)} tone="info" />
        <KpiCard label="Suspended / off" value={String(suspendedCount)} tone={suspendedCount ? 'warning' : undefined} />
      </div>

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search people…" className="w-full sm:w-56" />
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-auto"><option value="">All types</option>{USER_TYPES.map((t) => <option key={t}>{t}</option>)}</Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto"><option value="">All statuses</option>{USER_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} of {state.users.length}</span>
      </Toolbar>

      <Section flush>
        {rows.length === 0 ? (
          <EmptyState title="No people match" detail="Clear the search or filters, or add a new team member." />
        ) : (
          <DataTable rows={rows} onRowClick={(u) => setFocusId(u.id)} columns={[
            {
              key: 'n', header: 'Name', sort: (u) => u.name, cell: (u) => (
                <div className="flex items-center gap-2.5">
                  <Avatar size="sm" name={u.name} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{u.name}</p>
                    <p className="truncate text-[11.5px] text-muted-foreground">{u.email}</p>
                  </div>
                </div>
              ),
            },
            { key: 't', header: 'Type', cell: (u) => u.userType ?? ROLES.find((r) => r.id === u.role)?.name ?? u.role, hideBelow: 'md' },
            { key: 'd', header: 'Department', cell: (u) => u.department ?? '—', hideBelow: 'lg' },
            { key: 'tm', header: 'Team', cell: (u) => u.team ?? '—', hideBelow: 'lg' },
            { key: 'a', header: 'Clients', align: 'center', cell: (u) => <span className="tnum">{assignedClients(u.id) || '—'}</span>, hideBelow: 'lg' },
            { key: 'p', header: 'Projects', align: 'center', cell: (u) => <span className="tnum">{assignedProjects(u.id) || '—'}</span>, hideBelow: 'lg' },
            { key: 'w', header: 'Workload', align: 'center', cell: (u) => <span className="tnum">{workload(u.id) || '—'}</span>, hideBelow: 'md' },
            { key: 'll', header: 'Last login', cell: (u) => (u.lastLogin ? fmtDate(u.lastLogin) : <span className="text-muted-foreground">Never</span>), hideBelow: 'md' },
            { key: 's', header: 'Status', cell: (u) => <StatusBadge status={statusOf(u)} /> },
          ]} />
        )}
      </Section>
      </>)}

      {tab === 'teams' && <TeamsView onNew={() => setTeamOpen(true)} />}
      {tab === 'departments' && <DepartmentsView onNew={() => setDeptOpen(true)} />}
      {tab === 'access' && <AccessView onNew={() => setReqOpen(true)} />}
      {tab === 'sessions' && <SessionsView />}

      {focusId && state.users.some((u) => u.id === focusId) && <UserDrawer userId={focusId} onClose={() => setFocusId(null)} />}
      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} />
      <AddConsultantModal open={consultantOpen} onClose={() => setConsultantOpen(false)} />
      <NewTeamModal open={teamOpen} onClose={() => setTeamOpen(false)} />
      <NewDepartmentModal open={deptOpen} onClose={() => setDeptOpen(false)} />
      <NewRequestModal open={reqOpen} onClose={() => setReqOpen(false)} />
    </div>
  );
}

function UserDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { state, dispatch, user: me, userById, can, toast } = useApp();
  const u = state.users.find((x) => x.id === userId)!;
  const editable = can('users.manage');
  const s = statusOf(u);

  const clients = state.companies.filter((c) => c.owner === u.id && c.status === 'Client');
  const projects = state.projects.filter((p) => p.manager === u.id || p.consultants.includes(u.id));
  const tasks = state.tasks.filter((t) => t.assignee === u.id && !['Completed', 'Cancelled'].includes(t.status));

  const apply = (changes: Record<string, unknown>, action: string) => {
    dispatch({ type: 'patch', collection: 'users', id: u.id, changes });
    dispatch({ type: 'audit', entry: { user: me.id, action, record: u.id, detail: u.name } });
    dispatch({ type: 'notify', note: { category: 'Team', title: action, detail: u.name, tone: 'info', link: { module: 'team', recordId: u.id } } });
    toast(`${action}.`, 'success');
  };

  const setStatus = (status: string) => apply({ status, active: status === 'Active' }, `User ${status.toLowerCase()}`);
  const changeRole = (role: string) => apply({ role }, `Role changed to ${ROLES.find((r) => r.id === role)?.name ?? role}`);

  return (
    <Drawer open onClose={onClose} width="max-w-2xl" title={u.name}
      subtitle={<span className="flex flex-wrap items-center gap-2"><StatusBadge status={s} />{u.title}</span>}
      footer={editable && <>
        {s !== 'Active' && <Button variant="outline" onClick={() => setStatus('Active')}>Activate</Button>}
        {s === 'Active' && <Button variant="outline" onClick={() => setStatus('Suspended')}>Suspend</Button>}
        {s !== 'Deactivated' && <Button variant="outline" onClick={() => setStatus('Deactivated')}>Deactivate</Button>}
      </>}>
      <div className="space-y-5">
        <div className="panel-flat grid grid-cols-3 gap-2 bg-secondary/40 p-3">
          <Stat label="Clients" value={String(clients.length)} />
          <Stat label="Projects" value={String(projects.length)} />
          <Stat label="Open tasks" value={String(tasks.length)} />
        </div>

        {editable && (
          <div className="panel-flat bg-secondary/30 p-3.5">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Access role</p>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={u.role} onChange={(e) => changeRole(e.target.value)} className="w-auto min-w-[180px]">
                {ROLES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select>
              <span className="text-[11.5px] text-muted-foreground">Controls what this person can see and do.</span>
            </div>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
          <Stat label="Email" value={u.email} />
          <Stat label="Phone" value={u.phone} />
          <Stat label="User type" value={u.userType ?? '—'} />
          <Stat label="Access role" value={ROLES.find((r) => r.id === u.role)?.name ?? u.role} />
          <Stat label="Department" value={u.department ?? '—'} />
          <Stat label="Team" value={u.team ?? '—'} />
          <Stat label="Location" value={[u.city, u.country].filter(Boolean).join(', ') || '—'} />
          <Stat label="Manager" value={userById(u.manager ?? '')?.name ?? '—'} />
          <Stat label="Employee / Consultant ID" value={u.employeeId ?? '—'} />
          <Stat label="Start date" value={u.startDate ? fmtDate(u.startDate) : '—'} />
          <Stat label="Last login" value={u.lastLogin ? fmtDateTime(u.lastLogin) : 'Never'} />
          <Stat label="Created" value={u.created ? fmtDate(u.created) : '—'} />
        </dl>

        {u.isConsultant && (
          <>
            {(u.shortBio || u.fullBio || u.professionalTitle) && (
              <div className="panel-flat bg-secondary/25 p-3.5">
                <p className="mb-1 text-[12.5px] font-medium">{u.professionalTitle}</p>
                {u.shortBio && <p className="text-[12.5px] text-muted-foreground">{u.shortBio}</p>}
                {u.fullBio && <p className="mt-1.5 prose-editorial text-[12.5px]">{u.fullBio}</p>}
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
              <Stat label="Employment type" value={u.employmentType ?? '—'} />
              <Stat label="Availability" value={u.availability ?? '—'} />
              <Stat label="Experience" value={u.yearsExperience ? `${u.yearsExperience} years` : '—'} />
              <Stat label="Qualifications" value={u.qualifications || '—'} />
            </div>
            <BadgeRow label="Expertise" items={u.expertise} />
            <BadgeRow label="Industries" items={u.industries} />
            <BadgeRow label="Languages" items={u.languages} />
            <BadgeRow label="Specialisms" items={u.specialisms} />
            <div className="border-t border-border/70 pt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">BALIA coverage</p>
              <div className="space-y-2">
                <BadgeRow label="Countries" items={u.coverageCountries} inline />
                <BadgeRow label="Regions" items={u.coverageRegions} inline />
                <BadgeRow label="Markets" items={u.coverageMarkets} inline />
                <BadgeRow label="Services" items={u.coverageServices} inline />
                <BadgeRow label="Trade corridors" items={u.tradeCorridors} inline />
              </div>
            </div>
            {can('finance.view') && (u.costRate != null || u.billableRate != null) && (
              <div className="panel-flat border-l-gold/50 bg-gold-soft/30 p-3.5">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground"><ShieldCheck className="size-3.5" />Internal financial data — restricted</p>
                <div className="grid grid-cols-3 gap-2">
                  <Stat label="Cost rate" value={u.costRate != null ? money(u.costRate, u.rateCurrency) : '—'} />
                  <Stat label="Billable rate" value={u.billableRate != null ? money(u.billableRate, u.rateCurrency) : '—'} />
                  <Stat label="Margin" value={u.billableRate && u.costRate ? `${Math.round(((u.billableRate - u.costRate) / u.billableRate) * 100)}%` : '—'} />
                </div>
              </div>
            )}
          </>
        )}

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Assigned clients</p>
          {clients.length === 0 ? <p className="text-[12.5px] text-muted-foreground">None assigned.</p> : (
            <div className="flex flex-wrap gap-1.5">{clients.map((c) => <Badge key={c.id} tone="muted">{c.tradingName}</Badge>)}</div>
          )}
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Projects</p>
          {projects.length === 0 ? <p className="text-[12.5px] text-muted-foreground">None assigned.</p> : (
            <ul className="space-y-1 text-[12.5px]">{projects.map((p) => <li key={p.id} className="flex items-center justify-between"><span>{p.name}</span><StatusBadge status={p.status} /></li>)}</ul>
          )}
        </div>
      </div>
    </Drawer>
  );
}

function AddUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, user: me, setModule, toast } = useApp();
  const blank = {
    firstName: '', lastName: '', preferredName: '', email: '', phone: '',
    userType: 'Consultant', role: 'consultant', title: '', department: DEPARTMENTS[0], team: DEPARTMENTS[0],
    country: 'Cameroon', city: '', employeeId: '', startDate: TODAY_ISO, manager: '',
  };
  const [form, setForm] = useState(blank);

  const setType = (userType: string) => setForm({ ...form, userType, role: TYPE_TO_ROLE[userType] ?? form.role });

  const save = (invite: boolean) => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
    const name = `${form.firstName} ${form.lastName}`.trim();
    const id = `USR-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const status = invite ? 'Invited' : 'Active';
    const record = {
      id, name, initials: `${form.firstName[0] ?? ''}${form.lastName[0] ?? ''}`.toUpperCase(),
      role: form.role, title: form.title || form.userType, email: form.email, phone: form.phone,
      active: status === 'Active', lastLogin: '',
      firstName: form.firstName, lastName: form.lastName, preferredName: form.preferredName || undefined,
      userType: form.userType, department: form.department, team: form.team,
      country: form.country, city: form.city, status, manager: form.manager || undefined,
      employeeId: form.employeeId || undefined, startDate: form.startDate, created: TODAY_ISO,
    };
    dispatch({ type: 'add', collection: 'users', record });
    dispatch({ type: 'audit', entry: { user: me.id, action: invite ? 'User created and invited' : 'User created', record: id, detail: `${name} — ${form.userType}` } });
    dispatch({ type: 'notify', note: { category: 'Team', title: invite ? 'User invited' : 'User created', detail: name, tone: 'success', link: { module: 'team', recordId: id } } });
    toast(invite ? 'User created and invitation sent.' : 'User created.', 'success');
    setForm(blank);
    setModule('team', id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add user" width="max-w-2xl"
      footer={<>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="outline" onClick={() => save(false)}>Save</Button>
        <Button onClick={() => save(true)}>Save &amp; invite</Button>
      </>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First name"><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field>
        <Field label="Last name"><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field>
        <Field label="Preferred name"><Input value={form.preferredName} onChange={(e) => setForm({ ...form, preferredName: e.target.value })} placeholder="Optional" /></Field>
        <Field label="Work email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@baliaconsulting.com" /></Field>
        <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Job title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="User type"><Select value={form.userType} onChange={(e) => setType(e.target.value)}>{USER_TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="Access role"><Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{ROLES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</Select></Field>
        <Field label="Department"><Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</Select></Field>
        <Field label="Team"><Select value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</Select></Field>
        <Field label="Country"><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
        <Field label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
        <Field label="Employee / Consultant ID"><Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} /></Field>
        <Field label="Start date"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
        <Field label="Manager" className="sm:col-span-2"><Select value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })}><option value="">— None —</option>{state.users.filter((x) => x.active).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</Select></Field>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-muted-foreground"><ShieldCheck className="size-3.5" />Save &amp; invite sets the status to Invited; Save adds the person as Active. Access is governed by the selected role.</p>
    </Modal>
  );
}

// Split a comma-separated field into a clean string array.
const splitList = (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean);
const rid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
const nowISO = () => new Date().toISOString();

function AddConsultantModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, user: me, setModule, toast, can } = useApp();
  const canRates = can('finance.view');
  const blank = {
    firstName: '', lastName: '', email: '', phone: '', country: 'Cameroon', city: '',
    professionalTitle: '', shortBio: '', fullBio: '', qualifications: '', certifications: '',
    yearsExperience: '', expertise: '', industries: '', languages: 'English, French', specialisms: '',
    coverageCountries: '', coverageRegions: '', coverageMarkets: '', coverageServices: '', tradeCorridors: '',
    employmentType: 'Associate consultant', startDate: TODAY_ISO, endDate: '', manager: '',
    department: DEPARTMENTS[0], team: DEPARTMENTS[0], status: 'Active', availability: 'Available',
    costRate: '', billableRate: '', rateCurrency: 'XAF',
  };
  const [form, setForm] = useState(blank);
  const set = (k: keyof typeof blank, v: string) => setForm({ ...form, [k]: v });
  const external = form.employmentType === 'External expert';

  const save = (invite: boolean) => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) return;
    const name = `${form.firstName} ${form.lastName}`.trim();
    const id = `USR-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const status = invite ? 'Invited' : form.status;
    const record = {
      id, name, initials: `${form.firstName[0] ?? ''}${form.lastName[0] ?? ''}`.toUpperCase(),
      role: 'consultant', title: form.professionalTitle || 'Consultant', email: form.email, phone: form.phone,
      active: status === 'Active', lastLogin: '',
      firstName: form.firstName, lastName: form.lastName,
      userType: external ? 'External Expert' : 'Consultant', department: form.department, team: form.team,
      country: form.country, city: form.city, status, manager: form.manager || undefined,
      startDate: form.startDate, created: TODAY_ISO,
      isConsultant: true, professionalTitle: form.professionalTitle, shortBio: form.shortBio, fullBio: form.fullBio,
      qualifications: form.qualifications, certifications: form.certifications,
      yearsExperience: Number(form.yearsExperience) || 0,
      expertise: splitList(form.expertise), industries: splitList(form.industries),
      languages: splitList(form.languages), specialisms: splitList(form.specialisms),
      coverageCountries: splitList(form.coverageCountries), coverageRegions: splitList(form.coverageRegions),
      coverageMarkets: splitList(form.coverageMarkets), coverageServices: splitList(form.coverageServices),
      tradeCorridors: splitList(form.tradeCorridors),
      employmentType: form.employmentType, endDate: form.endDate || undefined, availability: form.availability,
      ...(canRates ? { costRate: Number(form.costRate) || 0, billableRate: Number(form.billableRate) || 0, rateCurrency: form.rateCurrency } : {}),
    };
    dispatch({ type: 'add', collection: 'users', record });
    dispatch({ type: 'audit', entry: { user: me.id, action: invite ? 'Consultant created and invited' : 'Consultant created', record: id, detail: `${name} — ${form.professionalTitle || 'Consultant'}` } });
    dispatch({ type: 'notify', note: { category: 'Team', title: invite ? 'Consultant invited' : 'Consultant added', detail: name, tone: 'success', link: { module: 'team', recordId: id } } });
    toast(invite ? 'Consultant created and invitation sent.' : 'Consultant added.', 'success');
    setForm(blank);
    setModule('team', id);
    onClose();
  };

  const Group = FormGroup;

  return (
    <Modal open={open} onClose={onClose} title="Add consultant" width="max-w-2xl"
      footer={<>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="outline" onClick={() => save(false)}>Save</Button>
        <Button onClick={() => save(true)}>Save &amp; invite</Button>
      </>}>
      <div className="space-y-5">
        <Group title="Personal">
          <Field label="First name"><Input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} /></Field>
          <Field label="Last name"><Input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@baliaconsulting.com" /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
          <Field label="Country"><Input value={form.country} onChange={(e) => set('country', e.target.value)} /></Field>
          <Field label="City"><Input value={form.city} onChange={(e) => set('city', e.target.value)} /></Field>
        </Group>

        <Group title="Professional">
          <Field label="Professional title" className="sm:col-span-2"><Input value={form.professionalTitle} onChange={(e) => set('professionalTitle', e.target.value)} placeholder="e.g. Senior Customs & Trade Compliance Advisor" /></Field>
          <Field label="Short bio" className="sm:col-span-2"><Input value={form.shortBio} onChange={(e) => set('shortBio', e.target.value)} placeholder="One line" /></Field>
          <Field label="Full bio" className="sm:col-span-2"><Textarea rows={2} value={form.fullBio} onChange={(e) => set('fullBio', e.target.value)} /></Field>
          <Field label="Years of experience"><Input type="number" value={form.yearsExperience} onChange={(e) => set('yearsExperience', e.target.value)} /></Field>
          <Field label="Qualifications"><Input value={form.qualifications} onChange={(e) => set('qualifications', e.target.value)} placeholder="e.g. LLB, MBA" /></Field>
          <Field label="Certifications" className="sm:col-span-2"><Input value={form.certifications} onChange={(e) => set('certifications', e.target.value)} /></Field>
          <Field label="Expertise (comma-separated)"><Input value={form.expertise} onChange={(e) => set('expertise', e.target.value)} placeholder="AfCFTA, Rules of origin" /></Field>
          <Field label="Industries (comma-separated)"><Input value={form.industries} onChange={(e) => set('industries', e.target.value)} placeholder="Agro, Manufacturing" /></Field>
          <Field label="Languages (comma-separated)"><Input value={form.languages} onChange={(e) => set('languages', e.target.value)} /></Field>
          <Field label="Specialisms (comma-separated)"><Input value={form.specialisms} onChange={(e) => set('specialisms', e.target.value)} /></Field>
        </Group>

        <Group title="BALIA coverage">
          <Field label="Countries (comma-separated)"><Input value={form.coverageCountries} onChange={(e) => set('coverageCountries', e.target.value)} placeholder="Cameroon, Nigeria" /></Field>
          <Field label="Regions (comma-separated)"><Input value={form.coverageRegions} onChange={(e) => set('coverageRegions', e.target.value)} placeholder="CEMAC, ECOWAS" /></Field>
          <Field label="Markets (comma-separated)"><Input value={form.coverageMarkets} onChange={(e) => set('coverageMarkets', e.target.value)} /></Field>
          <Field label="Trade corridors (comma-separated)"><Input value={form.tradeCorridors} onChange={(e) => set('tradeCorridors', e.target.value)} placeholder="Douala–N'Djamena" /></Field>
          <Field label="Services (comma-separated)" className="sm:col-span-2"><Input value={form.coverageServices} onChange={(e) => set('coverageServices', e.target.value)} placeholder={SERVICES.slice(0, 2).map((s) => s.name).join(', ')} /></Field>
        </Group>

        <Group title="Engagement">
          <Field label="Employment type"><Select value={form.employmentType} onChange={(e) => set('employmentType', e.target.value)}>{['Employed consultant', 'Associate consultant', 'External expert', 'Contractor'].map((t) => <option key={t}>{t}</option>)}</Select></Field>
          <Field label="Availability"><Select value={form.availability} onChange={(e) => set('availability', e.target.value)}>{['Available', 'Partially available', 'Fully booked', 'On leave'].map((a) => <option key={a}>{a}</option>)}</Select></Field>
          <Field label="Start date"><Input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} /></Field>
          <Field label="End date"><Input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} /></Field>
          <Field label="Department"><Select value={form.department} onChange={(e) => set('department', e.target.value)}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</Select></Field>
          <Field label="Team"><Select value={form.team} onChange={(e) => set('team', e.target.value)}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</Select></Field>
          <Field label="Manager" className="sm:col-span-2"><Select value={form.manager} onChange={(e) => set('manager', e.target.value)}><option value="">— None —</option>{state.users.filter((x) => x.active).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</Select></Field>
        </Group>

        {canRates ? (
          <Group title="Internal financial data (restricted)">
            <Field label="Internal cost rate"><Input type="number" value={form.costRate} onChange={(e) => set('costRate', e.target.value)} /></Field>
            <Field label="Billable rate"><Input type="number" value={form.billableRate} onChange={(e) => set('billableRate', e.target.value)} /></Field>
            <Field label="Rate currency"><Select value={form.rateCurrency} onChange={(e) => set('rateCurrency', e.target.value)}>{['XAF', 'USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
          </Group>
        ) : (
          <p className="flex items-center gap-1.5 rounded-md bg-secondary/50 p-2.5 text-[11.5px] text-muted-foreground"><ShieldCheck className="size-3.5" />Internal cost and billable rates are restricted — only Finance and administrators can set them.</p>
        )}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Teams & Departments (§26–§27)
// ---------------------------------------------------------------------------
function TeamsView({ onNew }: { onNew: () => void }) {
  const { state, userById, can } = useApp();
  const memberCount = (teamName: string) => state.users.filter((u) => u.team === teamName && u.active).length;
  return (
    <Section flush>
      {state.teams.length === 0 ? (
        <EmptyState title="No teams yet" detail="Create a team to group consultants by service line and market." action={can('users.manage') ? <Button onClick={onNew}><UsersRound className="size-3.5" />New team</Button> : undefined} />
      ) : (
        <DataTable rows={state.teams} columns={[
          { key: 'n', header: 'Team', sort: (t) => t.name, cell: (t) => <span className="font-medium">{t.name}</span> },
          { key: 'l', header: 'Team leader', cell: (t) => <div className="flex items-center gap-2"><Avatar size="xs" name={userById(t.lead)?.name} /><span>{userById(t.lead)?.name ?? '—'}</span></div> },
          { key: 'd', header: 'Department', cell: (t) => t.department, hideBelow: 'md' },
          { key: 'm', header: 'Members', align: 'center', cell: (t) => <span className="tnum">{memberCount(t.name)}</span> },
          { key: 'sv', header: 'Services', cell: (t) => <span className="text-[12px] text-muted-foreground">{t.services.join(', ') || '—'}</span>, hideBelow: 'lg' },
          { key: 'mk', header: 'Markets', cell: (t) => <div className="flex flex-wrap gap-1">{t.markets.length ? t.markets.map((m) => <Badge key={m} tone="muted">{m}</Badge>) : '—'}</div>, hideBelow: 'lg' },
          { key: 's', header: 'Status', cell: (t) => <StatusBadge status={t.status} /> },
        ]} />
      )}
    </Section>
  );
}

function DepartmentsView({ onNew }: { onNew: () => void }) {
  const { state, userById, can } = useApp();
  const memberCount = (name: string) => state.users.filter((u) => u.department === name && u.active).length;
  const teamCount = (name: string) => state.teams.filter((t) => t.department === name).length;
  return (
    <Section flush>
      {state.departments.length === 0 ? (
        <EmptyState title="No departments yet" detail="Create a department to organise teams, budgets and service lines." action={can('users.manage') ? <Button onClick={onNew}><Building2 className="size-3.5" />New department</Button> : undefined} />
      ) : (
        <DataTable rows={state.departments} columns={[
          { key: 'n', header: 'Department', sort: (dp) => dp.name, cell: (dp) => <span className="font-medium">{dp.name}</span> },
          { key: 'h', header: 'Head', cell: (dp) => <div className="flex items-center gap-2"><Avatar size="xs" name={userById(dp.head)?.name} /><span>{userById(dp.head)?.name ?? '—'}</span></div> },
          { key: 'm', header: 'Members', align: 'center', cell: (dp) => <span className="tnum">{memberCount(dp.name)}</span> },
          { key: 't', header: 'Teams', align: 'center', cell: (dp) => <span className="tnum">{teamCount(dp.name)}</span>, hideBelow: 'md' },
          { key: 'b', header: 'Budget', align: 'right', cell: (dp) => <span className="tnum">{dp.budget ? money(dp.budget, dp.currency, true) : '—'}</span>, sort: (dp) => dp.budget, hideBelow: 'md' },
          { key: 'sv', header: 'Services', cell: (dp) => <span className="text-[12px] text-muted-foreground">{dp.services.join(', ') || '—'}</span>, hideBelow: 'lg' },
          { key: 's', header: 'Status', cell: (dp) => <StatusBadge status={dp.status} /> },
        ]} />
      )}
    </Section>
  );
}

function NewTeamModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, user: me, toast } = useApp();
  const blank = { name: '', lead: state.users[0]?.id ?? '', department: DEPARTMENTS[0], services: '', markets: '', status: 'Active' };
  const [form, setForm] = useState(blank);
  const create = () => {
    if (!form.name.trim()) return;
    const id = `TEAM-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    dispatch({ type: 'add', collection: 'teams', record: { id, name: form.name, lead: form.lead, department: form.department, services: splitList(form.services), markets: splitList(form.markets), status: form.status } });
    dispatch({ type: 'audit', entry: { user: me.id, action: 'Team created', record: id, detail: form.name } });
    dispatch({ type: 'notify', note: { category: 'Team', title: 'Team created', detail: form.name, tone: 'success', link: { module: 'team' } } });
    toast('Team created.', 'success');
    setForm(blank);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="New team" width="max-w-lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Create team</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Team name" className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Market Entry" /></Field>
        <Field label="Team leader"><Select value={form.lead} onChange={(e) => setForm({ ...form, lead: e.target.value })}>{state.users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></Field>
        <Field label="Department"><Select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>{DEPARTMENTS.map((dp) => <option key={dp}>{dp}</option>)}</Select></Field>
        <Field label="Services (comma-separated)" className="sm:col-span-2"><Input value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} /></Field>
        <Field label="Markets (comma-separated)" className="sm:col-span-2"><Input value={form.markets} onChange={(e) => setForm({ ...form, markets: e.target.value })} placeholder="CEMAC, ECOWAS" /></Field>
      </div>
    </Modal>
  );
}

function NewDepartmentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, user: me, toast } = useApp();
  const blank = { name: '', head: state.users[0]?.id ?? '', budget: '', currency: 'XAF', services: '', status: 'Active' };
  const [form, setForm] = useState(blank);
  const create = () => {
    if (!form.name.trim()) return;
    const id = `DEP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    dispatch({ type: 'add', collection: 'departments', record: { id, name: form.name, head: form.head, budget: Number(form.budget) || 0, currency: form.currency, services: splitList(form.services), status: form.status } });
    dispatch({ type: 'audit', entry: { user: me.id, action: 'Department created', record: id, detail: form.name } });
    dispatch({ type: 'notify', note: { category: 'Team', title: 'Department created', detail: form.name, tone: 'success', link: { module: 'team' } } });
    toast('Department created.', 'success');
    setForm(blank);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="New department" width="max-w-lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Create department</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Department name" className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Department head"><Select value={form.head} onChange={(e) => setForm({ ...form, head: e.target.value })}>{state.users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></Field>
        <Field label="Status"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{['Active', 'Inactive'].map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Annual budget"><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></Field>
        <Field label="Currency"><Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{['XAF', 'USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Services (comma-separated)" className="sm:col-span-2"><Input value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Access requests (§28) and Sessions / login history (§30)
// ---------------------------------------------------------------------------
const ACCESS_TYPES = ['Module access', 'Permission', 'Client', 'Project', 'Sensitive record'];

function AccessView({ onNew }: { onNew: () => void }) {
  const { state, dispatch, user: me, userById, can, toast } = useApp();
  const editable = can('users.manage');

  const decide = (id: string, status: string, note: string) => {
    dispatch({ type: 'patch', collection: 'accessRequests', id, changes: { status, decidedBy: me.id, decidedAt: new Date().toISOString(), decisionNote: note } });
    const r = state.accessRequests.find((x) => x.id === id);
    dispatch({ type: 'audit', entry: { user: me.id, action: `Access request ${status.toLowerCase()}`, record: id, detail: `${userById(r?.requester ?? '')?.name ?? ''} — ${r?.target ?? ''}` } });
    dispatch({ type: 'notify', note: { category: 'Team', title: `Access request ${status.toLowerCase()}`, detail: r?.target ?? '', tone: status === 'Approved' ? 'success' : 'info', link: { module: 'team' } } });
    toast(`Request ${status.toLowerCase()}.`, status === 'Approved' ? 'success' : 'info');
  };

  const pending = state.accessRequests.filter((r) => r.status === 'Pending');
  const decided = state.accessRequests.filter((r) => r.status !== 'Pending');

  return (
    <div className="space-y-4">
      <Section title={`Pending — ${pending.length}`} flush>
        {pending.length === 0 ? (
          <EmptyState title="Nothing awaiting a decision" detail="Access requests raised by the team appear here for approval." action={editable ? <Button onClick={onNew}><KeyRound className="size-3.5" />New request</Button> : undefined} />
        ) : (
          <div className="divide-y divide-border/70">
            {pending.map((r) => (
              <div key={r.id} className="flex flex-wrap items-start gap-3 p-3">
                <Avatar size="sm" name={userById(r.requester)?.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px]"><span className="font-medium">{userById(r.requester)?.name}</span> requested <Badge tone="muted">{r.type}</Badge> access to <span className="font-medium">{r.target}</span></p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{r.reason}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Raised {fmtDateTime(r.requested)}</p>
                </div>
                {editable && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => decide(r.id, 'Rejected', 'Declined by administrator.')}>Reject</Button>
                    <Button onClick={() => decide(r.id, 'Approved', 'Granted by administrator.')}>Approve</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {decided.length > 0 && (
        <Section title="Decision history" flush>
          <DataTable rows={decided} columns={[
            { key: 'r', header: 'Requester', cell: (r) => userById(r.requester)?.name ?? '—' },
            { key: 't', header: 'Type', cell: (r) => r.type, hideBelow: 'md' },
            { key: 'tg', header: 'Target', cell: (r) => r.target },
            { key: 'by', header: 'Decided by', cell: (r) => userById(r.decidedBy ?? '')?.name ?? '—', hideBelow: 'lg' },
            { key: 'at', header: 'Decided', cell: (r) => (r.decidedAt ? fmtDate(r.decidedAt) : '—'), hideBelow: 'md' },
            { key: 's', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
          ]} />
        </Section>
      )}
    </div>
  );
}

function NewRequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch, user: me, toast } = useApp();
  const blank = { requester: me.id, type: ACCESS_TYPES[0], target: '', reason: '' };
  const [form, setForm] = useState(blank);
  const create = () => {
    if (!form.target.trim()) return;
    const id = `ACR-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    dispatch({ type: 'add', collection: 'accessRequests', record: { id, requester: form.requester, type: form.type, target: form.target, reason: form.reason, status: 'Pending', requested: new Date().toISOString() } });
    dispatch({ type: 'audit', entry: { user: me.id, action: 'Access request raised', record: id, detail: `${form.type} — ${form.target}` } });
    dispatch({ type: 'notify', note: { category: 'Team', title: 'Access request raised', detail: form.target, tone: 'info', link: { module: 'team' } } });
    toast('Access request raised — pending approval.', 'success');
    setForm(blank);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="New access request" width="max-w-lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Raise request</Button></>}>
      <div className="grid gap-3">
        <Field label="Access type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{ACCESS_TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="What do you need access to?"><Input value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} placeholder="e.g. Kola Agro Industries" /></Field>
        <Field label="Reason"><Textarea rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Why you need it" /></Field>
      </div>
    </Modal>
  );
}

function SessionsView() {
  const { state, dispatch, user: me, userById, can, toast } = useApp();
  const editable = can('users.manage');
  const active = state.sessions.filter((s) => s.active);

  const terminate = (id: string) => {
    const s = state.sessions.find((x) => x.id === id);
    dispatch({ type: 'patch', collection: 'sessions', id, changes: { active: false } });
    dispatch({ type: 'add', collection: 'loginHistory', record: { id: rid('LOG'), user: s?.user ?? '', event: 'Logout', at: nowISO(), device: s?.device ?? '', browser: s?.browser ?? '', ip: s?.ip ?? '', result: 'Success', reason: 'Session terminated by administrator' } });
    dispatch({ type: 'audit', entry: { user: me.id, action: 'Session terminated', record: id, detail: `${userById(s?.user ?? '')?.name ?? ''} — ${s?.device ?? ''}` } });
    toast('Session terminated.', 'info');
  };

  return (
    <div className="space-y-4">
      <Section title={`Active sessions — ${active.length}`} flush>
        {active.length === 0 ? (
          <EmptyState title="No active sessions" detail="Active sign-ins across devices appear here." />
        ) : (
          <div className="divide-y divide-border/70">
            {active.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-3 p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground"><Monitor className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium">{userById(s.user)?.name} {s.current && <Badge tone="success">This device</Badge>}</p>
                  <p className="text-[12px] text-muted-foreground">{s.device} · {s.browser} · {s.location} · {s.ip}</p>
                  <p className="text-[11px] text-muted-foreground">Active since {fmtDateTime(s.started)} · last seen {fmtDateTime(s.lastActive)}</p>
                </div>
                {editable && !s.current && <Button variant="outline" onClick={() => terminate(s.id)}>Terminate</Button>}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Login & activity history" flush>
        <DataTable rows={[...state.loginHistory].sort((a, b) => b.at.localeCompare(a.at))} columns={[
          { key: 'u', header: 'User', cell: (e) => userById(e.user)?.name ?? '—' },
          { key: 'e', header: 'Event', cell: (e) => <Badge tone={e.event === 'Failed login' ? 'danger' : e.event === 'Login' ? 'success' : 'muted'}>{e.event}</Badge> },
          { key: 'at', header: 'When', cell: (e) => fmtDateTime(e.at), sort: (e) => e.at },
          { key: 'd', header: 'Device', cell: (e) => `${e.device} · ${e.browser}`, hideBelow: 'md' },
          { key: 'ip', header: 'IP', cell: (e) => e.ip, hideBelow: 'lg' },
          { key: 'r', header: 'Result', cell: (e) => <span className={e.result === 'Failed' ? 'text-danger' : 'text-muted-foreground'}>{e.result}{e.reason ? ` — ${e.reason}` : ''}</span>, hideBelow: 'md' },
        ]} />
      </Section>
    </div>
  );
}
