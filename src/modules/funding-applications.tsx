import React, { useState } from 'react';
import {
  FileText, CheckCircle2, Circle, AlertTriangle, Lock, Send, FileCheck2,
  Paperclip, ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/store';
import {
  PageHeader, Section, Badge, Button, StatusBadge, DataTable, Drawer, Toolbar,
  SearchInput, Select, Stat, Avatar, EmptyState, Tabs, Progress,
} from '@/components/kit';
import { money, fmtDate, relativeDays, TODAY_ISO } from '@/lib/derive';
import { appCompletion, deadlineInfo } from '@/lib/funding';
import {
  APPLICATION_REQUIREMENTS, APPLICATION_STATUSES,
} from '@/data/funding';
import type { FundingRequirementState, FundingDocStatus } from '@/data/funding';
import { DeadlinePill } from '@/modules/funding';
import { cn } from '@/lib/utils';

const REQ_BY_KEY = new Map(APPLICATION_REQUIREMENTS.map((r) => [r.key, r]));

// Advance a document through its status lifecycle.
const DOC_NEXT: Record<FundingDocStatus, FundingDocStatus | null> = {
  Missing: 'Requested', Requested: 'Received', Received: 'Under Review',
  'Under Review': 'Approved', Approved: null, Rejected: 'Needs Update', 'Needs Update': 'Received',
};

// ===========================================================================
// Application detail drawer
// ===========================================================================

export function ApplicationRecord({ applicationId, onClose }: { applicationId: string; onClose: () => void }) {
  const { state, dispatch, user, userById, toast } = useApp();
  const [tab, setTab] = useState('completion');
  const a = state.fundingApplications.find((x) => x.id === applicationId);
  if (!a) return null;

  const opp = state.fundingOpportunities.find((o) => o.id === a.opportunityId);
  const funder = state.funders.find((f) => f.id === a.funderId);
  const docs = state.fundingAppDocuments.filter((d) => d.applicationId === a.id);
  const c = appCompletion(a);
  const dl = deadlineInfo(a.deadline);
  const submitted = !!a.submissionDate;

  const toggleRequirement = (key: string) => {
    if (submitted) return;
    const next: FundingRequirementState[] = a.requirements.map((r) =>
      r.key === key ? { ...r, done: !r.done, at: !r.done ? TODAY_ISO : undefined } : r);
    dispatch({ type: 'patch', collection: 'fundingApplications', id: a.id, changes: { requirements: next, updated: TODAY_ISO } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Application checklist updated', record: a.id, detail: `${REQ_BY_KEY.get(key)?.label}: ${a.requirements.find((r) => r.key === key)?.done ? 'unchecked' : 'checked'}` } });
  };

  const advanceDoc = (docId: string) => {
    const doc = docs.find((d) => d.id === docId);
    if (!doc) return;
    const nxt = DOC_NEXT[doc.status];
    if (!nxt) return;
    dispatch({ type: 'patch', collection: 'fundingAppDocuments', id: docId, changes: { status: nxt } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Application document status changed', record: docId, detail: `${doc.name}: ${doc.status} → ${nxt}` } });
    toast(`${doc.name}: ${nxt}.`);
  };

  const submit = () => {
    if (!c.canSubmit || submitted) return;
    dispatch({ type: 'patch', collection: 'fundingApplications', id: a.id, changes: { status: 'Submitted', submissionDate: TODAY_ISO, updated: TODAY_ISO } });
    if (opp) dispatch({ type: 'patch', collection: 'fundingOpportunities', id: opp.id, changes: { stage: 'Application Submitted', status: 'Submitted' } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Funding application submitted', record: a.id, detail: a.projectTitle } });
    toast('Application submitted. Opportunity moved to Submitted.', 'success');
  };

  const tabs = [
    { id: 'completion', label: 'Completion' },
    { id: 'documents', label: 'Documents', count: docs.length },
    { id: 'details', label: 'Details' },
  ];

  return (
    <Drawer open onClose={onClose} width="max-w-4xl" title={a.projectTitle}
      subtitle={<span className="flex flex-wrap items-center gap-2">
        <StatusBadge status={a.status} />
        <span>{funder?.name} · {opp?.programName}</span>
      </span>}
      footer={<>
        <span className="mr-auto flex items-center gap-2 text-[12px] text-muted-foreground">
          {submitted
            ? <><FileCheck2 className="size-3.5 text-forest" />Submitted {fmtDate(a.submissionDate)}</>
            : c.canSubmit
              ? <><ShieldCheck className="size-3.5 text-forest" />All mandatory items complete — ready to submit</>
              : <><Lock className="size-3.5 text-warning" />{c.outstandingMandatory.length} mandatory item{c.outstandingMandatory.length === 1 ? '' : 's'} outstanding</>}
        </span>
        <Button disabled={!c.canSubmit || submitted} onClick={submit}>
          <Send className="size-3.5" />{submitted ? 'Submitted' : 'Submit application'}
        </Button>
      </>}>
      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-4" />

      {tab === 'completion' && (
        <div className="space-y-4">
          {(dl.urgency === 'Critical' || dl.urgency === 'Overdue') && !submitted && (
            <div className="panel-flat flex items-center gap-2 bg-danger-soft/60 p-3 text-danger">
              <AlertTriangle className="size-4 shrink-0" />
              <p className="text-[12.5px] font-medium">Deadline {dl.label} — {fmtDate(a.deadline)}.</p>
            </div>
          )}

          <div className="panel-flat p-4">
            <div className="mb-2 flex items-end justify-between">
              <div>
                <p className="font-display text-[26px] font-semibold leading-none">{c.percent}%</p>
                <p className="mt-1 text-[12px] text-muted-foreground">{c.doneCount} of {c.totalCount} items complete</p>
              </div>
              <div className="text-right">
                <Badge tone={c.mandatoryComplete ? 'success' : 'warning'} dot>{c.mandatoryDone}/{c.mandatoryTotal} mandatory</Badge>
                {c.blockedAt100 && <p className="mt-1 text-[11px] text-warning">Held below 100% until mandatory items are done</p>}
              </div>
            </div>
            <Progress value={c.percent} tone={c.mandatoryComplete ? 'forest' : 'gold'} />
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Preparation checklist</p>
            <ul className="space-y-0.5">
              {a.requirements.map((r) => {
                const def = REQ_BY_KEY.get(r.key);
                return (
                  <li key={r.key}>
                    <button
                      onClick={() => toggleRequirement(r.key)}
                      disabled={submitted}
                      className={cn('flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors',
                        submitted ? 'cursor-default' : 'hover:bg-secondary')}>
                      {r.done
                        ? <CheckCircle2 className="size-4 shrink-0 text-forest" />
                        : <Circle className="size-4 shrink-0 text-muted-foreground" />}
                      <span className={cn('flex-1', r.done && 'text-muted-foreground line-through')}>{def?.label ?? r.key}</span>
                      {def?.mandatory && <Badge tone={r.done ? 'muted' : 'warning'}>Mandatory</Badge>}
                      {r.done && r.at && <span className="tnum text-[11px] text-muted-foreground">{fmtDate(r.at)}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {!c.mandatoryComplete && (
            <div className="panel-flat bg-warning-soft/50 p-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.055em] text-warning">Outstanding mandatory items</p>
              <p className="text-[12.5px] text-warning">{c.outstandingMandatory.map((m) => m.label).join(' · ')}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'documents' && (
        <div className="space-y-2">
          {docs.map((d) => {
            const nxt = DOC_NEXT[d.status];
            return (
              <div key={d.id} className="panel-flat flex items-center gap-3 p-3">
                <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium">{d.name}</p>
                    {d.required ? <Badge tone="warning">Required</Badge> : <Badge tone="muted">Optional</Badge>}
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">Owner: {userById(d.responsible)?.name ?? d.responsible}{d.notes ? ` · ${d.notes}` : ''}</p>
                </div>
                <StatusBadge status={d.status} />
                {nxt && <Button size="sm" variant="outline" onClick={() => advanceDoc(d.id)}>Mark {nxt}</Button>}
              </div>
            );
          })}
          {!docs.length && <EmptyState title="No documents yet" detail="Documents required for this application will appear here." />}
        </div>
      )}

      {tab === 'details' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { l: 'Requested', v: money(a.fundingRequested, a.currency, true) },
              { l: 'Awarded', v: a.fundingAwarded ? money(a.fundingAwarded, a.currency, true) : '—', tone: a.fundingAwarded ? 'text-success' : '' },
              { l: 'Budget', v: money(a.budget, a.currency, true) },
              { l: 'Co-financing', v: money(a.coFinancing, a.currency, true) },
            ].map((m) => (
              <div key={m.l} className="panel-flat bg-secondary/40 px-3 py-2.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{m.l}</p>
                <p className={cn('tnum mt-1 font-display text-[16px] font-semibold', m.tone)}>{m.v}</p>
              </div>
            ))}
          </div>
          <div className="panel-flat bg-secondary/30 p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Project summary</p>
            <p className="text-[12.5px] leading-relaxed">{a.projectSummary}</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
            <Stat label="Objectives" value={a.objectives} className="col-span-2" />
            <Stat label="Expected outcomes" value={a.expectedOutcomes} className="col-span-2" />
            <Stat label="Beneficiaries" value={a.beneficiaries} />
            <Stat label="Geographic scope" value={a.geographicScope} />
            <Stat label="Owner" value={userById(a.owner)?.name} />
            <Stat label="Team" value={a.team.map((t) => userById(t)?.name).filter(Boolean).join(', ')} />
            <Stat label="Deadline" value={`${fmtDate(a.deadline)} (${relativeDays(a.deadline)})`} />
            <Stat label="Started" value={fmtDate(a.startDate)} />
            <Stat label="Reporting requirements" value={a.reportingRequirements} className="col-span-2" />
            {a.notes && <Stat label="Notes" value={a.notes} className="col-span-2" />}
          </dl>
        </div>
      )}
    </Drawer>
  );
}

// ===========================================================================
// Applications list
// ===========================================================================

export function FundingApplications() {
  const { state, userById, focusId, setFocusId } = useApp();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  const rows = state.fundingApplications
    .filter((a) => (!q || `${a.projectTitle} ${state.funders.find((f) => f.id === a.funderId)?.name ?? ''}`.toLowerCase().includes(q.toLowerCase())))
    .filter((a) => (!status || a.status === status));

  const inProgress = state.fundingApplications.filter((a) => !a.submissionDate).length;
  const submitted = state.fundingApplications.filter((a) => a.submissionDate).length;
  const totalRequested = state.fundingApplications.reduce((s, a) => s + a.fundingRequested, 0);

  return (
    <div className="enter-up">
      <PageHeader
        title="Funding applications"
        subtitle="Every live application, its completion status and required documents. Applications cannot be submitted until all mandatory items are complete."
        meta={<>
          <Badge tone="gold" dot>{inProgress} in progress</Badge>
          <Badge tone="info" dot>{submitted} submitted</Badge>
          <Badge tone="forest" dot>{money(totalRequested, 'XAF', true)} requested</Badge>
        </>} />

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search applications…" className="w-full sm:w-64" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto"><option value="">All statuses</option>{APPLICATION_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} applications</span>
      </Toolbar>

      <Section flush>
        <DataTable rows={rows} onRowClick={(a) => setFocusId(a.id)}
          columns={[
            {
              key: 'n', header: 'Application', sort: (a) => a.projectTitle,
              cell: (a) => (
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground"><FileText className="size-4" strokeWidth={1.7} /></span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{a.projectTitle}</p>
                    <p className="truncate text-[11.5px] text-muted-foreground">{state.funders.find((f) => f.id === a.funderId)?.name}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'c', header: 'Completion', cell: (a) => {
                const c = appCompletion(a);
                return <div className="flex w-28 items-center gap-2"><Progress value={c.percent} tone={c.mandatoryComplete ? 'forest' : 'gold'} /><span className="tnum shrink-0 text-[11px] text-muted-foreground">{c.percent}%</span></div>;
              }, hideBelow: 'md',
            },
            { key: 'r', header: 'Requested', align: 'right', cell: (a) => <span className="tnum">{money(a.fundingRequested, a.currency, true)}</span>, sort: (a) => a.fundingRequested, hideBelow: 'lg' },
            { key: 'dl', header: 'Deadline', cell: (a) => <DeadlinePill deadline={a.deadline} />, sort: (a) => a.deadline, hideBelow: 'md' },
            { key: 's', header: 'Status', cell: (a) => <StatusBadge status={a.status} /> },
            { key: 'o', header: 'Owner', align: 'center', cell: (a) => <Avatar size="xs" name={userById(a.owner)?.name} /> },
          ]} />
      </Section>

      {focusId && state.fundingApplications.some((a) => a.id === focusId) && <ApplicationRecord applicationId={focusId} onClose={() => setFocusId(null)} />}
    </div>
  );
}
