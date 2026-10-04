import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Target, Building2, Users, TrendingUp, CalendarClock, Briefcase, MapPin,
  FolderKanban, CheckSquare, FileStack, FileText, FileSignature, Receipt, Banknote, FolderOpen,
  Wallet, MessagesSquare, Calendar, ClipboardCheck, GraduationCap, BarChart3,
  BookOpen, Gauge, Settings as SettingsIcon, Search, Bell, Plus, Sparkles, PanelLeft,
  ChevronDown, LogOut, Command, ArrowRight, Check, X, Globe2, Landmark, Coins, FileCheck2, Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp, useAlerts } from '@/store';
import { ROLES, SERVICES } from '@/data/catalog';
import { Badge, Button, Avatar, Input, Modal, Field, Select, Textarea } from '@/components/kit';
import { money, fmtDateTime, daysFromToday, invoiceTotals, projectProgress, leadScore, TODAY_ISO } from '@/lib/derive';
import { computeFitScore, deadlineInfo, fundingAnalytics } from '@/lib/funding';
import { oppIntel, isConsultingOpportunity, isClientOpportunity } from '@/lib/opportunity-intel';
import { prospectScore, prospectIntel } from '@/lib/prospect-intel';

export interface NavItem { id: string; label: string; icon: React.ElementType; perm: string; group: string }

export const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard', group: 'Overview' },
  { id: 'analytics', label: 'Visualiser', icon: BarChart3, perm: 'dashboard', group: 'Overview' },
  { id: 'leads', label: 'Leads', icon: Target, perm: 'leads', group: 'Pipeline' },
  { id: 'client-prospects', label: 'Client Prospects', icon: MapPin, perm: 'leads', group: 'Pipeline' },
  { id: 'strategic-accounts', label: 'Strategic Accounts', icon: Target, perm: 'clients', group: 'Pipeline' },
  { id: 'companies', label: 'Companies', icon: Building2, perm: 'companies', group: 'Pipeline' },
  { id: 'contacts', label: 'Contacts', icon: Users, perm: 'contacts', group: 'Pipeline' },
  { id: 'opportunities', label: 'Opportunities', icon: TrendingUp, perm: 'opportunities', group: 'Pipeline' },
  { id: 'consultations', label: 'Consultations', icon: CalendarClock, perm: 'consultations', group: 'Pipeline' },
  { id: 'clients', label: 'Clients', icon: Briefcase, perm: 'clients', group: 'Delivery' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, perm: 'projects', group: 'Delivery' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, perm: 'tasks', group: 'Delivery' },
  { id: 'documents', label: 'Documents', icon: FileStack, perm: 'documents', group: 'Delivery' },
  { id: 'document-library', label: 'Document Library', icon: FolderOpen, perm: 'documents', group: 'Delivery' },
  { id: 'proposals', label: 'Proposals', icon: FileText, perm: 'proposals', group: 'Commercial' },
  { id: 'contracts', label: 'Contracts', icon: FileSignature, perm: 'contracts', group: 'Commercial' },
  { id: 'invoices', label: 'Invoices', icon: Receipt, perm: 'invoices', group: 'Commercial' },
  { id: 'payments', label: 'Payments', icon: Banknote, perm: 'payments', group: 'Commercial' },
  { id: 'expenses', label: 'Expenses', icon: Wallet, perm: 'expenses', group: 'Commercial' },
  { id: 'communications', label: 'Communications', icon: MessagesSquare, perm: 'communications', group: 'Engagement' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, perm: 'calendar', group: 'Engagement' },
  { id: 'assessments', label: 'Assessments', icon: ClipboardCheck, perm: 'assessments', group: 'Intelligence' },
  { id: 'intelligence', label: 'Trade Intelligence', icon: Globe2, perm: 'knowledge', group: 'Intelligence' },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, perm: 'knowledge', group: 'Intelligence' },
  { id: 'academy', label: 'Academy', icon: GraduationCap, perm: 'academy', group: 'Intelligence' },
  { id: 'funding-dashboard', label: 'Funding & BI', icon: TrendingUp, perm: 'funding', group: 'Funding & BI' },
  { id: 'opportunity-intel', label: 'Opportunity Intel', icon: Target, perm: 'funding', group: 'Funding & BI' },
  { id: 'business-findings', label: 'Business findings', icon: Lightbulb, perm: 'funding', group: 'Funding & BI' },
  { id: 'funders', label: 'Funders', icon: Landmark, perm: 'funding', group: 'Funding & BI' },
  { id: 'funding-opportunities', label: 'Opportunities', icon: Coins, perm: 'funding', group: 'Funding & BI' },
  { id: 'funding-applications', label: 'Applications', icon: FileCheck2, perm: 'funding', group: 'Funding & BI' },
  { id: 'reports', label: 'Reports', icon: BarChart3, perm: 'reports', group: 'Management' },
  { id: 'team', label: 'Team & Access', icon: Users, perm: 'users.manage', group: 'Management' },
  { id: 'management', label: 'Management Review', icon: Gauge, perm: 'management', group: 'Management' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, perm: 'users.manage', group: 'Management' },
];

function BaliaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M4 26V6h9.4c3.6 0 5.8 1.9 5.8 4.9 0 2.1-1.1 3.6-3 4.3 2.4.6 3.9 2.3 3.9 4.8 0 3.6-2.6 6-6.8 6H4Z" fill="currentColor" opacity="0.92" />
      <path d="M22.5 6.5 28 26h-3.6l-1.1-4.4h-5.1" stroke="currentColor" strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: { collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onCloseMobile: () => void }) {
  const { module, setModule, can, role, setRole } = useApp();
  const items = NAV.filter((n) => can(n.perm));
  const groups = useMemo(() => {
    const g: Record<string, NavItem[]> = {};
    items.forEach((i) => { (g[i.group] ??= []).push(i); });
    return g;
  }, [items]);

  const content = (
    <div className="rail-scope flex h-full flex-col bg-rail text-rail-foreground">
      <div className={cn('flex items-center gap-2.5 border-b border-rail-border px-4 py-4', collapsed && 'justify-center px-0')}>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[hsl(219_50%_24%)] text-[hsl(210_40%_96%)]">
          <BaliaMark className="size-5" />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display text-[15px] font-semibold leading-none tracking-[-0.01em] text-[hsl(210_35%_95%)]">BALIA</p>
            <p className="mt-1 truncate text-[10px] uppercase tracking-[0.13em] text-rail-muted">Trade Advisory OS</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {Object.entries(groups).map(([group, list]) => (
          <div key={group} className="mb-3 last:mb-0">
            {!collapsed && <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-rail-muted">{group}</p>}
            <ul className="space-y-px">
              {list.map((item) => {
                const Icon = item.icon;
                const active = module === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => { setModule(item.id); onCloseMobile(); }}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] transition-colors duration-150',
                        collapsed && 'justify-center px-0',
                        active
                          ? 'bg-[hsl(219_50%_20%)] font-medium text-[hsl(210_40%_96%)]'
                          : 'text-[hsl(219_12%_70%)] hover:bg-[hsl(220_28%_14%)] hover:text-[hsl(219_25%_90%)]'
                      )}
                    >
                      {active && <span className="absolute inset-y-1 left-0 w-[2.5px] rounded-full bg-[hsl(41_58%_55%)]" />}
                      <Icon className={cn('size-[15px] shrink-0', active ? 'text-[hsl(41_58%_58%)]' : 'text-[hsl(219_10%_55%)] group-hover:text-[hsl(219_20%_82%)]')} strokeWidth={1.75} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-rail-border p-2">
        {!collapsed && (
          <div className="mb-2 px-1">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-rail-muted">Viewing as</p>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border border-rail-border bg-[hsl(220_30%_13%)] px-2 py-1.5 text-[12px] text-[hsl(219_20%_86%)] focus:outline-none focus:ring-2 focus:ring-[hsl(219_45%_42%)]"
            >
              {ROLES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        )}
        <button onClick={onToggle} className={cn('hidden w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] text-[hsl(219_12%_66%)] transition-colors hover:bg-[hsl(220_28%_14%)] hover:text-[hsl(219_25%_90%)] lg:flex', collapsed && 'justify-center px-0')}>
          <PanelLeft className="size-4 shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={cn('fixed inset-y-0 left-0 z-40 hidden shrink-0 transition-[width] duration-200 lg:block', collapsed ? 'w-[60px]' : 'w-[232px]')}>{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/45" onClick={onCloseMobile} />
          <div className="relative h-full w-[260px]" style={{ animation: 'slide-r 220ms cubic-bezier(0.16,1,0.3,1)' }}>
            <style>{`@keyframes slide-r{from{transform:translateX(-16px);opacity:.6}to{transform:none;opacity:1}}`}</style>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setModule } = useApp();
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    if (q.trim().length < 2) return [];
    const term = q.toLowerCase();
    const out: { id: string; label: string; sub: string; module: string; kind: string }[] = [];
    const add = (arr: any[], kind: string, module: string, label: (r: any) => string, sub: (r: any) => string, hay: (r: any) => string) => {
      arr.filter((r) => hay(r).toLowerCase().includes(term)).slice(0, 4)
        .forEach((r) => out.push({ id: r.id, label: label(r), sub: sub(r), module, kind }));
    };
    add(state.companies, 'Company', 'companies', (r) => r.tradingName, (r) => `${r.industry} · ${r.country}`, (r) => `${r.legalName} ${r.tradingName} ${r.country} ${r.industry} ${r.tags.join(' ')}`);
    add(state.contacts, 'Contact', 'contacts', (r) => `${r.firstName} ${r.lastName}`, (r) => r.position, (r) => `${r.firstName} ${r.lastName} ${r.email} ${r.position}`);
    add(state.leads, 'Lead', 'leads', (r) => r.companyName, (r) => `${r.status} · ${r.serviceInterest}`, (r) => `${r.companyName} ${r.contactName} ${r.serviceInterest} ${r.country}`);
    add(state.projects, 'Project', 'projects', (r) => r.name, (r) => r.status, (r) => `${r.name} ${r.notes}`);
    add(state.invoices, 'Invoice', 'invoices', (r) => r.number, (r) => r.items[0]?.description ?? '', (r) => `${r.number} ${r.po ?? ''} ${r.items.map((i: any) => i.description).join(' ')}`);
    add(state.proposals, 'Proposal', 'proposals', (r) => r.number, (r) => r.title, (r) => `${r.number} ${r.title}`);
    add(state.contracts, 'Contract', 'contracts', (r) => r.number, (r) => r.type, (r) => `${r.number} ${r.type}`);
    add(state.documents, 'Document', 'documents', (r) => r.name, (r) => `${r.category} · ${r.status}`, (r) => `${r.name} ${r.type}`);
    add(state.tasks, 'Task', 'tasks', (r) => r.name, (r) => r.status, (r) => `${r.name} ${r.description}`);
    add(state.articles, 'Knowledge', 'knowledge', (r) => r.title, (r) => r.category, (r) => `${r.title} ${r.summary} ${r.tags.join(' ')}`);
    add(state.courses, 'Course', 'academy', (r) => r.title, (r) => r.category, (r) => `${r.title} ${r.category}`);
    return out;
  }, [q, state]);

  useEffect(() => { if (!open) setQ(''); }, [open]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[hsl(60_5%_10%/0.38)] backdrop-blur-[2px]" onClick={onClose} />
      <div className="panel relative w-full max-w-xl overflow-hidden" style={{ animation: 'pop 180ms cubic-bezier(0.16,1,0.3,1)' }}>
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients, projects, invoices, documents, knowledge…"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground/70" />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">Esc</kbd>
        </div>
        <div className="max-h-[46vh] overflow-y-auto">
          {q.trim().length < 2 ? (
            <p className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">Type at least two characters. Search runs across every module you have access to.</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">No records match “{q}”.</p>
          ) : (
            <ul className="p-1.5">
              {results.map((r) => (
                <li key={`${r.kind}-${r.id}`}>
                  <button onClick={() => { setModule(r.module, r.id); onClose(); }}
                    className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-secondary">
                    <Badge tone="muted" className="w-[76px] shrink-0 justify-center">{r.kind}</Badge>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{r.label}</span>
                      <span className="block truncate text-[11.5px] text-muted-foreground">{r.sub}</span>
                    </span>
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
const QUICK_ACTIONS = [
  { id: 'lead', label: 'New lead', module: 'leads', perm: 'leads' },
  { id: 'consultation', label: 'New consultation', module: 'consultations', perm: 'consultations' },
  { id: 'opportunity', label: 'New opportunity', module: 'opportunities', perm: 'opportunities' },
  { id: 'proposal', label: 'New proposal', module: 'proposals', perm: 'proposals' },
  { id: 'project', label: 'New project', module: 'projects', perm: 'projects' },
  { id: 'task', label: 'New task', module: 'tasks', perm: 'tasks' },
  { id: 'document', label: 'Request documents', module: 'documents', perm: 'documents' },
  { id: 'invoice', label: 'New invoice', module: 'invoices', perm: 'invoices' },
  { id: 'payment', label: 'Record payment', module: 'payments', perm: 'payments' },
  { id: 'expense', label: 'Add expense', module: 'expenses', perm: 'expenses' },
  { id: 'meeting', label: 'Schedule meeting', module: 'calendar', perm: 'calendar' },
  { id: 'assessment', label: 'New assessment', module: 'assessments', perm: 'assessments' },
];

function QuickCreate({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { can, setModule, state, dispatch, user, toast } = useApp();
  const [form, setForm] = useState({ company: '', contact: '', country: 'Cameroon', source: 'Website', service: SERVICES[0].name, budget: '8000', owner: user.id, notes: '' });

  const create = () => {
    if (!form.company.trim()) return;
    const lead = {
      id: `LED-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      companyName: form.company, contactName: form.contact || '—',
      email: '', phone: '', country: form.country, city: '', website: '',
      industry: 'Not stated', companySize: 'Medium', source: form.source,
      serviceInterest: form.service, targetMarket: '', currentMarket: form.country,
      exportExperience: 'Unknown', estimatedBudget: Number(form.budget) || 0, currency: 'XAF',
      value: Number(form.budget) || 0, scoreFlags: ['export_plans'], owner: form.owner,
      status: 'New', priority: 'Medium' as const, created: TODAY_ISO, lastContact: TODAY_ISO,
      nextFollowUp: TODAY_ISO, notes: form.notes, tags: [], campaign: '',
    };
    dispatch({ type: 'add', collection: 'leads', record: lead });
    dispatch({ type: 'add', collection: 'tasks', record: { id: `TSK-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, name: `First contact — ${form.company}`, description: 'Auto-created on lead capture.', assignee: form.owner, priority: 'High', due: TODAY_ISO, status: 'To Do', estimatedHours: 1, actualHours: 0, checklist: [], comments: [] } });
    dispatch({ type: 'notify', note: { category: 'Sales', title: 'New lead assigned', detail: `${form.company} — ${form.service}`, tone: 'success', link: { module: 'leads', recordId: lead.id } } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Lead created', record: lead.id, detail: `${form.company} via ${form.source}` } });
    toast('Lead created, owner assigned and a follow-up task scheduled.');
    setForm({ ...form, company: '', contact: '', notes: '' });
    setModule('leads', lead.id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Quick create" width="max-w-xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Create lead</Button></>}>
      <p className="mb-4 text-[12.5px] leading-relaxed text-muted-foreground">
        Capturing a lead here assigns an owner, creates a first-contact task and posts an acknowledgement — the same automation the website form triggers.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Company"><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Douala Cocoa Exporters" /></Field>
        <Field label="Contact name"><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Full name" /></Field>
        <Field label="Country"><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
        <Field label="Source">
          <Select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
            {['Website', 'Google', 'LinkedIn', 'Referral', 'Networking', 'Partner', 'WhatsApp', 'Direct'].map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Service of interest" className="sm:col-span-2">
          <Select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
            {SERVICES.map((s) => <option key={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Estimated budget (FCFA)"><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></Field>
        <Field label="Assign to">
          <Select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}>
            {state.companies.length > 0 && ['USR-01', 'USR-02', 'USR-03', 'USR-05'].map((id) => (
              <option key={id} value={id}>{['Cornelius F. D. Dzekashu', 'Aminata Diallo', 'Serge Nkeng', 'Yannick Ebodé'][['USR-01', 'USR-02', 'USR-03', 'USR-05'].indexOf(id)]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Notes" className="sm:col-span-2"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What is the client trying to achieve?" /></Field>
      </div>
      <div className="mt-4 border-t border-border pt-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Or jump straight to</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.filter((a) => can(a.perm)).map((a) => (
            <button key={a.id} onClick={() => { setModule(a.module); onClose(); }}
              className="rounded-md border border-border bg-card px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:border-forest/30 hover:bg-forest-soft hover:text-forest">
              <Plus className="mr-1 inline size-3" />{a.label}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, setModule } = useApp();
  const [filter, setFilter] = useState('All');
  const cats = ['All', 'Sales', 'Projects', 'Finance', 'Documents', 'Clients', 'Management'];
  const list = state.notifications.filter((n) => filter === 'All' || n.category === filter);
  if (!open) return null;
  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-card shadow-[0_12px_40px_-12px_hsl(60_10%_20%/0.3)]">
      <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
        <h3 className="font-display text-[13.5px] font-semibold">Notifications</h3>
        <button onClick={() => dispatch({ type: 'readNotification' })} className="text-[11.5px] text-muted-foreground underline-offset-2 hover:text-forest hover:underline">Mark all read</button>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b border-border px-2.5 py-1.5">
        {cats.map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={cn('shrink-0 rounded px-1.5 py-0.5 text-[11.5px] transition-colors', filter === c ? 'bg-forest-soft font-medium text-forest' : 'text-muted-foreground hover:bg-secondary')}>{c}</button>
        ))}
      </div>
      <ul className="max-h-[52vh] overflow-y-auto">
        {list.length === 0 && <li className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">Nothing in this category.</li>}
        {list.map((n) => (
          <li key={n.id} className={cn('border-b border-border/70 last:border-0', !n.read && 'bg-forest-soft/35')}>
            <button className="flex w-full gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-secondary/70"
              onClick={() => { dispatch({ type: 'readNotification', id: n.id }); if (n.link) setModule(n.link.module, n.link.recordId); onClose(); }}>
              <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', n.tone === 'danger' ? 'bg-danger' : n.tone === 'warning' ? 'bg-warning' : n.tone === 'success' ? 'bg-success' : 'bg-info')} />
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-medium leading-snug">{n.title}</span>
                <span className="mt-0.5 block text-[11.5px] leading-relaxed text-muted-foreground">{n.detail}</span>
                <span className="mt-1 block text-[10.5px] uppercase tracking-wide text-muted-foreground/80">{n.category} · {fmtDateTime(n.at)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
interface AiAnswer { headline: string; rows?: { label: string; value: string }[]; body?: string; module?: string }

function answerQuery(q: string, state: any): AiAnswer {
  const t = q.toLowerCase();
  const company = (id?: string) => state.companies.find((c: any) => c.id === id)?.tradingName ?? '—';

  if (/not been contacted|not contacted|no contact|stale lead|7 days/.test(t)) {
    const rows = state.leads
      .filter((l: any) => !['Won', 'Lost'].includes(l.status) && -daysFromToday(l.lastContact) >= 7)
      .sort((a: any, b: any) => daysFromToday(a.lastContact) - daysFromToday(b.lastContact))
      .slice(0, 8)
      .map((l: any) => ({ label: `${l.companyName} · ${l.status}`, value: `${Math.abs(daysFromToday(l.lastContact))} days` }));
    return { headline: `${rows.length} leads have had no contact for 7 days or more`, rows, module: 'leads', body: 'Ordered by time since last contact. The longest-idle records carry the most decay risk.' };
  }
  if (/eu|europe|european/.test(t) && /client|interest|entering/.test(t)) {
    const rows = state.companies
      .filter((c: any) => c.targetMarkets.some((m: string) => ['Netherlands', 'Germany', 'France', 'United Kingdom', 'Portugal', 'Spain'].includes(m)))
      .map((c: any) => ({ label: c.tradingName, value: c.targetMarkets.join(', ') }));
    return { headline: `${rows.length} companies are targeting European markets`, rows, module: 'companies', body: 'All of these will be subject to EUDR due diligence where their commodity is in scope.' };
  }
  if (/overdue task/.test(t)) {
    const rows = state.tasks.filter((x: any) => !['Completed', 'Cancelled'].includes(x.status) && daysFromToday(x.due) < 0)
      .map((x: any) => ({ label: x.name, value: `${Math.abs(daysFromToday(x.due))} days overdue` }));
    return { headline: `${rows.length} tasks are past their due date`, rows, module: 'tasks' };
  }
  if (/missing document|documents.*missing|outstanding document/.test(t)) {
    const rows = state.documents.filter((d: any) => d.status === 'Requested')
      .map((d: any) => ({ label: d.name, value: company(d.companyId) }));
    return { headline: `${rows.length} requested documents are still outstanding`, rows, module: 'documents', body: 'Two of these are blocking active delivery work.' };
  }
  if (/most revenue|which service|service.*revenue|revenue.*service/.test(t)) {
    const byService: Record<string, number> = {};
    state.invoices.forEach((inv: any) => {
      const paid = invoiceTotals(inv, state.payments).paid;
      const proj = state.projects.find((p: any) => p.id === inv.projectId);
      const svc = SERVICES.find((s) => s.id === proj?.serviceId)?.name ?? 'Other';
      byService[svc] = (byService[svc] ?? 0) + paid;
    });
    const rows = Object.entries(byService).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, value: money(v, 'XAF', true) }));
    return { headline: 'Collected revenue by service line', rows, module: 'reports', body: 'Based on payments received, not invoiced value.' };
  }
  if (/finish this month|ending this month|complete this month/.test(t)) {
    const rows = state.projects.filter((p: any) => p.status !== 'Completed' && daysFromToday(p.end) <= 30 && daysFromToday(p.end) >= -30)
      .map((p: any) => ({ label: `${p.name} · ${company(p.companyId)}`, value: `${projectProgress(p)}% · ends ${p.end}` }));
    return { headline: `${rows.length} projects close within the next 30 days`, rows, module: 'projects' };
  }
  if (/summar/.test(t) && /client|kola|history/.test(t)) {
    const c = state.companies[0];
    const projs = state.projects.filter((p: any) => p.companyId === c.id);
    const invs = state.invoices.filter((i: any) => i.companyId === c.id);
    const outstanding = invs.reduce((s: number, i: any) => s + invoiceTotals(i, state.payments).balance, 0);
    return {
      headline: `${c.tradingName} — relationship summary`,
      body: `Client since ${c.since}. ${projs.length} engagements, ${projs.filter((p: any) => p.status === 'Active').length} currently active. Outstanding balance of ${money(outstanding, 'EUR')}. The EUDR programme is the anchor engagement and the December 2026 deadline is the governing constraint on the whole account.`,
      rows: projs.map((p: any) => ({ label: p.name, value: `${p.status} · ${projectProgress(p)}%` })),
      module: 'companies',
    };
  }
  if (/proposal/.test(t)) {
    const rows = state.proposals.filter((p: any) => ['Sent', 'Viewed', 'Changes Requested'].includes(p.status))
      .map((p: any) => ({ label: `${p.number} · ${company(p.companyId)}`, value: p.status }));
    return { headline: `${rows.length} proposals are awaiting a client decision`, rows, module: 'proposals' };
  }
  if (/overdue invoice|who owes|outstanding/.test(t)) {
    const rows = state.invoices.map((i: any) => ({ i, t: invoiceTotals(i, state.payments) }))
      .filter((x: any) => x.t.balance > 0 && !['Draft', 'Cancelled', 'Void'].includes(x.i.status))
      .map((x: any) => ({ label: `${x.i.number} · ${company(x.i.companyId)}`, value: `${money(x.t.balance, x.i.currency)}${x.t.status === 'Overdue' ? ` · ${x.t.overdueDays}d overdue` : ''}` }));
    return { headline: `${rows.length} invoices carry an outstanding balance`, rows, module: 'invoices' };
  }
  if (/follow.?up email|draft.*email/.test(t)) {
    return {
      headline: 'Draft follow-up email',
      body: 'Subject: Proposal BALIA-P-2026-0016 — next steps\n\nDear Youssef,\n\nFollowing our proposal of 2 September for the West Africa entry strategy, I wanted to check whether the scope reflects what your board needs to see. I am conscious that origin determination on the three lead SKUs is the piece that will decide whether preferential access is achievable at all, so I would rather we get that framing right before you take it forward.\n\nWould a short call on Thursday work?\n\nKind regards,\nYannick Ebodé\nBALIA Consulting',
    };
  }
  // ---- Funding & business-intelligence intents (spec §22) ----------------
  const funderName = (id: string) => state.funders.find((f: any) => f.id === id)?.name ?? 'Unassigned';
  const openOpp = (o: any) => !['Rejected', 'Withdrawn', 'Expired', 'Not Eligible', 'Archived'].includes(o.status);

  // §34 — Find clients for BALIA (prospect intelligence). Runs before the
  // funding intents so client/company/prospect queries route here.
  if (/prospect|\bclients?\b(?!.*fund)|exporters?|importers?|manufacturers?|companies (in|that|with|needing)|find .*(compan|firm|business)|who (could|might|should) (we|balia) (contact|approach)/.test(t) && !/opportunit|tender|grant/.test(t)) {
    let pool = (state.prospects as any[]).slice();
    let lens = 'BALIA client prospects';
    const countries = ['cameroon', 'gabon', 'congo', 'chad', 'central african', 'equatorial guinea'];
    for (const c of countries) if (t.includes(c)) { pool = pool.filter((p) => p.country.toLowerCase().includes(c)); lens = `${c.replace(/\b\w/, (m) => m.toUpperCase())} prospects`; }
    const cities = ['douala', 'yaound', 'kribi', 'limbe', 'garoua', 'bafoussam', 'libreville'];
    for (const c of cities) if (t.includes(c)) pool = pool.filter((p) => p.city.toLowerCase().includes(c));
    const segs: [string, string][] = [['exporter', 'Exporter'], ['importer', 'Importer'], ['manufacturer', 'Manufacturer'], ['logistic', 'Logistics / Freight'], ['agribusiness', 'Agribusiness'], ['distributor', 'Distributor / Wholesaler']];
    for (const [kw, seg] of segs) if (t.includes(kw)) { pool = pool.filter((p) => p.segment === seg); lens = `${seg} prospects`; }
    const svc: [string, string][] = [['eudr', 'EUDR'], ['customs', 'Customs'], ['export', 'Export'], ['market entry', 'Market Entry'], ['market-entry', 'Market Entry'], ['training', 'Training'], ['afcfta', 'AfCFTA'], ['compliance', 'Compliance']];
    for (const [kw, s] of svc) if (t.includes(kw)) pool = pool.filter((p) => (p.services || []).some((x: string) => x.toLowerCase().includes(s.toLowerCase())));
    const cm = t.match(/above (\d{2})|over (\d{2})|>\s?(\d{2})|(\d{2})%/);
    if (/conversion|convert|probab/.test(t) || cm) { const thr = Number(cm?.[1] || cm?.[2] || cm?.[3] || cm?.[4] || 60); pool = pool.filter((p) => (p.conversionProbability ?? 0) > thr); lens = `${lens} with conversion above ${thr}%`; }
    if (/trigger|why now|expansion|investment/.test(t)) { pool = pool.filter((p) => !!p.trigger && !/no current trigger/i.test(p.whyNow || '')); lens = `${lens} with a current trigger`; }
    if (/decision.?maker|export manager|managing director|contact.*identif/.test(t)) pool = pool.filter((p) => (p.contacts || []).some((c: any) => c.name));
    const rows = pool.map((p) => ({ p, i: prospectIntel(p) })).sort((a, b) => prospectScore(b.p) - prospectScore(a.p)).slice(0, 12)
      .map(({ p, i }: any) => ({ label: `${p.name} · ${p.city}, ${p.country}`, value: `score ${prospectScore(p)} · ${p.conversionProbability}% · ${i.outreach}` }));
    return { headline: `${rows.length} ${lens}`, rows, module: 'client-prospects', body: 'Ranked by BALIA prospect score. Company-level contacts and roles-to-target only — verify a named decision-maker and any current trigger before outreach.' };
  }

  // §38 — Find opportunities for BALIA (intelligence-aware). Runs before the
  // generic funding intents so category/keyword/competitiveness queries route
  // to the scored intelligence view.
  if (/(find|show|list|which).*(opportunit|funding|tender|contract|consult)|(customs|afcfta|eudr|export|trade|consult|training|research|market entry|client).*(opportunit|funding|tender|contract)|competitiveness|client funding/.test(t)) {
    let pool = state.fundingOpportunities.filter(openOpp);
    let lens = 'BALIA opportunities';
    if (/consult|technical assist|advisory contract/.test(t)) { pool = pool.filter(isConsultingOpportunity); lens = 'consulting & technical-assistance opportunities'; }
    else if (/client.*fund|client opportunit|for.*client/.test(t)) { pool = pool.filter(isClientOpportunity); lens = 'client funding opportunities'; }
    const kws: [string, string][] = [['customs', 'customs'], ['AfCFTA', 'afcfta'], ['EUDR', 'eudr'], ['export', 'export'], ['training', 'training'], ['research', 'research'], ['market-entry', 'market entry']];
    for (const [label, key] of kws) {
      if (t.includes(key)) { pool = pool.filter((o: any) => `${o.name} ${o.description} ${o.baliaCategory ?? ''} ${o.tags.join(' ')}`.toLowerCase().includes(key)); lens = `${label} opportunities`; }
    }
    const cm = t.match(/(\d{2})\s?%|more than (\d{2})|over (\d{2})|>\s?(\d{2})/);
    if (/competitiv/.test(t) || cm) { const thr = Number(cm?.[1] || cm?.[2] || cm?.[3] || cm?.[4] || 50); pool = pool.filter((o: any) => (o.competitiveness ?? 0) > thr); lens = `${lens} with estimated competitiveness above ${thr}%`; }
    if (/clos|deadline|due|30 day|within a month/.test(t)) { pool = pool.filter((o: any) => { const d = daysFromToday(o.deadline); return d >= 0 && d <= 30; }); lens = `${lens} closing within 30 days`; }
    const rows = pool.map((o: any) => ({ o, i: oppIntel(o) })).sort((a: any, b: any) => b.i.rank - a.i.rank).slice(0, 10)
      .map(({ o, i }: any) => ({ label: `${o.name} · ${funderName(o.funderId)}`, value: `fit ${i.fit.score} · ${o.competitiveness ?? 0}% · ${i.priority}` }));
    return { headline: `${rows.length} ${lens}`, rows, module: 'opportunity-intel', body: 'Ranked by BALIA composite score (fit, competitiveness, revenue, timing). Competitiveness is BALIA\u2019s estimate, not the funder\u2019s official selection rate — confirm the official source before acting.' };
  }

  if (/top.*(funding|opportunit)|best.*(funding|opportunit)|strongest.*fit|best.?fit/.test(t)) {
    const ranked = state.fundingOpportunities.filter(openOpp)
      .map((o: any) => ({ o, f: computeFitScore(o.fitInputs, o.verifiedCriteria) }))
      .sort((a: any, b: any) => b.f.score - a.f.score).slice(0, 10);
    const rows = ranked.map(({ o, f }: any) => ({ label: `${o.name} · ${funderName(o.funderId)}`, value: `fit ${f.score}${f.hasUnverified ? ' (some assumed)' : ''}` }));
    return { headline: `Top ${rows.length} funding opportunities by fit score`, rows, module: 'funding-opportunities', body: 'Ranked by fit score. Where inputs are still assumptions rather than verified eligibility, that is flagged — confirm before committing effort.' };
  }
  if (/fit score (above|over|>) ?8|above 80|over 80|score.*80/.test(t)) {
    const rows = state.fundingOpportunities.filter(openOpp)
      .map((o: any) => ({ o, s: computeFitScore(o.fitInputs, o.verifiedCriteria).score }))
      .filter((x: any) => x.s >= 80).sort((a: any, b: any) => b.s - a.s)
      .map(({ o, s }: any) => ({ label: `${o.name} · ${funderName(o.funderId)}`, value: `${s}` }));
    return { headline: `${rows.length} opportunities score 80 or above`, rows, module: 'funding-opportunities' };
  }
  if (/due.*(30|thirty) days|within (a )?month|application.*due|deadline.*(30|month)/.test(t)) {
    const rows = state.fundingOpportunities.filter(openOpp)
      .filter((o: any) => { const d = daysFromToday(o.deadline); return d >= 0 && d <= 30; })
      .sort((a: any, b: any) => daysFromToday(a.deadline) - daysFromToday(b.deadline))
      .map((o: any) => ({ label: `${o.name} · ${funderName(o.funderId)}`, value: deadlineInfo(o.deadline).label }));
    return { headline: `${rows.length} funding opportunities are due within 30 days`, rows, module: 'funding-opportunities' };
  }
  if (/missing.*(funding )?document|funding.*document.*missing|documents.*application/.test(t)) {
    const rows = state.fundingAppDocuments.filter((d: any) => d.required && (d.status === 'Missing' || d.status === 'Requested'))
      .map((d: any) => ({ label: d.name, value: d.status }));
    return { headline: `${rows.length} required application documents are outstanding`, rows, module: 'funding-applications' };
  }
  if (/funder.*not.*contact|not.*contacted.*funder|funders.*to contact/.test(t)) {
    const rows = state.funders
      .filter((f: any) => !['Archived', 'Dormant'].includes(f.status))
      .filter((f: any) => !f.lastContact || -daysFromToday(f.lastContact) >= 21)
      .sort((a: any, b: any) => (a.lastContact ?? '') < (b.lastContact ?? '') ? -1 : 1)
      .map((f: any) => ({ label: f.name, value: f.lastContact ? `${Math.abs(daysFromToday(f.lastContact))} days ago` : 'never' }));
    return { headline: `${rows.length} funders have not been contacted recently`, rows, module: 'funders', body: 'Funders with no contact in 21+ days, oldest first — relationships to re-warm.' };
  }
  if (/success rate|win rate.*fund|funding.*success/.test(t)) {
    const fan = fundingAnalytics(state.funders, state.fundingOpportunities, state.fundingApplications, state.fundingAppDocuments, state.fundingOutcomes);
    return { headline: `Funding success rate: ${fan.successRate}%`, rows: [
      { label: 'Funding secured', value: money(fan.fundingSecured, 'XAF', true) },
      { label: 'Funding requested', value: money(fan.fundingRequested, 'XAF', true) },
      { label: 'Pipeline value', value: money(fan.pipelineValue, 'XAF', true) },
      { label: 'Applications submitted', value: String(fan.applicationsSubmitted) },
    ], module: 'funding-dashboard', body: 'Success rate is awards divided by decided applications. Pipeline value counts open opportunities only.' };
  }
  if (/funding pipeline|funding over|opportunities over|funding above/.test(t)) {
    const m = t.match(/(\d[\d,]{3,})/);
    const threshold = m ? Number(m[1].replace(/,/g, '')) : 0;
    const list = state.fundingOpportunities.filter(openOpp).filter((o: any) => o.estimatedValue >= threshold)
      .sort((a: any, b: any) => b.estimatedValue - a.estimatedValue);
    const rows = list.map((o: any) => ({ label: `${o.name} · ${funderName(o.funderId)}`, value: money(o.estimatedValue, o.currency, true) }));
    return { headline: threshold ? `${rows.length} opportunities at or above ${money(threshold, 'XAF', true)}` : `Funding pipeline — ${rows.length} open opportunities`, rows, module: 'funding-opportunities' };
  }
  if (/findings?.*(not|un).*(acted|action)|findings? need|which findings/.test(t)) {
    const rows = state.businessFindings
      .filter((f: any) => !['Converted', 'Archived', 'Dismissed'].includes(f.status))
      .filter((f: any) => f.status === 'Action Required' || !f.nextAction)
      .map((f: any) => ({ label: f.title, value: f.status }));
    return { headline: `${rows.length} findings need action`, rows, module: 'business-findings' };
  }
  if (/findings?.*(consulting|revenue|convert)|consulting opportunit/.test(t)) {
    const rows = state.businessFindings
      .filter((f: any) => f.status !== 'Archived' && (f.type.includes('Consulting') || f.type.includes('Client') || f.category === 'Consulting'))
      .map((f: any) => ({ label: f.title, value: f.potentialValue ? money(f.potentialValue, f.currency, true) : f.country }));
    return { headline: `${rows.length} findings could become consulting opportunities`, rows, module: 'business-findings', body: 'Findings tagged as consulting or client opportunities — candidates to convert into leads or opportunities.' };
  }

  return {
    headline: 'Ask about anything in the system you can access',
    body: 'Try: leads with no contact in seven days · which clients are entering the EU · overdue tasks · which documents are missing · which services generate the most revenue · which projects finish this month · summarise this client’s history · draft a follow-up email.',
  };
}

function BaliaAI({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setModule, role } = useApp();
  const [q, setQ] = useState('');
  const [thread, setThread] = useState<{ q: string; a: AiAnswer }[]>([]);

  const ask = (question: string) => {
    if (!question.trim()) return;
    setThread((t) => [...t, { q: question, a: answerQuery(question, state) }]);
    setQ('');
  };

  if (!open) return null;
  const suggestions = ['Top funding opportunities for BALIA', 'Which applications are due within 30 days?', 'Which funders have we not contacted recently?', 'Which documents are missing?', 'Funding success rate', 'Which findings could become consulting opportunities?'];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[hsl(60_5%_10%/0.34)] backdrop-blur-[1.5px]" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-[-8px_0_40px_-12px_hsl(60_10%_15%/0.28)]">
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-forest-soft text-forest"><Sparkles className="size-4" strokeWidth={1.9} /></span>
            <div>
              <h2 className="font-display text-[15px] font-semibold leading-none">BALIA AI</h2>
              <p className="mt-1 text-[11.5px] text-muted-foreground">Scoped to your {ROLES.find((r) => r.id === role)?.name} permissions</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close assistant"><X className="size-4" /></Button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {thread.length === 0 && (
            <div className="space-y-3">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                Ask questions about your pipeline, delivery and finances. Answers are computed from live CRM records — nothing is invented.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="rounded-md border border-border bg-secondary/60 px-2 py-1 text-left text-[12px] text-muted-foreground transition-colors hover:border-forest/30 hover:bg-forest-soft hover:text-forest">{s}</button>
                ))}
              </div>
            </div>
          )}
          {thread.map((item, i) => (
            <div key={i} className="space-y-2.5">
              <p className="ml-auto w-fit max-w-[85%] rounded-lg rounded-br-sm bg-forest px-3 py-2 text-[13px] leading-relaxed text-primary-foreground">{item.q}</p>
              <div className="panel-flat bg-secondary/40 p-3">
                <p className="text-[13px] font-medium leading-snug text-foreground">{item.a.headline}</p>
                {item.a.body && <p className="mt-1.5 whitespace-pre-line text-[12.5px] leading-relaxed text-muted-foreground">{item.a.body}</p>}
                {item.a.rows && item.a.rows.length > 0 && (
                  <ul className="mt-2.5 space-y-1 border-t border-border pt-2.5">
                    {item.a.rows.map((r, j) => (
                      <li key={j} className="flex items-baseline justify-between gap-3 text-[12.5px]">
                        <span className="min-w-0 truncate text-foreground">{r.label}</span>
                        <span className="tnum shrink-0 text-muted-foreground">{r.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5">
                  <p className="text-[10.5px] leading-tight text-muted-foreground">AI-generated assistance. Verify before relying on it for regulatory advice.</p>
                  {item.a.module && <Button size="sm" variant="outline" onClick={() => { setModule(item.a.module!); onClose(); }}>Open</Button>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-3">
          <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="flex gap-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask BALIA AI…" />
            <Button type="submit">Ask</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { user, role, state, module, setModule } = useApp();
  const alerts = useAlerts();
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const unread = state.notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') { setSearchOpen(false); setNotesOpen(false); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const label = NAV.find((n) => n.id === module)?.label ?? 'Workspace';

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="flex h-14 items-center gap-2 px-4 md:px-6">
          <button onClick={onOpenMobile} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden" aria-label="Open navigation">
            <PanelLeft className="size-4.5" />
          </button>

          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-[12.5px] text-muted-foreground md:flex">
            <span>BALIA Consulting</span>
            <span className="text-border">/</span>
            <span className="truncate font-medium text-foreground">{label}</span>
          </nav>

          <button onClick={() => setSearchOpen(true)}
            className="ml-auto flex h-8 w-9 items-center justify-center gap-2 rounded-md border border-input bg-card text-muted-foreground transition-colors hover:border-muted-foreground/30 hover:text-foreground md:w-[260px] md:justify-start md:px-2.5">
            <Search className="size-3.5 shrink-0" />
            <span className="hidden text-[12.5px] md:inline">Search everything</span>
            <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-border px-1 py-px text-[10px] md:flex"><Command className="size-2.5" />K</kbd>
          </button>

          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => setAiOpen(true)}>
            <Sparkles className="size-3.5 text-gold" /><span className="hidden sm:inline">BALIA AI</span>
          </Button>

          <div className="relative">
            <button onClick={() => setNotesOpen((v) => !v)}
              className="relative flex size-8 items-center justify-center rounded-md border border-input bg-card text-muted-foreground transition-colors hover:border-muted-foreground/30 hover:text-foreground" aria-label={`Notifications, ${unread} unread`}>
              <Bell className="size-4" strokeWidth={1.8} />
              {unread > 0 && <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9.5px] font-semibold leading-4 text-white">{unread}</span>}
            </button>
            <NotificationPanel open={notesOpen} onClose={() => setNotesOpen(false)} />
          </div>

          <Button size="sm" className="h-8 gap-1.5" onClick={() => setQuickOpen(true)}>
            <Plus className="size-3.5" /><span className="hidden sm:inline">Create</span>
          </Button>

          <div className="ml-1 flex items-center gap-2 border-l border-border pl-3">
            <Avatar name={user.name} initials={user.initials} />
            <div className="hidden leading-tight lg:block">
              <p className="text-[12.5px] font-medium">{user.name.split(' ')[0]} {user.name.split(' ').slice(-1)}</p>
              <p className="text-[10.5px] text-muted-foreground">{ROLES.find((r) => r.id === role)?.name}</p>
            </div>
          </div>
        </div>

        {alerts.filter((a) => a.severity === 'danger').length > 0 && module === 'dashboard' && (
          <div className="flex items-center gap-2 border-t border-danger/15 bg-danger-soft px-4 py-1.5 text-[12px] text-danger md:px-6">
            <span className="size-1.5 shrink-0 rounded-full bg-danger" />
            <span className="truncate">
              {alerts.filter((a) => a.severity === 'danger').length} items need immediate attention — {alerts.find((a) => a.severity === 'danger')?.title}
            </span>
            <button onClick={() => setModule('dashboard')} className="ml-auto shrink-0 font-medium underline-offset-2 hover:underline">Review</button>
          </div>
        )}
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <QuickCreate open={quickOpen} onClose={() => setQuickOpen(false)} />
      <BaliaAI open={aiOpen} onClose={() => setAiOpen(false)} />
    </>
  );
}

export function Toasts() {
  const { toasts } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-border bg-card px-3.5 py-2.5 shadow-[0_8px_28px_-10px_hsl(60_10%_20%/0.3)]"
          style={{ animation: 'toast-in 240ms cubic-bezier(0.16,1,0.3,1)' }}>
          <style>{`@keyframes toast-in{from{transform:translateY(8px);opacity:0}to{transform:none;opacity:1}}`}</style>
          <span className={cn('mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full', t.tone === 'warning' ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success')}>
            <Check className="size-2.5" strokeWidth={3} />
          </span>
          <p className="text-[12.5px] leading-relaxed text-foreground">{t.msg}</p>
        </div>
      ))}
    </div>
  );
}
