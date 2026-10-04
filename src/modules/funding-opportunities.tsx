import React, { useState } from 'react';
import {
  LayoutGrid, List, CheckCircle2,
  AlertTriangle, ShieldCheck, ShieldAlert, Target, ExternalLink, Plus, XCircle,
} from 'lucide-react';
import { useApp } from '@/store';
import {
  PageHeader, Section, Badge, Button, StatusBadge, DataTable, Drawer, Toolbar,
  SearchInput, Select, Stat, Avatar, EmptyState, Tabs, Progress, Modal, Field, Input, Textarea,
} from '@/components/kit';
import { money, fmtDate, relativeDays, daysFromToday, TODAY_ISO, addDays } from '@/lib/derive';
import {
  opportunityFit, deadlineInfo, needsVerification, opportunityNeedsNextAction,
  appCompletion, inOppScope, isCompletedOpportunity,
} from '@/lib/funding';
import type { OppScope } from '@/lib/funding';
import {
  FUNDING_PIPELINE_STAGES, FUNDING_OPP_STATUSES, PRIORITIES, OPPORTUNITY_TYPES,
  BALIA_CATEGORIES, FUNDING_TYPES, BALIA_ELIGIBILITY, URL_STATUSES, PROBABILITY_CONFIDENCE,
} from '@/data/funding';
import type { FundingStage, FundingOpportunity } from '@/data/funding';
import { strategicFit, oppIntel, competitivenessBand, sourceConfidenceBand } from '@/lib/opportunity-intel';
import { FitBadge, DeadlinePill } from '@/modules/funding';import { cn } from '@/lib/utils';

// Map a pipeline stage to a reasonable status when a card is dragged.
const STAGE_TO_STATUS: Record<FundingStage, string> = {
  'Funder Identified': 'Identified',
  'Opportunity Identified': 'Identified',
  'Eligibility Review': 'Under Review',
  'Qualified': 'Qualified',
  'Application Preparation': 'Preparing Application',
  'Documents Complete': 'Application in Progress',
  'Application Submitted': 'Submitted',
  'Evaluation': 'Under Evaluation',
  'Shortlisted': 'Shortlisted',
  'Due Diligence': 'Interview/Due Diligence',
  'Awarded': 'Awarded',
  'Contracting': 'Contracting',
  'Funded': 'Funded',
  'Reporting': 'Funded',
  'Completed': 'Funded',
};

// Condensed board columns — the full 15 stages grouped so the board stays
// usable while still covering the whole lifecycle. Each column lists which
// stages it contains; a drop sets the card to the column's primary stage.
// These are the *working* columns of the active pipeline (Funded/Rejected are
// terminal outcomes handled separately, below).
const BOARD_COLUMNS: { label: string; stages: FundingStage[]; primary: FundingStage }[] = [
  { label: 'Identified', stages: ['Funder Identified', 'Opportunity Identified'], primary: 'Opportunity Identified' },
  { label: 'Eligibility', stages: ['Eligibility Review'], primary: 'Eligibility Review' },
  { label: 'Qualified', stages: ['Qualified'], primary: 'Qualified' },
  { label: 'Preparing', stages: ['Application Preparation', 'Documents Complete'], primary: 'Application Preparation' },
  { label: 'Submitted', stages: ['Application Submitted'], primary: 'Application Submitted' },
  { label: 'Evaluation', stages: ['Evaluation', 'Shortlisted', 'Due Diligence'], primary: 'Evaluation' },
  { label: 'Awarded', stages: ['Awarded', 'Contracting'], primary: 'Awarded' },
];

// Terminal outcome columns. Dropping a card here marks the opportunity's
// application as Funded or Rejected; it then leaves the active board and is
// viewed through its own scope. Funded also advances the stage to Funded to
// preserve the existing Funded behaviour; Rejected leaves the stage intact so
// the history of how far it got is preserved.
const TERMINAL_COLUMNS: { key: 'Funded' | 'Rejected'; label: string; status: string; stage?: FundingStage; tone: 'success' | 'danger'; hint: string }[] = [
  { key: 'Funded', label: 'Funded', status: 'Funded', stage: 'Funded', tone: 'success', hint: 'Drop here when the application is funded' },
  { key: 'Rejected', label: 'Rejected', status: 'Rejected', tone: 'danger', hint: 'Drop here when the application is declined' },
];

// ===========================================================================
// Opportunity detail drawer
// ===========================================================================

