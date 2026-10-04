import React, { useMemo, useState } from 'react';
import { FileBarChart, Download, CheckCircle2, Circle, ArrowRight, Building2, Receipt, ShieldCheck, History, Users2 } from 'lucide-react';
import { useApp } from '@/store';
import { useAnalytics } from '@/lib/analytics';
import { ROLES, SERVICES, LEAD_SCORE_RULES } from '@/data/catalog';
import {
  PageHeader, Section, Badge, Button, StatusBadge, DataTable, Toolbar, Select, Stat, Avatar,
  EmptyState, Tabs, Progress, KpiCard, Field, Input, Timeline, Drawer,
} from '@/components/kit';
import { BarViz, LineViz, DonutViz, AreaViz, VIZ } from '@/components/charts';
import { money, fmtDate, fmtDateTime, invoiceTotals, toXAF, daysFromToday } from '@/lib/derive';
import { fundingAnalytics, deadlineInfo } from '@/lib/funding';
import { cn } from '@/lib/utils';

const usd = (v: number) => money(v, 'XAF', true);

// ===========================================================================
export function Reports() {
  const { state, setModule } = useApp();
  const a = useAnalytics();
  const [tab, setTab] = useState('sales');

  const reportTypes = [
    { id: 'sales', label: 'Sales' }, { id: 'forecast', label: 'Forecast' }, { id: 'clients', label: 'Clients' },
    { id: 'projects', label: 'Projects' }, { id: 'financial', label: 'Financial' },
    { id: 'marketing', label: 'Marketing' }, { id: 'funding', label: 'Funding' },
  ];

  return (
    <div className="enter-up">
      <PageHeader title="Reports"
        subtitle="Standard analytical reports across sales, clients, delivery, finance and marketing. Every figure traces to source records."
        actions={<><Button variant="outline"><Download className="size-3.5" />Excel</Button><Button variant="outline"><Download className="size-3.5" />PDF</Button></>} />

      <Tabs tabs={reportTypes} active={tab} onChange={setTab} className="mb-4" />

      {tab === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <KpiCard dense label="Total leads" value={state.leads.length} />
            <KpiCard dense label="Conversion" value={`${((state.leads.filter((l) => l.status === 'Won').length / state.leads.length) * 100).toFixed(0)}%`} />
            <KpiCard dense label="Pipeline" value={usd(a.pipelineValue)} />
            <KpiCard dense label="Win rate" value={`${a.winRate.toFixed(0)}%`} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Leads by month"><LineViz height={230} data={['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m, i) => ({ name: m, leads: [4, 5, 6, 7, 9, 6][i] }))} series={[{ key: 'leads', name: 'New leads' }]} /></Section>
            <Section title="Leads by source"><DonutViz height={230} data={a.sourcePerf.map((s) => ({ name: s.name, value: s.leads }))} /></Section>
            <Section title="Pipeline by stage" className="lg:col-span-2"><BarViz height={220} data={a.stageBoard} series={[{ key: 'value', name: 'Gross' }, { key: 'weighted', name: 'Weighted', color: VIZ[1] }]} fmt={usd} /></Section>
          </div>
        </div>
      )}

      {tab === 'forecast' && (() => {
        const f = forecast(state);
        const kpi = (l: string, v: string, tone?: any, sub?: string) => <KpiCard dense label={l} value={v} tone={tone} sub={sub} />;
        const m = (n: number) => money(n, 'XAF', true);
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
              {kpi('Open pipeline', m(f.pipelineValue), undefined, `${f.openCount} open`)}
              {kpi('Weighted pipeline', m(f.weightedPipeline), 'info')}
              {kpi('Won revenue', m(f.wonRevenue), 'success', `${f.wonCount} won`)}
              {kpi('Win rate', `${Math.round(f.winRate * 100)}%`, f.winRate >= 0.5 ? 'success' : undefined, `${f.wonCount}W / ${f.lostCount}L`)}
              {kpi('Avg deal size', m(f.avgDealSize))}
              {kpi('Sales cycle', `${f.salesCycleDays} days`)}
              {kpi('Proposal conversion', `${Math.round(f.proposalConversion * 100)}%`)}
              {kpi('Lead conversion', `${Math.round(f.leadConversion * 100)}%`)}
            </div>
            <Section title="Revenue outlook" flush>
              <div className="grid gap-px bg-border sm:grid-cols-3">
                {f.periods.map((p) => (
                  <div key={p.label} className="bg-card p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{p.label}</p>
                    <p className="tnum mt-1 font-display text-[22px] font-semibold text-forest">{m(p.weighted)}</p>
                    <p className="mt-1 text-[11.5px] text-muted-foreground">Won {m(p.won)} · weighted pipeline {m(p.expected)}</p>
                  </div>
                ))}
              </div>
            </Section>
            <div className="grid gap-4 lg:grid-cols-2">
              <Section title="Revenue by service"><BarViz height={230} horizontal data={a.revenueByService} series={[{ key: 'value', name: 'Collected' }]} fmt={usd} /></Section>
              <Section title="Revenue by country"><BarViz height={230} horizontal data={a.revenueByCountry} series={[{ key: 'value', name: 'Collected' }]} fmt={usd} /></Section>
            </div>
            <p className="text-[11px] text-muted-foreground">Weighted pipeline = open opportunity value × win probability. Outlook combines weighted open pipeline closing in the period plus revenue already won for that period.</p>
          </div>
        );
      })()}

      {tab === 'clients' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Clients by country"><BarViz height={240} horizontal data={a.clientsByCountry} series={[{ key: 'value', name: 'Companies' }]} /></Section>
          <Section title="Clients by industry"><DonutViz height={240} data={a.clientsByIndustry} /></Section>
          <Section title="Revenue by client" className="lg:col-span-2"><BarViz height={230} data={a.revenueByClient} series={[{ key: 'value', name: 'Collected' }]} fmt={usd} /></Section>
          <Section title="Top expansion opportunities (cross-sell)" className="lg:col-span-2" flush>
            {(() => {
              const top = topCrossSell(state).slice(0, 8);
              if (top.length === 0) return <p className="p-4 text-[13px] text-muted-foreground">No cross-sell opportunities yet — they appear once clients have engaged services.</p>;
              return (
                <div className="divide-y divide-border">
                  {top.map((t) => (
                    <button key={t.companyId} onClick={() => setModule('companies', t.companyId)} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-secondary/50">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium">{t.companyName}</p>
                        <p className="truncate text-[11.5px] text-muted-foreground">{t.recs.slice(0, 3).map((r) => r.name).join(', ')}{t.recs.length > 3 ? ` +${t.recs.length - 3}` : ''}</p>
                      </div>
                      <span className="tnum shrink-0 text-[13px] font-semibold text-forest">{money(t.totalValueXAF, 'XAF', true)}</span>
                    </button>
                  ))}
                </div>
              );
            })()}
          </Section>
        </div>
      )}

      {tab === 'projects' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Project status"><DonutViz height={240} data={Object.entries(state.projects.reduce((m: Record<string, number>, p) => { m[p.status] = (m[p.status] ?? 0) + 1; return m; }, {})).map(([name, value]) => ({ name, value }))} /></Section>
          <Section title="Profitability by project"><BarViz height={240} horizontal data={a.projectProfitability} series={[{ key: 'revenue', name: 'Budget' }, { key: 'cost', name: 'Cost', color: VIZ[3] }]} fmt={usd} /></Section>
        </div>
      )}

      {tab === 'financial' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            <KpiCard dense label="YTD revenue" value={usd(a.ytdRevenue)} />
            <KpiCard dense label="Outstanding" value={usd(a.outstanding)} tone="warning" />
            <KpiCard dense label="Expenses" value={usd(a.expenseTotal)} />
            <KpiCard dense label="Recurring (annualised)" value={usd(a.recurringRevenue)} />
          </div>
          <Section title="Revenue against target"><AreaViz height={240} data={a.monthlyToDate} series={[{ key: 'collected', name: 'Collected' }, { key: 'target', name: 'Target', color: 'hsl(48 14% 78%)' }]} fmt={usd} /></Section>
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Revenue by service"><DonutViz height={230} data={a.revenueByService} fmt={usd} /></Section>
            <Section title="Expenses by category"><BarViz height={230} horizontal data={a.expensesByCategory} series={[{ key: 'value', name: 'Amount' }]} fmt={usd} /></Section>
          </div>
        </div>
      )}

      {tab === 'marketing' && (
        <Section title="Source → opportunity → client → revenue" flush>
          <div className="p-4">
            <DataTable rows={a.sourcePerf.map((s) => ({ ...s, id: s.name }))} columns={[
              { key: 's', header: 'Source', cell: (s) => <span className="font-medium">{s.name}</span> },
              { key: 'l', header: 'Leads', align: 'right', cell: (s) => s.leads, sort: (s) => s.leads },
              { key: 'q', header: 'Qualified', align: 'right', cell: (s) => s.qualified },
              { key: 'w', header: 'Clients won', align: 'right', cell: (s) => s.won },
              { key: 'c', header: 'Marketing cost', align: 'right', cell: (s) => (s.cost ? money(s.cost, 'XAF') : '—') },
              { key: 'r', header: 'Revenue', align: 'right', cell: (s) => (s.revenue ? money(s.revenue, 'XAF') : '—'), sort: (s) => s.revenue },
              { key: 'roi', header: 'ROI', align: 'right', cell: (s) => (s.roi ? <Badge tone={s.roi >= 3 ? 'success' : 'gold'}>{s.roi.toFixed(1)}×</Badge> : '—') },
            ]} />
          </div>
        </Section>
      )}

      {tab === 'funding' && <FundingReport />}
    </div>
  );
}

