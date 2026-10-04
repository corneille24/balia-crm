import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Search, X, ArrowUpRight, Inbox } from 'lucide-react';

// ---------------------------------------------------------------------------
// Tone system — one semantic vocabulary used everywhere
// ---------------------------------------------------------------------------
export type Tone = 'neutral' | 'muted' | 'forest' | 'gold' | 'success' | 'warning' | 'danger' | 'info';

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-secondary text-secondary-foreground border-border',
  muted: 'bg-muted text-muted-foreground border-border',
  forest: 'bg-forest-soft text-forest border-forest/15',
  gold: 'bg-gold-soft text-gold border-gold/20',
  success: 'bg-success-soft text-success border-success/15',
  warning: 'bg-warning-soft text-warning border-warning/20',
  danger: 'bg-danger-soft text-danger border-danger/20',
  info: 'bg-info-soft text-info border-info/15',
};

const DOT_CLASS: Record<Tone, string> = {
  neutral: 'bg-muted-foreground', muted: 'bg-muted-foreground/60', forest: 'bg-forest',
  gold: 'bg-gold', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', info: 'bg-info',
};

export const STATUS_TONE: Record<string, Tone> = {
  // leads / pipeline
  New: 'info', Contacted: 'info', Qualified: 'forest', 'Consultation Scheduled': 'gold',
  'Proposal Required': 'gold', 'Proposal Sent': 'gold', Negotiation: 'warning',
  Won: 'success', Lost: 'muted', Nurture: 'muted',
  Qualification: 'info', Consultation: 'gold', Proposal: 'gold',
  // projects
  'Not Started': 'muted', Planning: 'info', Active: 'forest', 'Waiting for Client': 'warning',
  'Under Review': 'gold', Completed: 'success', 'On Hold': 'muted', Cancelled: 'muted',
  // tasks
  'To Do': 'muted', 'In Progress': 'info', Waiting: 'warning',
  // proposals
  Draft: 'muted', 'Internal Review': 'info', Approved: 'forest', Sent: 'info', Viewed: 'gold',
  Accepted: 'success', Rejected: 'danger', 'Changes Requested': 'warning', Expired: 'muted',
  // contracts
  'Pending Signature': 'warning', Expiring: 'warning', Renewed: 'success', Terminated: 'muted',
  // invoices
  'Pending Approval': 'info', 'Partially Paid': 'gold', Paid: 'success', Overdue: 'danger',
  Disputed: 'danger', Void: 'muted',
  // documents
  Requested: 'warning', Uploaded: 'info',
  // health
  Healthy: 'success', Stable: 'info', 'Needs Attention': 'warning', 'At Risk': 'danger',
  'On Track': 'success', Delayed: 'danger', Delivered: 'muted',
  // expenses
  Submitted: 'info', Reimbursed: 'success',
  // misc
  Scheduled: 'info', Published: 'success', Active2: 'forest', Paused: 'muted', Ended: 'muted',
  Final: 'success', Reviewed: 'info', Open: 'warning',
  // funding & business intelligence
  Prospect: 'muted', Researching: 'muted', 'Relationship Established': 'forest',
  'Active Opportunity': 'gold', 'Application Submitted': 'info', Funded: 'success',
  Unsuccessful: 'danger', Dormant: 'muted', Archived: 'muted', Identified: 'info',
  'Preparing Application': 'gold', 'Application in Progress': 'gold', 'Under Evaluation': 'info',
  Shortlisted: 'forest', 'Interview/Due Diligence': 'warning', Awarded: 'success',
  Contracting: 'forest', Withdrawn: 'muted', 'Not Eligible': 'muted',
  'Action Required': 'warning', Converting: 'gold', Converted: 'success', Monitoring: 'info',
  Dismissed: 'muted', Preparing: 'gold', 'Ready to Submit': 'forest', 'Due Diligence': 'warning',
  Verified: 'success', 'Needs Verification': 'warning', Changed: 'warning',
  // funding pipeline stages
  'Funder Identified': 'muted', 'Opportunity Identified': 'info', 'Eligibility Review': 'gold',
  'Application Preparation': 'gold', 'Documents Complete': 'forest', 'Application Submitted ': 'info',
  Evaluation: 'info', Reporting: 'forest',
};

