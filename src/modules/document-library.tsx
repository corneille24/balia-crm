import React, { useState } from 'react';
import { FilePlus2, ExternalLink, FolderOpen, Link2, Trash2 } from 'lucide-react';
import { useApp } from '@/store';
import {
  PageHeader, Section, Badge, Button, DataTable, Toolbar, SearchInput, Select,
  KpiCard, EmptyState, Modal, Field, Input, Textarea,
} from '@/components/kit';
import { fmtDate, TODAY_ISO } from '@/lib/derive';
import { LIBRARY_TYPES, LIBRARY_PROJECTS } from '@/data/library';
import type { LibraryDoc } from '@/data/library';

const rid = () => `LIB-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
const TYPE_TONE: Record<string, 'forest' | 'gold' | 'info' | 'muted'> = {
  Report: 'forest', Presentation: 'info', Proposal: 'gold', Strategy: 'forest', Guide: 'info', Brief: 'info',
};

export function DocumentLibrary() {
  const { state, dispatch, user, userById, can, toast } = useApp();
  const docs = state.library as LibraryDoc[];
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [project, setProject] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState<LibraryDoc | null>(null);

  const rows = docs.filter((x) => {
    if (q && !`${x.title} ${x.description} ${x.category} ${x.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (type && x.type !== type) return false;
    if (project && x.project !== project) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const byProject = (p: string) => docs.filter((x) => x.project === p).length;

  const remove = (doc: LibraryDoc) => {
    dispatch({ type: 'remove', collection: 'library', id: doc.id });
    dispatch({ type: 'audit', entry: { user: user.id, action: 'Document removed from library', record: doc.id, detail: doc.title } });
    toast('Removed from the library.', 'info');
  };

  return (
    <div className="enter-up">
      <PageHeader
        title="Document Library"
        subtitle="One place for every BALIA deliverable — reports, decks, proposals, strategies and guides across projects. Each entry links straight to the document; add your own with a Drive/Docs link."
        actions={can('record.edit') ? <Button onClick={() => setAddOpen(true)}><FilePlus2 className="size-3.5" />Add document</Button> : undefined}
        meta={<>
          <Badge tone="forest" dot>{docs.length} documents</Badge>
          {byProject('TradeBridge Advisory') > 0 && <Badge tone="muted">{byProject('TradeBridge Advisory')} TradeBridge</Badge>}
        </>} />

      <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <KpiCard label="Total documents" value={String(docs.length)} />
        <KpiCard dense label="Balia CRM" value={String(byProject('Balia CRM'))} />
        <KpiCard dense label="Balia Consulting" value={String(byProject('Balia Consulting'))} />
        <KpiCard dense label="TradeBridge" value={String(byProject('TradeBridge Advisory'))} />
      </div>

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search documents…" className="w-full sm:w-56" />
        <Select value={project} onChange={(e) => setProject(e.target.value)} className="w-auto"><option value="">All projects</option>{LIBRARY_PROJECTS.map((p) => <option key={p}>{p}</option>)}</Select>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="w-auto"><option value="">All types</option>{LIBRARY_TYPES.map((t) => <option key={t}>{t}</option>)}</Select>
        <span className="ml-auto text-[12px] text-muted-foreground">{rows.length} of {docs.length}</span>
      </Toolbar>

      <Section flush>
        {rows.length === 0 ? (
          <EmptyState title={docs.length === 0 ? 'Your library is empty' : 'No documents match'}
            detail={docs.length === 0 ? 'Add your first document — a title, type, project and a link to open it.' : 'Clear the search or filters.'}
            action={can('record.edit') ? <Button onClick={() => setAddOpen(true)}><FilePlus2 className="size-3.5" />Add document</Button> : undefined} />
        ) : (
          <DataTable rows={rows} columns={[
            {
              key: 't', header: 'Document', sort: (x) => x.title, cell: (x) => (
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground"><FolderOpen className="size-4" strokeWidth={1.7} /></span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{x.title}</p>
                    <p className="truncate text-[11.5px] text-muted-foreground">{x.category} · {userById(x.owner)?.name ?? x.owner}</p>
                  </div>
                </div>
              ),
            },
            { key: 'ty', header: 'Type', cell: (x) => <Badge tone={TYPE_TONE[x.type] ?? 'muted'}>{x.type}</Badge> },
            { key: 'p', header: 'Project', cell: (x) => x.project, hideBelow: 'md' },
            { key: 'dt', header: 'Date', cell: (x) => fmtDate(x.date), sort: (x) => x.date, hideBelow: 'lg' },
            {
              key: 'a', header: 'Open', align: 'right', cell: (x) => (
                <div className="flex items-center justify-end gap-1.5">
                  {x.link
                    ? <a href={/^(https?:\/\/|\/)/.test(x.link) ? x.link : `https://${x.link}`} target="_blank" rel="noreferrer" download onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-[11.5px] text-forest hover:bg-secondary">Open<ExternalLink className="size-3" /></a>
                    : <span className="text-[11px] text-muted-foreground" title="No link yet — edit to add one">no link</span>}
                  {can('record.edit') && <button onClick={(e) => { e.stopPropagation(); setEdit(x); }} className="rounded-md border border-input px-2 py-1 text-[11.5px] text-muted-foreground hover:bg-secondary"><Link2 className="size-3" /></button>}
                  {can('record.edit') && <button onClick={(e) => { e.stopPropagation(); remove(x); }} className="rounded-md border border-input px-1.5 py-1 text-muted-foreground hover:text-danger" title="Remove"><Trash2 className="size-3" /></button>}
                </div>
              ),
            },
          ]} />
        )}
      </Section>

      <LibraryModal open={addOpen} onClose={() => setAddOpen(false)} />
      {edit && <LibraryModal open onClose={() => setEdit(null)} doc={edit} />}
    </div>
  );
}

function LibraryModal({ open, onClose, doc }: { open: boolean; onClose: () => void; doc?: LibraryDoc }) {
  const { dispatch, user, toast } = useApp();
  const [form, setForm] = useState({
    title: doc?.title ?? '', type: doc?.type ?? LIBRARY_TYPES[0], project: doc?.project ?? LIBRARY_PROJECTS[0],
    category: doc?.category ?? '', date: doc?.date ?? TODAY_ISO, description: doc?.description ?? '', link: doc?.link ?? '',
  });
  const save = () => {
    if (!form.title.trim()) return;
    if (doc) {
      dispatch({ type: 'patch', collection: 'library', id: doc.id, changes: { ...form } });
      dispatch({ type: 'audit', entry: { user: user.id, action: 'Library document updated', record: doc.id, detail: form.title } });
      toast('Document updated.', 'success');
    } else {
      const id = rid();
      dispatch({ type: 'add', collection: 'library', record: { id, ...form, owner: user.id, tags: [] } });
      dispatch({ type: 'audit', entry: { user: user.id, action: 'Document added to library', record: id, detail: form.title } });
      toast('Document added to the library.', 'success');
    }
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={doc ? 'Edit document' : 'Add document'} width="max-w-lg"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>{doc ? 'Save' : 'Add document'}</Button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title" className="sm:col-span-2"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. TradeBridge market-entry strategy" /></Field>
        <Field label="Type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{LIBRARY_TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="Project"><Select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })}>{LIBRARY_PROJECTS.map((p) => <option key={p}>{p}</option>)}</Select></Field>
        <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. EUDR, Governance" /></Field>
        <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="Link (Drive / Docs URL)" className="sm:col-span-2"><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://docs.google.com/…" /></Field>
        <Field label="Description" className="sm:col-span-2"><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}
