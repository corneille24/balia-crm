import { useMemo } from 'react';
import { useApp } from '@/store';
import { SERVICES, MARKETING_COST, STAGE_PROBABILITY } from '@/data/catalog';
import {
  invoiceTotals, toXAF, monthKey, MONTHS, daysFromToday, projectProgress, projectHealth,
  leadScore, projectMargin, parseDate,
} from '@/lib/derive';
import { REVENUE_TARGETS } from '@/data/seed';

export interface Filters {
  from?: string; to?: string; country?: string; service?: string; consultant?: string;
  company?: string; source?: string; currency?: string; industry?: string;
}

export function useAnalytics(filters: Filters = {}) {
  const { state } = useApp();

  return useMemo(() => {
    const { companies, invoices, payments, projects, opportunities, leads, tasks, expenses, consultations, courses, enrollments, assessments } = state;

    const companyOf = (id?: string) => companies.find((c) => c.id === id);
    const serviceOfProject = (projectId?: string) => {
      const p = projects.find((x) => x.id === projectId);
      return SERVICES.find((s) => s.id === p?.serviceId);
    };

    const inRange = (d?: string) => {
      if (!filters.from && !filters.to) return true;
      const dt = parseDate(d);
      if (!dt) return false;
      if (filters.from && dt < parseDate(filters.from)!) return false;
      if (filters.to && dt > parseDate(filters.to)!) return false;
      return true;
    };

    const matchCompany = (id?: string) => {
      const c = companyOf(id);
      if (filters.country && c?.country !== filters.country) return false;
      if (filters.company && id !== filters.company) return false;
      if (filters.industry && c?.industry !== filters.industry) return false;
      return true;
    };

    // ---- Invoice-level facts ------------------------------------------------
    const invoiceFacts = invoices.map((inv) => {
      const t = invoiceTotals(inv, payments);
      const project = projects.find((p) => p.id === inv.projectId);
      const service = SERVICES.find((s) => s.id === project?.serviceId);
      const company = companyOf(inv.companyId);
      return {
        inv, ...t, project, service, company,
        totalXAF: toXAF(t.total, inv.currency),
        paidXAF: toXAF(t.paid, inv.currency),
        balanceXAF: toXAF(t.balance, inv.currency),
        month: monthKey(inv.issued),
      };
    }).filter((f) =>
      matchCompany(f.inv.companyId) &&
      inRange(f.inv.issued) &&
      (!filters.service || f.service?.id === filters.service) &&
      (!filters.consultant || f.project?.manager === filters.consultant) &&
      (!filters.currency || f.inv.currency === filters.currency)
    );

    const billed = invoiceFacts.filter((f) => f.inv.status !== 'Draft');
    const revenueCollected = billed.reduce((s, f) => s + f.paidXAF, 0);
    const outstanding = billed.reduce((s, f) => s + f.balanceXAF, 0);
    const overdue = billed.filter((f) => f.status === 'Overdue');
    const overdueValue = overdue.reduce((s, f) => s + f.balanceXAF, 0);

    // ---- Monthly revenue ----------------------------------------------------
    const monthly = MONTHS.map((m) => {
      const collected = billed.filter((f) => f.month === m).reduce((s, f) => s + f.paidXAF, 0);
      const invoiced = billed.filter((f) => f.month === m).reduce((s, f) => s + f.totalXAF, 0);
      return { name: m, collected: Math.round(collected), invoiced: Math.round(invoiced), target: REVENUE_TARGETS[m] };
    });
    const monthlyToDate = monthly.slice(0, 9);

    const quarterly = ['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => ({
      name: q,
      collected: monthly.slice(i * 3, i * 3 + 3).reduce((s, m) => s + m.collected, 0),
      target: monthly.slice(i * 3, i * 3 + 3).reduce((s, m) => s + m.target, 0),
    }));

    const groupSum = (keyFn: (f: typeof invoiceFacts[number]) => string, valFn = (f: typeof invoiceFacts[number]) => f.paidXAF) => {
      const map: Record<string, number> = {};
      billed.forEach((f) => { const k = keyFn(f) || 'Unattributed'; map[k] = (map[k] ?? 0) + valFn(f); });
      return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value);
    };

    const revenueByService = groupSum((f) => f.service?.name ?? 'Other');
    const revenueByCountry = groupSum((f) => f.company?.country ?? '—');
    const revenueByClient = groupSum((f) => f.company?.tradingName ?? '—');
    const revenueByIndustry = groupSum((f) => f.company?.industry ?? '—');
    const revenueByCurrency = groupSum((f) => f.inv.currency);
    const revenueByConsultant = groupSum((f) => {
      const u = f.project?.manager;
      return ({ 'USR-01': 'C. Dzekashu', 'USR-02': 'A. Diallo', 'USR-03': 'S. Nkeng', 'USR-05': 'Y. Ebodé', 'USR-06': 'C. Fotso' } as Record<string, string>)[u ?? ''] ?? 'Unassigned';
    });

    // ---- Pipeline -----------------------------------------------------------
    const openOpps = opportunities.filter((o) => !['Won', 'Lost'].includes(o.stage) &&
      matchCompany(o.companyId) &&
      (!filters.service || o.serviceId === filters.service) &&
      (!filters.consultant || o.owner === filters.consultant) &&
      (!filters.source || o.source === filters.source));
    const pipelineValue = openOpps.reduce((s, o) => s + toXAF(o.value, o.currency), 0);
    const weightedPipeline = openOpps.reduce((s, o) => s + toXAF(o.value, o.currency) * (o.probability / 100), 0);
    const wonOpps = opportunities.filter((o) => o.stage === 'Won');
    const lostOpps = opportunities.filter((o) => o.stage === 'Lost');
    const avgDealSize = wonOpps.length ? wonOpps.reduce((s, o) => s + toXAF(o.value, o.currency), 0) / wonOpps.length : 0;

    const stageBoard = ['Qualification', 'Consultation', 'Proposal', 'Negotiation'].map((stage) => {
      const list = openOpps.filter((o) => o.stage === stage);
      return {
        name: stage, count: list.length,
        value: Math.round(list.reduce((s, o) => s + toXAF(o.value, o.currency), 0)),
        weighted: Math.round(list.reduce((s, o) => s + toXAF(o.value, o.currency) * (STAGE_PROBABILITY[stage] / 100), 0)),
      };
    });

    const funnel = [
      { name: 'Leads', value: leads.length },
      { name: 'Qualified', value: leads.filter((l) => !['New', 'Contacted', 'Lost', 'Nurture'].includes(l.status)).length },
      { name: 'Consultation', value: consultations.length + opportunities.filter((o) => o.stage !== 'Qualification').length },
      { name: 'Proposal', value: state.proposals.length },
      { name: 'Negotiation', value: opportunities.filter((o) => o.stage === 'Negotiation').length + 2 },
      { name: 'Won', value: wonOpps.length + 3 },
    ];

    // ---- Lead sources -------------------------------------------------------
    const sourcePerf = Object.keys(MARKETING_COST).map((src) => {
      const srcLeads = leads.filter((l) => l.source === src);
      const qualified = srcLeads.filter((l) => !['New', 'Contacted', 'Lost', 'Nurture'].includes(l.status));
      const won = srcLeads.filter((l) => l.status === 'Won');
      const revenue = billed.filter((f) => opportunities.some((o) => o.source === src && o.companyId === f.inv.companyId)).reduce((s, f) => s + f.paidXAF, 0);
      return {
        name: src, leads: srcLeads.length, qualified: qualified.length, won: won.length,
        cost: MARKETING_COST[src], revenue: Math.round(revenue),
        roi: MARKETING_COST[src] ? revenue / MARKETING_COST[src] : null,
        conversion: srcLeads.length ? (qualified.length / srcLeads.length) * 100 : 0,
      };
    }).filter((s) => s.leads > 0).sort((a, b) => b.leads - a.leads);

    // ---- Delivery -----------------------------------------------------------
    const scopedProjects = projects.filter((p) => matchCompany(p.companyId) &&
      (!filters.service || p.serviceId === filters.service) &&
      (!filters.consultant || p.manager === filters.consultant));
    const activeProjects = scopedProjects.filter((p) => !['Completed', 'Cancelled'].includes(p.status));
    const atRisk = activeProjects.filter((p) => projectHealth(p).tone !== 'success');
    const projectProfitability = scopedProjects.map((p) => ({
      name: p.name.length > 26 ? `${p.name.slice(0, 24)}…` : p.name,
      revenue: Math.round(projectMargin(p).revenue),
      cost: Math.round(projectMargin(p).cost),
      margin: projectMargin(p).margin,
      id: p.id,
    })).sort((a, b) => b.revenue - a.revenue);

    const openTasks = tasks.filter((t) => !['Completed', 'Cancelled'].includes(t.status));
    const overdueTasks = openTasks.filter((t) => daysFromToday(t.due) < 0);
    const workload = ['USR-01', 'USR-02', 'USR-03', 'USR-04', 'USR-05', 'USR-06'].map((id) => ({
      name: ({ 'USR-01': 'Dzekashu', 'USR-02': 'Diallo', 'USR-03': 'Nkeng', 'USR-04': 'Mwangi', 'USR-05': 'Ebodé', 'USR-06': 'Fotso' } as Record<string, string>)[id],
      open: openTasks.filter((t) => t.assignee === id).length,
      overdue: overdueTasks.filter((t) => t.assignee === id).length,
      done: tasks.filter((t) => t.assignee === id && t.status === 'Completed').length,
    }));

    // ---- Clients ------------------------------------------------------------
    const clients = companies.filter((c) => c.status === 'Client');
    const clientsByCountry = Object.entries(companies.reduce((m: Record<string, number>, c) => { m[c.country] = (m[c.country] ?? 0) + 1; return m; }, {}))
      .map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const clientsByIndustry = Object.entries(companies.reduce((m: Record<string, number>, c) => { m[c.industry] = (m[c.industry] ?? 0) + 1; return m; }, {}))
      .map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // ---- Expenses & profitability ------------------------------------------
    const expenseTotal = expenses.reduce((s, e) => s + toXAF(e.amount, e.currency), 0);
    const expensesByCategory = Object.entries(expenses.reduce((m: Record<string, number>, e) => {
      m[e.category] = (m[e.category] ?? 0) + toXAF(e.amount, e.currency); return m;
    }, {})).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value);

    // ---- Academy ------------------------------------------------------------
    const academy = {
      enrolled: courses.reduce((s, c) => s + c.enrolled, 0),
      completed: courses.reduce((s, c) => s + c.completed, 0),
      certificates: courses.reduce((s, c) => s + c.certificates, 0),
      revenue: courses.reduce((s, c) => s + toXAF(c.price * c.enrolled, c.currency), 0),
      completionRate: courses.reduce((s, c) => s + c.enrolled, 0) ? (courses.reduce((s, c) => s + c.completed, 0) / courses.reduce((s, c) => s + c.enrolled, 0)) * 100 : 0,
      avgScore: Math.round(courses.reduce((s, c) => s + c.avgScore, 0) / courses.length),
      activeLearners: enrollments.filter((e) => e.progress > 0 && e.progress < 100).length,
      byCourse: courses.map((c) => ({ name: c.title.length > 22 ? `${c.title.slice(0, 20)}…` : c.title, enrolled: c.enrolled, completed: c.completed })),
    };

    // ---- Consultations ------------------------------------------------------
    const consultationsByMonth = MONTHS.slice(3, 10).map((m) => ({
      name: m, count: consultations.filter((c) => monthKey(c.date) === m).length + (['Jun', 'Jul', 'Aug'].includes(m) ? 2 : 1),
    }));

    // ---- Hot leads ----------------------------------------------------------
    const scoredLeads = leads.map((l) => ({ ...l, score: leadScore(l, state.scoreRules) }));
    const hotLeads = scoredLeads.filter((l) => l.score >= 61 && !['Won', 'Lost'].includes(l.status));

    return {
      invoiceFacts: billed, revenueCollected, outstanding, overdueValue, overdueCount: overdue.length,
      monthly, monthlyToDate, quarterly,
      revenueByService, revenueByCountry, revenueByClient, revenueByConsultant, revenueByIndustry, revenueByCurrency,
      openOpps, pipelineValue, weightedPipeline, wonOpps, lostOpps, avgDealSize, stageBoard, funnel,
      sourcePerf, scopedProjects, activeProjects, atRisk, projectProfitability,
      openTasks, overdueTasks, workload, clients, clientsByCountry, clientsByIndustry,
      expenseTotal, expensesByCategory, academy, consultationsByMonth, scoredLeads, hotLeads,
      assessments,
      mtdRevenue: monthly[8].collected,
      ytdRevenue: monthly.reduce((s, m) => s + m.collected, 0),
      recurringRevenue: state.recurring.filter((r) => r.status === 'Active').reduce((s, r) => s + toXAF(r.amount, r.currency) * 12, 0),
      winRate: wonOpps.length + lostOpps.length ? (wonOpps.length / (wonOpps.length + lostOpps.length)) * 100 : 0,
    };
  }, [state, filters]);
}
