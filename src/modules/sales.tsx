import React, { useMemo, useState } from 'react';
import { LayoutGrid, List, Users, ArrowRight, Flame, Phone, Mail, Plus, CalendarClock } from 'lucide-react';
import { useApp } from '@/store';
import { matchForOpportunity } from '@/lib/consultant-match';
import { assessGoNoGo, GO_NO_GO_CRITERIA } from '@/lib/go-no-go';
import { LEAD_STATUSES, LEAD_SOURCES, SERVICES, scoreBand, STAGE_PROBABILITY } from '@/data/catalog';
import {
  PageHeader, Section, Badge, Button, StatusBadge, DataTable, Drawer, Toolbar, SearchInput,
  Select, Field, Input, Textarea, Stat, Avatar, EmptyState, Tabs, Progress, Timeline, Modal,
} from '@/components/kit';
import { money, fmtDate, relativeDays, daysFromToday, leadScore, TODAY_ISO, addDays } from '@/lib/derive';
import { cn } from '@/lib/utils';

// ===========================================================================
export function Leads() {
  const { state, dispatch, focusId, setFocusId, setModule, user, userById, toast } = useApp();
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [q, setQ] = useState('');
  const [owner, setOwner] = useState('');
  const [source, setSource] = useState('');
  const [band, setBand] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);

  const scored = state.leads.map((l) => ({ ...l, score: leadScore(l, state.scoreRules) }));
  const rows = scored.filter((l) =>
    (!q || `${l.companyName} ${l.contactName} ${l.country} ${l.serviceInterest}`.toLowerCase().includes(q.toLowerCase())) &&
    (!owner || l.owner === owner) && (!source || l.source === source) &&
    (!band || scoreBand(l.score).label === band)
  );

  const lead = scored.find((l) => l.id === focusId);
  const boardStatuses = ['New', 'Contacted', 'Qualified', 'Consultation Scheduled', 'Proposal Sent', 'Negotiation'];

  const move = (id: string, status: string) => {
    dispatch({ type: 'patch', collection: 'leads', id, changes: { status, lastContact: TODAY_ISO } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Lead status changed', record: id, detail: `→ ${status}` } });
    toast(`Lead moved to ${status}.`);
  };

  return (
    <div className="enter-up">
      <PageHeader
        title="Leads"
        subtitle="Every enquiry, scored against the firm's qualification rules. Hot leads are worked within 24 hours."
        meta={<>
          <Badge tone="danger" dot>{scored.filter((l) => l.score >= 81).length} very hot</Badge>
          <Badge tone="warning" dot>{scored.filter((l) => l.score >= 61 && l.score < 81).length} hot</Badge>
          <Badge tone="muted" dot>{scored.filter((l) => daysFromToday(l.nextFollowUp) < 0 && !['Won', 'Lost'].includes(l.status)).length} follow-ups overdue</Badge>
        </>}
        actions={<>
          <div className="flex rounded-md border border-input p-0.5">
            <button onClick={() => setView('kanban')} className={cn('rounded px-2 py-1 text-[12px] transition-colors', view === 'kanban' ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground')}><LayoutGrid className="mr-1 inline size-3" />Board</button>
            <button onClick={() => setView('table')} className={cn('rounded px-2 py-1 text-[12px] transition-colors', view === 'table' ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground')}><List className="mr-1 inline size-3" />Table</button>
          </div>
        </>}
      />

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search leads…" className="w-full sm:w-64" />
        <Select value={owner} onChange={(e) => setOwner(e.target.value)} className="w-auto"><option value="">All owners</option>
          {['USR-01', 'USR-02', 'USR-03', 'USR-05', 'USR-06'].map((id) => <option key={id} value={id}>{userById(id)?.name}</option>)}</Select>
        <Select value={source} onChange={(e) => setSource(e.target.value)} className="w-auto"><option value="">All sources</option>{LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}</Select>
        <Select value={band} onChange={(e) => setBand(e.target.value)} className="w-auto"><option value="">All scores</option>{['Very Hot', 'Hot', 'Warm', 'Cold'].map((s) => <option key={s}>{s}</option>)}</Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} of {state.leads.length}</span>
        {selected.length > 0 && <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>{selected.length} selected — bulk action</Button>}
      </Toolbar>

      {view === 'kanban' ? (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-3">
          {boardStatuses.map((status) => {
            const list = rows.filter((l) => l.status === status);
            const value = list.reduce((s, l) => s + l.estimatedBudget, 0);
            return (
              <div key={status} className="flex w-[266px] shrink-0 flex-col">
                <div className="mb-2 flex items-baseline justify-between px-0.5">
                  <span className="flex items-center gap-1.5 text-[12.5px] font-semibold">
                    <StatusBadge status={status} />
                  </span>
                  <span className="tnum text-[11.5px] text-muted-foreground">{money(value, 'XAF', true)}</span>
                </div>
                <div className="flex flex-1 flex-col gap-2 rounded-lg bg-secondary/45 p-2">
                  {list.length === 0 && <p className="px-2 py-6 text-center text-[11.5px] text-muted-foreground">No leads</p>}
                  {list.map((l) => {
                    const b = scoreBand(l.score);
                    return (
                      <button key={l.id} onClick={() => setFocusId(l.id)}
                        className="panel lift w-full p-2.5 text-left">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[12.5px] font-medium leading-snug">{l.companyName}</span>
                          <Badge tone={b.tone === 'muted' ? 'muted' : b.tone} className="shrink-0">{l.score}</Badge>
                        </div>
                        <p className="mt-1 truncate text-[11.5px] text-muted-foreground">{l.serviceInterest}</p>
                        <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
                          <span className="flex items-center gap-1.5">
                            <Avatar size="xs" name={userById(l.owner)?.name} />
                            <span className="text-[11px] text-muted-foreground">{l.country}</span>
                          </span>
                          <span className={cn('tnum text-[11px]', daysFromToday(l.nextFollowUp) < 0 ? 'font-medium text-danger' : 'text-muted-foreground')}>
                            {relativeDays(l.nextFollowUp)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Section flush>
          <DataTable
            rows={rows} selectable selected={selected} onSelect={setSelected}
            onRowClick={(l) => setFocusId(l.id)}
            columns={[
              { key: 'co', header: 'Company', cell: (l) => <div><p className="font-medium">{l.companyName}</p><p className="text-[11.5px] text-muted-foreground">{l.contactName}</p></div>, sort: (l) => l.companyName },
              { key: 'score', header: 'Score', align: 'right', sort: (l) => l.score, cell: (l) => { const b = scoreBand(l.score); return <Badge tone={b.tone === 'muted' ? 'muted' : b.tone}>{l.score} · {b.label}</Badge>; } },
              { key: 'svc', header: 'Service', cell: (l) => l.serviceInterest, hideBelow: 'lg' },
              { key: 'country', header: 'Country', cell: (l) => l.country, hideBelow: 'md', sort: (l) => l.country },
              { key: 'src', header: 'Source', cell: (l) => <Badge tone="muted">{l.source}</Badge>, hideBelow: 'lg' },
              { key: 'val', header: 'Value', align: 'right', cell: (l) => money(l.estimatedBudget, 'XAF', true), sort: (l) => l.estimatedBudget },
              { key: 'status', header: 'Status', cell: (l) => <StatusBadge status={l.status} /> },
              { key: 'fu', header: 'Follow-up', cell: (l) => <span className={daysFromToday(l.nextFollowUp) < 0 ? 'font-medium text-danger' : ''}>{relativeDays(l.nextFollowUp)}</span>, sort: (l) => l.nextFollowUp, hideBelow: 'md' },
              { key: 'own', header: 'Owner', cell: (l) => <Avatar size="xs" name={userById(l.owner)?.name} />, align: 'center' },
            ]}
          />
        </Section>
      )}

      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)} title={`Bulk action on ${selected.length} leads`}
        footer={<><Button variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button>
          <Button onClick={() => { dispatch({ type: 'bulkPatch', collection: 'leads', ids: selected, changes: { owner: 'USR-02', status: 'Contacted' } }); toast(`${selected.length} leads reassigned to Aminata Diallo and marked contacted.`); setSelected([]); setBulkOpen(false); }}>Apply</Button></>}>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          This will reassign the selected leads to Aminata Diallo and set their status to Contacted. Bulk changes are written to the audit log with the previous values retained.
        </p>
      </Modal>

      <Drawer open={!!lead} onClose={() => setFocusId(null)} title={lead?.companyName ?? ''}
        subtitle={lead && <span className="flex flex-wrap items-center gap-2"><StatusBadge status={lead.status} /><span>{lead.contactName} · {lead.country}</span></span>}
        footer={lead && <>
          <Button variant="outline" onClick={() => { setModule('consultations'); setFocusId(null); }}><CalendarClock className="size-3.5" />Book consultation</Button>
          <Button variant="outline" onClick={() => move(lead.id, 'Nurture')}>Move to nurture</Button>
          <Button onClick={() => { dispatch({ type: 'convertLead', leadId: lead.id, user: user.id }); toast('Opportunity created, first task scheduled and the lead marked qualified.'); setFocusId(null); setModule('opportunities'); }}>
            Convert to opportunity<ArrowRight className="size-3.5" />
          </Button>
        </>}>
        {lead && <LeadDetail lead={lead} onMove={move} />}
      </Drawer>
    </div>
  );
}

function LeadDetail({ lead, onMove }: { lead: any; onMove: (id: string, s: string) => void }) {
  const { state, dispatch, userById, user } = useApp();
  const band = scoreBand(lead.score);
  const rules = state.scoreRules;

  const toggleFlag = (id: string) => {
    const flags = lead.scoreFlags.includes(id) ? lead.scoreFlags.filter((f: string) => f !== id) : [...lead.scoreFlags, id];
    dispatch({ type: 'patch', collection: 'leads', id: lead.id, changes: { scoreFlags: flags } });
  };

  return (
    <div className="space-y-5">
      <div className="panel-flat bg-secondary/40 p-3.5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Lead score</p>
            <p className="tnum mt-1 font-display text-[30px] font-semibold leading-none">{lead.score}<span className="text-[15px] font-normal text-muted-foreground">/100</span></p>
          </div>
          <div className="text-right">
            <Badge tone={band.tone === 'muted' ? 'muted' : band.tone} dot>{band.label}</Badge>
            {lead.score >= 61 && <p className="mt-1.5 flex items-center gap-1 text-[11.5px] font-medium text-danger"><Flame className="size-3" />Follow up within 24 hours</p>}
          </div>
        </div>
        <div className="mt-3">
          <Progress value={lead.score} tone={band.tone === 'muted' ? 'muted' : band.tone} />
        </div>
        <div className="mt-3 space-y-1 border-t border-border pt-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Qualification signals</p>
          {rules.map((r) => (
            <label key={r.id} className="flex cursor-pointer items-center gap-2 text-[12.5px]">
              <input type="checkbox" checked={lead.scoreFlags.includes(r.id)} onChange={() => toggleFlag(r.id)} className="size-3.5 accent-[hsl(var(--forest))]" />
              <span className={lead.scoreFlags.includes(r.id) ? 'text-foreground' : 'text-muted-foreground'}>{r.label}</span>
              <span className="tnum ml-auto text-[11.5px] text-muted-foreground">+{r.points}</span>
            </label>
          ))}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
        <Stat label="Contact" value={lead.contactName} />
        <Stat label="Owner" value={userById(lead.owner)?.name} />
        <Stat label="Service interest" value={lead.serviceInterest} />
        <Stat label="Target market" value={lead.targetMarket} />
        <Stat label="Current market" value={lead.currentMarket} />
        <Stat label="Export experience" value={lead.exportExperience} />
        <Stat label="Industry" value={lead.industry} />
        <Stat label="Source" value={<Badge tone="muted">{lead.source}</Badge>} />
        <Stat label="Estimated budget" value={money(lead.estimatedBudget, lead.currency)} />
        <Stat label="Priority" value={lead.priority} />
        <Stat label="Created" value={fmtDate(lead.created)} />
        <Stat label="Last contact" value={`${fmtDate(lead.lastContact)} (${relativeDays(lead.lastContact)})`} />
        <Stat label="Next follow-up" value={<span className={daysFromToday(lead.nextFollowUp) < 0 ? 'font-medium text-danger' : ''}>{fmtDate(lead.nextFollowUp)} · {relativeDays(lead.nextFollowUp)}</span>} className="col-span-2" />
        {lead.campaign && <Stat label="Campaign" value={lead.campaign} className="col-span-2" />}
      </dl>

      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Notes</p>
        <p className="text-[13px] leading-relaxed text-foreground">{lead.notes}</p>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Move to</p>
        <div className="flex flex-wrap gap-1.5">
          {LEAD_STATUSES.filter((s) => s !== lead.status).map((s) => (
            <button key={s} onClick={() => onMove(lead.id, s)}
              className="rounded-md border border-border bg-card px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:border-forest/30 hover:bg-forest-soft hover:text-forest">{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

const GNG_TONE: Record<string, 'success' | 'info' | 'gold' | 'danger' | 'muted'> = {
  GO: 'success', 'GO WITH PARTNER': 'info', 'GO — CONSORTIUM': 'info', WATCH: 'gold', 'NO-GO': 'danger',
};

function GoNoGoModal({ open, onClose, opp }: { open: boolean; onClose: () => void; opp: any }) {
  const { dispatch, user, toast } = useApp();
  const [scores, setScores] = React.useState<Record<string, number>>(opp.goNoGo?.scores ?? Object.fromEntries(GO_NO_GO_CRITERIA.map((c) => [c.key, 3])));
  const [partners, setPartners] = React.useState<boolean>(opp.goNoGo?.requiredPartners ?? false);
  const result = assessGoNoGo(scores, { requiredPartners: partners });
  const save = () => {
    dispatch({ type: 'patch', collection: 'opportunities', id: opp.id, changes: { goNoGo: { scores, requiredPartners: partners, recommendation: result.recommendation, rationale: result.rationale, scorePct: result.scorePct, decidedBy: user.id, decidedAt: TODAY_ISO } } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Go/No-Go decision recorded', record: opp.id, detail: `${result.recommendation} (${result.scorePct}%)` } });
    toast(`Go/No-Go recorded: ${result.recommendation}.`, result.recommendation.startsWith('GO') ? 'success' : 'info');
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Go / No-Go assessment" width="max-w-xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Record decision</Button></>}>
      <div className="space-y-3">
        <p className="text-[12.5px] text-muted-foreground">Score each criterion from 0 (poor) to 5 (excellent). The recommendation updates live.</p>
        <div className="grid gap-2">
          {GO_NO_GO_CRITERIA.map((c) => (
            <div key={c.key} className="flex items-center gap-3">
              <span className="w-44 shrink-0 text-[12.5px]">{c.label} <span className="text-[10.5px] text-muted-foreground">·{c.weight}</span></span>
              <input type="range" min={0} max={5} value={scores[c.key]} onChange={(e) => setScores({ ...scores, [c.key]: Number(e.target.value) })} className="flex-1 accent-[var(--forest)]" />
              <span className="tnum w-5 text-right text-[12.5px] font-medium">{scores[c.key]}</span>
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[12.5px]">
          <input type="checkbox" checked={partners} onChange={(e) => setPartners(e.target.checked)} className="accent-[var(--forest)]" />
          This bid requires external partners
        </label>
        <div className="panel-flat bg-secondary/40 p-3">
          <div className="flex items-center gap-2"><Badge tone={GNG_TONE[result.recommendation]}>{result.recommendation}</Badge><span className="tnum text-[12px] text-muted-foreground">{result.scorePct}% fit</span></div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{result.rationale}</p>
        </div>
      </div>
    </Modal>
  );
}

// ===========================================================================
export function Opportunities() {
  const { state, dispatch, focusId, setFocusId, setModule, user, userById, toast, can, users, companyById } = useApp();
  const [stage, setStage] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [gngOpen, setGngOpen] = useState(false);
  const stages = ['Qualification', 'Consultation', 'Proposal', 'Negotiation', 'Won', 'Lost'];
  const rows = state.opportunities.filter((o) => !stage || o.stage === stage);
  const opp = state.opportunities.find((o) => o.id === focusId);
  const open = state.opportunities.filter((o) => !['Won', 'Lost'].includes(o.stage));
  const weighted = open.reduce((s, o) => s + o.value * (o.probability / 100), 0);

  const setStageOf = (id: string, s: string) => {
    dispatch({ type: 'patch', collection: 'opportunities', id, changes: { stage: s, probability: STAGE_PROBABILITY[s] } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Opportunity stage changed', record: id, detail: `→ ${s}` } });
    toast(`Stage set to ${s}; probability updated to ${STAGE_PROBABILITY[s]}%.`);
  };

  return (
    <div className="enter-up">
      <PageHeader title="Opportunities"
        subtitle="Weighted pipeline is opportunity value multiplied by stage probability. It is the number the monthly review works from."
        actions={can('record.edit') ? <Button onClick={() => setAddOpen(true)}><Plus className="size-3.5" />New opportunity</Button> : undefined}
        meta={<>
          <Badge tone="forest" dot>{open.length} open</Badge>
          <Badge tone="muted">Gross {money(open.reduce((s, o) => s + o.value, 0), 'XAF', true)}</Badge>
          <Badge tone="gold">Weighted {money(weighted, 'XAF', true)}</Badge>
        </>} />

      <div className="-mx-1 mb-4 flex gap-3 overflow-x-auto px-1 pb-3">
        {stages.slice(0, 4).map((s, i) => {
          const list = state.opportunities.filter((o) => o.stage === s);
          return (
            <div key={s} className="flex w-[280px] shrink-0 flex-col">
              <div className="mb-2 flex items-baseline justify-between px-0.5">
                <span className="text-[12.5px] font-semibold">{s}</span>
                <span className="tnum text-[11.5px] text-muted-foreground">{list.length} · {money(list.reduce((x, o) => x + o.value, 0), 'XAF', true)}</span>
              </div>
              <div className="mb-2 h-0.5 rounded-full" style={{ background: `hsl(var(--viz-${i + 1}))` }} />
              <div className="flex flex-1 flex-col gap-2 rounded-lg bg-secondary/45 p-2">
                {list.length === 0 && <p className="px-2 py-6 text-center text-[11.5px] text-muted-foreground">Empty stage</p>}
                {list.map((o) => (
                  <button key={o.id} onClick={() => setFocusId(o.id)} className="panel lift w-full p-2.5 text-left">
                    <p className="text-[12.5px] font-medium leading-snug">{o.name}</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{o.companyName}</p>
                    <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                      <span className="tnum text-[12px] font-medium">{money(o.value, o.currency, true)}</span>
                      <span className="flex items-center gap-1.5">
                        <span className="tnum text-[11px] text-muted-foreground">{o.probability}%</span>
                        <Avatar size="xs" name={userById(o.owner)?.name} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Section title="All opportunities" flush actions={
        <Select value={stage} onChange={(e) => setStage(e.target.value)} className="h-7 w-auto py-0 text-[12px]">
          <option value="">All stages</option>{stages.map((s) => <option key={s}>{s}</option>)}
        </Select>}>
        <DataTable rows={rows} onRowClick={(o) => setFocusId(o.id)}
          columns={[
            { key: 'n', header: 'Opportunity', cell: (o) => <div><p className="font-medium">{o.name}</p><p className="text-[11.5px] text-muted-foreground">{o.companyName}</p></div>, sort: (o) => o.name },
            { key: 'stage', header: 'Stage', cell: (o) => <StatusBadge status={o.stage} /> },
            { key: 'v', header: 'Value', align: 'right', cell: (o) => money(o.value, o.currency), sort: (o) => o.value },
            { key: 'p', header: 'Prob.', align: 'right', cell: (o) => `${o.probability}%` },
            { key: 'w', header: 'Weighted', align: 'right', cell: (o) => <span className="font-medium">{money(o.value * (o.probability / 100), o.currency)}</span>, sort: (o) => o.value * o.probability },
            { key: 'c', header: 'Close', cell: (o) => fmtDate(o.expectedClose), sort: (o) => o.expectedClose, hideBelow: 'md' },
            { key: 'o', header: 'Owner', align: 'center', cell: (o) => <Avatar size="xs" name={userById(o.owner)?.name} /> },
          ]} />
      </Section>

      <Drawer open={!!opp} onClose={() => setFocusId(null)} title={opp?.name ?? ''}
        subtitle={opp && <span className="flex items-center gap-2"><StatusBadge status={opp.stage} />{opp.companyName}</span>}
        footer={opp && <>
          {opp.stage !== 'Lost' && <Button variant="outline" onClick={() => setStageOf(opp.id, 'Lost')}>Mark lost</Button>}
          <Button onClick={() => { dispatch({ type: 'opportunityToProposal', opportunityId: opp.id, user: user.id }); toast('Proposal drafted from the service template and the opportunity advanced.'); setFocusId(null); setModule('proposals'); }}>
            Create proposal<ArrowRight className="size-3.5" />
          </Button>
        </>}>
        {opp && (
          <div className="space-y-5">
            <div className="panel-flat grid grid-cols-3 divide-x divide-border bg-secondary/40">
              <div className="px-3 py-2.5"><p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Value</p><p className="tnum mt-0.5 font-display text-[16px] font-semibold">{money(opp.value, opp.currency, true)}</p></div>
              <div className="px-3 py-2.5"><p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Probability</p><p className="tnum mt-0.5 font-display text-[16px] font-semibold">{opp.probability}%</p></div>
              <div className="px-3 py-2.5"><p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Weighted</p><p className="tnum mt-0.5 font-display text-[16px] font-semibold text-forest">{money(opp.value * (opp.probability / 100), opp.currency, true)}</p></div>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
              <Stat label="Service" value={SERVICES.find((s) => s.id === opp.serviceId)?.name} />
              <Stat label="Contact" value={opp.contactName} />
              <Stat label="Owner" value={userById(opp.owner)?.name} />
              <Stat label="Source" value={opp.source} />
              <Stat label="Expected close" value={`${fmtDate(opp.expectedClose)} · ${relativeDays(opp.expectedClose)}`} />
              <Stat label="Competitor" value={opp.competitor} />
              <Stat label="Next action" value={opp.nextAction} className="col-span-2" />
              <Stat label="Notes" value={opp.notes} className="col-span-2" />
            </dl>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Advance to stage</p>
              <div className="flex flex-wrap gap-1.5">
                {['Qualification', 'Consultation', 'Proposal', 'Negotiation', 'Won'].filter((s) => s !== opp.stage).map((s) => (
                  <button key={s} onClick={() => setStageOf(opp.id, s)}
                    className="rounded-md border border-border bg-card px-2 py-1 text-[12px] text-muted-foreground transition-colors hover:border-forest/30 hover:bg-forest-soft hover:text-forest">
                    {s} <span className="tnum text-[11px] opacity-70">{STAGE_PROBABILITY[s]}%</span>
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const matches = matchForOpportunity(opp, state).slice(0, 5);
              if (matches.length === 0) return null;
              return (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Matched consultants · §9</p>
                  <div className="space-y-1.5">
                    {matches.map((mt) => (
                      <div key={mt.userId} className="panel-flat flex items-center gap-3 p-2.5">
                        <div className="flex w-10 shrink-0 items-center justify-center rounded-md bg-forest-soft py-1 text-[13px] font-semibold text-forest tnum">{mt.score}%</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12.5px] font-medium">{userById(mt.userId)?.name ?? mt.name}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{mt.reasons.length ? mt.reasons.slice(0, 3).join(' · ') : mt.available}</p>
                        </div>
                        <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-secondary"><div className={cn('h-full rounded-full', mt.score >= 75 ? 'bg-forest' : mt.score >= 45 ? 'bg-gold' : 'bg-muted-foreground/40')} style={{ width: `${mt.score}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Go / No-Go · §6</p>
                {can('record.edit') && <button onClick={() => setGngOpen(true)} className="text-[11.5px] text-forest hover:underline">{opp.goNoGo ? 'Re-assess' : 'Run assessment'}</button>}
              </div>
              {opp.goNoGo ? (
                <div className="panel-flat p-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={GNG_TONE[opp.goNoGo.recommendation] ?? 'muted'}>{opp.goNoGo.recommendation}</Badge>
                    <span className="tnum text-[12px] text-muted-foreground">{opp.goNoGo.scorePct}% fit</span>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{opp.goNoGo.rationale}</p>
                  <p className="mt-1 text-[10.5px] text-muted-foreground">Decided by {userById(opp.goNoGo.decidedBy)?.name ?? opp.goNoGo.decidedBy} · {fmtDate(opp.goNoGo.decidedAt)}</p>
                </div>
              ) : <p className="text-[12px] text-muted-foreground">No Go/No-Go decision recorded yet.</p>}
            </div>
          </div>
        )}
      </Drawer>
      <NewOpportunityModal open={addOpen} onClose={() => setAddOpen(false)} />
      {opp && <GoNoGoModal open={gngOpen} onClose={() => setGngOpen(false)} opp={opp} />}
    </div>
  );
}

function NewOpportunityModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, user, users, setModule, toast, companyById } = useApp();
  const firstCompany = state.companies[0]?.id ?? '';
  const blank = {
    name: '', companyId: firstCompany, contactName: '', serviceId: SERVICES[0].id,
    value: '8000000', currency: 'XAF', stage: 'Qualification', expectedClose: addDays(TODAY_ISO, 45),
    owner: user.id, source: 'Referral', competitor: '—', nextAction: '', notes: '',
  };
  const [form, setForm] = useState(blank);

  const create = () => {
    if (!form.name.trim() || !form.companyId) return;
    const company = companyById(form.companyId);
    const id = `OPP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const opp = {
      id, name: form.name, companyId: form.companyId, companyName: company?.tradingName ?? '',
      contactName: form.contactName || '—', serviceId: form.serviceId,
      value: Number(form.value) || 0, currency: form.currency,
      probability: STAGE_PROBABILITY[form.stage] ?? 20, stage: form.stage,
      expectedClose: form.expectedClose, owner: form.owner, source: form.source,
      competitor: form.competitor, nextAction: form.nextAction, notes: form.notes, created: TODAY_ISO,
    };
    dispatch({ type: 'add', collection: 'opportunities', record: opp });
    dispatch({ type: 'notify', note: { category: 'Sales', title: 'New opportunity', detail: `${form.name} — ${company?.tradingName ?? ''}`, tone: 'success', link: { module: 'opportunities', recordId: id } } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Opportunity created', record: id, detail: form.name } });
    toast('Opportunity added to the pipeline.', 'success');
    setForm(blank);
    setModule('opportunities', id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New opportunity" width="max-w-xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Create opportunity</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Opportunity name" className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. EUDR due diligence programme" /></Field>
        <Field label="Company"><Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>{state.companies.map((c) => <option key={c.id} value={c.id}>{c.tradingName}</option>)}</Select></Field>
        <Field label="Contact"><Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Decision-maker" /></Field>
        <Field label="Service"><Select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>{SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
        <Field label="Stage"><Select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>{['Qualification', 'Consultation', 'Proposal', 'Negotiation'].map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Value"><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></Field>
        <Field label="Currency"><Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{['XAF', 'USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Expected close"><Input type="date" value={form.expectedClose} onChange={(e) => setForm({ ...form, expectedClose: e.target.value })} /></Field>
        <Field label="Owner"><Select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}>{users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></Field>
        <Field label="Source"><Select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>{LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Competitor"><Input value={form.competitor} onChange={(e) => setForm({ ...form, competitor: e.target.value })} /></Field>
        <Field label="Next action" className="sm:col-span-2"><Input value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} /></Field>
        <Field label="Notes" className="sm:col-span-2"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

// ===========================================================================
export function Consultations() {
  const { state, dispatch, focusId, setFocusId, setModule, user, userById, toast, can } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const cns = state.consultations.find((c) => c.id === focusId);
  const upcoming = state.consultations.filter((c) => c.status === 'Scheduled');
  const done = state.consultations.filter((c) => c.status === 'Completed');

  return (
    <div className="enter-up">
      <PageHeader title="Consultations"
        subtitle="The structured discovery conversation. Everything captured here carries forward into the opportunity, proposal and project."
        meta={<><Badge tone="info" dot>{upcoming.length} scheduled</Badge><Badge tone="success" dot>{done.length} completed</Badge></>}
        actions={<div className="flex items-center gap-2">
          {can('record.edit') && <Button onClick={() => setAddOpen(true)}><Plus className="size-3.5" />New consultation</Button>}
          <Button variant="outline" onClick={() => setModule('calendar')}><CalendarClock className="size-3.5" />Schedule</Button>
        </div>} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Scheduled" flush>
          <ul className="divide-y divide-border/70">
            {upcoming.map((c) => (
              <li key={c.id}>
                <button onClick={() => setFocusId(c.id)} className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60">
                  <span className="flex w-12 shrink-0 flex-col items-center rounded border border-border bg-secondary/60 py-1">
                    <span className="text-[9.5px] uppercase tracking-wide text-muted-foreground">{fmtDate(c.date, 'day').split(' ')[0]}</span>
                    <span className="tnum font-display text-[16px] font-semibold leading-none">{new Date(`${c.date}T00:00`).getDate()}</span>
                    <span className="mt-0.5 text-[9.5px] text-muted-foreground">{c.time}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium">{c.companyName}</span>
                    <span className="mt-0.5 block text-[12px] text-muted-foreground">{c.type} · {c.meetingType}</span>
                    <span className="mt-1 block truncate text-[11.5px] text-muted-foreground">{c.challenge}</span>
                  </span>
                  <Avatar size="xs" name={userById(c.consultant)?.name} />
                </button>
              </li>
            ))}
            {upcoming.length === 0 && <li><EmptyState title="No consultations scheduled" /></li>}
          </ul>
        </Section>

        <Section title="Completed" flush>
          <ul className="divide-y divide-border/70">
            {done.map((c) => (
              <li key={c.id}>
                <button onClick={() => setFocusId(c.id)} className="w-full px-4 py-3 text-left transition-colors hover:bg-secondary/60">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-medium">{c.companyName}</span>
                    <span className="tnum text-[11.5px] text-muted-foreground">{fmtDate(c.date)}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{c.type}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge tone="forest">{SERVICES.find((s) => s.id === c.recommendedService)?.name}</Badge>
                    <span className="tnum text-[11.5px] text-muted-foreground">{money(c.estimatedValue, c.currency, true)}</span>
                    {c.opportunityId && <Badge tone="success" dot>Converted</Badge>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Drawer open={!!cns} onClose={() => setFocusId(null)} title={cns?.companyName ?? ''} width="max-w-3xl"
        subtitle={cns && <span className="flex flex-wrap items-center gap-2"><StatusBadge status={cns.status} />{cns.type} · {fmtDate(cns.date)} at {cns.time} · {userById(cns.consultant)?.name}</span>}
        footer={cns && <>
          <Button variant="outline" onClick={() => { dispatch({ type: 'add', collection: 'tasks', record: { id: `TSK-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, name: `Follow up — ${cns.companyName}`, description: cns.followUp || 'Post-consultation follow-up.', companyId: cns.companyId, assignee: cns.consultant, priority: 'High', due: addDays(TODAY_ISO, 3), status: 'To Do', estimatedHours: 1, actualHours: 0, checklist: [], comments: [] } }); toast('Follow-up task created.'); }}>Create follow-up</Button>
          {!cns.opportunityId && <Button onClick={() => { dispatch({ type: 'consultationToOpportunity', consultationId: cns.id, user: user.id }); toast('Consultation closed and converted into an opportunity.'); setFocusId(null); setModule('opportunities'); }}>Convert to opportunity<ArrowRight className="size-3.5" /></Button>}
          {cns.opportunityId && <Button onClick={() => { setModule('opportunities', cns.opportunityId); setFocusId(null); }}>Open opportunity</Button>}
        </>}>
        {cns && (
          <div className="space-y-5">
            <div className="panel-flat bg-secondary/40 p-3.5">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Business challenge</p>
              <p className="text-[13px] leading-relaxed">{cns.challenge}</p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
              <Stat label="Contact" value={cns.contactName} />
              <Stat label="Meeting" value={`${cns.meetingType} · ${cns.location}`} />
              <Stat label="Products" value={cns.products} />
              <Stat label="Export experience" value={cns.exportExperience} />
              <Stat label="Current markets" value={cns.currentMarkets} />
              <Stat label="Target markets" value={cns.targetMarkets} />
              <Stat label="Compliance issues" value={cns.complianceIssues} className="col-span-2" />
              <Stat label="Objectives" value={cns.objectives} className="col-span-2" />
              <Stat label="Recommended service" value={SERVICES.find((s) => s.id === cns.recommendedService)?.name} />
              <Stat label="Estimated value" value={money(cns.estimatedValue, cns.currency)} />
            </dl>
            {cns.notes && <div><p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Consultant notes</p><p className="prose-editorial">{cns.notes}</p></div>}
            {cns.recommendations && <div><p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Recommendations</p><p className="prose-editorial">{cns.recommendations}</p></div>}
            {cns.followUp && <div className="panel-flat border-l-forest/40 bg-forest-soft/40 p-3"><p className="text-[12.5px] leading-relaxed text-forest">{cns.followUp}</p></div>}
          </div>
        )}
      </Drawer>
      <NewConsultationModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function NewConsultationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, user, users, setModule, toast, companyById } = useApp();
  const firstCompany = state.companies[0]?.id ?? '';
  const blank = {
    companyId: firstCompany, contactName: '', date: TODAY_ISO, time: '10:00', consultant: user.id,
    type: 'Compliance consultation', meetingType: 'Video call', location: '',
    challenge: '', objectives: '', recommendedService: '', estimatedValue: '', currency: 'XAF',
    status: 'Scheduled',
  };
  const [form, setForm] = useState(blank);

  const create = () => {
    if (!form.companyId) return;
    const company = companyById(form.companyId);
    const id = `CNS-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const consultation = {
      id, companyId: form.companyId, companyName: company?.tradingName ?? '', contactName: form.contactName || '—',
      date: form.date, time: form.time, consultant: form.consultant, type: form.type,
      meetingType: form.meetingType, location: form.location,
      challenge: form.challenge, products: '', currentMarkets: '', targetMarkets: '',
      exportExperience: '', complianceIssues: '', objectives: form.objectives, notes: '',
      recommendations: '', followUp: '', recommendedService: form.recommendedService || undefined,
      estimatedValue: Number(form.estimatedValue) || 0, currency: form.currency, status: form.status,
    };
    dispatch({ type: 'add', collection: 'consultations', record: consultation });
    dispatch({ type: 'notify', note: { category: 'Sales', title: 'New consultation', detail: `${company?.tradingName ?? ''} — ${form.type}`, tone: 'info', link: { module: 'consultations', recordId: id } } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Consultation created', record: id, detail: `${company?.tradingName ?? ''} — ${form.date}` } });
    toast('Consultation created. Capture the discovery detail on the record.', 'success');
    setForm(blank);
    setModule('consultations', id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New consultation" width="max-w-xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Create consultation</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Company"><Select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>{state.companies.map((c) => <option key={c.id} value={c.id}>{c.tradingName}</option>)}</Select></Field>
        <Field label="Contact"><Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Who is attending?" /></Field>
        <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="Time"><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
        <Field label="Consultant"><Select value={form.consultant} onChange={(e) => setForm({ ...form, consultant: e.target.value })}>{users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></Field>
        <Field label="Type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{['Compliance consultation', 'Market-entry consultation', 'AfCFTA consultation', 'Export readiness consultation', 'General consultation'].map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="Meeting type"><Select value={form.meetingType} onChange={(e) => setForm({ ...form, meetingType: e.target.value })}>{['Video call', 'Phone call', 'In person'].map((m) => <option key={m}>{m}</option>)}</Select></Field>
        <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Meet link or address" /></Field>
        <Field label="Service of interest"><Select value={form.recommendedService} onChange={(e) => setForm({ ...form, recommendedService: e.target.value })}><option value="">— Undecided —</option>{SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
        <Field label="Estimated value"><Input type="number" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} /></Field>
        <Field label="Challenge" className="sm:col-span-2"><Textarea rows={2} value={form.challenge} onChange={(e) => setForm({ ...form, challenge: e.target.value })} placeholder="What is the client trying to solve?" /></Field>
        <Field label="Objectives" className="sm:col-span-2"><Textarea rows={2} value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}
