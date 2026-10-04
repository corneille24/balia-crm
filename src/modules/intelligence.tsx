import React, { useMemo, useState } from 'react';
import { ClipboardCheck, Globe2, BookOpen, GraduationCap, Award, Plus, Download, Search } from 'lucide-react';
import { useApp } from '@/store';
import { ASSESSMENT_DIMENSIONS, COUNTRIES, readinessBand, SERVICES } from '@/data/catalog';
import {
  PageHeader, Section, Badge, Button, StatusBadge, DataTable, Drawer, Toolbar, SearchInput,
  Select, Stat, Avatar, EmptyState, Tabs, Progress, Modal, Field, Input, Textarea, KpiCard, Collapse,
} from '@/components/kit';
import { RadarViz, BarViz, DonutViz, VIZ } from '@/components/charts';
import { money, fmtDate, assessmentScore, assessmentRecommendations, TODAY_ISO } from '@/lib/derive';
import { cn } from '@/lib/utils';

// ===========================================================================
export function Assessments() {
  const { state, dispatch, focusId, setFocusId, user, companyById, toast } = useApp();
  const [newOpen, setNewOpen] = useState(false);
  const a = state.assessments.find((x) => x.id === focusId);

  return (
    <div className="enter-up">
      <PageHeader title="Assessments"
        subtitle="The BALIA trade readiness diagnostic and market entry assessment. Scores are weighted across six dimensions and drive the recommendations in the client report."
        meta={<>
          <Badge tone="forest" dot>{state.assessments.filter((x) => x.type === 'Trade Readiness').length} readiness</Badge>
          <Badge tone="gold" dot>{state.assessments.filter((x) => x.type === 'Market Entry').length} market entry</Badge>
        </>}
        actions={<Button onClick={() => setNewOpen(true)}><Plus className="size-3.5" />New assessment</Button>} />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {state.assessments.map((x) => {
          const isReadiness = x.type === 'Trade Readiness';
          const score = isReadiness ? assessmentScore(x.scores).overall : null;
          const band = score !== null ? readinessBand(score) : null;
          const co = companyById(x.companyId);
          return (
            <button key={x.id} onClick={() => setFocusId(x.id)} className="panel lift p-4 text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium">{co?.tradingName}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{x.type} · {fmtDate(x.date)}</p>
                </div>
                {score !== null && band && (
                  <div className="shrink-0 text-right">
                    <p className="tnum font-display text-[24px] font-semibold leading-none">{score}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">/ 100</p>
                  </div>
                )}
              </div>
              {band && <div className="mt-3"><Badge tone={band.tone} dot>{band.label}</Badge></div>}
              {x.targetMarket && <p className="mt-2 text-[12px] text-muted-foreground">Target: {x.targetMarket}{x.product ? ` · ${x.product}` : ''}</p>}
              <p className="mt-2 line-clamp-2 border-t border-border pt-2 text-[12px] leading-relaxed text-muted-foreground">{x.notes}</p>
            </button>
          );
        })}
      </div>

      {a && <AssessmentDrawer assessmentId={a.id} onClose={() => setFocusId(null)} />}
      <NewAssessmentModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}

function AssessmentDrawer({ assessmentId, onClose }: { assessmentId: string; onClose: () => void }) {
  const { state, dispatch, user, companyById, userById, toast } = useApp();
  const a = state.assessments.find((x) => x.id === assessmentId)!;
  const co = companyById(a.companyId);
  const [scores, setScores] = useState<Record<string, number>>(a.scores);
  const [tab, setTab] = useState('score');
  const isReadiness = a.type === 'Trade Readiness';
  const { dims, overall } = assessmentScore(scores);
  const band = readinessBand(overall);
  const recs = assessmentRecommendations({ ...a, scores });

  return (
    <Drawer open onClose={onClose} width="max-w-3xl" title={`${a.type} — ${co?.tradingName}`}
      subtitle={<span className="flex items-center gap-2">{fmtDate(a.date, 'long')} · {userById(a.assessor)?.name}{a.targetMarket && ` · target ${a.targetMarket}`}</span>}
      footer={<>
        <Button variant="outline"><Download className="size-3.5" />Generate report</Button>
        {isReadiness && <Button onClick={() => { dispatch({ type: 'saveAssessment', assessment: { ...a, scores }, user: user.id }); toast(`Assessment saved. Score is now ${overall} — ${readinessBand(overall).label}.`); }}>Save scores</Button>}
      </>}>
      {isReadiness ? (
        <>
          <div className="mb-4 panel-flat bg-secondary/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">BALIA Trade Readiness Score</p>
                <p className="tnum mt-1 font-display text-[40px] font-semibold leading-none">{overall}<span className="text-[16px] font-normal text-muted-foreground"> / 100</span></p>
              </div>
              <div className="text-right">
                <Badge tone={band.tone} dot>{band.label}</Badge>
                <p className="mt-1.5 max-w-[24ch] text-[11.5px] leading-relaxed text-muted-foreground">
                  {overall >= 75 ? 'Ready to pursue the target market with focused support.' : overall >= 60 ? 'Developing — close the weak dimensions before committing to volumes.' : 'Significant gaps. Address these before approaching buyers.'}
                </p>
              </div>
            </div>
          </div>

          <Tabs active={tab} onChange={setTab} className="mb-4" tabs={[
            { id: 'score', label: 'Scoring' }, { id: 'profile', label: 'Profile' }, { id: 'recs', label: 'Recommendations', count: recs.length },
          ]} />

          {tab === 'score' && (
            <div className="space-y-4">
              <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                Each question is scored 0–5. Dimensions are weighted; company, product, export, market and regulatory carry 18% each and logistics 10%.
              </p>
              {ASSESSMENT_DIMENSIONS.map((dim) => {
                const d = dims.find((x) => x.id === dim.id)!;
                return (
                  <div key={dim.id} className="panel-flat p-3.5">
                    <div className="mb-2.5 flex items-baseline justify-between gap-3">
                      <p className="text-[13px] font-medium">{dim.name}</p>
                      <span className="tnum text-[12px] text-muted-foreground">{d.got}/{d.max} · {Math.round(d.pct)}%</span>
                    </div>
                    <Progress value={d.pct} tone={d.pct >= 75 ? 'success' : d.pct >= 60 ? 'gold' : d.pct >= 40 ? 'warning' : 'danger'} />
                    <ul className="mt-3 space-y-2">
                      {dim.questions.map((q) => (
                        <li key={q.id} className="flex flex-wrap items-center justify-between gap-2">
                          <span className="min-w-0 flex-1 text-[12.5px] text-foreground">{q.text}</span>
                          <span className="flex shrink-0 gap-1">
                            {[0, 1, 2, 3, 4, 5].map((v) => (
                              <button key={v} onClick={() => setScores({ ...scores, [q.id]: v })}
                                className={cn('tnum size-6 rounded border text-[11.5px] transition-colors',
                                  (scores[q.id] ?? 0) === v
                                    ? 'border-forest bg-forest font-semibold text-primary-foreground'
                                    : 'border-border bg-card text-muted-foreground hover:border-forest/40 hover:bg-forest-soft')}>
                                {v}
                              </button>
                            ))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'profile' && (
            <div className="space-y-4">
              <RadarViz height={320} data={dims.map((d) => ({ subject: d.name.replace(' Readiness', ''), score: Math.round(d.pct), benchmark: 75 }))} />
              <div className="panel-flat p-3.5">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Assessor notes</p>
                <p className="prose-editorial">{a.notes}</p>
              </div>
            </div>
          )}

          {tab === 'recs' && (
            <div className="space-y-3">
              {recs.length === 0 && <EmptyState title="No weak dimensions" detail="Every dimension scores 60% or above. Focus the engagement on execution rather than remediation." />}
              {recs.map((r) => (
                <div key={r.dimension} className="panel-flat p-3.5">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="text-[13px] font-medium">{r.dimension}</p>
                    <Badge tone={r.pct < 40 ? 'danger' : 'warning'}>{r.pct}%</Badge>
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-muted-foreground">{r.action}</p>
                </div>
              ))}
              {recs.length > 0 && (
                <div className="panel-flat bg-forest-soft/50 p-3.5">
                  <p className="text-[12.5px] font-medium text-forest">Recommended next service</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-forest">
                    {recs[0].dimension.includes('Regulatory') ? 'Product Compliance Assessment, followed by an export documentation package.'
                      : recs[0].dimension.includes('Market') ? 'Market Entry Assessment for the stated target market.'
                      : 'Export Readiness Assessment follow-up with a documentation workstream.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-5">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
            <Stat label="Origin" value={co?.country} />
            <Stat label="Target market" value={a.targetMarket} />
            <Stat label="Product" value={a.product} />
            <Stat label="HS code" value={<span className="font-mono">{a.hsCode}</span>} />
            <Stat label="Assessor" value={userById(a.assessor)?.name} />
            <Stat label="Date" value={fmtDate(a.date, 'long')} />
          </dl>
          <div className="panel-flat p-3.5">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Findings</p>
            <p className="prose-editorial">{a.notes}</p>
          </div>
          {a.targetMarket && (() => {
            const country = COUNTRIES.find((c) => c.name === a.targetMarket);
            return country ? (
              <div className="panel-flat p-3.5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Market context — {country.name}</p>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Stat label="Agreements" value={country.agreements.join(', ')} className="col-span-2" />
                  <Stat label="Import requirements" value={country.importNotes} className="col-span-2" />
                  <Stat label="Risk" value={<Badge tone={country.risk === 'Low' ? 'success' : country.risk === 'Moderate' ? 'gold' : 'warning'}>{country.risk}</Badge>} />
                </dl>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </Drawer>
  );
}

function NewAssessmentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, user, toast, setFocusId } = useApp();
  const [companyId, setCompanyId] = useState('CMP-07');
  const [type, setType] = useState<'Trade Readiness' | 'Market Entry'>('Trade Readiness');
  const [target, setTarget] = useState('Netherlands');

  const create = () => {
    const id = `ASM-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    dispatch({
      type: 'saveAssessment', user: user.id,
      assessment: { id, companyId, type, date: TODAY_ISO, assessor: user.id, scores: {}, notes: '', targetMarket: target },
    });
    toast('Assessment created. Score each dimension to generate the readiness profile.');
    onClose();
    setFocusId(id);
  };

  return (
    <Modal open={open} onClose={onClose} title="New assessment"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={create}>Create</Button></>}>
      <div className="grid gap-3">
        <Field label="Client">
          <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            {state.companies.map((c) => <option key={c.id} value={c.id}>{c.tradingName}</option>)}
          </Select>
        </Field>
        <Field label="Assessment type">
          <Select value={type} onChange={(e) => setType(e.target.value as any)}>
            <option>Trade Readiness</option><option>Market Entry</option>
          </Select>
        </Field>
        <Field label="Target market">
          <Select value={target} onChange={(e) => setTarget(e.target.value)}>
            {COUNTRIES.map((c) => <option key={c.code}>{c.name}</option>)}
          </Select>
        </Field>
      </div>
    </Modal>
  );
}

// ===========================================================================
export function Intelligence() {
  const { state, companyById } = useApp();
  const [tab, setTab] = useState('countries');
  const [q, setQ] = useState('');
  const [selCountry, setSelCountry] = useState<string | null>(null);

  const countries = COUNTRIES.filter((c) => !q || `${c.name} ${c.region} ${c.industries.join(' ')}`.toLowerCase().includes(q.toLowerCase()));
  const country = COUNTRIES.find((c) => c.code === selCountry);

  return (
    <div className="enter-up">
      <PageHeader title="Trade intelligence"
        subtitle="The country and product reference layer. Every client, product and target market resolves against these records so advice stays consistent across the team."
        meta={<><Badge tone="muted">{COUNTRIES.length} countries</Badge><Badge tone="muted">{state.products.length} client products</Badge></>} />

      <Tabs active={tab} onChange={setTab} className="mb-4" tabs={[
        { id: 'countries', label: 'Countries', count: COUNTRIES.length },
        { id: 'products', label: 'Products', count: state.products.length },
        { id: 'services', label: 'Service catalogue', count: SERVICES.length },
      ]} />

      {tab === 'countries' && (
        <>
          <Toolbar><SearchInput value={q} onChange={setQ} placeholder="Search countries…" className="w-full sm:w-64" /></Toolbar>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {countries.map((c) => (
              <button key={c.code} onClick={() => setSelCountry(c.code)} className="panel lift p-4 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-medium">{c.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{c.region} · {c.currency}</p>
                  </div>
                  <Badge tone={c.afcfta === 'Trading under AfCFTA' ? 'forest' : c.afcfta === 'Not a party' ? 'muted' : 'gold'}>{c.afcfta === 'Trading under AfCFTA' ? 'AfCFTA live' : c.afcfta}</Badge>
                </div>
                <p className="mt-2.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">{c.opportunities}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-border pt-2.5">
                  <Badge tone={c.risk === 'Low' ? 'success' : c.risk === 'Moderate' ? 'gold' : 'warning'} dot>{c.risk} risk</Badge>
                  <span className="text-[11.5px] text-muted-foreground">{state.companies.filter((x) => x.country === c.name || x.targetMarkets.includes(c.name)).length} linked companies</span>
                </div>
              </button>
            ))}
          </div>

          <Drawer open={!!country} onClose={() => setSelCountry(null)} title={country?.name ?? ''}
            subtitle={country && <span className="flex items-center gap-2"><Badge tone="muted">{country.region}</Badge><Badge tone={country.risk === 'Low' ? 'success' : 'gold'} dot>{country.risk} risk</Badge></span>}>
            {country && (
              <div className="space-y-5">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                  <Stat label="Currency" value={country.currency} />
                  <Stat label="Languages" value={country.languages} />
                  <Stat label="AfCFTA status" value={country.afcfta} />
                  <Stat label="Major industries" value={country.industries.join(', ')} />
                  <Stat label="Trade agreements" value={country.agreements.join(' · ')} className="col-span-2" />
                </dl>
                <div><p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Opportunities</p><p className="prose-editorial">{country.opportunities}</p></div>
                <div><p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Import requirements</p><p className="prose-editorial">{country.importNotes}</p></div>
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Linked companies</p>
                  {state.companies.filter((x) => x.country === country.name || x.targetMarkets.includes(country.name)).map((x) => (
                    <div key={x.id} className="flex items-center justify-between gap-3 border-b border-border py-2 text-[12.5px] last:border-0">
                      <span>{x.tradingName}</span>
                      <Badge tone="muted">{x.country === country.name ? 'Based here' : 'Target market'}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Drawer>
        </>
      )}

      {tab === 'products' && (
        <Section flush>
          <DataTable rows={state.products} columns={[
            { key: 'n', header: 'Product', cell: (p) => <div><p className="font-medium">{p.name}</p><p className="text-[11.5px] text-muted-foreground">{companyById(p.companyId)?.tradingName}</p></div> },
            { key: 'h', header: 'HS code', cell: (p) => <span className="font-mono text-[12.5px]">{p.hsCode}</span> },
            { key: 'o', header: 'Origin', cell: (p) => p.origin, hideBelow: 'md' },
            { key: 't', header: 'Target markets', cell: (p) => p.targetMarkets.join(', '), hideBelow: 'lg' },
            { key: 'r', header: 'Requirements', cell: (p) => <div className="flex flex-wrap gap-1">{p.requirements.slice(0, 2).map((r) => <Badge key={r} tone="muted">{r}</Badge>)}{p.requirements.length > 2 && <Badge tone="muted">+{p.requirements.length - 2}</Badge>}</div> },
            { key: 'c', header: 'Certifications', cell: (p) => (p.certifications.length ? p.certifications.join(', ') : <span className="text-warning">None held</span>), hideBelow: 'lg' },
          ]} />
        </Section>
      )}

      {tab === 'services' && (
        <div className="grid gap-3 md:grid-cols-2">
          {SERVICES.map((s) => (
            <div key={s.id} className="panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium">{s.name}</p>
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">{s.category} · {s.duration}</p>
                </div>
                <span className="tnum shrink-0 font-display text-[15px] font-semibold">{money(s.price, s.currency, true)}</span>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{s.description}</p>
              <div className="mt-3 grid gap-2 border-t border-border pt-3 text-[11.5px]">
                <div><span className="text-muted-foreground">Deliverables: </span>{s.deliverables.join(', ')}</div>
                <div><span className="text-muted-foreground">Workflow: </span>{s.workflow.length} steps</div>
                <div><span className="text-muted-foreground">Pricing: </span>{s.pricingModel} · {s.taxTreatment}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
export function Knowledge() {
  const { state } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [sel, setSel] = useState<string | null>(null);
  const rows = state.articles.filter((a) =>
    (!q || `${a.title} ${a.summary} ${a.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())) &&
    (!cat || a.category === cat));
  const article = state.articles.find((a) => a.id === sel);
  const cats = Array.from(new Set(state.articles.map((a) => a.category)));

  return (
    <div className="enter-up">
      <PageHeader title="Knowledge base"
        subtitle="The firm's working reference: regulatory explainers, checklists, templates and internal procedure. What BALIA knows, written down once."
        meta={<><Badge tone="muted">{state.articles.length} entries</Badge><Badge tone="forest" dot>{cats.length} categories</Badge></>} />

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search the knowledge base…" className="w-full sm:w-72" />
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="w-auto"><option value="">All categories</option>{cats.map((c) => <option key={c}>{c}</option>)}</Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} entries</span>
      </Toolbar>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((a) => (
          <button key={a.id} onClick={() => setSel(a.id)} className="panel lift flex flex-col p-4 text-left">
            <div className="flex items-center justify-between gap-2">
              <Badge tone={a.type === 'SOP' ? 'gold' : a.type === 'Checklist' ? 'info' : a.type === 'Template' ? 'muted' : 'forest'}>{a.type}</Badge>
              <span className="text-[11.5px] text-muted-foreground">{a.readTime}</span>
            </div>
            <p className="mt-2.5 text-[13.5px] font-medium leading-snug">{a.title}</p>
            <p className="mt-1.5 line-clamp-3 flex-1 text-[12.5px] leading-relaxed text-muted-foreground">{a.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-2.5">
              {a.tags.slice(0, 3).map((t) => <Badge key={t} tone="muted">{t}</Badge>)}
              <span className="ml-auto text-[11px] text-muted-foreground">{fmtDate(a.updated)}</span>
            </div>
          </button>
        ))}
      </div>
      {!rows.length && <Section><EmptyState title="Nothing matches" detail="Try a broader search term, or clear the category filter." /></Section>}

      <Drawer open={!!article} onClose={() => setSel(null)} width="max-w-2xl" title={article?.title ?? ''}
        subtitle={article && <span className="flex items-center gap-2"><Badge tone="forest">{article.category}</Badge>{article.readTime} · updated {fmtDate(article.updated)}</span>}>
        {article && (
          <div>
            <p className="mb-4 border-l-2 border-gold pl-3 text-[13px] italic leading-relaxed text-muted-foreground">{article.summary}</p>
            <div className="prose-editorial">
              {article.body.split('\n\n').map((para, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-1.5 border-t border-border pt-4">
              {article.tags.map((t) => <Badge key={t} tone="muted">{t}</Badge>)}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

// ===========================================================================
export function Academy() {
  const { state, userById, companyById } = useApp();
  const [tab, setTab] = useState('courses');
  const [sel, setSel] = useState<string | null>(null);
  const course = state.courses.find((c) => c.id === sel);

  const totals = {
    enrolled: state.courses.reduce((s, c) => s + c.enrolled, 0),
    completed: state.courses.reduce((s, c) => s + c.completed, 0),
    certificates: state.courses.reduce((s, c) => s + c.certificates, 0),
    revenue: state.courses.reduce((s, c) => s + c.price * c.enrolled * (c.currency === 'EUR' ? 1.09 : 1), 0),
  };

  return (
    <div className="enter-up">
      <PageHeader title="BALIA Academy"
        subtitle="Course delivery, corporate cohorts and certification. Training relationships convert into advisory work more reliably than any other channel."
        meta={<><Badge tone="forest" dot>{state.courses.length} published courses</Badge><Badge tone="muted">{totals.enrolled} enrolments</Badge></>}
        actions={<Button><Plus className="size-3.5" />New course</Button>} />

      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <KpiCard dense label="Enrolments" value={totals.enrolled} />
        <KpiCard dense label="Completion rate" value={`${((totals.completed / totals.enrolled) * 100).toFixed(0)}%`} />
        <KpiCard dense label="Certificates issued" value={totals.certificates} />
        <KpiCard dense label="Course revenue" value={money(totals.revenue, 'XAF', true)} />
      </div>

      <Tabs active={tab} onChange={setTab} className="mb-4" tabs={[
        { id: 'courses', label: 'Courses', count: state.courses.length },
        { id: 'learners', label: 'Learners', count: state.enrollments.length },
        { id: 'analytics', label: 'Analytics' },
      ]} />

      {tab === 'courses' && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {state.courses.map((c) => (
            <button key={c.id} onClick={() => setSel(c.id)} className="panel lift flex flex-col p-4 text-left">
              <div className="flex items-start justify-between gap-2">
                <Badge tone="forest">{c.category}</Badge>
                <Badge tone="muted">{c.level}</Badge>
              </div>
              <p className="mt-2.5 text-[13.5px] font-medium leading-snug">{c.title}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">{c.duration} · {userById(c.instructor)?.name}</p>
              <div className="mt-3 flex-1">
                <div className="mb-1 flex items-baseline justify-between text-[11.5px]">
                  <span className="text-muted-foreground">{c.completed} of {c.enrolled} completed</span>
                  <span className="tnum">{Math.round((c.completed / c.enrolled) * 100)}%</span>
                </div>
                <Progress value={(c.completed / c.enrolled) * 100} tone="forest" />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
                <span className="tnum text-[13px] font-medium">{money(c.price, c.currency)}</span>
                <span className="flex items-center gap-1 text-[11.5px] text-muted-foreground"><Award className="size-3" />{c.certificates}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {tab === 'learners' && (
        <Section flush>
          <DataTable rows={state.enrollments} columns={[
            { key: 'n', header: 'Learner', cell: (e) => <div><p className="font-medium">{e.learnerName}</p><p className="text-[11.5px] text-muted-foreground">{e.organisation}</p></div>, sort: (e) => e.learnerName },
            { key: 'c', header: 'Course', cell: (e) => state.courses.find((c) => c.id === e.courseId)?.title, hideBelow: 'md' },
            { key: 'co', header: 'Cohort', cell: (e) => <Badge tone={e.corporate ? 'forest' : 'muted'}>{e.cohort}</Badge>, hideBelow: 'lg' },
            { key: 'p', header: 'Progress', cell: (e) => <div className="w-32"><Progress value={e.progress} showLabel size="sm" /></div>, sort: (e) => e.progress },
            { key: 's', header: 'Score', align: 'right', cell: (e) => (e.score ? `${e.score}%` : '—') },
            { key: 'cert', header: 'Certificate', align: 'center', cell: (e) => (e.certified ? <Badge tone="success" dot>Issued</Badge> : <span className="text-muted-foreground">—</span>) },
          ]} />
        </Section>
      )}

      {tab === 'analytics' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Enrolment against completion">
            <BarViz height={250} horizontal data={state.courses.map((c) => ({ name: c.title.length > 20 ? `${c.title.slice(0, 18)}…` : c.title, enrolled: c.enrolled, completed: c.completed }))}
              series={[{ key: 'enrolled', name: 'Enrolled' }, { key: 'completed', name: 'Completed', color: VIZ[1] }]} />
          </Section>
          <Section title="Average assessment score">
            <BarViz height={250} data={state.courses.map((c) => ({ name: c.category, score: c.avgScore }))} series={[{ key: 'score', name: 'Average score' }]} />
          </Section>
          <Section title="Revenue by course" className="lg:col-span-2">
            <BarViz height={220} data={state.courses.map((c) => ({ name: c.title.length > 24 ? `${c.title.slice(0, 22)}…` : c.title, revenue: Math.round(c.price * c.enrolled * (c.currency === 'EUR' ? 1.09 : 1)) }))}
              series={[{ key: 'revenue', name: 'Revenue' }]} fmt={(v) => money(v, 'XAF', true)} />
          </Section>
        </div>
      )}

      <Drawer open={!!course} onClose={() => setSel(null)} width="max-w-2xl" title={course?.title ?? ''}
        subtitle={course && <span className="flex items-center gap-2"><Badge tone="forest">{course.category}</Badge>{course.level} · {course.duration} · {userById(course.instructor)?.name}</span>}
        footer={course && <><Button variant="outline">Duplicate</Button><Button>Manage cohort</Button></>}>
        {course && (
          <div className="space-y-5">
            <div className="grid grid-cols-4 gap-2.5">
              {[{ l: 'Enrolled', v: course.enrolled }, { l: 'Completed', v: course.completed }, { l: 'Avg score', v: `${course.avgScore}%` }, { l: 'Certificates', v: course.certificates }].map((s) => (
                <div key={s.l} className="panel-flat bg-secondary/40 px-3 py-2.5">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">{s.l}</p>
                  <p className="tnum mt-1 font-display text-[16px] font-semibold">{s.v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Objectives</p>
              <ul className="space-y-1">
                {course.objectives.map((o) => <li key={o} className="flex items-start gap-2 text-[12.5px]"><span className="mt-1.5 size-1 shrink-0 rounded-full bg-gold" />{o}</li>)}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Curriculum</p>
              {course.modules.map((m, i) => (
                <Collapse key={m.title} title={<span><span className="tnum mr-2 text-muted-foreground">{i + 1}</span>{m.title}</span>} meta={<Badge tone="muted">{m.lessons.length} lessons</Badge>}>
                  <ul className="space-y-1">
                    {m.lessons.map((l) => <li key={l} className="text-[12.5px] text-muted-foreground">{l}</li>)}
                  </ul>
                </Collapse>
              ))}
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.055em] text-muted-foreground">Enrolled learners</p>
              {state.enrollments.filter((e) => e.courseId === course.id).map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
                  <div><p className="text-[12.5px] font-medium">{e.learnerName}</p><p className="text-[11.5px] text-muted-foreground">{e.organisation}</p></div>
                  <div className="flex w-32 items-center gap-2"><Progress value={e.progress} size="sm" showLabel /></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