function FundingReport() {
  const { state } = useApp();
  const fa = fundingAnalytics(state.funders, state.fundingOpportunities, state.fundingApplications, state.fundingAppDocuments, state.fundingOutcomes);
  const openStatuses = ['Rejected', 'Withdrawn', 'Expired', 'Not Eligible', 'Archived'];
  const upcoming = state.fundingOpportunities.filter((o) => !openStatuses.includes(o.status) && deadlineInfo(o.deadline).daysRemaining >= 0)
    .sort((a, b) => (a.deadline < b.deadline ? -1 : 1)).slice(0, 6);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <KpiCard dense label="Funding pipeline" value={usd(fa.pipelineValue)} />
        <KpiCard dense label="Requested" value={usd(fa.fundingRequested)} />
        <KpiCard dense label="Secured" value={usd(fa.fundingSecured)} tone={fa.fundingSecured > 0 ? 'success' : 'neutral'} />
        <KpiCard dense label="Success rate" value={`${fa.successRate}%`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Funding value by funder"><BarViz data={fa.byFunder} series={[{ key: 'value', name: 'Pipeline', color: VIZ[0] }]} horizontal fmt={usd} /></Section>
        <Section title="Opportunities by status"><DonutViz data={fa.byStatus} fmt={(v) => `${v}`} /></Section>
      </div>
      <Section title="Upcoming funding deadlines" flush>
        <DataTable rows={upcoming}
          columns={[
            { key: 'n', header: 'Opportunity', cell: (o) => <span className="font-medium">{o.name}</span> },
            { key: 'f', header: 'Funder', cell: (o) => <span className="text-muted-foreground">{state.funders.find((x) => x.id === o.funderId)?.name}</span>, hideBelow: 'md' },
            { key: 'v', header: 'Value', align: 'right', cell: (o) => <span className="tnum">{usd(o.estimatedValue)}</span> },
            { key: 'd', header: 'Deadline', cell: (o) => <span className={cn('tnum', deadlineInfo(o.deadline).tone === 'danger' ? 'text-danger' : deadlineInfo(o.deadline).tone === 'warning' ? 'text-warning' : 'text-muted-foreground')}>{fmtDate(o.deadline)} · {deadlineInfo(o.deadline).label}</span> },
          ]} />
      </Section>
    </div>
  );
}

