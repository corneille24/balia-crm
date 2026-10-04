import { FX_TO_XAF, LEAD_SCORE_RULES, ASSESSMENT_DIMENSIONS, TODAY } from '@/data/catalog';
import type { Invoice, Payment, Project, Lead, Task, Company, Assessment } from '@/data/seed';

export const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', XAF: 'FCFA ' };

export function money(amount: number, currency = 'XAF', compact = false) {
  const sym = CURRENCY_SYMBOL[currency] ?? `${currency} `;
  if (compact && Math.abs(amount) >= 1000) {
    const units = [
      { v: 1e9, s: 'bn' },
      { v: 1e6, s: 'm' },
      { v: 1e3, s: 'k' },
    ];
    const u = units.find((x) => Math.abs(amount) >= x.v)!;
    const n = amount / u.v;
    return `${sym}${n >= 100 ? n.toFixed(0) : n.toFixed(1)}${u.s}`;
  }
  return `${sym}${amount.toLocaleString('en-GB', { minimumFractionDigits: currency === 'XAF' ? 0 : 2, maximumFractionDigits: currency === 'XAF' ? 0 : 2 })}`;
}

export const toXAF = (amount: number, currency: string) => amount * (FX_TO_XAF[currency] ?? 1);

export function parseDate(s?: string) {
  if (!s) return null;
  const dt = new Date(s.length <= 10 ? `${s}T00:00:00` : s);
  return isNaN(dt.getTime()) ? null : dt;
}