export function OpportunityRecord({ opportunityId, onClose }: { opportunityId: string; onClose: () => void }) {
  const { state, dispatch, user, userById, toast, setModule, can } = useApp();
  const [tab, setTab] = useState('overview');
  const [awardOpen, setAwardOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const o = state.fundingOpportunities.find((x) => x.id === opportunityId);
  if (!o) return null;

  const funder = state.funders.find((f) => f.id === o.funderId);
  const fit = opportunityFit(o);
  const dl = deadlineInfo(o.deadline);
  const application = state.fundingApplications.find((a) => a.opportunityId === o.id);
  const actions = state.fundingActions.filter((a) => a.opportunityId === o.id);
  const comms = state.funderCommunications.filter((c) => c.opportunityId === o.id);
  const staleVerification = needsVerification(o.nextVerification);

  const setStage = (stage: FundingStage) => {
    dispatch({ type: 'patch', collection: 'fundingOpportunities', id: o.id, changes: { stage, status: STAGE_TO_STATUS[stage] } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Funding opportunity stage changed', record: o.id, detail: `→ ${stage}` } });
    toast(`Stage set to ${stage}.`);
  };

  // Directly set the status from the record — the universal way to move an
  // opportunity to any state (including Funded / Rejected) without the board.
  // Funded also advances the stage; Rejected keeps the stage so the history of
  // how far it got is preserved. Funded/Rejected leave the active pipeline.
  const setStatus = (status: string) => {
    if (status === o.status) return;
    const changes: Record<string, unknown> = { status, updated: TODAY_ISO };
    if (status === 'Funded') changes.stage = 'Funded';
    dispatch({ type: 'patch', collection: 'fundingOpportunities', id: o.id, changes });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Funding opportunity status changed', record: o.id, detail: `→ ${status}` } });
    const completed = status === 'Funded' || status === 'Rejected';
    dispatch({ type: 'notify', note: { category: 'Funding', title: `Opportunity status: ${status}`, detail: o.name, tone: status === 'Funded' ? 'success' : status === 'Rejected' ? 'warning' : 'info', link: { module: 'funding-opportunities', recordId: o.id } } });
    toast(completed ? `Marked as ${status} — moved out of the active pipeline. Find it in the ${status} view.` : `Status set to ${status}.`, status === 'Rejected' ? 'info' : 'success');
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'intel', label: 'BALIA intel' },
    { id: 'fit', label: 'Fit score' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'application', label: 'Application', count: application ? 1 : 0 },
    { id: 'actions', label: 'Actions', count: actions.length },
    { id: 'timeline', label: 'Activity', count: comms.length },
  ];

  return (
    <Drawer open onClose={onClose} width="max-w-4xl" title={o.name}
      subtitle={<span className="flex flex-wrap items-center gap-2">
        <StatusBadge status={o.status} />
        <FitBadge score={fit.score} band={fit.band} tone={fit.tone} />
        <span>{funder?.name}</span>
      </span>}
      footer={<>
        {['Submitted', 'Under Evaluation', 'Shortlisted', 'Interview/Due Diligence', 'Contracting'].includes(o.status) && <>
          <Button variant="outline" onClick={() => setRejectOpen(true)}>Mark unsuccessful</Button>
          <Button onClick={() => setAwardOpen(true)}>Record award</Button>
        </>}
        {o.applicationUrl && <Button variant="outline" onClick={() => window.open(`https://${o.applicationUrl}`, '_blank')}>Application portal<ExternalLink className="size-3.5" /></Button>}
        <Button variant="outline" onClick={onClose}>Close</Button>
      </>}>
      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-4" />

      {tab === 'overview' && (
        <div className="space-y-5">
          {(dl.urgency === 'Critical' || dl.urgency === 'Overdue') && (
            <div className="panel-flat flex items-center gap-2 bg-danger-soft/60 p-3 text-danger">
              <AlertTriangle className="size-4 shrink-0" />
              <p className="text-[12.5px] font-medium">Deadline {dl.label} — {o.deadline}. {o.status !== 'Submitted' && o.status !== 'Funded' && o.status !== 'Awarded' ? 'Escalate or decide to withdraw.' : ''}</p>
            </div>
          )}
          {staleVerification && (
            <div className="panel-flat flex items-center gap-2 bg-warning-soft/60 p-3 text-warning">
              <ShieldAlert className="size-4 shrink-0" />
              <p className="text-[12.5px] font-medium">Details need re-verification (last verified {fmtDate(o.lastVerified)}). Funding terms change — confirm before relying on this.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { l: 'Estimated value', v: money(o.estimatedValue, o.currency, true) },
              { l: 'Fit score', v: `${fit.score}/100` },
              { l: 'Probability', v: `${o.probability}%` },
              { l: 'Deadline', v: dl.label, tone: dl.tone === 'danger' ? 'text-danger' : dl.tone === 'warning' ? 'text-warning' : '' },
            ].map((m) => (
              <div key={m.l} className="panel-flat bg-secondary/40 px-3 py-2.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{m.l}</p>
                <p className={cn('tnum mt-1 font-display text-[17px] font-semibold', m.tone)}>{m.v}</p>
              </div>
            ))}
          </div>

          <div className="panel-flat bg-secondary/30 p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Description</p>
            <p className="text-[12.5px] leading-relaxed">{o.description}</p>
          </div>

          {o.nextAction && (
            <div className={cn('panel-flat p-3', opportunityNeedsNextAction(o) ? 'bg-warning-soft/60' : 'bg-forest-soft/40')}>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Next action</p>
              <p className="text-[12.5px]">{o.nextAction} <span className="text-muted-foreground">· due {fmtDate(o.nextActionDate)} ({relativeDays(o.nextActionDate)})</span></p>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
            <Stat label="Funder" value={funder?.name} />
            <Stat label="Programme" value={o.programName} />
            <Stat label="Type" value={o.oppType} />
            <Stat label="Funding range" value={`${money(o.minAmount, o.currency, true)} – ${money(o.maxAmount, o.currency, true)}`} />
            <Stat label="Duration" value={o.fundingDuration} />
            <Stat label="Strategic value" value={o.strategicValue} className="col-span-2" />
            <Stat label="Owner" value={userById(o.owner)?.name} />
            <Stat label="Priority" value={o.priority} />
            <Stat label="Co-financing" value={o.coFinancingRequired ? `Yes — ${o.matchingPercent}%` : 'No'} />
            <Stat label="Application fee" value={o.applicationFee ? money(o.applicationFee, o.currency) : 'None'} />
          </dl>

          <div className="panel-flat space-y-3.5 bg-secondary/30 p-3.5">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Status</p>
              {can('record.edit') ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={o.status} onChange={(e) => setStatus(e.target.value)} className="w-auto min-w-[196px]">
                    {FUNDING_OPP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                  {isCompletedOpportunity(o) && (
                    <Badge tone={o.status === 'Funded' ? 'success' : 'danger'} dot>Out of active pipeline</Badge>
                  )}
                </div>
              ) : (
                <StatusBadge status={o.status} />
              )}
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
                {isCompletedOpportunity(o)
                  ? `Completed as ${o.status} — it now sits in the ${o.status} view rather than the active pipeline. Change the status here to reopen it.`
                  : 'Set the status to Funded or Rejected to complete the opportunity and move it out of the active pipeline — the stage and full history are kept.'}
              </p>
            </div>
            {can('record.edit') && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Advance to stage</p>
                <div className="flex flex-wrap gap-1.5">
                  {FUNDING_PIPELINE_STAGES.filter((s) => s !== o.stage).map((s) => (
                    <button key={s} onClick={() => setStage(s)}
                      className="rounded-md border border-input px-2 py-1 text-[11.5px] transition-colors hover:bg-secondary">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'intel' && <IntelTab o={o} />}

      {tab === 'fit' && (
        <div className="space-y-4">
          <div className="panel-flat flex items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display text-[28px] font-semibold leading-none">{fit.score}<span className="text-[15px] text-muted-foreground">/100</span></p>
              <p className="mt-1 text-[12.5px] font-medium">{fit.band}</p>
            </div>
            <div className="text-right">
              <Badge tone={fit.hasUnverified ? 'warning' : 'success'} dot>{fit.verifiedShare}% verified</Badge>
              <p className="mt-1 text-[11px] text-muted-foreground">{fit.hasUnverified ? 'Some inputs are assumptions' : 'All inputs verified'}</p>
            </div>
          </div>

          {fit.strengths.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-forest"><CheckCircle2 className="size-3.5" />Strengths</p>
              <ul className="space-y-1">
                {fit.strengths.map((c) => (
                  <li key={c.key} className="flex items-center justify-between gap-2 text-[12.5px]">
                    <span className="flex items-center gap-1.5">{c.label}{c.verified ? <ShieldCheck className="size-3 text-forest" /> : <ShieldAlert className="size-3 text-warning" />}</span>
                    <span className="tnum text-muted-foreground">{c.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fit.gaps.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-warning"><AlertTriangle className="size-3.5" />Gaps</p>
              <ul className="space-y-1">
                {fit.gaps.map((c) => (
                  <li key={c.key} className="flex items-center justify-between gap-2 text-[12.5px]">
                    <span>{c.label}</span>
                    <span className="tnum text-muted-foreground">{c.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">All criteria</p>
            <div className="space-y-1.5">
              {fit.criteria.map((c) => (
                <div key={c.key} className="flex items-center gap-2">
                  <span className="w-40 shrink-0 text-[11.5px]">{c.label}</span>
                  <Progress value={c.value} tone={c.value >= 75 ? 'forest' : c.value <= 45 ? 'danger' : 'gold'} />
                  <span className="tnum w-8 shrink-0 text-right text-[11px] text-muted-foreground">{c.value}</span>
                  {c.verified
                    ? <ShieldCheck className="size-3 shrink-0 text-forest" aria-label="verified" />
                    : <ShieldAlert className="size-3 shrink-0 text-warning" aria-label="assumed" />}
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground"><ShieldCheck className="mr-0.5 inline size-3 text-forest" />verified · <ShieldAlert className="mx-0.5 inline size-3 text-warning" />assumed — the score counts both, but only verified criteria are confirmed eligibility.</p>
          </div>
        </div>
      )}

      {tab === 'eligibility' && (
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
          <Stat label="Geographic eligibility" value={o.geographicEligibility.join(', ')} />
          <Stat label="Country eligibility" value={o.countryEligibility.join(', ')} />
          <Stat label="Sector eligibility" value={o.sectorEligibility.join(', ')} className="sm:col-span-2" />
          <Stat label="Business eligibility" value={o.businessEligibility} className="sm:col-span-2" />
          <Stat label="Company stage" value={o.companyStage} />
          <Stat label="Revenue requirement" value={o.revenueRequirement} />
          <Stat label="Project requirement" value={o.projectRequirement} className="sm:col-span-2" />
          <Stat label="Required documents" value={o.requiredDocuments.join(', ')} className="sm:col-span-2" />
          <Stat label="Evaluation criteria" value={o.evaluationCriteria.join(', ')} className="sm:col-span-2" />
          <Stat label="Verification status" value={o.verificationStatus} />
          <Stat label="Last verified" value={`${fmtDate(o.lastVerified)} · next ${fmtDate(o.nextVerification)}`} />
        </dl>
      )}

      {tab === 'application' && (
        application ? (() => {
          const c = appCompletion(application);
          return (
            <div className="space-y-4">
              <div className="panel-flat p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[13px] font-medium">{application.projectTitle}</p>
                  <StatusBadge status={application.status} />
                </div>
                <Progress value={c.percent} tone={c.mandatoryComplete ? 'forest' : 'gold'} showLabel />
                <p className="mt-1.5 text-[11.5px] text-muted-foreground">{c.doneCount}/{c.totalCount} items · {c.mandatoryDone}/{c.mandatoryTotal} mandatory{!c.mandatoryComplete && ` · ${c.outstandingMandatory.length} mandatory outstanding`}</p>
              </div>
              <button onClick={() => setModule('funding-applications', application.id)} className="text-[12px] text-gold underline-offset-2 hover:underline">Open the full application workspace →</button>
            </div>
          );
        })() : <EmptyState title="No application yet" detail="Qualify this opportunity to start an application." />
      )}

      {tab === 'actions' && (
        <div className="space-y-2">
          {actions.map((a) => (
            <div key={a.id} className="panel-flat p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium">{a.name}</p>
                <StatusBadge status={a.status} />
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <Progress value={a.completion} tone="forest" />
                <span className="tnum shrink-0 text-[11px] text-muted-foreground">{a.completion}%</span>
              </div>
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">{userById(a.owner)?.name} · due {fmtDate(a.dueDate)} ({relativeDays(a.dueDate)}) · {a.priority}</p>
            </div>
          ))}
          {!actions.length && <EmptyState title="No actions yet" detail="Add actions to drive this opportunity forward." />}
        </div>
      )}

      {tab === 'timeline' && (
        <div className="space-y-2">
          {comms.map((c) => (
            <div key={c.id} className="panel-flat p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12.5px] font-medium">{c.type}: {c.subject}</p>
                <Badge tone={c.direction === 'Inbound' ? 'info' : 'gold'}>{c.direction}</Badge>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">{c.summary}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{fmtDate(c.date)} · {userById(c.user)?.name}</p>
            </div>
          ))}
          {!comms.length && <EmptyState title="No activity yet" detail="Funder communications on this opportunity will appear here." />}
        </div>
      )}
      <AwardModal opportunity={o} open={awardOpen} onClose={() => setAwardOpen(false)} />
      <RejectModal opportunity={o} open={rejectOpen} onClose={() => setRejectOpen(false)} />
    </Drawer>
  );
}

function AwardModal({ opportunity, open, onClose }: { opportunity: { id: string; estimatedValue: number; currency: string; name: string }; open: boolean; onClose: () => void }) {
  const { dispatch, user, toast } = useApp();
  const [amount, setAmount] = useState(String(opportunity.estimatedValue));
  const submit = () => {
    dispatch({ type: 'awardOpportunity', opportunityId: opportunity.id, amount: Number(amount) || 0, user: user.id });
    toast('Funding recorded as awarded. Contract and reporting follow-ups flagged.', 'success');
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Record funding award"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit}>Confirm award</Button></>}>
      <p className="mb-3 text-[12.5px] text-muted-foreground">Recording an award for <span className="font-medium text-foreground">{opportunity.name}</span> will mark the funder as Funded, close the application as Awarded and create an outcome record. A follow-up to set up the contract and reporting schedule will be flagged.</p>
      <Field label={`Amount awarded (${opportunity.currency})`}>
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
    </Modal>
  );
}

function RejectModal({ opportunity, open, onClose }: { opportunity: { id: string; name: string }; open: boolean; onClose: () => void }) {
  const { dispatch, user, toast } = useApp();
  const [reason, setReason] = useState('');
  const submit = () => {
    dispatch({ type: 'rejectOpportunity', opportunityId: opportunity.id, reason: reason || 'No reason given', user: user.id });
    toast('Marked unsuccessful. Lessons-learned task created; history preserved.', 'warning');
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Mark application unsuccessful"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit}>Confirm</Button></>}>
      <p className="mb-3 text-[12.5px] text-muted-foreground">The full history is preserved and a lessons-learned task is created so the opportunity can be reconsidered in a future round.</p>
      <Field label="Reason / feedback">
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Funder feedback, gaps, timing…" />
      </Field>
    </Modal>
  );
}

// ===========================================================================
// Pipeline board card
// ===========================================================================

function PipelineCard({ oppId, onOpen, onDragStart, draggable = true }: { oppId: string; onOpen: () => void; onDragStart?: () => void; draggable?: boolean }) {
  const { state, userById } = useApp();
  const o = state.fundingOpportunities.find((x) => x.id === oppId)!;
  const funder = state.funders.find((f) => f.id === o.funderId);
  const fit = opportunityFit(o);
  const dl = deadlineInfo(o.deadline);
  return (
    <button
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onClick={onOpen}
      className={cn('panel lift w-full p-2.5 text-left', draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer')}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12.5px] font-medium leading-snug">{funder?.name}</span>
        <Badge tone={fit.tone} className="shrink-0">{fit.score}</Badge>
      </div>
      <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">{o.programName}</p>
      <p className="tnum mt-1.5 text-[12.5px] font-semibold">{money(o.estimatedValue, o.currency, true)}</p>
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
        <span className="flex items-center gap-1.5">
          <Avatar size="xs" name={userById(o.owner)?.name} />
          <span className={cn('tnum text-[11px]', dl.tone === 'danger' ? 'font-medium text-danger' : dl.tone === 'warning' ? 'text-warning' : 'text-muted-foreground')}>{dl.label}</span>
        </span>
        <span className="tnum text-[11px] text-muted-foreground">{o.probability}%</span>
      </div>
    </button>
  );
}

// ===========================================================================
// Funding Opportunities — list + pipeline board
// ===========================================================================

export function FundingOpportunities() {
  const { state, dispatch, user, userById, focusId, setFocusId, toast, can } = useApp();
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [scope, setScope] = useState<OppScope>('active');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Base filter set (search / status / priority) — shared by every scope.
  const rows = state.fundingOpportunities
    .filter((o) => (!q || `${o.name} ${o.programName} ${o.oppType} ${o.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase()) || (state.funders.find((f) => f.id === o.funderId)?.name.toLowerCase().includes(q.toLowerCase()))))
    .filter((o) => (!status || o.status === status))
    .filter((o) => (!priority || o.priority === priority));

  // Scope narrows the base set to the active pipeline or a completed view.
  const scopedRows = rows.filter((o) => inOppScope(o, scope));
  const scopeCounts = {
    active: rows.filter((o) => inOppScope(o, 'active')).length,
    funded: rows.filter((o) => o.status === 'Funded').length,
    rejected: rows.filter((o) => o.status === 'Rejected').length,
    all: rows.length,
  };
  const SCOPES: { key: OppScope; label: string; count: number }[] = [
    { key: 'active', label: 'Active pipeline', count: scopeCounts.active },
    { key: 'funded', label: 'Funded', count: scopeCounts.funded },
    { key: 'rejected', label: 'Rejected', count: scopeCounts.rejected },
    { key: 'all', label: 'All', count: scopeCounts.all },
  ];
  const emptyCopy = {
    active: { title: 'No active opportunities', detail: 'Nothing is currently moving through the pipeline. Funded and rejected opportunities are in their own views; switch to All to see everything.' },
    funded: { title: 'No funded opportunities yet', detail: 'When an application succeeds, drag its card to the Funded column on the active board — or mark it awarded from the record.' },
    rejected: { title: 'No rejected opportunities', detail: 'Declined applications appear here once you drag them to Rejected on the active board — the full history is preserved.' },
    all: { title: 'No opportunities found', detail: 'No opportunity matches the current search or filters. Try clearing them.' },
  }[scope];

  // Funded and Rejected are completed — they don't count as open pipeline value
  // or as deadlines that still need chasing.
  const closedStatuses = ['Funded', 'Rejected', 'Withdrawn', 'Expired', 'Not Eligible', 'Archived'];
  const pipelineValue = state.fundingOpportunities.filter((o) => !closedStatuses.includes(o.status)).reduce((s, o) => s + o.estimatedValue, 0);
  const dueSoon = state.fundingOpportunities.filter((o) => { const d = daysFromToday(o.deadline); return d >= 0 && d <= 14 && !closedStatuses.includes(o.status); }).length;

  const moveToColumn = (col: typeof BOARD_COLUMNS[number]) => {
    if (!dragId) return;
    const o = state.fundingOpportunities.find((x) => x.id === dragId);
    setDragOver(null);
    setDragId(null);
    if (!o || o.stage === col.primary || col.stages.includes(o.stage)) return;
    dispatch({ type: 'patch', collection: 'fundingOpportunities', id: dragId, changes: { stage: col.primary, status: STAGE_TO_STATUS[col.primary] } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Funding opportunity stage changed', record: dragId, detail: `→ ${col.primary}` } });
    toast(`Moved to ${col.label}.`);
  };

  // Drop onto a terminal column: mark the opportunity Funded or Rejected. It
  // then leaves the active board and appears under its own scope. The richer
  // "award / decline with reason + outcome" flows remain in the record drawer.
  const moveToTerminal = (col: typeof TERMINAL_COLUMNS[number]) => {
    if (!dragId) return;
    const o = state.fundingOpportunities.find((x) => x.id === dragId);
    setDragOver(null);
    setDragId(null);
    if (!o || o.status === col.status) return;
    const changes: Record<string, unknown> = { status: col.status, updated: TODAY_ISO };
    if (col.stage) changes.stage = col.stage;
    dispatch({ type: 'patch', collection: 'fundingOpportunities', id: o.id, changes });
    dispatch({ type: 'audit', entry: { user: user.id, action: `Funding opportunity ${col.status.toLowerCase()}`, record: o.id, detail: `${o.name} → ${col.label}` } });
    dispatch({ type: 'notify', note: { category: 'Funding', title: col.key === 'Funded' ? 'Opportunity funded' : 'Opportunity rejected', detail: o.name, tone: col.key === 'Funded' ? 'success' : 'warning', link: { module: 'funding-opportunities', recordId: o.id } } });
    toast(`Marked as ${col.label}. Moved out of the active pipeline — find it in the ${col.label} view.`, col.key === 'Funded' ? 'success' : 'info');
  };

  return (
    <div className="enter-up">
      <PageHeader
        title="Funding opportunities"
        subtitle="The BALIA funding pipeline — every grant, challenge fund and programme, scored for fit and tracked to its deadline. Drag cards between stages to advance them."
        meta={<>
          <Badge tone="forest" dot>{money(pipelineValue, 'XAF', true)} pipeline</Badge>
          <Badge tone={dueSoon ? 'warning' : 'muted'} dot>{dueSoon} due within 14 days</Badge>
        </>}
        actions={<div className="flex items-center gap-2">
          {can('record.edit') && <Button onClick={() => setAddOpen(true)}><Plus className="size-3.5" />New opportunity</Button>}
          <div className="flex rounded-md border border-input p-0.5">
            <button onClick={() => setView('kanban')} className={cn('rounded px-2 py-1 text-[12px] transition-colors', view === 'kanban' ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground')}><LayoutGrid className="mr-1 inline size-3" />Pipeline</button>
            <button onClick={() => setView('table')} className={cn('rounded px-2 py-1 text-[12px] transition-colors', view === 'table' ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground')}><List className="mr-1 inline size-3" />Table</button>
          </div>
        </div>} />

      <Toolbar>
        <div className="flex rounded-md border border-input p-0.5">
          {SCOPES.map((s) => (
            <button key={s.key} onClick={() => setScope(s.key)}
              className={cn('rounded px-2.5 py-1 text-[12px] transition-colors', scope === s.key ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {s.label}<span className="tnum ml-1.5 text-[11px] opacity-70">{s.count}</span>
            </button>
          ))}
        </div>
        <SearchInput value={q} onChange={setQ} placeholder="Search opportunities…" className="w-full sm:w-56" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto"><option value="">All statuses</option>{FUNDING_OPP_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select>
        <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-auto"><option value="">All priorities</option>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{scopedRows.length} of {state.fundingOpportunities.length}</span>
      </Toolbar>

      {view === 'kanban' ? (
        scope === 'active' ? (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-3">
            {BOARD_COLUMNS.map((col) => {
              const list = scopedRows.filter((o) => col.stages.includes(o.stage));
              const value = list.reduce((s, o) => s + o.estimatedValue, 0);
              return (
                <div key={col.label} className="flex w-[248px] shrink-0 flex-col"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(col.label); }}
                  onDragLeave={() => setDragOver((d) => (d === col.label ? null : d))}
                  onDrop={() => moveToColumn(col)}>
                  <div className="mb-2 flex items-baseline justify-between px-0.5">
                    <span className="text-[12.5px] font-semibold">{col.label}</span>
                    <span className="tnum text-[11.5px] text-muted-foreground">{list.length} · {money(value, 'XAF', true)}</span>
                  </div>
                  <div className={cn('flex flex-1 flex-col gap-2 rounded-lg p-2 transition-colors', dragOver === col.label ? 'bg-gold-soft/50 ring-1 ring-gold/40' : 'bg-secondary/45')}>
                    {list.length === 0 && <p className="px-2 py-6 text-center text-[11.5px] text-muted-foreground">Drop here</p>}
                    {list.map((o) => (
                      <PipelineCard key={o.id} oppId={o.id} onOpen={() => setFocusId(o.id)} onDragStart={() => setDragId(o.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
            {TERMINAL_COLUMNS.map((col) => {
              const total = col.key === 'Funded' ? scopeCounts.funded : scopeCounts.rejected;
              const isFunded = col.key === 'Funded';
              return (
                <div key={col.key} className="flex w-[208px] shrink-0 flex-col"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(col.key); }}
                  onDragLeave={() => setDragOver((d) => (d === col.key ? null : d))}
                  onDrop={() => moveToTerminal(col)}>
                  <div className="mb-2 flex items-baseline justify-between px-0.5">
                    <span className={cn('flex items-center gap-1 text-[12.5px] font-semibold', isFunded ? 'text-success' : 'text-danger')}>
                      {isFunded ? <CheckCircle2 className="size-3.5" strokeWidth={2} /> : <XCircle className="size-3.5" strokeWidth={2} />}{col.label}
                    </span>
                    <button onClick={() => setScope(isFunded ? 'funded' : 'rejected')} className="tnum text-[11.5px] text-muted-foreground underline-offset-2 hover:underline">{total} · view</button>
                  </div>
                  <div className={cn('flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-2 text-center transition-colors',
                    dragOver === col.key ? (isFunded ? 'border-success/60 bg-success/10' : 'border-danger/60 bg-danger/10') : 'border-border bg-secondary/25')}>
                    <p className="px-1 py-6 text-[11.5px] leading-relaxed text-muted-foreground">{col.hint}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : scopedRows.length === 0 ? (
          <Section><EmptyState title={emptyCopy.title} detail={emptyCopy.detail} /></Section>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {scopedRows.map((o) => (
              <PipelineCard key={o.id} oppId={o.id} draggable={false} onOpen={() => setFocusId(o.id)} />
            ))}
          </div>
        )
      ) : scopedRows.length === 0 ? (
        <Section><EmptyState title={emptyCopy.title} detail={emptyCopy.detail} /></Section>
      ) : (
        <Section flush>
          <DataTable rows={scopedRows} onRowClick={(o) => setFocusId(o.id)}
            columns={[
              {
                key: 'n', header: 'Opportunity', sort: (o) => o.name,
                cell: (o) => (
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground"><Target className="size-4" strokeWidth={1.7} /></span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{o.name}</p>
                      <p className="truncate text-[11.5px] text-muted-foreground">{state.funders.find((f) => f.id === o.funderId)?.name} · {o.programName}</p>
                    </div>
                  </div>
                ),
              },
              { key: 'v', header: 'Value', align: 'right', cell: (o) => <span className="tnum">{money(o.estimatedValue, o.currency, true)}</span>, sort: (o) => o.estimatedValue, hideBelow: 'md' },
              { key: 'fit', header: 'Fit', align: 'center', cell: (o) => { const f = opportunityFit(o); return <Badge tone={f.tone}>{f.score}</Badge>; }, sort: (o) => opportunityFit(o).score, hideBelow: 'sm' },
              { key: 'p', header: 'Prob.', align: 'center', cell: (o) => <span className="tnum text-muted-foreground">{o.probability}%</span>, sort: (o) => o.probability, hideBelow: 'lg' },
              { key: 'dl', header: 'Deadline', cell: (o) => <DeadlinePill deadline={o.deadline} />, sort: (o) => o.deadline, hideBelow: 'md' },
              { key: 's', header: 'Stage', cell: (o) => <StatusBadge status={o.stage} />, hideBelow: 'lg' },
              { key: 'st', header: 'Status', cell: (o) => <StatusBadge status={o.status} /> },
              { key: 'o', header: 'Owner', align: 'center', cell: (o) => <Avatar size="xs" name={userById(o.owner)?.name} /> },
            ]} />
        </Section>
      )}

      {focusId && state.fundingOpportunities.some((o) => o.id === focusId) && <OpportunityRecord opportunityId={focusId} onClose={() => setFocusId(null)} />}
      <NewOpportunityModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function NewOpportunityModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, user, users, setModule, toast } = useApp();
  const firstFunder = state.funders[0]?.id ?? '';
  const blank = {
    name: '', funderId: firstFunder, programName: '', oppType: OPPORTUNITY_TYPES[0] as string,
    description: '', amount: '50000000', currency: 'XAF', deadline: addDays(TODAY_ISO, 45),
    priority: 'Medium' as string, owner: user.id, nextAction: '',
  };
  const [form, setForm] = useState(blank);

  const create = () => {
    if (!form.name.trim() || !form.funderId) return;
    const id = `FOP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const amount = Number(form.amount) || 0;
    const opp = {
      id, name: form.name, funderId: form.funderId, programName: form.programName,
      oppType: form.oppType, description: form.description,
      amount, minAmount: 0, maxAmount: amount, currency: form.currency,
      fundingDuration: '', openingDate: TODAY_ISO, deadline: form.deadline,
      geographicEligibility: [], countryEligibility: [], sectorEligibility: [],
      businessEligibility: '', companyStage: '', revenueRequirement: '', employeeRequirement: '', projectRequirement: '',
      matchingFundsRequired: false, coFinancingRequired: false, matchingPercent: 0, applicationFee: 0,
      applicationUrl: '', officialSource: '', contactPerson: '', contactEmail: '',
      requiredDocuments: [], evaluationCriteria: [], priority: form.priority, estimatedValue: amount,
      strategicValue: '', probability: 30, owner: form.owner, team: [form.owner],
      status: 'Identified', stage: 'Opportunity Identified',
      fitInputs: {}, verifiedCriteria: [], nextAction: form.nextAction, nextActionDate: addDays(TODAY_ISO, 7),
      notes: '', tags: [], discovered: TODAY_ISO, lastVerified: TODAY_ISO, nextVerification: addDays(TODAY_ISO, 30),
      verificationStatus: 'Needs Verification', verifiedBy: form.owner, created: TODAY_ISO, updated: TODAY_ISO,
    };
    dispatch({ type: 'add', collection: 'fundingOpportunities', record: opp });
    dispatch({ type: 'notify', note: { category: 'Funding', title: 'New funding opportunity', detail: form.name, tone: 'success', link: { module: 'funding-opportunities', recordId: id } } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Funding opportunity created', record: id, detail: form.name } });
    toast('Opportunity added to the pipeline. Complete the fit inputs to score it.', 'success');
    setForm(blank);
    setModule('funding-opportunities', id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New funding opportunity" width="max-w-xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Add opportunity</Button></>}>
      <p className="mb-3 text-[12px] text-muted-foreground">The opportunity starts at the Identified stage. Add fit-criteria inputs and verify eligibility from the record to generate a fit score.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Opportunity name" className="sm:col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. AfCFTA SME Readiness Grant" /></Field>
        <Field label="Funder"><Select value={form.funderId} onChange={(e) => setForm({ ...form, funderId: e.target.value })}>{state.funders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</Select></Field>
        <Field label="Programme"><Input value={form.programName} onChange={(e) => setForm({ ...form, programName: e.target.value })} placeholder="Window / call name" /></Field>
        <Field label="Type"><Select value={form.oppType} onChange={(e) => setForm({ ...form, oppType: e.target.value })}>{OPPORTUNITY_TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="Priority"><Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
        <Field label="Estimated value"><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
        <Field label="Currency"><Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{['XAF', 'USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Deadline"><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
        <Field label="Owner"><Select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}>{users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select></Field>
        <Field label="Description" className="sm:col-span-2"><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <Field label="Next action" className="sm:col-span-2"><Input value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} placeholder="e.g. Confirm eligibility" /></Field>
      </div>
    </Modal>
  );
}

// ===========================================================================
// BALIA intelligence tab + editor (§17–§32)
// ===========================================================================
function IntelBar({ label, value, weight }: { label: string; value: number; weight: number }) {
  const tone = value >= 75 ? 'bg-forest' : value >= 45 ? 'bg-gold' : 'bg-danger/70';
  return (
    <div className="flex items-center gap-2">
      <span className="w-48 shrink-0 text-[12px] text-muted-foreground">{label} <span className="opacity-60">·{weight}</span></span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"><div className={cn('h-full rounded-full', tone)} style={{ width: `${value}%` }} /></div>
      <span className="tnum w-9 text-right text-[12px]">{value}</span>
    </div>
  );
}

function IntelTab({ o }: { o: FundingOpportunity }) {
  const { can } = useApp();
  const [edit, setEdit] = useState(false);
  const intel = oppIntel(o);
  const fit = strategicFit(o);
  const classified = !!o.baliaCategory;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {o.baliaCategory && <Badge tone="forest">{o.baliaCategory}</Badge>}
          {o.fundingType && <Badge tone="muted">{o.fundingType}</Badge>}
          {o.baliaEligibility && <Badge tone={o.baliaEligibility === 'Not Eligible' ? 'danger' : o.baliaEligibility === 'Directly Eligible' ? 'success' : 'gold'}>{o.baliaEligibility}</Badge>}
          <Badge tone={intel.priority === 'Do Not Pursue' ? 'danger' : intel.priority === 'Apply Now' ? 'success' : 'info'}>{intel.priority}</Badge>
        </div>
        {can('record.edit') && <Button variant="outline" onClick={() => setEdit(true)}>{classified ? 'Edit intelligence' : 'Classify opportunity'}</Button>}
      </div>

      {!classified && <div className="panel-flat border-l-gold/50 bg-gold-soft/30 p-3 text-[12.5px] text-muted-foreground">This opportunity has not yet been classified for BALIA. Add its category, eligibility and fit factors to bring it into the intelligence scoring.</div>}

      {o.eligibilityReason && <div><p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Eligibility rationale</p><p className="prose-editorial text-[12.5px]">{o.eligibilityReason}</p></div>}

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Strategic fit — §18</p>
          <Badge tone={fit.tone}>{fit.score} · {fit.band}</Badge>
        </div>
        <div className="space-y-1.5">
          {fit.factors.map((f) => <IntelBar key={f.key} label={f.label} value={f.value} weight={f.weight} />)}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="panel-flat bg-secondary/30 p-3.5">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Estimated competitiveness — §19</p>
          <p className="text-[15px] font-semibold">{o.competitiveness ?? 0}% <span className="text-[12px] font-normal text-muted-foreground">{competitivenessBand(o.competitiveness ?? 0)} · {o.competitivenessConfidence ?? 'Low'} confidence</span></p>
          {o.competitivenessRationale && <p className="mt-1 text-[12px] text-muted-foreground">{o.competitivenessRationale}</p>}
          <div className="mt-2 flex gap-3 text-[11.5px] text-muted-foreground"><span>Competition: {o.competition ?? '—'}</span><span>Difficulty: {o.applicationDifficulty ?? '—'}</span></div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">BALIA's estimated position — not the funder's official selection rate.</p>
        </div>
        <div className="panel-flat bg-secondary/30 p-3.5">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Revenue &amp; client value</p>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Revenue potential (§21)" value={`${o.revenuePotential ?? 0}/100`} />
            <Stat label="Client advisory (§22)" value={`${o.clientAdvisoryPotential ?? 0}/100`} />
          </div>
        </div>
      </div>

      <div className="panel-flat bg-secondary/30 p-3.5">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Source &amp; verification — §15, §32</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={intel.urlStatus === 'Verified' ? 'success' : intel.urlStatus === 'Broken Link' ? 'danger' : 'gold'}>{intel.urlStatus}</Badge>
          <span className="text-[12.5px]">Source confidence: <b>{o.sourceConfidence ?? 0}</b> <span className="text-muted-foreground">({sourceConfidenceBand(o.sourceConfidence ?? 0)})</span></span>
          {o.sourceDomain && <span className="text-[12px] text-muted-foreground">· {o.sourceDomain}</span>}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[12px]">
          {o.officialSource && <a href={`https://${o.officialSource}`} target="_blank" rel="noreferrer" className="text-forest hover:underline">Official source<ExternalLink className="ml-0.5 inline size-3" /></a>}
          {o.applicationUrl && <a href={`https://${o.applicationUrl}`} target="_blank" rel="noreferrer" className="text-forest hover:underline">Application page<ExternalLink className="ml-0.5 inline size-3" /></a>}
          <span className="text-muted-foreground">Last verified {o.lastVerified ? fmtDate(o.lastVerified) : '—'} · re-verify {o.nextVerification ? fmtDate(o.nextVerification) : '—'}</span>
        </div>
      </div>

      <IntelEditModal o={o} open={edit} onClose={() => setEdit(false)} />
    </div>
  );
}

const FIT_KEYS: { key: string; label: string }[] = [
  { key: 'trade', label: 'Trade' }, { key: 'customs', label: 'Customs' }, { key: 'export', label: 'Export' },
  { key: 'geo', label: 'Geography' }, { key: 'eligibility', label: 'Eligibility' }, { key: 'revenue', label: 'Revenue' },
  { key: 'capability', label: 'Capability' }, { key: 'brand', label: 'Brand' }, { key: 'timing', label: 'Timing' },
];

function IntelEditModal({ o, open, onClose }: { o: FundingOpportunity; open: boolean; onClose: () => void }) {
  const { dispatch, user, toast } = useApp();
  const ff = o.fitFactors ?? {};
  const [form, setForm] = useState({
    baliaCategory: o.baliaCategory ?? BALIA_CATEGORIES[0], fundingType: o.fundingType ?? FUNDING_TYPES[0],
    baliaEligibility: o.baliaEligibility ?? 'Unclear', eligibilityReason: o.eligibilityReason ?? '',
    competitiveness: String(o.competitiveness ?? ''), competitivenessConfidence: o.competitivenessConfidence ?? 'Low',
    competitivenessRationale: o.competitivenessRationale ?? '', competition: o.competition ?? 'Medium',
    applicationDifficulty: o.applicationDifficulty ?? 'Medium', revenuePotential: String(o.revenuePotential ?? ''),
    clientAdvisoryPotential: String(o.clientAdvisoryPotential ?? ''), sourceConfidence: String(o.sourceConfidence ?? ''),
    sourceDomain: o.sourceDomain ?? '', urlStatus: o.urlStatus ?? 'Requires Verification',
  });
  const [factors, setFactors] = useState<Record<string, string>>(Object.fromEntries(FIT_KEYS.map((f) => [f.key, String(ff[f.key] ?? '')])));

  const save = () => {
    const fitFactors: Record<string, number> = {};
    for (const f of FIT_KEYS) fitFactors[f.key] = Math.max(0, Math.min(100, Number(factors[f.key]) || 0));
    dispatch({ type: 'patch', collection: 'fundingOpportunities', id: o.id, changes: {
      baliaCategory: form.baliaCategory, fundingType: form.fundingType, baliaEligibility: form.baliaEligibility,
      eligibilityReason: form.eligibilityReason, fitFactors,
      competitiveness: Number(form.competitiveness) || 0, competitivenessConfidence: form.competitivenessConfidence,
      competitivenessRationale: form.competitivenessRationale, competition: form.competition,
      applicationDifficulty: form.applicationDifficulty, revenuePotential: Number(form.revenuePotential) || 0,
      clientAdvisoryPotential: Number(form.clientAdvisoryPotential) || 0, sourceConfidence: Number(form.sourceConfidence) || 0,
      sourceDomain: form.sourceDomain, urlStatus: form.urlStatus, updated: TODAY_ISO,
    } });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Opportunity intelligence updated', record: o.id, detail: `${form.baliaCategory} · ${form.baliaEligibility}` } });
    toast('Intelligence updated — scoring recomputed.', 'success');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="BALIA opportunity intelligence" width="max-w-2xl"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Save intelligence</Button></>}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="BALIA category"><Select value={form.baliaCategory} onChange={(e) => setForm({ ...form, baliaCategory: e.target.value })}>{BALIA_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Funding type"><Select value={form.fundingType} onChange={(e) => setForm({ ...form, fundingType: e.target.value })}>{FUNDING_TYPES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="BALIA eligibility"><Select value={form.baliaEligibility} onChange={(e) => setForm({ ...form, baliaEligibility: e.target.value })}>{BALIA_ELIGIBILITY.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="URL status"><Select value={form.urlStatus} onChange={(e) => setForm({ ...form, urlStatus: e.target.value })}>{URL_STATUSES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Eligibility rationale" className="sm:col-span-2"><Textarea rows={2} value={form.eligibilityReason} onChange={(e) => setForm({ ...form, eligibilityReason: e.target.value })} /></Field>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Strategic-fit factors (0–100)</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {FIT_KEYS.map((f) => (
              <Field key={f.key} label={f.label}><Input type="number" value={factors[f.key]} onChange={(e) => setFactors({ ...factors, [f.key]: e.target.value })} /></Field>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Competitiveness %"><Input type="number" value={form.competitiveness} onChange={(e) => setForm({ ...form, competitiveness: e.target.value })} /></Field>
          <Field label="Confidence"><Select value={form.competitivenessConfidence} onChange={(e) => setForm({ ...form, competitivenessConfidence: e.target.value })}>{PROBABILITY_CONFIDENCE.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Competition"><Select value={form.competition} onChange={(e) => setForm({ ...form, competition: e.target.value })}>{['Low', 'Medium', 'High'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Application difficulty"><Select value={form.applicationDifficulty} onChange={(e) => setForm({ ...form, applicationDifficulty: e.target.value })}>{['Low', 'Medium', 'High'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Revenue potential"><Input type="number" value={form.revenuePotential} onChange={(e) => setForm({ ...form, revenuePotential: e.target.value })} /></Field>
          <Field label="Client advisory potential"><Input type="number" value={form.clientAdvisoryPotential} onChange={(e) => setForm({ ...form, clientAdvisoryPotential: e.target.value })} /></Field>
          <Field label="Source confidence (0–100)"><Input type="number" value={form.sourceConfidence} onChange={(e) => setForm({ ...form, sourceConfidence: e.target.value })} /></Field>
          <Field label="Source domain" className="sm:col-span-2"><Input value={form.sourceDomain} onChange={(e) => setForm({ ...form, sourceDomain: e.target.value })} placeholder="afdb.org" /></Field>
        </div>
        <p className="text-[11.5px] text-muted-foreground">Competitiveness rationale</p>
        <Textarea rows={2} value={form.competitivenessRationale} onChange={(e) => setForm({ ...form, competitivenessRationale: e.target.value })} />
      </div>
    </Modal>
  );
}
