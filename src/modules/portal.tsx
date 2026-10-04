import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard, Building2, FolderKanban, FileStack, FileText, FileSignature, Receipt,
  Banknote, MessagesSquare, Calendar, GraduationCap, LogOut, CheckCircle2, Circle, Upload,
  Send, ArrowRight, ShieldCheck, Clock,
} from 'lucide-react';
import { useApp } from '@/store';
import { SERVICES } from '@/data/catalog';
import {
  Badge, Button, StatusBadge, Progress, Stat, Avatar, EmptyState, Input, KpiCard,
} from '@/components/kit';
import { money, fmtDate, fmtDateTime, relativeDays, daysFromToday, invoiceTotals, projectProgress } from '@/lib/derive';
import { cn } from '@/lib/utils';

const PORTAL_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'company', label: 'My Company', icon: Building2 },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'documents', label: 'Documents', icon: FileStack },
  { id: 'proposals', label: 'Proposals', icon: FileText },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'messages', label: 'Messages', icon: MessagesSquare },
  { id: 'training', label: 'Training', icon: GraduationCap },
];

function BaliaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M4 26V6h9.4c3.6 0 5.8 1.9 5.8 4.9 0 2.1-1.1 3.6-3 4.3 2.4.6 3.9 2.3 3.9 4.8 0 3.6-2.6 6-6.8 6H4Z" fill="currentColor" opacity="0.92" />
      <path d="M22.5 6.5 28 26h-3.6l-1.1-4.4h-5.1" stroke="currentColor" strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

