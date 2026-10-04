import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  FunnelChart, Funnel, LabelList,
} from 'recharts';

export const VIZ = [
  'hsl(219 62% 24%)', 'hsl(41 58% 47%)', 'hsl(205 45% 46%)', 'hsl(12 52% 52%)',
  'hsl(222 16% 46%)', 'hsl(200 42% 58%)', 'hsl(38 34% 52%)', 'hsl(220 12% 60%)',
];

const AXIS = { fontSize: 11, fill: 'hsl(55 5% 40%)', fontFamily: 'IBM Plex Sans' };
const GRID = 'hsl(48 14% 89%)';

function TipBox({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-2.5 py-2 shadow-[0_4px_16px_-6px_hsl(60_10%_20%/0.25)]">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey ?? p.name} className="tnum flex items-center gap-2 text-[12.5px] text-foreground">
          <span className="size-2 rounded-[2px]" style={{ background: p.color ?? p.fill }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="ml-auto font-medium">{fmt ? fmt(p.value) : p.value?.toLocaleString?.() ?? p.value}</span>
        </p>
      ))}
    </div>
  );
}

interface SeriesSpec { key: string; name: string; color?: string; }

export function LineViz({ data, series, xKey = 'name', height = 220, fmt, stacked }: { data: any[]; series: SeriesSpec[]; xKey?: string; height?: number; fmt?: (v: number) => string; stacked?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => (fmt ? fmt(v) : v)} width={58} />
        <Tooltip content={<TipBox fmt={fmt} />} cursor={{ stroke: GRID }} />
        {series.length > 1 && <Legend iconType="plainline" wrapperStyle={{ fontSize: 11.5, paddingTop: 8 }} />}
        {series.map((s, i) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color ?? VIZ[i % VIZ.length]}
            strokeWidth={2} dot={{ r: 2.5, strokeWidth: 0, fill: s.color ?? VIZ[i % VIZ.length] }} activeDot={{ r: 4 }}
            strokeDasharray={stacked && i === 1 ? '4 3' : undefined} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AreaViz({ data, series, xKey = 'name', height = 220, fmt }: { data: any[]; series: SeriesSpec[]; xKey?: string; height?: number; fmt?: (v: number) => string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color ?? VIZ[i % VIZ.length]} stopOpacity={0.28} />
              <stop offset="100%" stopColor={s.color ?? VIZ[i % VIZ.length]} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => (fmt ? fmt(v) : v)} width={58} />
        <Tooltip content={<TipBox fmt={fmt} />} cursor={{ stroke: GRID }} />
        {series.length > 1 && <Legend iconType="plainline" wrapperStyle={{ fontSize: 11.5, paddingTop: 8 }} />}
        {series.map((s, i) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color ?? VIZ[i % VIZ.length]}
            strokeWidth={2} fill={`url(#grad-${s.key})`} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarViz({ data, series, xKey = 'name', height = 220, fmt, stacked, horizontal, onClick }: { data: any[]; series: SeriesSpec[]; xKey?: string; height?: number; fmt?: (v: number) => string; stacked?: boolean; horizontal?: boolean; onClick?: (d: any) => void }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 6, right: 12, left: horizontal ? 4 : -14, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={!!horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => (fmt ? fmt(v) : v)} />
            <YAxis type="category" dataKey={xKey} tick={AXIS} axisLine={false} tickLine={false} width={128} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} interval={0} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => (fmt ? fmt(v) : v)} width={58} />
          </>
        )}
        <Tooltip content={<TipBox fmt={fmt} />} cursor={{ fill: 'hsl(48 18% 94%)' }} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11.5, paddingTop: 8 }} />}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color ?? VIZ[i % VIZ.length]}
            stackId={stacked ? 'a' : undefined} radius={horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]}
            maxBarSize={horizontal ? 18 : 42} onClick={onClick} cursor={onClick ? 'pointer' : undefined} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutViz({ data, height = 220, fmt, onClick, centerLabel, centerValue }: { data: { name: string; value: number }[]; height?: number; fmt?: (v: number) => string; onClick?: (d: any) => void; centerLabel?: string; centerValue?: string }) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="84%" paddingAngle={1.5} stroke="none" onClick={onClick} cursor={onClick ? 'pointer' : undefined}>
            {data.map((_, i) => <Cell key={i} fill={VIZ[i % VIZ.length]} />)}
          </Pie>
          <Tooltip content={<TipBox fmt={fmt} />} />
          <Legend wrapperStyle={{ fontSize: 11.5 }} iconType="circle" iconSize={7} />
        </PieChart>
      </ResponsiveContainer>
      {centerValue && (
        <div className="pointer-events-none absolute inset-x-0 flex flex-col items-center" style={{ top: height * 0.34 }}>
          <span className="tnum font-display text-[19px] font-semibold leading-none">{centerValue}</span>
          {centerLabel && <span className="mt-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

export function RadarViz({ data, height = 260 }: { data: { subject: string; score: number; benchmark?: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={GRID} />
        <PolarAngleAxis dataKey="subject" tick={{ ...AXIS, fontSize: 10.5 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ ...AXIS, fontSize: 9.5 }} axisLine={false} />
        <Radar name="Score" dataKey="score" stroke={VIZ[0]} fill={VIZ[0]} fillOpacity={0.22} strokeWidth={2} />
        {data[0]?.benchmark !== undefined && <Radar name="Export-ready threshold" dataKey="benchmark" stroke={VIZ[1]} fill="none" strokeWidth={1.5} strokeDasharray="4 3" />}
        <Legend wrapperStyle={{ fontSize: 11.5 }} />
        <Tooltip content={<TipBox />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function FunnelViz({ data, height = 240, fmt }: { data: { name: string; value: number; fill?: string }[]; height?: number; fmt?: (v: number) => string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <FunnelChart>
        <Tooltip content={<TipBox fmt={fmt} />} />
        <Funnel dataKey="value" data={data.map((d, i) => ({ ...d, fill: d.fill ?? VIZ[i % VIZ.length] }))} isAnimationActive>
          <LabelList position="right" dataKey="name" style={{ fontSize: 11.5, fill: 'hsl(60 3% 20%)', fontFamily: 'IBM Plex Sans' }} />
          <LabelList position="left" dataKey="value" style={{ fontSize: 11.5, fill: 'hsl(55 5% 40%)', fontFamily: 'IBM Plex Sans' }} />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