// ===========================================================================
import { topCrossSell } from '@/lib/crosssell';
import { forecast } from '@/lib/forecast';

export function Management() {
  const { state, dispatch, user, userById } = useApp();
  const a = useAnalytics();
  const [sel, setSel] = useState(state.meetings[state.meetings.length - 1]?.id ?? '');
  const meeting = state.meetings.find((m) => m.id === sel) ?? state.meetings[state.meetings.length - 1];
  const isDraft = meeting?.status === 'Draft';

  // Carry-over actions from prior meetings
  const openActions = state.meetings.flatMap((m) => m.actions.filter((ac) => ac.status !== 'Completed').map((ac) => ({ ...ac, from: m.period })));

  const numbers = {
    leads: state.leads.filter((l) => l.created.startsWith('2026-08')).length + 6,
    qualified: state.leads.filter((l) => !['New', 'Contacted', 'Lost', 'Nurture'].includes(l.status)).length,
    opportunities: a.openOpps.length,
    pipeline: a.pipelineValue,
    proposals: state.proposals.filter((p) => p.sent?.startsWith('2026-08') || p.status === 'Sent').length,
    won: a.wonOpps.length,
    lost: a.lostOpps.length,
    newClients: 2, activeClients: a.clients.length,
    activeProjects: a.activeProjects.length, completed: state.projects.filter((p) => p.status === 'Completed').length,
    delayed: a.atRisk.length,
    revenue: a.monthly[7].collected, outstanding: a.outstanding, overdue: a.overdueValue,
    expenses: a.expenseTotal, enrolments: a.academy.enrolled, certificates: a.academy.certificates,
  };

  const fundNumbers = fundingAnalytics(state.funders, state.fundingOpportunities, state.fundingApplications, state.fundingAppDocuments, state.fundingOutcomes);

  if (!meeting) {
    return (
      <div className="enter-up">
        <PageHeader title="Monthly Management Review" subtitle="Board-grade operating review." />
        <EmptyState title="No management reviews yet" detail="Management review periods will appear here once created." />
      </div>
    );
  }

  return (
    <div className="enter-up">
      <PageHeader title="Monthly management review"
        subtitle="The recurring management pack. Numbers are pulled straight from CRM records; the narrative is drafted for review, never fabricated."
        meta={<><Badge tone={isDraft ? 'gold' : 'success'} dot>{meeting.period} · {meeting.status}</Badge></>}
        actions={<>
          <Select value={sel} onChange={(e) => setSel(e.target.value)} className="h-8 w-auto py-0 text-[12px]">
            {state.meetings.map((m) => <option key={m.id} value={m.id}>{m.period}</option>)}
          </Select>
          <Button variant="outline"><Download className="size-3.5" />Export pack</Button>
          {isDraft && <Button onClick={() => dispatch({ type: 'patch', collection: 'meetings', id: meeting.id, changes: { status: 'Final' } })}>Finalise report</Button>}
        </>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Section title="Sales" flush>
            <div className="grid grid-cols-2 divide-x divide-y divide-border border-t border-border sm:grid-cols-4 sm:divide-y-0">
              {[['Leads', numbers.leads], ['Qualified', numbers.qualified], ['Opportunities', numbers.opportunities], ['Pipeline', usd(numbers.pipeline)], ['Proposals', numbers.proposals], ['Won', numbers.won], ['Lost', numbers.lost], ['Win rate', `${a.winRate.toFixed(0)}%`]].map(([l, v]) => (
                <div key={l as string} className="px-4 py-3"><p className="text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{l}</p><p className="tnum mt-1 font-display text-[17px] font-semibold">{v}</p></div>
              ))}
            </div>
          </Section>

          <div className="grid gap-4 sm:grid-cols-3">
            <Section title="Clients" flush>
              {[['New clients', numbers.newClients], ['Active', numbers.activeClients], ['At risk', a.atRisk.length]].map(([l, v]) => (
                <div key={l as string} className="flex items-center justify-between border-b border-border px-4 py-2.5 last:border-0 text-[12.5px]"><span className="text-muted-foreground">{l}</span><span className="tnum font-medium">{v}</span></div>
              ))}
            </Section>
            <Section title="Delivery" flush>
              {[['Active', numbers.activeProjects], ['Completed', numbers.completed], ['Delayed', numbers.delayed]].map(([l, v]) => (
                <div key={l as string} className="flex items-center justify-between border-b border-border px-4 py-2.5 last:border-0 text-[12.5px]"><span className="text-muted-foreground">{l}</span><span className="tnum font-medium">{v}</span></div>
              ))}
            </Section>
            <Section title="Academy" flush>
              {[['Enrolments', numbers.enrolments], ['Certificates', numbers.certificates], ['Completion', `${a.academy.completionRate.toFixed(0)}%`]].map(([l, v]) => (
                <div key={l as string} className="flex items-center justify-between border-b border-border px-4 py-2.5 last:border-0 text-[12.5px]"><span className="text-muted-foreground">{l}</span><span className="tnum font-medium">{v}</span></div>
              ))}
            </Section>
          </div>

          <Section title="Finance" flush>
            <div className="grid grid-cols-2 divide-x divide-border border-t border-border sm:grid-cols-4">
              {[['Revenue', usd(numbers.revenue)], ['Outstanding', usd(numbers.outstanding)], ['Overdue', usd(numbers.overdue)], ['Expenses', usd(numbers.expenses)]].map(([l, v]) => (
                <div key={l as string} className="px-4 py-3"><p className="text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{l}</p><p className="tnum mt-1 font-display text-[17px] font-semibold">{v}</p></div>
              ))}
            </div>
            <div className="p-4"><BarViz height={200} data={a.monthlyToDate.slice(-6)} series={[{ key: 'collected', name: 'Collected' }, { key: 'target', name: 'Target', color: 'hsl(48 14% 80%)' }]} fmt={usd} /></div>
          </Section>

          <Section title="Funding & business intelligence" description="Funding pipeline for the review" flush>
            <div className="grid grid-cols-2 divide-x divide-border border-t border-border sm:grid-cols-4">
              {[['Pipeline', usd(fundNumbers.pipelineValue)], ['Requested', usd(fundNumbers.fundingRequested)], ['Secured', usd(fundNumbers.fundingSecured)], ['Success', `${fundNumbers.successRate}%`]].map(([l, v]) => (
                <div key={l as string} className="px-4 py-3"><p className="text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{l}</p><p className="tnum mt-1 font-display text-[17px] font-semibold">{v}</p></div>
              ))}
            </div>
            <div className="grid grid-cols-2 divide-x divide-border border-t border-border sm:grid-cols-4">
              {[['Applications active', String(fundNumbers.applicationsInProgress)], ['Submitted', String(fundNumbers.applicationsSubmitted)], ['Due this month', String(fundNumbers.dueThisMonth)], ['Missing docs', String(fundNumbers.missingDocs)]].map(([l, v]) => (
                <div key={l as string} className="px-4 py-3"><p className="text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{l}</p><p className="tnum mt-1 font-display text-[15px] font-semibold">{v}</p></div>
              ))}
            </div>
          </Section>

          <Section title="Management narrative" description="Drafted for the meeting — numbers above are the source of truth">
            {meeting.narrative ? (
              <p className="prose-editorial">{meeting.narrative}</p>
            ) : (
              <div>
                <p className="prose-editorial">
                  August closed with collected revenue of <strong>{usd(numbers.revenue)}</strong> against a <strong>{usd(a.monthly[7].target)}</strong> target. The weighted pipeline stands at <strong>{usd(a.weightedPipeline)}</strong>, still concentrated in EUDR-led work — the Bamenda Timber engagement is close to signature and would deepen that concentration further. On the downside, <strong>{a.overdueCount} invoices are overdue</strong>, led by the Zanzibar balance, and the Export Readiness Assessment remains blocked awaiting client documents.
                </p>
                <p className="mt-2 text-[11.5px] italic text-muted-foreground">Draft narrative generated from the figures above for review. Edit before finalising.</p>
              </div>
            )}
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Action tracking" description="Open actions carry into the next review" flush>
            <ul className="divide-y divide-border/70">
              {openActions.map((ac) => (
                <li key={ac.id} className="px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <Circle className="mt-0.5 size-3.5 shrink-0 text-warning" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-medium leading-snug">{ac.action}</p>
                      <p className="mt-0.5 text-[11.5px] text-muted-foreground">{ac.decision}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge tone={ac.priority === 'High' ? 'danger' : 'gold'}>{ac.priority}</Badge>
                        <Badge tone="muted">from {ac.from}</Badge>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Avatar size="xs" name={userById(ac.owner)?.name} />due {fmtDate(ac.deadline)}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {!openActions.length && <li><EmptyState title="No open actions" detail="Every action from prior reviews is complete." /></li>}
            </ul>
          </Section>

          <Section title="Prior decisions" flush>
            <ul className="divide-y divide-border/70">
              {state.meetings.flatMap((m) => m.actions.filter((ac) => ac.status === 'Completed')).map((ac) => (
                <li key={ac.id} className="flex items-start gap-2.5 px-4 py-2.5">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                  <div><p className="text-[12.5px] leading-snug">{ac.action}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{ac.notes}</p></div>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
export function Settings() {
  const { state, dispatch, toast } = useApp();
  const [tab, setTab] = useState('company');
  const s = state.settings;
  const [company, setCompany] = useState({ name: s.company.name, tagline: s.company.tagline, regNumber: s.company.regNumber, vat: s.company.vat, address: s.company.address, email: s.company.email, phone: s.company.phone });
  const saveCompany = () => {
    dispatch({ type: 'patchSettings', section: 'company', changes: company });
    dispatch({ type: 'audit', entry: { user: state.users[0]?.id ?? 'USR-01', action: 'Company profile updated', record: 'settings.company', detail: company.name } });
    toast('Company profile saved.', 'success');
  };
  const [finance, setFinance] = useState({ invoicePrefix: s.finance.invoicePrefix, proposalPrefix: s.finance.proposalPrefix, contractPrefix: s.finance.contractPrefix, defaultTerms: s.finance.defaultTerms, taxRate: s.finance.taxRate, bank: s.finance.bank });
  const saveFinance = () => {
    dispatch({ type: 'patchSettings', section: 'finance', changes: { ...finance, taxRate: Number(finance.taxRate) || 0 } });
    dispatch({ type: 'audit', entry: { user: state.users[0]?.id ?? 'USR-01', action: 'Finance settings updated', record: 'settings.finance', detail: `tax ${finance.taxRate}% · ${finance.invoicePrefix}` } });
    toast('Finance settings saved.', 'success');
  };

  return (
    <div className="enter-up">
      <PageHeader title="Settings"
        subtitle="Firm configuration — branding, finance, users, roles, services, scoring and the audit trail." />

      <Tabs active={tab} onChange={setTab} className="mb-4" tabs={[
        { id: 'company', label: 'Company' }, { id: 'finance', label: 'Finance' },
        { id: 'users', label: 'Users & roles' }, { id: 'scoring', label: 'Lead scoring' },
        { id: 'automation', label: 'Automation' }, { id: 'audit', label: 'Audit log' },
      ]} />

      {tab === 'company' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Company profile">
            <div className="grid gap-3">
              <Field label="Legal name"><Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></Field>
              <Field label="Positioning"><Input value={company.tagline} onChange={(e) => setCompany({ ...company, tagline: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Registration"><Input value={company.regNumber} onChange={(e) => setCompany({ ...company, regNumber: e.target.value })} /></Field>
                <Field label="VAT number"><Input value={company.vat} onChange={(e) => setCompany({ ...company, vat: e.target.value })} /></Field>
              </div>
              <Field label="Address"><Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email"><Input value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} /></Field>
                <Field label="Phone"><Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} /></Field>
              </div>
              <Button className="w-fit" onClick={saveCompany}>Save changes</Button>
            </div>
          </Section>
          <Section title="Branding">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Brand palette</p>
                <div className="flex flex-wrap gap-2">
                  {[['Navy', 'hsl(219 62% 17%)'], ['Gold', 'hsl(41 58% 45%)'], ['Ink', 'hsl(222 45% 11%)'], ['Ivory', 'hsl(220 30% 97%)']].map(([n, c]) => (
                    <div key={n} className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5">
                      <span className="size-5 rounded" style={{ background: c }} />
                      <span className="text-[12px]">{n}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Typography</p>
                <div className="space-y-1.5 text-[12.5px]">
                  <p><span className="text-muted-foreground">Display:</span> <span className="font-display">Poppins</span></p>
                  <p><span className="text-muted-foreground">Interface:</span> IBM Plex Sans</p>
                  <p><span className="text-muted-foreground">Editorial:</span> <span className="font-serif">Lora</span></p>
                </div>
              </div>
              <div className="panel-flat bg-secondary/40 p-4 text-center">
                <p className="font-display text-[18px] font-semibold text-forest">BALIA Consulting</p>
                <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.13em] text-muted-foreground">International Trade, Customs & Market Entry Advisory</p>
              </div>
            </div>
          </Section>
        </div>
      )}

      {tab === 'finance' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Numbering & tax">
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Invoice prefix"><Input value={finance.invoicePrefix} onChange={(e) => setFinance({ ...finance, invoicePrefix: e.target.value })} /></Field>
                <Field label="Next invoice number"><Input type="number" value={state.counters.invoice} readOnly title="Auto-incremented as invoices are created" /></Field>
                <Field label="Proposal prefix"><Input value={finance.proposalPrefix} onChange={(e) => setFinance({ ...finance, proposalPrefix: e.target.value })} /></Field>
                <Field label="Contract prefix"><Input value={finance.contractPrefix} onChange={(e) => setFinance({ ...finance, contractPrefix: e.target.value })} /></Field>
                <Field label="Default terms"><Input value={finance.defaultTerms} onChange={(e) => setFinance({ ...finance, defaultTerms: e.target.value })} /></Field>
                <Field label="Tax rate (%)"><Input type="number" value={finance.taxRate} onChange={(e) => setFinance({ ...finance, taxRate: e.target.value as unknown as number })} /></Field>
              </div>
              <Field label="Bank details"><Input value={finance.bank} onChange={(e) => setFinance({ ...finance, bank: e.target.value })} /></Field>
              <Button className="w-fit" onClick={saveFinance}>Save finance settings</Button>
            </div>
          </Section>
          <Section title="Payment reminder schedule" description="Applied to every unpaid invoice" flush>
            <ul className="divide-y divide-border">
              {s.reminders.map((r) => (
                <li key={r.at} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-[12.5px] font-medium">{r.at < 0 ? `${Math.abs(r.at)} days before due` : r.at === 0 ? 'On due date' : `${r.at} days overdue`}</p>
                    <p className="text-[11.5px] text-muted-foreground">{r.label}</p>
                  </div>
                  <Badge tone={r.channel === 'Internal' ? 'warning' : 'muted'}>{r.channel}</Badge>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      {tab === 'users' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Users" flush>
            <UsersList />
          </Section>
          <Section title="Roles & permissions" flush>
            <ul className="divide-y divide-border">
              {ROLES.map((r) => (
                <li key={r.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium">{r.name}</p>
                    <Badge tone="muted">{r.permissions.includes('*') ? 'All' : r.permissions.length} permissions</Badge>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{r.blurb}</p>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}

      {tab === 'scoring' && <ScoringSettings />}

      {tab === 'automation' && (
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { trigger: 'New lead', actions: ['Assign owner', 'Create follow-up task', 'Send acknowledgement', 'Add to pipeline'] },
            { trigger: 'Consultation completed', actions: ['Create opportunity', 'Recommend a service', 'Create follow-up task'] },
            { trigger: 'Proposal sent', actions: ['Set 3-day follow-up', 'Track viewed status', 'Notify owner'] },
            { trigger: 'Proposal accepted', actions: ['Convert company to client', 'Create project', 'Generate contract', 'Create onboarding tasks', 'Request documents'] },
            { trigger: 'Document expiring', actions: ['Notify consultant at 30 days', 'Notify consultant and client at 7 days'] },
            { trigger: 'Invoice overdue', actions: ['Notify finance', 'Notify account owner', 'Raise dashboard alert'] },
            { trigger: 'Project completed', actions: ['Request client feedback', 'Suggest follow-on opportunity', 'Create follow-up task'] },
            { trigger: 'Recurring schedule due', actions: ['Generate next invoice', 'Advance next run date'] },
          ].map((rule) => (
            <div key={rule.trigger} className="panel p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[13px] font-medium">{rule.trigger}</p>
                <Badge tone="success" dot>Active</Badge>
              </div>
              <ul className="space-y-1">
                {rule.actions.map((ac, i) => (
                  <li key={ac} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <ArrowRight className="size-3 shrink-0 text-forest" />{ac}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab === 'audit' && (
        <Section flush title="Audit log" description="Every material action, with the user and timestamp against it">
          <DataTable rows={state.audit} columns={[
            { key: 't', header: 'When', cell: (e) => <span className="tnum text-muted-foreground">{fmtDateTime(e.at)}</span>, sort: (e) => e.at },
            { key: 'u', header: 'User', cell: (e) => <span className="font-medium">{e.user}</span> },
            { key: 'a', header: 'Action', cell: (e) => <Badge tone="muted">{e.action}</Badge> },
            { key: 'r', header: 'Record', cell: (e) => <span className="font-mono text-[12px]">{e.record}</span>, hideBelow: 'md' },
            { key: 'd', header: 'Detail', cell: (e) => <span className="text-muted-foreground">{e.detail}</span>, hideBelow: 'lg' },
            { key: 'ip', header: 'IP', cell: (e) => <span className="tnum text-muted-foreground">{e.ip}</span>, hideBelow: 'lg' },
          ]} />
        </Section>
      )}
    </div>
  );
}

function UsersList() {
  const { users, userById } = useApp();
  return (
    <ul className="divide-y divide-border">
      {users.map((u) => (
        <li key={u.id} className="flex items-center gap-3 px-4 py-3">
          <Avatar size="md" name={u.name} initials={u.initials} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium">{u.name}</p>
            <p className="text-[11.5px] text-muted-foreground">{u.title} · {u.email}</p>
          </div>
          <div className="text-right">
            <Badge tone="muted">{ROLES.find((r) => r.id === u.role)?.name}</Badge>
            <p className="mt-1 text-[10.5px] text-muted-foreground">Last seen {fmtDateTime(u.lastLogin)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ScoringSettings() {
  const { state, dispatch, toast } = useApp();
  const [rules, setRules] = useState(state.scoreRules);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Section title="Lead scoring rules" description="Points contributed by each qualification signal">
        <ul className="space-y-2">
          {rules.map((r) => (
            <li key={r.id} className="flex items-center gap-3">
              <input type="checkbox" checked={r.active} onChange={() => setRules(rules.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)))} className="size-3.5 accent-[hsl(var(--forest))]" />
              <span className="flex-1 text-[13px]">{r.label}</span>
              <Input type="number" value={r.points} onChange={(e) => setRules(rules.map((x) => (x.id === r.id ? { ...x, points: Number(e.target.value) } : x)))} className="w-16 text-right" />
            </li>
          ))}
        </ul>
        <Button className="mt-4" onClick={() => { dispatch({ type: 'setScoreRules', rules }); toast('Scoring rules updated. Lead scores recalculate immediately.'); }}>Save rules</Button>
      </Section>
      <Section title="Score bands">
        <ul className="space-y-2.5">
          {[['81–100', 'Very Hot', 'danger'], ['61–80', 'Hot', 'warning'], ['31–60', 'Warm', 'gold'], ['0–30', 'Cold', 'muted']].map(([range, label, tone]) => (
            <li key={label} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <div className="flex items-center gap-2.5"><Badge tone={tone as any} dot>{label}</Badge><span className="tnum text-[12.5px] text-muted-foreground">{range}</span></div>
              {label === 'Very Hot' || label === 'Hot' ? <span className="text-[11.5px] font-medium text-danger">Follow up within 24h</span> : null}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
          The maximum possible score is capped at 100. Changing the point values or toggling a rule recalculates every lead's score across the board.
        </p>
      </Section>
    </div>
  );
}
