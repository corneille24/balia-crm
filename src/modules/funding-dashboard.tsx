import React, { useMemo, useState } from 'react';
import {
  Trophy, CalendarClock, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { useApp } from '@/store';
import {
  KpiCard, PageHeader, Section, Badge, StatusBadge, Tabs, EmptyState,
} from '@/components/kit';
import { BarViz, DonutViz, FunnelViz } from '@/components/charts';
import { money, fmtDate } from '@/lib/derive';
import {
  fundingAnalytics, findingsAnalytics, opportunityFit, deadlineInfo,
} from '@/lib/funding';
import { cn } from '@/lib/utils';

const xaf = (v: number) => money(v, 'XAF', true);

export function FundingDashboard() {
  const { state, setModule } = useApp();
  const [tab, setTab] = useState('overview');

  const a = useMemo(() => fundingAnalytics(
    state.funders, state.fundingOpportunities, state.fundingApplications,
    state.fundingAppDocuments, state.fundingOutcomes,
  ), [state]);
  const fa = useMemo(() => findingsAnalytics(state.businessFindings), [state.businessFindings]);

  const openStatuses = ['Rejected', 'Withdrawn', 'Expired', 'Not Eligible', 'Archived'];
  const upcoming = state.fundingOpportunities
    .filter((o) => !openStatuses.includes(o.status))
    .filter((o) => deadlineInfo(o.deadline).daysRemaining >= 0)
    .sort((x, y) => (x.deadline < y.deadline ? -1 : 1))
    .slice(0, 6);
  const topOpps = [...state.fundingOpportunities]
    .filter((o) => !openStatuses.includes(o.status))
    .map((o) => ({ o, fit: opportunityFit(o).score }))
    .sort((x, y) => y.fit - x.fit)
    .slice(0, 5);
  const nextDeadline = upcoming[0];
  const topOpp = topOpps[0]?.o;

  const tabs = [
    { id: 'overview', label: 'Funding dashboard' },
    { id: 'executive', label: 'Executive view' },
    { id: 'findings', label: 'Business findings' },
    { id: 'charts', label: 'Visualiser' },
  ];

  return (
    <div className="enter-up">
      <PageHeader
        title="Funding & business intelligence"
        subtitle="BALIA's opportunity intelligence engine — funders, funding pipeline, applications and strategic findings in one view."
        meta={<>
          <Badge tone="forest" dot>{xaf(a.pipelineValue)} pipeline</Badge>
          <Badge tone={a.dueThisWeek ? 'warning' : 'muted'} dot>{a.dueThisWeek} due this week</Badge>
          <Badge tone="gold" dot>{a.successRate}% success rate</Badge>
        </>} />

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-4" />

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
            <KpiCard label="Funding pipeline" value={xaf(a.pipelineValue)} sub={`${a.totalOpportunities} opportunities`} onClick={() => setModule('funding-opportunities')} />
            <KpiCard label="Funding requested" value={xaf(a.fundingRequested)} sub={`${a.applicationsSubmitted} submitted`} onClick={() => setModule('funding-applications')} />
            <KpiCard label="Funding secured" value={xaf(a.fundingSecured)} tone={a.fundingSecured > 0 ? 'success' : 'neutral'} sub={`${a.successRate}% success`} onClick={() => setModule('funding-opportunities')} />
            <KpiCard label="Active funders" value={a.activeFunders} sub={`of ${a.totalFunders} total`} onClick={() => setModule('funders')} />
            <KpiCard label="Applications" value={a.applicationsInProgress} sub={`${a.applicationsInProgress} in progress`} onClick={() => setModule('funding-applications')} />
            <KpiCard label="Avg fit score" value={a.avgFitScore} sub="open opportunities" onClick={() => setModule('funding-opportunities')} />
          </div>

          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
            <KpiCard dense label="Qualified" value={a.qualifiedOpportunities} onClick={() => setModule('funding-opportunities')} />
            <KpiCard dense label="Due this week" value={a.dueThisWeek} tone={a.dueThisWeek ? 'warning' : 'success'} onClick={() => setModule('funding-opportunities')} />
            <KpiCard dense label="Due this month" value={a.dueThisMonth} onClick={() => setModule('funding-opportunities')} />
            <KpiCard dense label="Overdue" value={a.overdue} tone={a.overdue ? 'danger' : 'success'} onClick={() => setModule('funding-opportunities')} />
            <KpiCard dense label="Missing documents" value={a.missingDocs} tone={a.missingDocs ? 'warning' : 'success'} onClick={() => setModule('funding-applications')} />
            <KpiCard dense label="Strategic findings" value={fa.highPriority} onClick={() => setModule('business-findings')} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Section className="lg:col-span-2" title="Funding pipeline" description="Opportunities by stage">
              <FunnelViz data={a.pipelineFunnel} fmt={(v) => `${v}`} />
            </Section>
            <Section title="Upcoming deadlines" flush>
              <ul className="divide-y divide-border">
                {upcoming.map((o) => {
                  const dl = deadlineInfo(o.deadline);
                  return (
                    <li key={o.id}>
                      <button onClick={() => setModule('funding-opportunities', o.id)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-secondary/50">
                        <CalendarClock className={cn('size-4 shrink-0', dl.tone === 'danger' ? 'text-danger' : dl.tone === 'warning' ? 'text-warning' : 'text-muted-foreground')} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12.5px] font-medium">{o.name}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{state.funders.find((f) => f.id === o.funderId)?.name}</p>
                        </div>
                        <span className={cn('tnum shrink-0 text-[11px]', dl.tone === 'danger' ? 'font-medium text-danger' : dl.tone === 'warning' ? 'text-warning' : 'text-muted-foreground')}>{dl.label}</span>
                      </button>
                    </li>
                  );
                })}
                {!upcoming.length && <li className="px-4 py-6"><EmptyState title="No upcoming deadlines" /></li>}
              </ul>
            </Section>
          </div>

          <Section title="Best-fit opportunities" description="Highest fit score, open pipeline" flush>
            <ul className="divide-y divide-border">
              {topOpps.map(({ o, fit }) => (
                <li key={o.id}>
                  <button onClick={() => setModule('funding-opportunities', o.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-secondary/50">
                    <Badge tone={fit >= 75 ? 'success' : fit >= 60 ? 'info' : 'warning'}>{fit}</Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium">{o.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{state.funders.find((f) => f.id === o.funderId)?.name} · {xaf(o.estimatedValue)}</p>
                    </div>
                    <StatusBadge status={o.status} />
                  </button>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      {tab === 'executive' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <div className="panel bg-navy p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/60">Total funding pipeline</p>
              <p className="tnum mt-1.5 font-display text-[26px] font-semibold leading-none">{xaf(a.pipelineValue)}</p>
              <p className="mt-1.5 text-[11.5px] text-white/70">{a.totalOpportunities} opportunities across {a.totalFunders} funders</p>
            </div>
            <div className="panel p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Funding requested</p>
              <p className="tnum mt-1.5 font-display text-[26px] font-semibold leading-none">{xaf(a.fundingRequested)}</p>
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">{a.applicationsSubmitted} applications submitted</p>
            </div>
            <div className="panel p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Funding secured</p>
              <p className={cn('tnum mt-1.5 font-display text-[26px] font-semibold leading-none', a.fundingSecured > 0 && 'text-forest')}>{xaf(a.fundingSecured)}</p>
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">{a.successRate}% success rate</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <KpiCard dense label="Applications active" value={a.applicationsInProgress} onClick={() => setModule('funding-applications')} />
            <KpiCard dense label="Under review" value={a.applicationsUnderReview} onClick={() => setModule('funding-applications')} />
            <KpiCard dense label="Success rate" value={`${a.successRate}%`} tone="gold" />
            <KpiCard dense label="Avg fit score" value={a.avgFitScore} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Top opportunity" flush>
              {topOpp ? (
                <button onClick={() => setModule('funding-opportunities', topOpp.id)} className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-secondary/40">
                  <Trophy className="mt-0.5 size-5 shrink-0 text-gold" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium">{topOpp.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{state.funders.find((f) => f.id === topOpp.funderId)?.name} · {xaf(topOpp.estimatedValue)}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge tone="success">Fit {opportunityFit(topOpp).score}</Badge>
                      <StatusBadge status={topOpp.status} />
                    </div>
                  </div>
                </button>
              ) : <div className="p-4"><EmptyState title="No open opportunities" /></div>}
            </Section>

            <Section title="Next deadline" flush>
              {nextDeadline ? (
                <button onClick={() => setModule('funding-opportunities', nextDeadline.id)} className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-secondary/40">
                  <CalendarClock className={cn('mt-0.5 size-5 shrink-0', deadlineInfo(nextDeadline.deadline).tone === 'danger' ? 'text-danger' : 'text-warning')} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium">{nextDeadline.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{state.funders.find((f) => f.id === nextDeadline.funderId)?.name}</p>
                    <p className="mt-1.5 text-[12px] font-medium">{fmtDate(nextDeadline.deadline)} · {deadlineInfo(nextDeadline.deadline).label}</p>
                  </div>
                </button>
              ) : <div className="p-4"><EmptyState title="No upcoming deadlines" /></div>}
            </Section>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Applications by stage">
              <BarViz data={a.pipelineFunnel} series={[{ key: 'value', name: 'Opportunities', color: 'hsl(219 62% 24%)' }]} fmt={(v) => `${v}`} onClick={() => setModule('funding-opportunities')} />
            </Section>
            <Section title="Required management actions" flush>
              <ManagementActions />
            </Section>
          </div>
        </div>
      )}

      {tab === 'findings' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
            <KpiCard label="Total findings" value={fa.total} onClick={() => setModule('business-findings')} />
            <KpiCard label="Need action" value={fa.needAction} tone={fa.needAction ? 'warning' : 'success'} onClick={() => setModule('business-findings')} />
            <KpiCard label="High priority" value={fa.highPriority} onClick={() => setModule('business-findings')} />
            <KpiCard label="Need verification" value={fa.needVerification} tone={fa.needVerification ? 'warning' : 'success'} onClick={() => setModule('business-findings')} />
            <KpiCard label="Converted" value={fa.converted} tone="success" onClick={() => setModule('business-findings')} />
            <KpiCard label="Funders identified" value={a.totalFunders} onClick={() => setModule('funders')} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Findings by category"><DonutViz data={fa.byCategory} onClick={() => setModule('business-findings')} /></Section>
            <Section title="Findings by source"><BarViz data={fa.bySource} series={[{ key: 'value', name: 'Findings', color: 'hsl(41 58% 47%)' }]} horizontal fmt={(v) => `${v}`} onClick={() => setModule('business-findings')} /></Section>
            <Section title="Findings by type"><BarViz data={fa.byType.slice(0, 8)} series={[{ key: 'value', name: 'Findings', color: 'hsl(205 45% 46%)' }]} horizontal fmt={(v) => `${v}`} onClick={() => setModule('business-findings')} /></Section>
            <Section title="Findings by country"><DonutViz data={fa.byCountry} onClick={() => setModule('business-findings')} /></Section>
          </div>
        </div>
      )}

      {tab === 'charts' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Funding value by funder" description="Open pipeline · click to drill in">
            <BarViz data={a.byFunder} series={[{ key: 'value', name: 'Pipeline', color: 'hsl(219 62% 24%)' }]} horizontal fmt={xaf} onClick={() => setModule('funders')} />
          </Section>
          <Section title="By funding type"><DonutViz data={a.byType} fmt={xaf} onClick={() => setModule('funding-opportunities')} /></Section>
          <Section title="By country"><BarViz data={a.byCountry} series={[{ key: 'value', name: 'Pipeline', color: 'hsl(205 45% 46%)' }]} horizontal fmt={xaf} onClick={() => setModule('funding-opportunities')} /></Section>
          <Section title="By sector"><DonutViz data={a.bySector} fmt={xaf} onClick={() => setModule('funding-opportunities')} /></Section>
          <Section title="Opportunities by status"><BarViz data={a.byStatus.slice(0, 10)} series={[{ key: 'value', name: 'Count', color: 'hsl(41 58% 47%)' }]} horizontal fmt={(v) => `${v}`} onClick={() => setModule('funding-opportunities')} /></Section>
          <Section title="Fit score distribution"><BarViz data={a.fitDistribution} series={[{ key: 'value', name: 'Opportunities', color: 'hsl(12 52% 52%)' }]} fmt={(v) => `${v}`} onClick={() => setModule('funding-opportunities')} /></Section>
          <Section title="Requested vs awarded" description="By application">
            <BarViz data={a.requestedVsAwarded} series={[{ key: 'Requested', name: 'Requested', color: 'hsl(219 62% 24%)' }, { key: 'Awarded', name: 'Awarded', color: 'hsl(41 58% 47%)' }]} fmt={xaf} onClick={() => setModule('funding-applications')} />
          </Section>
          <Section title="Pipeline by currency"><DonutViz data={a.byCurrency} fmt={xaf} onClick={() => setModule('funding-opportunities')} /></Section>
        </div>
      )}
    </div>
  );
}

// Required management actions — the highest-severity funding alerts, surfaced
// for the executive view.
function ManagementActions() {
  const { state, setModule } = useApp();
  const openStatuses = ['Rejected', 'Withdrawn', 'Expired', 'Not Eligible', 'Archived'];
  const items: { id: string; title: string; detail: string; module: string; recordId: string; tone: 'danger' | 'warning' }[] = [];

  state.fundingOpportunities.filter((o) => !openStatuses.includes(o.status)).forEach((o) => {
    const dl = deadlineInfo(o.deadline);
    if (dl.urgency === 'Critical' || dl.urgency === 'Overdue') {
      items.push({ id: o.id, title: `Decide on ${o.name}`, detail: `${dl.label} — escalate, submit or withdraw`, module: 'funding-opportunities', recordId: o.id, tone: 'danger' });
    }
  });
  state.fundingApplications.filter((ap) => !ap.submissionDate).forEach((ap) => {
    const missing = state.fundingAppDocuments.filter((d) => d.applicationId === ap.id && d.required && (d.status === 'Missing' || d.status === 'Requested'));
    if (missing.length && deadlineInfo(ap.deadline).daysRemaining <= 30) {
      items.push({ id: ap.id, title: `${missing.length} document${missing.length === 1 ? '' : 's'} outstanding`, detail: ap.projectTitle, module: 'funding-applications', recordId: ap.id, tone: 'warning' });
    }
  });

  if (!items.length) return <div className="p-4"><EmptyState title="No management actions required" detail="No critical deadlines or blocking gaps right now." /></div>;
  return (
    <ul className="divide-y divide-border">
      {items.slice(0, 6).map((it) => (
        <li key={`${it.id}-${it.title}`}>
          <button onClick={() => setModule(it.module, it.recordId)} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-secondary/50">
            <AlertTriangle className={cn('size-4 shrink-0', it.tone === 'danger' ? 'text-danger' : 'text-warning')} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium">{it.title}</p>
              <p className="truncate text-[11px] text-muted-foreground">{it.detail}</p>
            </div>
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        </li>
      ))}
    </ul>
  );
}
