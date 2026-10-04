import React, { useState } from 'react';
import {
  AlertTriangle, ArrowRight, CalendarClock, CheckSquare, Clock, TrendingUp, Filter, Download,
} from 'lucide-react';
import { useApp, useAlerts } from '@/store';
import { useAnalytics } from '@/lib/analytics';
import { SERVICES, COUNTRIES, scoreBand, readinessBand, ASSESSMENT_DIMENSIONS } from '@/data/catalog';
import {
  KpiCard, PageHeader, Section, Badge, Button, StatusBadge, Progress, Avatar, Tabs, Select, Field, EmptyState, DataTable,
} from '@/components/kit';
import { AreaViz, BarViz, DonutViz, LineViz, FunnelViz, RadarViz, VIZ } from '@/components/charts';
import { money, fmtDate, relativeDays, daysFromToday, projectProgress, projectHealth, invoiceTotals, assessmentScore } from '@/lib/derive';
import { cn } from '@/lib/utils';

const usd = (v: number) => money(v, 'XAF', true);

// ===========================================================================
export function Dashboard() {
  const { state, setModule, user, userById } = useApp();
  const a = useAnalytics();
  const alerts = useAlerts();
  const [alertFilter, setAlertFilter] = useState('All');

  const myTasks = state.tasks
    .filter((t) => t.assignee === user.id && !['Completed', 'Cancelled'].includes(t.status))
    .sort((x, y) => daysFromToday(x.due) - daysFromToday(y.due));
  const todayEvents = state.events.filter((e) => daysFromToday(e.date) >= 0 && daysFromToday(e.date) <= 7);
  const cats = ['All', ...Array.from(new Set(alerts.map((x) => x.category)))];
  const shown = alerts.filter((x) => alertFilter === 'All' || x.category === alertFilter);

  const mtdTarget = a.monthly[8].target;
  const trend = a.monthly[7].collected ? ((a.mtdRevenue - a.monthly[7].collected) / a.monthly[7].collected) * 100 : 0;

  return (
    <div className="enter-up">
      <PageHeader
        title={`Good morning, ${user.name.split(' ')[0]}`}
        subtitle="Eight items need a decision today. The EUDR programme and the Zanzibar document blockage are the two that move money."
        meta={<>
          <Badge tone="muted" dot>Tuesday 8 September 2026</Badge>
          <Badge tone={a.overdueCount ? 'danger' : 'success'} dot>{a.overdueCount} overdue invoices</Badge>
          <Badge tone={a.overdueTasks.length ? 'warning' : 'success'} dot>{a.overdueTasks.length} overdue tasks</Badge>
        </>}
        actions={<>
          <Button variant="outline" onClick={() => setModule('analytics')}><TrendingUp className="size-3.5" />Visualiser</Button>
          <Button onClick={() => setModule('reports')}>Monthly report</Button>
        </>}
      />

      {/* KPI band */}
      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Weighted pipeline" value={usd(a.weightedPipeline)} sub={`${a.openOpps.length} open opportunities`} onClick={() => setModule('opportunities')} />
        <KpiCard label="Month to date" value={usd(a.mtdRevenue)} trend={trend} sub={`of ${usd(mtdTarget)} target`} onClick={() => setModule('reports')} />
        <KpiCard label="Year to date" value={usd(a.ytdRevenue)} sub="collected, all currencies" onClick={() => setModule('reports')} />
        <KpiCard label="Outstanding" value={usd(a.outstanding)} tone={a.outstanding > 20000 ? 'warning' : 'neutral'} sub={`${a.overdueCount} overdue`} onClick={() => setModule('invoices')} />
        <KpiCard label="Active clients" value={a.clients.length} sub={`${state.companies.filter((c) => c.status === 'Prospect').length} prospects`} onClick={() => setModule('clients')} />
        <KpiCard label="Projects at risk" value={a.atRisk.length} tone={a.atRisk.length ? 'danger' : 'success'} sub={`of ${a.activeProjects.length} active`} onClick={() => setModule('projects')} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard dense label="Total leads" value={state.leads.length} sub={`${a.hotLeads.length} hot`} onClick={() => setModule('leads')} />
        <KpiCard dense label="Qualified leads" value={state.leads.filter((l) => !['New', 'Contacted', 'Lost', 'Nurture'].includes(l.status)).length} onClick={() => setModule('leads')} />
        <KpiCard dense label="Open proposals" value={state.proposals.filter((p) => ['Sent', 'Viewed', 'Changes Requested', 'Draft'].includes(p.status)).length} sub={usd(state.proposals.filter((p) => ['Sent', 'Viewed', 'Changes Requested'].includes(p.status)).reduce((s, p) => s + p.services.reduce((x, i) => x + i.qty * i.rate, 0), 0))} onClick={() => setModule('proposals')} />
        <KpiCard dense label="Recurring revenue" value={usd(a.recurringRevenue)} sub="annualised retainers" onClick={() => setModule('invoices')} />
        <KpiCard dense label="Win rate" value={`${a.winRate.toFixed(0)}%`} sub={`avg deal ${usd(a.avgDealSize)}`} onClick={() => setModule('reports')} />
        <KpiCard dense label="Overdue tasks" value={a.overdueTasks.length} tone={a.overdueTasks.length ? 'warning' : 'success'} onClick={() => setModule('tasks')} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Alerts */}
        <Section
          className="xl:col-span-2"
          title="What needs attention"
          description="Exceptions surfaced automatically from live records"
          actions={
            <Select value={alertFilter} onChange={(e) => setAlertFilter(e.target.value)} className="h-7 w-auto py-0 text-[12px]">
              {cats.map((c) => <option key={c}>{c}</option>)}
            </Select>
          }
          flush
        >
          {shown.length === 0 ? (
            <EmptyState title="Nothing outstanding in this category" detail="Alerts appear here as invoices age, documents expire and projects drift." />
          ) : (
            <ul className="divide-y divide-border/70">
              {shown.slice(0, 9).map((al) => (
                <li key={al.id}>
                  <button onClick={() => setModule(al.module, al.recordId)}
                    className="group flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-secondary/60">
                    <span className={cn('mt-1 flex size-5 shrink-0 items-center justify-center rounded-full',
                      al.severity === 'danger' ? 'bg-danger-soft text-danger' : al.severity === 'warning' ? 'bg-warning-soft text-warning' : 'bg-info-soft text-info')}>
                      <AlertTriangle className="size-3" strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium leading-snug text-foreground">{al.title}</span>
                      <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">{al.detail}</span>
                    </span>
                    <Badge tone="muted" className="mt-0.5 shrink-0">{al.category}</Badge>
                    <ArrowRight className="mt-1 size-3.5 shrink-0 text-transparent transition-colors group-hover:text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {shown.length > 9 && (
            <div className="border-t border-border px-4 py-2 text-center">
              <span className="text-[12px] text-muted-foreground">{shown.length - 9} more exceptions</span>
            </div>
          )}
        </Section>

        {/* Today */}
        <div className="space-y-4">
          <Section title="Your day" flush>
            <ul className="divide-y divide-border/70">
              {todayEvents.slice(0, 4).map((e) => (
                <li key={e.id} className="flex gap-3 px-4 py-2.5">
                  <span className="flex w-11 shrink-0 flex-col items-center rounded border border-border bg-secondary/60 py-1">
                    <span className="text-[9.5px] uppercase tracking-wide text-muted-foreground">{fmtDate(e.date, 'day').split(' ')[0]}</span>
                    <span className="tnum font-display text-[15px] font-semibold leading-none">{new Date(`${e.date}T00:00`).getDate()}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium">{e.title}</span>
                    <span className="mt-0.5 block text-[11.5px] text-muted-foreground">{e.time} · {e.location}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-border p-2">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setModule('calendar')}>Open calendar</Button>
            </div>
          </Section>

          <Section title={`Your tasks (${myTasks.length})`} flush>
            <ul className="divide-y divide-border/70">
              {myTasks.slice(0, 5).map((t) => {
                const late = daysFromToday(t.due) < 0;
                return (
                  <li key={t.id}>
                    <button onClick={() => setModule('tasks', t.id)} className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-secondary/60">
                      <CheckSquare className={cn('mt-0.5 size-3.5 shrink-0', late ? 'text-danger' : 'text-muted-foreground')} strokeWidth={1.8} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-medium">{t.name}</span>
                        <span className={cn('mt-0.5 block text-[11.5px]', late ? 'font-medium text-danger' : 'text-muted-foreground')}>{relativeDays(t.due)}</span>
                      </span>
                      <StatusBadge status={t.status} dot={false} />
                    </button>
                  </li>
                );
              })}
              {myTasks.length === 0 && <li className="px-4 py-6 text-center text-[12.5px] text-muted-foreground">Nothing assigned to you.</li>}
            </ul>
          </Section>
        </div>
      </div>

      {/* Charts row */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Section className="lg:col-span-2" title="Revenue against target" description="Collected against invoiced, all currencies converted to XAF">
          <AreaViz
            data={a.monthlyToDate}
            series={[{ key: 'collected', name: 'Collected', color: VIZ[0] }, { key: 'invoiced', name: 'Invoiced', color: VIZ[1] }]}
            fmt={(v) => usd(v)} height={230}
          />
        </Section>
        <Section title="Pipeline by stage" description={`${usd(a.pipelineValue)} gross · ${usd(a.weightedPipeline)} weighted`}>
          <div className="space-y-3">
            {a.stageBoard.map((s, i) => (
              <button key={s.name} onClick={() => setModule('opportunities')} className="group block w-full text-left">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12.5px] font-medium text-foreground group-hover:text-forest">{s.name}</span>
                  <span className="tnum text-[12px] text-muted-foreground">{s.count} · {usd(s.value)}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-sm bg-secondary">
                  <div className="h-full rounded-sm transition-[width] duration-500" style={{ width: `${(s.value / Math.max(1, a.pipelineValue)) * 100}%`, background: VIZ[i] }} />
                </div>
              </button>
            ))}
            <div className="border-t border-border pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] text-muted-foreground">Weighted forecast</span>
                <span className="tnum font-display text-[17px] font-semibold">{usd(a.weightedPipeline)}</span>
              </div>
            </div>
          </div>
        </Section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Section title="Revenue by service line" flush>
          <div className="px-2 pt-3">
            <DonutViz data={a.revenueByService.slice(0, 5)} fmt={(v) => usd(v)} height={215}
              centerValue={usd(a.revenueCollected)} centerLabel="collected"
              onClick={() => setModule('reports')} />
          </div>
        </Section>
        <Section title="Delivery health" description="Active engagements and where they stand" flush>
          <ul className="divide-y divide-border/70">
            {a.activeProjects.slice(0, 5).map((p) => {
              const h = projectHealth(p);
              return (
                <li key={p.id}>
                  <button onClick={() => setModule('projects', p.id)} className="w-full px-4 py-2.5 text-left transition-colors hover:bg-secondary/60">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[12.5px] font-medium">{p.name}</span>
                      <Badge tone={h.tone} dot>{h.label}</Badge>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Progress value={projectProgress(p)} tone={h.tone === 'danger' ? 'danger' : 'forest'} size="sm" />
                      <span className="tnum w-8 text-right text-[11px] text-muted-foreground">{projectProgress(p)}%</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
        <Section title="Client portfolio" description="By country" flush>
          <div className="p-3">
            <BarViz data={a.clientsByCountry.slice(0, 6)} series={[{ key: 'value', name: 'Companies' }]} horizontal height={205} />
          </div>
        </Section>
      </div>
    </div>
  );
}

// ===========================================================================
export function Analytics() {
  const { state, setModule } = useApp();
  const [tab, setTab] = useState('revenue');
  const [filters, setFilters] = useState<{ country?: string; service?: string; consultant?: string; company?: string; industry?: string }>({});
  const a = useAnalytics(filters);

  const consultants = [
    { id: 'USR-01', name: 'Cornelius Dzekashu' }, { id: 'USR-02', name: 'Aminata Diallo' },
    { id: 'USR-03', name: 'Serge Nkeng' }, { id: 'USR-05', name: 'Yannick Ebodé' },
  ];
  const set = (k: string, v: string) => setFilters((f) => ({ ...f, [k]: v || undefined }));
  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  const tabs = [
    { id: 'revenue', label: 'Revenue' }, { id: 'sales', label: 'Sales' },
    { id: 'sources', label: 'Lead sources' }, { id: 'clients', label: 'Portfolio' },
    { id: 'delivery', label: 'Delivery' }, { id: 'productivity', label: 'Productivity' },
    { id: 'readiness', label: 'Trade readiness' }, { id: 'academy', label: 'Academy' },
  ];

  return (
    <div className="enter-up">
      <PageHeader
        title="Executive visualiser"
        subtitle="Every chart filters against the same record set. Click a segment to drill through to the underlying records."
        actions={<Button variant="outline"><Download className="size-3.5" />Export dashboard</Button>}
      />

      <div className="panel mb-4 p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">
          <Filter className="size-3" />Global filters
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={filters.country ?? ''} onChange={(e) => set('country', e.target.value)}>
            <option value="">All countries</option>
            {Array.from(new Set(state.companies.map((c) => c.country))).map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Select value={filters.service ?? ''} onChange={(e) => set('service', e.target.value)}>
            <option value="">All services</option>
            {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select value={filters.consultant ?? ''} onChange={(e) => set('consultant', e.target.value)}>
            <option value="">All consultants</option>
            {consultants.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select value={filters.company ?? ''} onChange={(e) => set('company', e.target.value)}>
            <option value="">All clients</option>
            {state.companies.map((c) => <option key={c.id} value={c.id}>{c.tradingName}</option>)}
          </Select>
          <Select value={filters.industry ?? ''} onChange={(e) => set('industry', e.target.value)}>
            <option value="">All industries</option>
            {Array.from(new Set(state.companies.map((c) => c.industry))).map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
        {activeFilters.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-border pt-2.5">
            {activeFilters.map(([k, v]) => (
              <Badge key={k} tone="forest">{k}: {SERVICES.find((s) => s.id === v)?.name ?? state.companies.find((c) => c.id === v)?.tradingName ?? consultants.find((c) => c.id === v)?.name ?? v}</Badge>
            ))}
            <button onClick={() => setFilters({})} className="text-[11.5px] text-muted-foreground underline-offset-2 hover:text-forest hover:underline">Clear all</button>
          </div>
        )}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-4" />

      {tab === 'revenue' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section className="lg:col-span-2" title="Monthly revenue against target">
            <BarViz data={a.monthly} series={[{ key: 'collected', name: 'Collected', color: VIZ[0] }, { key: 'target', name: 'Target', color: 'hsl(48 14% 84%)' }]} fmt={usd} height={250} />
          </Section>
          <Section title="Quarterly performance">
            <BarViz data={a.quarterly} series={[{ key: 'collected', name: 'Collected' }, { key: 'target', name: 'Target', color: 'hsl(48 14% 84%)' }]} fmt={usd} height={220} />
          </Section>
          <Section title="Revenue by country">
            <BarViz data={a.revenueByCountry} series={[{ key: 'value', name: 'Collected' }]} horizontal fmt={usd} height={220} />
          </Section>
          <Section title="Revenue by service line">
            <DonutViz data={a.revenueByService} fmt={usd} height={230} onClick={() => setModule('reports')} />
          </Section>
          <Section title="Revenue by consultant">
            <BarViz data={a.revenueByConsultant} series={[{ key: 'value', name: 'Collected' }]} horizontal fmt={usd} height={230} />
          </Section>
          <Section title="Revenue by client" className="lg:col-span-2">
            <BarViz data={a.revenueByClient} series={[{ key: 'value', name: 'Collected' }]} fmt={usd} height={210} />
          </Section>
        </div>
      )}

      {tab === 'sales' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Sales funnel" description="Lead → Qualified → Consultation → Proposal → Negotiation → Won">
            <FunnelViz data={a.funnel} height={250} />
          </Section>
          <Section title="Pipeline value by stage">
            <BarViz data={a.stageBoard} series={[{ key: 'value', name: 'Gross' }, { key: 'weighted', name: 'Weighted', color: VIZ[1] }]} fmt={usd} height={250} />
          </Section>
          <Section title="Pipeline metrics" className="lg:col-span-2" flush>
            <div className="grid grid-cols-2 divide-x divide-border border-b border-border md:grid-cols-3 lg:grid-cols-6">
              {[
                { l: 'Pipeline value', v: usd(a.pipelineValue) },
                { l: 'Weighted', v: usd(a.weightedPipeline) },
                { l: 'Win rate', v: `${a.winRate.toFixed(0)}%` },
                { l: 'Average deal', v: usd(a.avgDealSize) },
                { l: 'Open opportunities', v: String(a.openOpps.length) },
                { l: 'Sales cycle', v: '54 days' },
              ].map((m) => (
                <div key={m.l} className="px-4 py-3">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{m.l}</p>
                  <p className="tnum mt-1 font-display text-[18px] font-semibold">{m.v}</p>
                </div>
              ))}
            </div>
            <div className="p-4">
              <DataTable
                rows={a.openOpps}
                onRowClick={(o) => setModule('opportunities', o.id)}
                columns={[
                  { key: 'name', header: 'Opportunity', cell: (o) => <span className="font-medium">{o.name}</span>, sort: (o) => o.name },
                  { key: 'co', header: 'Company', cell: (o) => o.companyName, hideBelow: 'md' },
                  { key: 'stage', header: 'Stage', cell: (o) => <StatusBadge status={o.stage} /> },
                  { key: 'value', header: 'Value', align: 'right', cell: (o) => money(o.value, o.currency), sort: (o) => o.value },
                  { key: 'p', header: 'Prob.', align: 'right', cell: (o) => `${o.probability}%` },
                  { key: 'w', header: 'Weighted', align: 'right', cell: (o) => money(o.value * (o.probability / 100), o.currency), sort: (o) => o.value * o.probability },
                  { key: 'close', header: 'Close', cell: (o) => fmtDate(o.expectedClose), hideBelow: 'lg', sort: (o) => o.expectedClose },
                ]}
              />
            </div>
          </Section>
        </div>
      )}

      {tab === 'sources' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Leads by source">
            <BarViz data={a.sourcePerf.map((s) => ({ name: s.name, leads: s.leads, qualified: s.qualified }))}
              series={[{ key: 'leads', name: 'Leads' }, { key: 'qualified', name: 'Qualified', color: VIZ[1] }]} height={240} />
          </Section>
          <Section title="Marketing return" description="Revenue generated divided by attributed marketing cost">
            <BarViz data={a.sourcePerf.filter((s) => s.cost > 0).map((s) => ({ name: s.name, roi: Number((s.roi ?? 0).toFixed(2)) }))}
              series={[{ key: 'roi', name: 'ROI (×)', color: VIZ[1] }]} height={240} />
          </Section>
          <Section className="lg:col-span-2" title="Source → lead → qualified → client → revenue" flush>
            <div className="p-4">
              <DataTable
                rows={a.sourcePerf.map((s) => ({ ...s, id: s.name }))}
                columns={[
                  { key: 'src', header: 'Source', cell: (s) => <span className="font-medium">{s.name}</span> },
                  { key: 'leads', header: 'Leads', align: 'right', cell: (s) => s.leads, sort: (s) => s.leads },
                  { key: 'q', header: 'Qualified', align: 'right', cell: (s) => s.qualified, sort: (s) => s.qualified },
                  { key: 'conv', header: 'Conversion', align: 'right', cell: (s) => `${s.conversion.toFixed(0)}%`, sort: (s) => s.conversion },
                  { key: 'won', header: 'Won', align: 'right', cell: (s) => s.won },
                  { key: 'cost', header: 'Cost', align: 'right', cell: (s) => (s.cost ? money(s.cost, 'XAF') : '—'), hideBelow: 'md' },
                  { key: 'rev', header: 'Revenue', align: 'right', cell: (s) => (s.revenue ? money(s.revenue, 'XAF') : '—'), sort: (s) => s.revenue },
                  { key: 'roi', header: 'ROI', align: 'right', cell: (s) => (s.roi ? <Badge tone={s.roi >= 3 ? 'success' : s.roi >= 1 ? 'gold' : 'warning'}>{s.roi.toFixed(1)}×</Badge> : '—'), sort: (s) => s.roi ?? 0 },
                ]}
              />
            </div>
          </Section>
        </div>
      )}

      {tab === 'clients' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Clients by country"><BarViz data={a.clientsByCountry} series={[{ key: 'value', name: 'Companies' }]} horizontal height={240} /></Section>
          <Section title="Clients by industry"><DonutViz data={a.clientsByIndustry} height={240} /></Section>
          <Section title="Revenue by client"><BarViz data={a.revenueByClient} series={[{ key: 'value', name: 'Collected' }]} horizontal fmt={usd} height={240} /></Section>
          <Section title="Revenue by industry"><BarViz data={a.revenueByIndustry} series={[{ key: 'value', name: 'Collected' }]} horizontal fmt={usd} height={240} /></Section>
        </div>
      )}

      {tab === 'delivery' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section className="lg:col-span-2" title="Project profitability" description="Budget against recorded cost, in XAF">
            <BarViz data={a.projectProfitability} series={[{ key: 'revenue', name: 'Budget' }, { key: 'cost', name: 'Cost', color: VIZ[3] }]} horizontal fmt={usd} height={280} />
          </Section>
          <Section title="Estimated against actual hours">
            <BarViz data={a.scopedProjects.map((p) => ({ name: p.id.replace('PRJ-', 'P'), est: p.estimatedHours, act: p.actualHours }))}
              series={[{ key: 'est', name: 'Estimated', color: 'hsl(48 14% 82%)' }, { key: 'act', name: 'Actual', color: VIZ[0] }]} height={240} />
          </Section>
          <Section title="Project status">
            <DonutViz height={240} data={Object.entries(a.scopedProjects.reduce((m: Record<string, number>, p) => { m[p.status] = (m[p.status] ?? 0) + 1; return m; }, {})).map(([name, value]) => ({ name, value }))} />
          </Section>
        </div>
      )}

      {tab === 'productivity' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Workload by consultant"><BarViz data={a.workload} series={[{ key: 'open', name: 'Open' }, { key: 'overdue', name: 'Overdue', color: VIZ[3] }, { key: 'done', name: 'Completed', color: VIZ[4] }]} stacked height={250} /></Section>
          <Section title="Consultations by month"><LineViz data={a.consultationsByMonth} series={[{ key: 'count', name: 'Consultations' }]} height={250} /></Section>
          <Section className="lg:col-span-2" title="Billable hours by project" flush>
            <div className="p-4">
              <DataTable
                rows={a.scopedProjects}
                onRowClick={(p) => setModule('projects', p.id)}
                columns={[
                  { key: 'n', header: 'Project', cell: (p) => <span className="font-medium">{p.name}</span> },
                  { key: 'est', header: 'Estimated', align: 'right', cell: (p) => `${p.estimatedHours}h` },
                  { key: 'act', header: 'Actual', align: 'right', cell: (p) => `${p.actualHours}h` },
                  { key: 'var', header: 'Variance', align: 'right', cell: (p) => <span className={p.actualHours > p.estimatedHours ? 'text-danger' : 'text-success'}>{p.actualHours > p.estimatedHours ? '+' : ''}{p.actualHours - p.estimatedHours}h</span> },
                  { key: 'util', header: 'Consumed', cell: (p) => <div className="w-32"><Progress value={(p.actualHours / p.estimatedHours) * 100} tone={p.actualHours > p.estimatedHours ? 'danger' : 'forest'} showLabel /></div> },
                ]}
              />
            </div>
          </Section>
        </div>
      )}

      {tab === 'readiness' && <ReadinessViz />}

      {tab === 'academy' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-2.5 lg:col-span-2 lg:grid-cols-6">
            <KpiCard dense label="Enrolments" value={a.academy.enrolled} />
            <KpiCard dense label="Active learners" value={a.academy.activeLearners} />
            <KpiCard dense label="Completion rate" value={`${a.academy.completionRate.toFixed(0)}%`} />
            <KpiCard dense label="Certificates" value={a.academy.certificates} />
            <KpiCard dense label="Average score" value={`${a.academy.avgScore}%`} />
            <KpiCard dense label="Course revenue" value={usd(a.academy.revenue)} />
          </div>
          <Section title="Enrolment against completion"><BarViz data={a.academy.byCourse} series={[{ key: 'enrolled', name: 'Enrolled' }, { key: 'completed', name: 'Completed', color: VIZ[1] }]} horizontal height={250} /></Section>
          <Section title="Corporate against open enrolment">
            <DonutViz height={250} data={[
              { name: 'Corporate cohorts', value: state.enrollments.filter((e) => e.corporate).length },
              { name: 'Open enrolment', value: state.enrollments.filter((e) => !e.corporate).length },
            ]} />
          </Section>
        </div>
      )}
    </div>
  );
}

function ReadinessViz() {
  const { state, setModule } = useApp();
  const assessments = state.assessments.filter((x) => x.type === 'Trade Readiness');
  const [sel, setSel] = useState(assessments[0]?.id ?? '');
  const current = assessments.find((x) => x.id === sel) ?? assessments[0];
  if (!current) return <EmptyState title="No assessments recorded" />;
  const { dims, overall } = assessmentScore(current.scores);
  const band = readinessBand(overall);
  const company = state.companies.find((c) => c.id === current.companyId);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Section className="lg:col-span-2" title="Readiness profile"
        actions={<Select value={sel} onChange={(e) => setSel(e.target.value)} className="h-7 w-auto py-0 text-[12px]">
          {assessments.map((x) => <option key={x.id} value={x.id}>{state.companies.find((c) => c.id === x.companyId)?.tradingName}</option>)}
        </Select>}>
        <RadarViz height={300} data={dims.map((d) => ({ subject: d.name.replace(' Readiness', ''), score: Math.round(d.pct), benchmark: 75 }))} />
      </Section>
      <Section title={company?.tradingName ?? ''} description={`Assessed ${fmtDate(current.date)}`}>
        <div className="mb-4 flex items-baseline gap-3">
          <span className="tnum font-display text-[38px] font-semibold leading-none">{overall}</span>
          <div>
            <span className="block text-[12px] text-muted-foreground">out of 100</span>
            <Badge tone={band.tone} dot>{band.label}</Badge>
          </div>
        </div>
        <ul className="space-y-2.5">
          {dims.map((d) => (
            <li key={d.id}>
              <div className="flex items-baseline justify-between text-[12.5px]">
                <span>{d.name}</span>
                <span className="tnum text-muted-foreground">{Math.round(d.pct)}%</span>
              </div>
              <Progress value={d.pct} tone={d.pct >= 75 ? 'success' : d.pct >= 60 ? 'gold' : d.pct >= 40 ? 'warning' : 'danger'} size="sm" />
            </li>
          ))}
        </ul>
        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setModule('assessments', current.id)}>Open assessment</Button>
      </Section>
      <Section className="lg:col-span-3" title="Readiness across the portfolio">
        <BarViz height={220} data={assessments.map((x) => ({
          name: state.companies.find((c) => c.id === x.companyId)?.tradingName ?? '',
          score: assessmentScore(x.scores).overall,
          threshold: 75,
        }))} series={[{ key: 'score', name: 'Readiness score' }, { key: 'threshold', name: 'Export-ready threshold', color: 'hsl(48 14% 84%)' }]} />
      </Section>
    </div>
  );
}
