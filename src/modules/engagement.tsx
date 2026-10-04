import React, { useMemo, useState } from 'react';
import { Mail, Phone, CalendarDays, StickyNote, MessageSquare, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/store';
import {
  PageHeader, Section, Badge, Button, Toolbar, SearchInput, Select, Avatar, EmptyState, Timeline, Stat, Drawer, Input,
} from '@/components/kit';
import { EMAIL_TEMPLATES } from '@/data/catalog';
import { fmtDate, fmtDateTime, daysFromToday, relativeDays, TODAY_ISO } from '@/lib/derive';
import { cn } from '@/lib/utils';

const TYPE_ICON: Record<string, any> = { Email: Mail, Call: Phone, Meeting: CalendarDays, Note: StickyNote };
const TYPE_TONE: Record<string, any> = { Email: 'info', Call: 'gold', Meeting: 'forest', Note: 'muted' };

// ===========================================================================
export function Communications() {
  const { state, companyById, userById, setModule } = useApp();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [company, setCompany] = useState('');
  const [tab, setTab] = useState<'timeline' | 'messages' | 'templates'>('timeline');

  const rows = state.communications
    .filter((c) => (!type || c.type === type) && (!company || c.companyId === company) &&
      (!q || `${c.subject} ${c.summary} ${companyById(c.companyId)?.tradingName ?? ''}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (a.at < b.at ? 1 : -1));

  return (
    <div className="enter-up">
      <PageHeader title="Communications"
        subtitle="A unified activity stream across every client — emails, calls, meetings, notes and portal messages, all on one timeline."
        meta={<><Badge tone="muted">{state.communications.length} logged interactions</Badge><Badge tone="info" dot>{state.messages.filter((m) => m.from === 'client' && !m.read).length} unread client messages</Badge></>} />

      <div className="mb-4 flex gap-1 border-b border-border">
        {([['timeline', 'Activity timeline'], ['messages', 'Portal messages'], ['templates', 'Email templates']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={cn('relative px-3 py-2 text-[13px] font-medium', tab === id ? 'text-forest' : 'text-muted-foreground hover:text-foreground')}>
            {label}{tab === id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-forest" />}
          </button>
        ))}
      </div>

      {tab === 'timeline' && (
        <>
          <Toolbar>
            <SearchInput value={q} onChange={setQ} placeholder="Search activity…" className="w-full sm:w-64" />
            <Select value={type} onChange={(e) => setType(e.target.value)} className="w-auto"><option value="">All types</option>{['Email', 'Call', 'Meeting', 'Note'].map((t) => <option key={t}>{t}</option>)}</Select>
            <Select value={company} onChange={(e) => setCompany(e.target.value)} className="w-auto"><option value="">All clients</option>{state.companies.map((c) => <option key={c.id} value={c.id}>{c.tradingName}</option>)}</Select>
          </Toolbar>
          <Section>
            {rows.length === 0 ? <EmptyState title="No activity matches" /> : (
              <ol className="space-y-0">
                {rows.map((c, i) => {
                  const Icon = TYPE_ICON[c.type] ?? StickyNote;
                  return (
                    <li key={c.id} className="relative flex gap-3 pb-4 last:pb-0">
                      <div className="relative flex flex-col items-center">
                        <span className={cn('mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border',
                          c.type === 'Email' ? 'bg-info-soft text-info border-info/15' : c.type === 'Call' ? 'bg-gold-soft text-gold border-gold/20' : c.type === 'Meeting' ? 'bg-forest-soft text-forest border-forest/15' : 'bg-muted text-muted-foreground border-border')}>
                          <Icon className="size-3.5" strokeWidth={1.9} />
                        </span>
                        {i < rows.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
                      </div>
                      <div className="min-w-0 flex-1 pb-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                          <button onClick={() => setModule('companies', c.companyId)} className="text-[13px] font-medium text-foreground hover:text-forest">
                            {c.subject}
                          </button>
                          <span className="shrink-0 text-[11.5px] tabular-nums text-muted-foreground">{fmtDateTime(c.at)}</span>
                        </div>
                        <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{c.summary}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <Badge tone="muted">{companyById(c.companyId)?.tradingName}</Badge>
                          <Badge tone={c.direction === 'in' ? 'info' : 'muted'}>{c.direction === 'in' ? 'Inbound' : 'Outbound'}</Badge>
                          <span className="flex items-center gap-1 text-[11.5px] text-muted-foreground"><Avatar size="xs" name={userById(c.user)?.name} />{userById(c.user)?.name}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Section>
        </>
      )}

      {tab === 'messages' && <MessageThreads />}

      {tab === 'templates' && (
        <div className="grid gap-3 md:grid-cols-2">
          {EMAIL_TEMPLATES.map((t) => (
            <div key={t.id} className="panel p-4">
              <p className="text-[13px] font-medium">{t.name}</p>
              <p className="mt-1 text-[12px] font-medium text-muted-foreground">Subject: {t.subject}</p>
              <p className="mt-2 whitespace-pre-line border-t border-border pt-2 text-[12px] leading-relaxed text-muted-foreground">{t.body.slice(0, 180)}…</p>
              <div className="mt-2.5 flex flex-wrap gap-1">
                {Array.from(t.body.matchAll(/\{\{(\w+)\}\}/g)).map((m, i) => <Badge key={i} tone="muted">{`{{${m[1]}}}`}</Badge>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageThreads() {
  const { state, dispatch, user, companyById } = useApp();
  const companiesWithMessages = Array.from(new Set(state.messages.map((m) => m.companyId)));
  const [sel, setSel] = useState(companiesWithMessages[0] ?? 'CMP-01');
  const [draft, setDraft] = useState('');
  const thread = state.messages.filter((m) => m.companyId === sel).sort((a, b) => (a.at < b.at ? -1 : 1));

  const send = () => {
    if (!draft.trim()) return;
    dispatch({ type: 'sendMessage', message: { companyId: sel, from: 'balia', author: user.name, at: new Date().toISOString(), body: draft, read: true } });
    setDraft('');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Section title="Conversations" flush className="lg:col-span-1">
        <ul className="divide-y divide-border/70">
          {companiesWithMessages.map((cid) => {
            const last = state.messages.filter((m) => m.companyId === cid).sort((a, b) => (a.at < b.at ? 1 : -1))[0];
            const unread = state.messages.some((m) => m.companyId === cid && m.from === 'client' && !m.read);
            return (
              <li key={cid}>
                <button onClick={() => setSel(cid)} className={cn('w-full px-4 py-3 text-left transition-colors hover:bg-secondary/60', sel === cid && 'bg-accent/60')}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium">{companyById(cid)?.tradingName}</span>
                    {unread && <span className="size-1.5 rounded-full bg-info" />}
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{last?.body}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title={companyById(sel)?.tradingName} description="Secure client-consultant messaging" flush className="lg:col-span-2">
        <div className="flex h-[420px] flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {thread.map((m) => (
              <div key={m.id} className={cn('flex', m.from === 'balia' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[78%] rounded-lg px-3 py-2', m.from === 'balia' ? 'rounded-br-sm bg-forest text-primary-foreground' : 'rounded-bl-sm bg-secondary text-foreground')}>
                  <p className="mb-0.5 text-[11px] font-medium opacity-80">{m.author}</p>
                  <p className="text-[13px] leading-relaxed">{m.body}</p>
                  <p className="mt-1 text-[10.5px] opacity-70">{fmtDateTime(m.at)}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2 border-t border-border p-3">
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Reply to the client…" />
            <Button type="submit"><Send className="size-3.5" /></Button>
          </form>
        </div>
      </Section>
    </div>
  );
}

// ===========================================================================
const EVENT_TONE: Record<string, string> = {
  Consultation: 'gold', 'Client meeting': 'forest', 'Internal meeting': 'info',
  Training: 'success', 'Project deadline': 'danger',
};

export function Calendar() {
  const { state, userById, companyById, setModule } = useApp();
  const [month, setMonth] = useState(8); // September (0-indexed)
  const [sel, setSel] = useState<string | null>(null);
  const event = state.events.find((e) => e.id === sel);

  const year = 2026;
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsOn = (day: number) => state.events.filter((e) => {
    const d = new Date(`${e.date}T00:00`);
    return d.getMonth() === month && d.getDate() === day;
  });
  const monthName = first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const upcoming = state.events.filter((e) => daysFromToday(e.date) >= 0).sort((a, b) => (a.date < b.date ? -1 : 1)).slice(0, 6);

  return (
    <div className="enter-up">
      <PageHeader title="Calendar"
        subtitle="Consultations, client meetings, deadlines, training and internal reviews in one view."
        actions={<Button onClick={() => setModule('consultations')}>Schedule consultation</Button>} />

      <div className="grid gap-4 lg:grid-cols-4">
        <Section className="lg:col-span-3" flush
          title={monthName}
          actions={<div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setMonth((m) => Math.max(0, m - 1))}><ChevronLeft className="size-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setMonth(8)}>Today</Button>
            <Button variant="ghost" size="icon" onClick={() => setMonth((m) => Math.min(11, m + 1))}><ChevronRight className="size-4" /></Button>
          </div>}>
          <div className="grid grid-cols-7 border-b border-border">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const isToday = month === 8 && day === 8;
              const evs = day ? eventsOn(day) : [];
              return (
                <div key={i} className={cn('min-h-[92px] border-b border-r border-border/70 p-1.5 [&:nth-child(7n)]:border-r-0', !day && 'bg-secondary/30')}>
                  {day && (
                    <>
                      <span className={cn('tnum mb-1 flex size-5 items-center justify-center rounded-full text-[11.5px]', isToday ? 'bg-forest font-semibold text-primary-foreground' : 'text-muted-foreground')}>{day}</span>
                      <div className="space-y-1">
                        {evs.slice(0, 3).map((e) => (
                          <button key={e.id} onClick={() => setSel(e.id)}
                            className={cn('block w-full truncate rounded px-1 py-0.5 text-left text-[10.5px] font-medium transition-opacity hover:opacity-80',
                              e.type === 'Project deadline' ? 'bg-danger-soft text-danger' : e.type === 'Consultation' ? 'bg-gold-soft text-gold' : e.type === 'Training' ? 'bg-success-soft text-success' : e.type === 'Internal meeting' ? 'bg-info-soft text-info' : 'bg-forest-soft text-forest')}>
                            {e.time !== '—' && <span className="tnum mr-1 opacity-70">{e.time}</span>}{e.title}
                          </button>
                        ))}
                        {evs.length > 3 && <p className="px-1 text-[10px] text-muted-foreground">+{evs.length - 3} more</p>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Upcoming" flush className="lg:col-span-1">
          <ul className="divide-y divide-border/70">
            {upcoming.map((e) => (
              <li key={e.id}>
                <button onClick={() => setSel(e.id)} className="w-full px-4 py-3 text-left transition-colors hover:bg-secondary/60">
                  <div className="flex items-center gap-2">
                    <span className={cn('size-1.5 rounded-full', e.type === 'Project deadline' ? 'bg-danger' : e.type === 'Consultation' ? 'bg-gold' : e.type === 'Training' ? 'bg-success' : 'bg-forest')} />
                    <span className="text-[12.5px] font-medium">{e.title}</span>
                  </div>
                  <p className="mt-0.5 pl-3.5 text-[11.5px] text-muted-foreground">{fmtDate(e.date, 'day')} · {e.time}</p>
                </button>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Drawer open={!!event} onClose={() => setSel(null)} title={event?.title ?? ''}
        subtitle={event && <span className="flex items-center gap-2"><Badge tone={(EVENT_TONE[event.type] ?? 'muted') as any} dot>{event.type}</Badge>{fmtDate(event.date, 'long')} · {event.time}</span>}>
        {event && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
              <Stat label="Date & time" value={`${fmtDate(event.date, 'long')} at ${event.time}`} />
              <Stat label="Duration" value={event.duration} />
              <Stat label="Location" value={event.location} className="col-span-2" />
              <Stat label="Client" value={companyById(event.companyId)?.tradingName} />
              <Stat label="Participants" value={event.participants.map((p) => userById(p)?.name).join(', ')} />
            </dl>
            {event.agenda && <div><p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Agenda</p><p className="prose-editorial">{event.agenda}</p></div>}
            {event.notes && <div className="panel-flat bg-secondary/40 p-3"><p className="text-[12.5px] leading-relaxed text-muted-foreground">{event.notes}</p></div>}
          </div>
        )}
      </Drawer>
    </div>
  );
}