export function fmtDate(s?: string, style: 'short' | 'long' | 'day' = 'short') {
  const dt = parseDate(s);
  if (!dt) return '—';
  if (style === 'long') return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  if (style === 'day') return dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtDateTime(s?: string) {
  const dt = parseDate(s);
  if (!dt) return '—';
  return `${dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · ${dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

export const daysFromToday = (s?: string) => {
  const dt = parseDate(s);
  if (!dt) return NaN;
  return Math.round((dt.getTime() - TODAY.getTime()) / 86400000);
};

export function relativeDays(s?: string) {
  const n = daysFromToday(s);
  if (isNaN(n)) return '—';
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  if (n < 0) return `${Math.abs(n)} days ago`;
  return `in ${n} days`;
}

export const iso = (dt: Date) => dt.toISOString().slice(0, 10);
export const addDays = (s: string, n: number) => {
  const dt = parseDate(s) ?? new Date(TODAY);
  dt.setDate(dt.getDate() + n);
  return iso(dt);
};
export const TODAY_ISO = iso(TODAY);

// --- Lead scoring ----------------------------------------------------------
export function leadScore(lead: Lead, rules = LEAD_SCORE_RULES) {
  const raw = rules
    .filter((r) => r.active && lead.scoreFlags.includes(r.id))
    .reduce((sum, r) => sum + r.points, 0);
  return Math.min(100, raw);
}

// --- Invoices --------------------------------------------------------------
export interface InvoiceTotals {
  subtotal: number; discount: number; tax: number; total: number;
  paid: number; balance: number; status: string; overdueDays: number;
}

export function invoiceTotals(inv: Invoice, payments: Payment[]): InvoiceTotals {
  const subtotal = inv.items.reduce((s, it) => s + it.qty * it.rate, 0);
  const discount = inv.items.reduce((s, it) => s + it.qty * it.rate * (it.discount / 100), 0);
  const taxable = subtotal - discount;
  const tax = inv.items.reduce((s, it) => s + it.qty * it.rate * (1 - it.discount / 100) * (it.tax / 100), 0);
  const total = taxable + tax;
  const paid = payments.filter((p) => p.invoiceId === inv.id).reduce((s, p) => s + p.amount, 0);
  const balance = Math.max(0, total - paid);
  const overdueDays = -daysFromToday(inv.due);

  let status = inv.status;
  if (!['Draft', 'Pending Approval', 'Cancelled', 'Void', 'Disputed'].includes(inv.status)) {
    if (balance <= 0.005 && total > 0) status = 'Paid';
    else if (paid > 0) status = overdueDays > 0 ? 'Overdue' : 'Partially Paid';
    else if (overdueDays > 0) status = 'Overdue';
  }
  return { subtotal, discount, tax, total, paid, balance, status, overdueDays };
}

// --- Projects --------------------------------------------------------------
export function projectProgress(p: Project) {
  if (!p.workflow.length) return 0;
  return Math.round((p.workflow.filter((w) => w.done).length / p.workflow.length) * 100);
}

export function projectHealth(p: Project): { label: string; tone: 'success' | 'warning' | 'danger' | 'muted' } {
  if (p.status === 'Completed') return { label: 'Delivered', tone: 'muted' };
  if (p.status === 'Cancelled') return { label: 'Cancelled', tone: 'muted' };
  const remaining = daysFromToday(p.end);
  const progress = projectProgress(p);
  if (remaining < 0 && progress < 100) return { label: 'Delayed', tone: 'danger' };
  if (p.status === 'Waiting for Client') return { label: 'At Risk', tone: 'warning' };
  const total = Math.max(1, daysFromToday(p.end) - daysFromToday(p.start));
  const elapsed = Math.max(0, -daysFromToday(p.start));
  const expected = Math.min(100, (elapsed / total) * 100);
  if (progress < expected - 20) return { label: 'At Risk', tone: 'warning' };
  return { label: 'On Track', tone: 'success' };
}

export function projectMargin(p: Project) {
  const rev = toXAF(p.budget, p.currency);
  const cost = toXAF(p.cost, p.currency);
  return { revenue: rev, cost, profit: rev - cost, margin: rev ? ((rev - cost) / rev) * 100 : 0 };
}

// --- Assessments -----------------------------------------------------------
export function assessmentScore(scores: Record<string, number>) {
  const dims = ASSESSMENT_DIMENSIONS.map((dim) => {
    const answered = dim.questions.map((q) => scores[q.id] ?? 0);
    const max = dim.questions.length * 5;
    const got = answered.reduce((a, b) => a + b, 0);
    return { id: dim.id, name: dim.name, weight: dim.weight, pct: max ? (got / max) * 100 : 0, got, max };
  });
  const totalWeight = dims.reduce((s, d) => s + d.weight, 0);
  const overall = Math.round(dims.reduce((s, d) => s + (d.pct * d.weight) / totalWeight, 0));
  return { dims, overall };
}

export function assessmentRecommendations(a: Assessment) {
  const { dims } = assessmentScore(a.scores);
  const weak = dims.filter((d) => d.pct < 60).sort((x, y) => x.pct - y.pct);
  const map: Record<string, string> = {
    company: 'Strengthen the export function: appoint a named export owner and confirm working capital for a full shipment cycle.',
    product: 'Close product gaps first — packaging validation, destination-compliant labelling and the certifications your buyers will ask for.',
    export: 'Build export capability: document set, Incoterm selection and a briefed customs broker before the next consignment.',
    market: 'Complete the market work: evidence-based target selection, competitor pricing and a tested landed-cost model.',
    regulatory: 'Regulatory readiness is the binding constraint. Map destination import requirements and secure certificates before committing to volumes.',
    logistics: 'Resolve the logistics route: corridor choice, broker appointment and handling requirements.',
  };
  return weak.map((d) => ({ dimension: d.name, pct: Math.round(d.pct), action: map[d.id] }));
}

// --- Client health ---------------------------------------------------------
export function clientHealth(
  company: Company,
  ctx: { invoices: Invoice[]; payments: Payment[]; projects: Project[]; tasks: Task[]; lastContact?: string }
) {
  let score = 100;
  const reasons: string[] = [];

  const overdue = ctx.invoices
    .filter((i) => i.companyId === company.id)
    .map((i) => invoiceTotals(i, ctx.payments))
    .filter((t) => t.status === 'Overdue');
  if (overdue.length) {
    score -= 12 * overdue.length;
    reasons.push(`${overdue.length} overdue invoice${overdue.length > 1 ? 's' : ''}`);
  }

  const projects = ctx.projects.filter((p) => p.companyId === company.id && p.status !== 'Completed');
  const risky = projects.filter((p) => projectHealth(p).tone !== 'success');
  if (risky.length) {
    score -= 10 * risky.length;
    reasons.push(`${risky.length} project${risky.length > 1 ? 's' : ''} off track`);
  }

  const overdueTasks = ctx.tasks.filter(
    (t) => t.companyId === company.id && t.status !== 'Completed' && t.status !== 'Cancelled' && daysFromToday(t.due) < 0
  );
  if (overdueTasks.length) {
    score -= 5 * overdueTasks.length;
    reasons.push(`${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`);
  }

  const since = ctx.lastContact ? -daysFromToday(ctx.lastContact) : 999;
  if (since > 30) {
    score -= 15;
    reasons.push(`no contact for ${since === 999 ? 'over a month' : `${since} days`}`);
  }

  score = Math.max(0, Math.min(100, score));
  const label = score >= 85 ? 'Healthy' : score >= 70 ? 'Stable' : score >= 50 ? 'Needs Attention' : 'At Risk';
  const tone = score >= 85 ? 'success' : score >= 70 ? 'info' : score >= 50 ? 'warning' : 'danger';
  return { score, label, tone: tone as 'success' | 'info' | 'warning' | 'danger', reasons };
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function monthKey(s?: string) {
  const dt = parseDate(s);
  return dt ? MONTHS[dt.getMonth()] : '';
}

export function nextNumber(prefix: string, n: number) {
  return `${prefix}${String(n).padStart(4, '0')}`;
}

export function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