export function Badge({
  children, tone = 'neutral', dot = false, className,
}: { children: React.ReactNode; tone?: Tone; dot?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-medium leading-4', TONE_CLASS[tone], className)}>
      {dot && <span className={cn('size-1.5 rounded-full', DOT_CLASS[tone])} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, dot = true }: { status: string; dot?: boolean }) {
  return <Badge tone={STATUS_TONE[status] ?? 'neutral'} dot={dot}>{status}</Badge>;
}

export function Avatar({ name, initials, size = 'sm', tone }: { name?: string; initials?: string; size?: 'xs' | 'sm' | 'md'; tone?: string }) {
  const text = initials ?? (name ?? '?').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const dims = size === 'xs' ? 'size-6 text-[10px]' : size === 'md' ? 'size-9 text-xs' : 'size-7 text-[11px]';
  const palette = ['bg-forest/10 text-forest', 'bg-gold/12 text-gold', 'bg-info/10 text-info', 'bg-danger/10 text-danger'];
  const idx = text.charCodeAt(0) % palette.length;
  return (
    <span title={name} className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-inset ring-black/5', dims, tone ?? palette[idx])}>
      {text}
    </span>
  );
}

// ---------------------------------------------------------------------------
export function PageHeader({
  title, subtitle, actions, meta,
}: { title: string; subtitle?: string; actions?: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[22px] font-semibold leading-tight text-foreground md:text-[26px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-[70ch] text-[13.5px] leading-relaxed text-muted-foreground">{subtitle}</p>}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Button({
  children, variant = 'default', size = 'md', className, loading = false, disabled, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'subtle' | 'danger' | 'gold'; size?: 'sm' | 'md' | 'lg' | 'icon'; loading?: boolean }) {
  const base = 'relative inline-flex items-center justify-center rounded-md font-medium select-none whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';
  // Explicit height AND vertical padding together: padding is the safety net if a
  // height utility is ever dropped, so a control never collapses to text-only sizing.
  const sizes = {
    sm: 'h-8 gap-1.5 px-3 py-1.5 text-[12px]',
    md: 'h-10 gap-2 px-4 py-2 text-[13px]',
    lg: 'h-11 gap-2 px-6 py-2.5 text-[14px] font-semibold',
    icon: 'size-9 gap-0 p-0',
  };
  const variants = {
    // Primary = deep navy. Gold reserved as accent, not the default fill.
    default: 'bg-primary text-primary-foreground hover:bg-primary/88 active:bg-primary shadow-[0_1px_2px_-1px_hsl(219_62%_12%/0.45)] hover:shadow-[0_2px_6px_-1px_hsl(219_62%_12%/0.35)]',
    outline: 'border border-input bg-card text-foreground hover:bg-secondary hover:border-muted-foreground/30 active:bg-muted',
    ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground active:bg-muted',
    subtle: 'bg-secondary text-secondary-foreground hover:bg-muted active:bg-muted',
    danger: 'bg-danger text-white hover:bg-danger/90 active:bg-danger shadow-[0_1px_2px_-1px_hsl(4_62%_28%/0.45)]',
    // Restrained gold: a card-backed accent with a gold border + gold text, not a saturated fill.
    gold: 'border border-gold/40 bg-gold-soft text-gold hover:bg-gold/15 hover:border-gold/60 active:bg-gold/20',
  };
  return (
    <button aria-busy={loading || undefined} disabled={disabled || loading}
      className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {loading && (
        <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      <span className={cn('inline-flex items-center gap-2', loading && 'opacity-90')}>{children}</span>
    </button>
  );
}

export function Field({ label, children, hint, className }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

const inputCls = 'w-full rounded-md border border-input bg-card px-2.5 py-1.5 text-[13px] text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-muted-foreground/40 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:bg-muted disabled:text-muted-foreground';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input ref={ref} {...props} className={cn(inputCls, props.className)} />
);
Input.displayName = 'Input';

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={cn(inputCls, 'min-h-[80px] resize-y leading-relaxed', props.className)} />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={cn(inputCls, 'appearance-none bg-[length:16px] bg-[right_0.5rem_center] bg-no-repeat pr-8', props.className)}
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23787770' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, ...props.style }} />
);

// ---------------------------------------------------------------------------
export function KpiCard({
  label, value, sub, tone = 'neutral', trend, onClick, dense = false,
}: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: Tone; trend?: number; onClick?: () => void; dense?: boolean }) {
  const Cmp: React.ElementType = onClick ? 'button' : 'div';
  return (
    <Cmp
      onClick={onClick}
      className={cn(
        'panel lift group relative flex w-full flex-col items-start gap-1 p-3.5 text-left',
        onClick && 'cursor-pointer'
      )}
    >
      <span className="flex w-full items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">
        <span className="truncate">{label}</span>
        {onClick && <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground" />}
      </span>
      <span className={cn('tnum font-display font-semibold leading-none', dense ? 'text-[19px]' : 'text-[24px]',
        tone === 'danger' ? 'text-danger' : tone === 'warning' ? 'text-warning' : tone === 'success' ? 'text-success' : 'text-foreground')}>
        {value}
      </span>
      {(sub || trend !== undefined) && (
        <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
          {trend !== undefined && (
            <span className={cn('tnum font-medium', trend >= 0 ? 'text-success' : 'text-danger')}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(0)}%
            </span>
          )}
          {sub}
        </span>
      )}
    </Cmp>
  );
}

export function Section({
  title, description, actions, children, className, flush = false,
}: { title?: string; description?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string; flush?: boolean }) {
  return (
    <section className={cn('panel', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="font-display text-[13.5px] font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={flush ? '' : 'p-4'}>{children}</div>
    </section>
  );
}

export function EmptyState({ title, detail, action }: { title: string; detail?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <span className="mb-1 flex size-10 items-center justify-center rounded-full bg-secondary">
        <Inbox className="size-5 text-muted-foreground" strokeWidth={1.6} />
      </span>
      <p className="font-display text-[14px] font-semibold text-foreground">{title}</p>
      {detail && <p className="max-w-[46ch] text-[12.5px] leading-relaxed text-muted-foreground">{detail}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  cell: (row: T) => React.ReactNode;
  sort?: (row: T) => string | number;
  hideBelow?: 'sm' | 'md' | 'lg';
}

export function DataTable<T extends { id: string }>({
  rows, columns, onRowClick, selectable, selected, onSelect, empty, dense,
}: {
  rows: T[]; columns: Column<T>[]; onRowClick?: (row: T) => void;
  selectable?: boolean; selected?: string[]; onSelect?: (ids: string[]) => void;
  empty?: React.ReactNode; dense?: boolean;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sort) return rows;
    return [...rows].sort((a, b) => {
      const av = col.sort!(a); const bv = col.sort!(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, sortKey, dir, columns]);

  const hideCls = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' };
  const allSelected = selectable && rows.length > 0 && selected?.length === rows.length;

  if (!rows.length) return <>{empty ?? <EmptyState title="Nothing here yet" detail="Adjust your filters, or create the first record." />}</>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-border">
            {selectable && (
              <th className="w-9 px-3 py-2">
                <input type="checkbox" checked={!!allSelected} onChange={(e) => onSelect?.(e.target.checked ? rows.map((r) => r.id) : [])}
                  className="size-3.5 accent-[hsl(var(--forest))]" aria-label="Select all" />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }}
                className={cn('px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground',
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                  col.hideBelow && hideCls[col.hideBelow])}>
                {col.sort ? (
                  <button
                    className="inline-flex items-center gap-1 rounded transition-colors hover:text-foreground"
                    onClick={() => { if (sortKey === col.key) setDir((d) => (d === 1 ? -1 : 1)); else { setSortKey(col.key); setDir(1); } }}>
                    {col.header}
                    <ChevronDown className={cn('size-3 transition-transform', sortKey === col.key ? 'opacity-100' : 'opacity-0', dir === -1 && 'rotate-180')} />
                  </button>
                ) : col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn('border-b border-border/70 last:border-0 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-secondary/70',
                selected?.includes(row.id) && 'bg-accent/60')}>
              {selectable && (
                <td className="px-3" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selected?.includes(row.id) ?? false}
                    onChange={(e) => onSelect?.(e.target.checked ? [...(selected ?? []), row.id] : (selected ?? []).filter((i) => i !== row.id))}
                    className="size-3.5 accent-[hsl(var(--forest))]" aria-label={`Select ${row.id}`} />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key}
                  className={cn(dense ? 'px-3 py-1.5' : 'px-3 py-2.5', 'align-middle',
                    col.align === 'right' ? 'text-right tnum' : col.align === 'center' ? 'text-center' : 'text-left',
                    col.hideBelow && hideCls[col.hideBelow])}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
export function Drawer({
  open, onClose, title, subtitle, children, footer, width = 'max-w-2xl',
}: { open: boolean; onClose: () => void; title: React.ReactNode; subtitle?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; width?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[hsl(60_5%_10%/0.34)] backdrop-blur-[1.5px]" onClick={onClose} />
      <div className={cn('relative flex h-full w-full flex-col border-l border-border bg-card shadow-[-8px_0_40px_-12px_hsl(60_10%_15%/0.28)]', width)}
        style={{ animation: 'slide-in 260ms cubic-bezier(0.16,1,0.3,1)' }}>
        <style>{`@keyframes slide-in{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}}`}</style>
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-[16px] font-semibold leading-snug text-foreground">{title}</h2>
            {subtitle && <div className="mt-1 text-[12.5px] text-muted-foreground">{subtitle}</div>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel"><X className="size-4" /></Button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-secondary/50 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, width = 'max-w-lg' }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; width?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[hsl(60_5%_10%/0.34)] backdrop-blur-[1.5px]" onClick={onClose} />
      <div className={cn('panel relative w-full overflow-hidden', width)} style={{ animation: 'pop 200ms cubic-bezier(0.16,1,0.3,1)' }}>
        <style>{`@keyframes pop{from{transform:translateY(8px) scale(0.98);opacity:0}to{transform:none;opacity:1}}`}</style>
        <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="font-display text-[15px] font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X className="size-4" /></Button>
        </header>
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-2 border-t border-border bg-secondary/50 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
export function Tabs({ tabs, active, onChange, className }: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void; className?: string }) {
  return (
    <div className={cn('flex gap-0.5 overflow-x-auto border-b border-border', className)}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={cn('relative shrink-0 px-3 py-2 text-[13px] font-medium transition-colors',
            active === t.id ? 'text-forest' : 'text-muted-foreground hover:text-foreground')}>
          <span className="flex items-center gap-1.5">
            {t.label}
            {t.count !== undefined && (
              <span className={cn('tnum rounded px-1 py-px text-[10.5px] font-semibold', active === t.id ? 'bg-forest-soft text-forest' : 'bg-secondary text-muted-foreground')}>{t.count}</span>
            )}
          </span>
          {active === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-forest" />}
        </button>
      ))}
    </div>
  );
}

export function Progress({ value, tone = 'forest', showLabel = false, size = 'md' }: { value: number; tone?: Tone; showLabel?: boolean; size?: 'sm' | 'md' }) {
  const bar: Record<string, string> = { forest: 'bg-forest', gold: 'bg-gold', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', info: 'bg-info', muted: 'bg-muted-foreground', neutral: 'bg-foreground' };
  return (
    <div className="flex items-center gap-2">
      <div className={cn('relative flex-1 overflow-hidden rounded-full bg-secondary', size === 'sm' ? 'h-1' : 'h-1.5')}>
        <div className={cn('h-full rounded-full transition-[width] duration-500', bar[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      {showLabel && <span className="tnum w-9 shrink-0 text-right text-[11.5px] font-medium text-muted-foreground">{Math.round(value)}%</span>}
    </div>
  );
}

export function Stat({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-[13px] text-foreground">{value || '—'}</dd>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-8" />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground" aria-label="Clear search">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function Toolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-3 flex flex-wrap items-center gap-2', className)}>{children}</div>;
}

export function Timeline({ items }: { items: { id: string; at: string; title: React.ReactNode; detail?: React.ReactNode; tone?: Tone; icon?: React.ReactNode }[] }) {
  return (
    <ol className="relative space-y-0">
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
          <div className="relative flex flex-col items-center">
            <span className={cn('mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border', TONE_CLASS[item.tone ?? 'muted'])}>
              {item.icon ?? <span className={cn('size-1.5 rounded-full', DOT_CLASS[item.tone ?? 'muted'])} />}
            </span>
            {i < items.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <p className="text-[13px] font-medium leading-snug text-foreground">{item.title}</p>
              <span className="shrink-0 text-[11.5px] tabular-nums text-muted-foreground">{item.at}</span>
            </div>
            {item.detail && <div className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">{item.detail}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Collapse({ title, children, defaultOpen = false, meta }: { title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; meta?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 py-2.5 text-left transition-colors hover:text-forest">
        <span className="flex items-center gap-2 text-[13px] font-medium">
          <ChevronRight className={cn('size-3.5 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-90')} />
          {title}
        </span>
        {meta}
      </button>
      {open && <div className="pb-3 pl-[22px]">{children}</div>}
    </div>
  );
}