export function ClientPortal() {
  const { state, dispatch, setRole, portalCompanyId, setPortalCompanyId } = useApp();
  const [page, setPage] = useState('dashboard');
  const company = state.companies.find((c) => c.id === portalCompanyId)!;

  // Everything below is scoped strictly to this one company.
  const projects = state.projects.filter((p) => p.companyId === portalCompanyId);
  const documents = state.documents.filter((d) => d.companyId === portalCompanyId);
  const proposals = state.proposals.filter((p) => p.companyId === portalCompanyId);
  const invoices = state.invoices.filter((i) => i.companyId === portalCompanyId && i.status !== 'Draft');
  const messages = state.messages.filter((m) => m.companyId === portalCompanyId);
  const enrollments = state.enrollments.filter((e) => e.companyId === portalCompanyId);
  const events = state.events.filter((e) => e.companyId === portalCompanyId && daysFromToday(e.date) >= 0);
  const contract = state.contracts.find((c) => c.companyId === portalCompanyId);

  const requestedDocs = documents.filter((d) => d.status === 'Requested');
  const outstandingInvoices = invoices.filter((i) => invoiceTotals(i, state.payments).balance > 0);

  const clientCompanies = state.companies.filter((c) => c.status === 'Client');

  return (
    <div className="min-h-screen bg-background">
      {/* Portal top bar — visually distinct from the internal app */}
      <header className="sticky top-0 z-30 border-b border-border bg-rail text-rail-foreground">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <span className="flex size-8 items-center justify-center rounded-md bg-[hsl(219_50%_24%)] text-[hsl(210_40%_96%)]"><BaliaMark className="size-5" /></span>
          <div>
            <p className="font-display text-[14px] font-semibold leading-none text-[hsl(210_35%_95%)]">BALIA Client Portal</p>
            <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.1em] text-rail-muted">{company.tradingName}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <select value={portalCompanyId} onChange={(e) => setPortalCompanyId(e.target.value)}
              className="rounded-md border border-rail-border bg-[hsl(220_30%_13%)] px-2 py-1 text-[12px] text-[hsl(219_20%_86%)] focus:outline-none">
              {clientCompanies.map((c) => <option key={c.id} value={c.id}>{c.tradingName}</option>)}
            </select>
            <button onClick={() => setRole('super_admin')} className="flex items-center gap-1.5 rounded-md border border-rail-border px-2.5 py-1.5 text-[12px] text-[hsl(219_18%_78%)] transition-colors hover:bg-[hsl(220_28%_14%)]">
              <LogOut className="size-3.5" />Exit portal
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-0.5 overflow-x-auto px-2">
          {PORTAL_NAV.map((n) => {
            const Icon = n.icon;
            const active = page === n.id;
            const badge = n.id === 'documents' ? requestedDocs.length : n.id === 'invoices' ? outstandingInvoices.length : n.id === 'messages' ? messages.filter((m) => m.from === 'balia').length : 0;
            return (
              <button key={n.id} onClick={() => setPage(n.id)}
                className={cn('relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-[12.5px] transition-colors',
                  active ? 'text-[hsl(41_60%_60%)]' : 'text-[hsl(219_12%_66%)] hover:text-[hsl(219_22%_86%)]')}>
                <Icon className="size-3.5" strokeWidth={1.8} />{n.label}
                {badge > 0 && <span className="tnum rounded-full bg-[hsl(41_58%_50%)] px-1 text-[10px] font-semibold text-[hsl(220_30%_12%)]">{badge}</span>}
                {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[hsl(41_58%_55%)]" />}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {page === 'dashboard' && (
          <div className="enter-up space-y-5">
            <div>
              <h1 className="font-display text-[24px] font-semibold">Welcome, {company.tradingName}</h1>
              <p className="mt-1 text-[13.5px] text-muted-foreground">Here is where your BALIA engagements stand today.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
              <KpiCard dense label="Active projects" value={projects.filter((p) => !['Completed', 'Cancelled'].includes(p.status)).length} onClick={() => setPage('projects')} />
              <KpiCard dense label="Documents requested" value={requestedDocs.length} tone={requestedDocs.length ? 'warning' : 'success'} onClick={() => setPage('documents')} />
              <KpiCard dense label="Outstanding invoices" value={outstandingInvoices.length} tone={outstandingInvoices.length ? 'warning' : 'success'} onClick={() => setPage('invoices')} />
              <KpiCard dense label="Open proposals" value={proposals.filter((p) => ['Sent', 'Viewed'].includes(p.status)).length} onClick={() => setPage('proposals')} />
            </div>

            {requestedDocs.length > 0 && (
              <div className="panel border-l-2 border-l-warning/50 p-4">
                <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-warning"><Upload className="size-4" />Action needed: upload {requestedDocs.length} document{requestedDocs.length > 1 ? 's' : ''}</p>
                <ul className="space-y-2">
                  {requestedDocs.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3">
                      <div><p className="text-[13px] font-medium">{d.name}</p><p className="text-[11.5px] text-muted-foreground">{d.category}</p></div>
                      <Button size="sm" onClick={() => { dispatch({ type: 'clientUploadDocument', documentId: d.id, contactId: d.requestedFrom ?? 'CON-01' }); }}>
                        <Upload className="size-3.5" />Upload
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="panel p-4">
                <p className="mb-3 font-display text-[13.5px] font-semibold">Project progress</p>
                {projects.filter((p) => p.status !== 'Completed').map((p) => (
                  <div key={p.id} className="mb-3 last:mb-0">
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <button onClick={() => setPage('projects')} className="truncate text-[12.5px] font-medium hover:text-forest">{p.name}</button>
                      <span className="tnum text-[11.5px] text-muted-foreground">{projectProgress(p)}%</span>
                    </div>
                    <Progress value={projectProgress(p)} tone="forest" />
                  </div>
                ))}
                {!projects.filter((p) => p.status !== 'Completed').length && <EmptyState title="No active projects" />}
              </div>

              <div className="panel p-4">
                <p className="mb-3 font-display text-[13.5px] font-semibold">Upcoming meetings</p>
                {events.length ? events.map((e) => (
                  <div key={e.id} className="mb-2.5 flex gap-3 last:mb-0">
                    <span className="flex w-11 shrink-0 flex-col items-center rounded border border-border bg-secondary/60 py-1">
                      <span className="text-[9.5px] uppercase text-muted-foreground">{fmtDate(e.date, 'day').split(' ')[0]}</span>
                      <span className="tnum font-display text-[15px] font-semibold leading-none">{new Date(`${e.date}T00:00`).getDate()}</span>
                    </span>
                    <div><p className="text-[12.5px] font-medium">{e.title}</p><p className="text-[11.5px] text-muted-foreground">{e.time} · {e.location}</p></div>
                  </div>
                )) : <EmptyState title="No meetings scheduled" />}
              </div>
            </div>
          </div>
        )}

        {page === 'company' && (
          <div className="enter-up">
            <h1 className="mb-4 font-display text-[22px] font-semibold">My company</h1>
            <div className="panel p-5">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <Stat label="Legal name" value={company.legalName} />
                <Stat label="Registration" value={company.regNumber} />
                <Stat label="Industry" value={company.industry} />
                <Stat label="Country" value={company.country} />
                <Stat label="Website" value={company.website} />
                <Stat label="Client since" value={fmtDate(company.since)} />
                <Stat label="Products" value={company.products.join(', ')} className="col-span-2 sm:col-span-3" />
                <Stat label="Target markets" value={company.targetMarkets.join(', ')} className="col-span-2 sm:col-span-3" />
              </dl>
            </div>
            {contract && (
              <div className="panel mt-4 p-5">
                <p className="mb-3 font-display text-[13.5px] font-semibold">Your engagement</p>
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Stat label="Contract" value={contract.number} />
                  <Stat label="Type" value={contract.type} />
                  <Stat label="Value" value={money(contract.value, contract.currency)} />
                  <Stat label="Status" value={<StatusBadge status={contract.status} />} />
                </dl>
              </div>
            )}
          </div>
        )}

        {page === 'projects' && (
          <div className="enter-up">
            <h1 className="mb-4 font-display text-[22px] font-semibold">Projects</h1>
            <div className="space-y-4">
              {projects.map((p) => (
                <div key={p.id} className="panel p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-[15px] font-medium">{p.name}</p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{SERVICES.find((s) => s.id === p.serviceId)?.name}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Progress value={projectProgress(p)} tone="forest" />
                    <span className="tnum text-[13px] font-medium">{projectProgress(p)}%</span>
                  </div>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Workplan</p>
                    <ol className="grid gap-1.5 sm:grid-cols-2">
                      {p.workflow.map((w) => (
                        <li key={w.name} className="flex items-center gap-2 text-[12.5px]">
                          {w.done ? <CheckCircle2 className="size-3.5 shrink-0 text-success" /> : <Circle className="size-3.5 shrink-0 text-muted-foreground/50" />}
                          <span className={w.done ? 'text-muted-foreground' : 'text-foreground'}>{w.name}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
              {!projects.length && <div className="panel"><EmptyState title="No projects yet" /></div>}
            </div>
          </div>
        )}

        {page === 'documents' && (
          <div className="enter-up">
            <h1 className="mb-4 font-display text-[22px] font-semibold">Documents</h1>
            <div className="panel overflow-hidden">
              <table className="w-full text-[13px]">
                <thead><tr className="border-b border-border">
                  {['Document', 'Category', 'Status', 'Action'].map((h) => <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground last:text-right">{h}</th>)}
                </tr></thead>
                <tbody>
                  {documents.map((d) => (
                    <tr key={d.id} className="border-b border-border/70 last:border-0">
                      <td className="px-4 py-3"><p className="font-medium">{d.name}</p>{d.uploaded && <p className="text-[11.5px] text-muted-foreground">Uploaded {fmtDate(d.uploaded)}</p>}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.category}</td>
                      <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                      <td className="px-4 py-3 text-right">
                        {d.status === 'Requested'
                          ? <Button size="sm" onClick={() => dispatch({ type: 'clientUploadDocument', documentId: d.id, contactId: d.requestedFrom ?? 'CON-01' })}><Upload className="size-3.5" />Upload</Button>
                          : <span className="text-[12px] text-muted-foreground">{d.status === 'Approved' ? 'Approved' : d.status === 'Under Review' ? 'In review' : d.status}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {page === 'proposals' && (
          <div className="enter-up">
            <h1 className="mb-4 font-display text-[22px] font-semibold">Proposals</h1>
            <div className="space-y-3">
              {proposals.map((p) => {
                const value = p.services.reduce((s, i) => s + i.qty * i.rate, 0);
                return (
                  <div key={p.id} className="panel p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-medium">{p.title}</p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">{p.number} · valid until {fmtDate(p.validUntil)}</p>
                      </div>
                      <div className="text-right">
                        <p className="tnum font-display text-[18px] font-semibold">{money(value, p.currency)}</p>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                    <p className="mt-3 border-t border-border pt-3 text-[13px] leading-relaxed text-muted-foreground">{p.scope}</p>
                    {['Sent', 'Viewed'].includes(p.status) && (
                      <div className="mt-4 flex gap-2">
                        <Button onClick={() => dispatch({ type: 'acceptProposal', proposalId: p.id, signer: { name: 'Authorised signatory', email: 'client@example.com' }, user: 'client' })}>
                          <ShieldCheck className="size-3.5" />Accept proposal
                        </Button>
                        <Button variant="outline">Request changes</Button>
                      </div>
                    )}
                    {p.status === 'Accepted' && p.signature && (
                      <div className="mt-3 flex items-center gap-2 rounded-md bg-success-soft/60 px-3 py-2 text-[12px] text-success">
                        <ShieldCheck className="size-3.5" />Accepted on {fmtDate(p.accepted!)} by {p.signature.name}
                      </div>
                    )}
                  </div>
                );
              })}
              {!proposals.length && <div className="panel"><EmptyState title="No proposals" /></div>}
            </div>
          </div>
        )}

        {page === 'invoices' && (
          <div className="enter-up">
            <h1 className="mb-4 font-display text-[22px] font-semibold">Invoices</h1>
            <div className="panel overflow-hidden">
              <table className="w-full text-[13px]">
                <thead><tr className="border-b border-border">
                  {['Invoice', 'Issued', 'Due', 'Total', 'Balance', 'Status', ''].map((h) => <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>)}
                </tr></thead>
                <tbody>
                  {invoices.map((i) => {
                    const t = invoiceTotals(i, state.payments);
                    return (
                      <tr key={i.id} className="border-b border-border/70 last:border-0">
                        <td className="px-4 py-3 font-medium">{i.number}</td>
                        <td className="px-4 py-3 text-muted-foreground">{fmtDate(i.issued)}</td>
                        <td className="px-4 py-3"><span className={t.status === 'Overdue' ? 'font-medium text-danger' : ''}>{fmtDate(i.due)}</span></td>
                        <td className="px-4 py-3 tnum">{money(t.total, i.currency)}</td>
                        <td className="px-4 py-3 tnum font-medium">{money(t.balance, i.currency)}</td>
                        <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                        <td className="px-4 py-3 text-right">{t.balance > 0 && <Button size="sm"><Banknote className="size-3.5" />Pay</Button>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {page === 'messages' && <PortalMessages companyId={portalCompanyId} />}

        {page === 'training' && (
          <div className="enter-up">
            <h1 className="mb-4 font-display text-[22px] font-semibold">Training</h1>
            <div className="space-y-3">
              {enrollments.map((e) => {
                const course = state.courses.find((c) => c.id === e.courseId);
                return (
                  <div key={e.id} className="panel p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="text-[14px] font-medium">{course?.title}</p><p className="mt-0.5 text-[12px] text-muted-foreground">{e.learnerName} · {e.cohort}</p></div>
                      {e.certified && <Badge tone="success" dot>Certified</Badge>}
                    </div>
                    <div className="mt-3 flex items-center gap-3"><Progress value={e.progress} tone="forest" /><span className="tnum text-[12.5px] font-medium">{e.progress}%</span></div>
                  </div>
                );
              })}
              {!enrollments.length && <div className="panel"><EmptyState title="No training enrolments" detail="Your team's BALIA Academy courses will appear here." /></div>}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border py-4 text-center text-[11.5px] text-muted-foreground">
        BALIA Consulting · Secure client portal · You are viewing only your organisation's information.
      </footer>
    </div>
  );
}

function PortalMessages({ companyId }: { companyId: string }) {
  const { state, dispatch } = useApp();
  const [draft, setDraft] = useState('');
  const thread = state.messages.filter((m) => m.companyId === companyId).sort((a, b) => (a.at < b.at ? -1 : 1));
  const company = state.companies.find((c) => c.id === companyId)!;
  const contact = state.contacts.find((c) => c.companyId === companyId && c.decisionMaker);

  const send = () => {
    if (!draft.trim()) return;
    dispatch({ type: 'sendMessage', message: { companyId, from: 'client', author: contact ? `${contact.firstName} ${contact.lastName}` : company.tradingName, at: new Date().toISOString(), body: draft, read: false } });
    setDraft('');
  };

  return (
    <div className="enter-up">
      <h1 className="mb-4 font-display text-[22px] font-semibold">Messages</h1>
      <div className="panel flex h-[520px] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {thread.map((m) => (
            <div key={m.id} className={cn('flex', m.from === 'client' ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[75%] rounded-lg px-3.5 py-2.5', m.from === 'client' ? 'rounded-br-sm bg-forest text-primary-foreground' : 'rounded-bl-sm bg-secondary')}>
                <p className="mb-0.5 text-[11px] font-medium opacity-80">{m.author}</p>
                <p className="text-[13px] leading-relaxed">{m.body}</p>
                <p className="mt-1 text-[10.5px] opacity-70">{fmtDateTime(m.at)}</p>
              </div>
            </div>
          ))}
          {!thread.length && <EmptyState title="No messages yet" detail="Send a message to your BALIA consultant." />}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-border p-3">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message your BALIA consultant…" />
          <Button type="submit"><Send className="size-3.5" /></Button>
        </form>
      </div>
    </div>
  );
}
