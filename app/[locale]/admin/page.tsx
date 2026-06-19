'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';

const LOCALES = ['en', 'ja', 'ne'];
const SECTIONS = ['nav', 'hero', 'about', 'contact', 'footer', 'work', 'media'];
const SECTION_LABELS: Record<string, string> = {
  nav: 'Navigation', hero: 'Hero', about: 'About', contact: 'Contact',
  footer: 'Footer', work: 'Work Projects', media: 'Media & Talks',
};

// ─── helpers ────────────────────────────────────────────────────────────────
function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// ─── Login ───────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/admin/sections?locale=en&section=nav`);
    if (!res.ok) { setErr('Cannot reach server'); return; }

    // verify password by doing a harmless PUT
    const test = await fetch('/api/admin/sections', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'en', section: 'nav', data: undefined, password: pw }),
    });
    if (test.status === 401) { setErr('Wrong password'); return; }
    sessionStorage.setItem('admin_pw', pw);
    onLogin(pw);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f' }}>
      <form onSubmit={submit} style={{ background: '#1a1a1a', padding: '2.5rem', borderRadius: 12, width: 340, border: '1px solid #333' }}>
        <h1 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.4rem' }}>Admin Panel</h1>
        <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.85rem' }}>Nanami Wakayama Portfolio</p>
        <input
          type="password" placeholder="Password" value={pw}
          onChange={e => setPw(e.target.value)} required
          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #444', background: '#111', color: '#fff', fontSize: '0.95rem', marginBottom: '1rem', boxSizing: 'border-box' }}
        />
        {err && <p style={{ color: '#f44', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{err}</p>}
        <button type="submit" style={{ width: '100%', padding: '0.75rem', borderRadius: 8, background: '#fff', color: '#000', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>
          Sign In
        </button>
      </form>
    </div>
  );
}

// ─── Field editor ─────────────────────────────────────────────────────────────
function FieldRow({ label, value, multiline, onSave }: { label: string; value: string; multiline?: boolean; onSave: (v: string) => Promise<void> }) {
  const [val, setVal] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setVal(value); }, [value]);

  async function save() {
    setSaving(true);
    await onSave(val);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, padding: '0.55rem 0.75rem', borderRadius: 6, border: '1px solid #444',
    background: '#111', color: '#fff', fontSize: '0.88rem', resize: multiline ? 'vertical' : undefined,
  };

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: multiline ? 'flex-start' : 'center', marginBottom: 12 }}>
      <span style={{ color: '#aaa', fontSize: '0.8rem', width: 110, flexShrink: 0, paddingTop: multiline ? 8 : 0 }}>{label}</span>
      {multiline
        ? <textarea rows={3} value={val} onChange={e => setVal(e.target.value)} style={inputStyle} />
        : <input value={val} onChange={e => setVal(e.target.value)} style={inputStyle} />}
      <button onClick={save} disabled={saving} style={{ padding: '0.5rem 0.9rem', borderRadius: 6, border: 'none', background: saved ? '#22c55e' : '#fff', color: '#000', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
        {saving ? '…' : saved ? 'Saved' : 'Save'}
      </button>
    </div>
  );
}

// ─── Section panels ──────────────────────────────────────────────────────────
function SectionPanel({ section, locale, password }: { section: string; locale: string; password: string }) {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/sections?locale=${locale}&section=${section}`);
    const json = await res.json();
    setData(json.data || {});
    setLoading(false);
  }, [locale, section]);

  useEffect(() => { load(); }, [load]);

  async function saveField(key: string, value: string) {
    await fetch('/api/admin/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale, section, key, value, password }),
    });
  }

  if (loading) return <p style={{ color: '#666', fontSize: '0.85rem' }}>Loading…</p>;

  const multilineKeys = ['description', 'subtitle', 'mission', 'greeting'];

  return (
    <div>
      {Object.entries(data).map(([key, val]) => (
        <FieldRow key={key} label={key} value={String(val)} multiline={multilineKeys.includes(key)}
          onSave={v => saveField(key, v)} />
      ))}
    </div>
  );
}

// ─── Work panel ───────────────────────────────────────────────────────────────
function WorkPanel({ locale, password }: { locale: string; password: string }) {
  const [items, setItems] = useState<{ key: string; title: string; description: string }[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/works?locale=${locale}`);
    const json = await res.json();
    setItems(json.items || []);
  }, [locale]);

  useEffect(() => { load(); }, [load]);

  async function saveItem(key: string, title: string, description: string) {
    await fetch('/api/admin/works', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale, key, title, description, password }),
    });
  }

  async function deleteItem(key: string) {
    if (!confirm(`Delete "${key}"?`)) return;
    await fetch('/api/admin/works', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale, key, password }),
    });
    load();
  }

  async function addItem() {
    if (!newTitle) return;
    setAdding(true);
    const key = newKey || slugify(newTitle);
    await saveItem(key, newTitle, newDesc);
    setNewKey(''); setNewTitle(''); setNewDesc('');
    setAdding(false);
    load();
  }

  return (
    <div>
      {items.map(item => (
        <WorkItemRow key={item.key} item={item} onSave={saveItem} onDelete={() => deleteItem(item.key)} />
      ))}
      <div style={{ marginTop: 24, padding: 16, background: '#111', borderRadius: 8, border: '1px solid #333' }}>
        <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: 10 }}>Add new project</p>
        <input placeholder="Title *" value={newTitle} onChange={e => setNewTitle(e.target.value)}
          style={{ width: '100%', padding: '0.55rem', borderRadius: 6, border: '1px solid #444', background: '#1a1a1a', color: '#fff', marginBottom: 8, fontSize: '0.88rem', boxSizing: 'border-box' }} />
        <input placeholder="Key (auto-generated)" value={newKey} onChange={e => setNewKey(e.target.value)}
          style={{ width: '100%', padding: '0.55rem', borderRadius: 6, border: '1px solid #444', background: '#1a1a1a', color: '#fff', marginBottom: 8, fontSize: '0.88rem', boxSizing: 'border-box' }} />
        <textarea placeholder="Description" rows={2} value={newDesc} onChange={e => setNewDesc(e.target.value)}
          style={{ width: '100%', padding: '0.55rem', borderRadius: 6, border: '1px solid #444', background: '#1a1a1a', color: '#fff', marginBottom: 10, fontSize: '0.88rem', resize: 'vertical', boxSizing: 'border-box' }} />
        <button onClick={addItem} disabled={adding || !newTitle}
          style={{ padding: '0.6rem 1.2rem', borderRadius: 6, background: '#fff', color: '#000', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          {adding ? 'Adding…' : '+ Add Project'}
        </button>
      </div>
    </div>
  );
}

function WorkItemRow({ item, onSave, onDelete }: { item: { key: string; title: string; description: string }; onSave: (k: string, t: string, d: string) => Promise<void>; onDelete: () => void }) {
  const [title, setTitle] = useState(item.title);
  const [desc, setDesc] = useState(item.description);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onSave(item.key, title, desc);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div style={{ marginBottom: 12, padding: 14, background: '#111', borderRadius: 8, border: '1px solid #2a2a2a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
        <span style={{ color: '#666', fontSize: '0.75rem', fontFamily: 'monospace' }}>{item.key}</span>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: '#f44', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #333', background: '#1a1a1a', color: '#fff', marginBottom: 8, fontSize: '0.88rem', boxSizing: 'border-box' }} />
      <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #333', background: '#1a1a1a', color: '#fff', marginBottom: 10, fontSize: '0.88rem', resize: 'vertical', boxSizing: 'border-box' }} />
      <button onClick={save} disabled={saving}
        style={{ padding: '0.45rem 1rem', borderRadius: 6, background: saved ? '#22c55e' : '#fff', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
        {saving ? '…' : saved ? 'Saved' : 'Save'}
      </button>
    </div>
  );
}

// ─── Media panel ──────────────────────────────────────────────────────────────
function MediaPanel({ locale, password }: { locale: string; password: string }) {
  const [items, setItems] = useState<{ key: string; value: string }[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/media?locale=${locale}`);
    const json = await res.json();
    setItems(json.items || []);
  }, [locale]);

  useEffect(() => { load(); }, [load]);

  async function saveItem(key: string, value: string) {
    await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale, key, value, password }),
    });
  }

  async function deleteItem(key: string) {
    if (!confirm(`Delete "${key}"?`)) return;
    await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale, key, password }),
    });
    load();
  }

  async function addItem() {
    if (!newKey || !newValue) return;
    setAdding(true);
    await saveItem(newKey, newValue);
    setNewKey(''); setNewValue('');
    setAdding(false);
    load();
  }

  return (
    <div>
      {items.map(item => (
        <MediaItemRow key={item.key} item={item} onSave={saveItem} onDelete={() => deleteItem(item.key)} />
      ))}
      <div style={{ marginTop: 20, padding: 14, background: '#111', borderRadius: 8, border: '1px solid #333' }}>
        <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: 10 }}>Add media item</p>
        <input placeholder="Key (e.g. tedx)" value={newKey} onChange={e => setNewKey(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #444', background: '#1a1a1a', color: '#fff', marginBottom: 8, fontSize: '0.88rem', boxSizing: 'border-box' }} />
        <input placeholder="Label / Title" value={newValue} onChange={e => setNewValue(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #444', background: '#1a1a1a', color: '#fff', marginBottom: 10, fontSize: '0.88rem', boxSizing: 'border-box' }} />
        <button onClick={addItem} disabled={adding || !newKey || !newValue}
          style={{ padding: '0.6rem 1.2rem', borderRadius: 6, background: '#fff', color: '#000', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          {adding ? 'Adding…' : '+ Add Item'}
        </button>
      </div>
    </div>
  );
}

function MediaItemRow({ item, onSave, onDelete }: { item: { key: string; value: string }; onSave: (k: string, v: string) => Promise<void>; onDelete: () => void }) {
  const [val, setVal] = useState(item.value);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onSave(item.key, val);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
      <span style={{ color: '#666', fontSize: '0.75rem', width: 120, flexShrink: 0, fontFamily: 'monospace' }}>{item.key}</span>
      <input value={val} onChange={e => setVal(e.target.value)}
        style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #333', background: '#111', color: '#fff', fontSize: '0.88rem' }} />
      <button onClick={save} disabled={saving}
        style={{ padding: '0.45rem 0.9rem', borderRadius: 6, background: saved ? '#22c55e' : '#fff', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
        {saving ? '…' : saved ? '✓' : 'Save'}
      </button>
      <button onClick={onDelete}
        style={{ padding: '0.45rem 0.7rem', borderRadius: 6, background: '#2a0a0a', color: '#f44', border: '1px solid #f443', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [locale, setLocale] = useState('en');
  const [migrating, setMigrating] = useState(false);
  const [migrateMsg, setMigrateMsg] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pw');
    if (saved) setPassword(saved);
  }, []);

  async function migrate() {
    setMigrating(true); setMigrateMsg('');
    const res = await fetch('/api/admin/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    setMigrateMsg(json.success ? 'Seeded successfully' : `Error: ${json.error}`);
    setMigrating(false);
  }

  if (!password) return <Login onLogin={setPassword} />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0f0f', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: 210, background: '#111', borderRight: '1px solid #222', padding: '1.5rem 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid #222' }}>
          <h2 style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>Admin Panel</h2>
          <p style={{ color: '#555', fontSize: '0.72rem', margin: '4px 0 0' }}>Nanami Portfolio</p>
        </div>

        {/* Locale */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #222' }}>
          <p style={{ color: '#666', fontSize: '0.72rem', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Language</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {LOCALES.map(l => (
              <button key={l} onClick={() => setLocale(l)}
                style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: locale === l ? '#fff' : '#222', color: locale === l ? '#000' : '#888', cursor: 'pointer', fontWeight: locale === l ? 700 : 400, fontSize: '0.8rem' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '0.75rem 0', flex: 1 }}>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 1.25rem', background: activeSection === s ? '#1e1e1e' : 'none', color: activeSection === s ? '#fff' : '#777', border: 'none', cursor: 'pointer', fontSize: '0.88rem', borderLeft: activeSection === s ? '3px solid #fff' : '3px solid transparent' }}>
              {SECTION_LABELS[s]}
            </button>
          ))}
        </nav>

        {/* Migrate */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #222' }}>
          <button onClick={migrate} disabled={migrating}
            style={{ width: '100%', padding: '0.5rem', borderRadius: 6, background: '#1a2a1a', color: '#4ade80', border: '1px solid #4ade8033', cursor: 'pointer', fontSize: '0.8rem' }}>
            {migrating ? 'Seeding…' : 'Seed from files'}
          </button>
          {migrateMsg && <p style={{ color: '#4ade80', fontSize: '0.72rem', marginTop: 6 }}>{migrateMsg}</p>}
        </div>

        <div style={{ padding: '0 1.25rem 1rem' }}>
          <button onClick={() => { sessionStorage.removeItem('admin_pw'); setPassword(null); }}
            style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.8rem' }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <h1 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.25rem' }}>{SECTION_LABELS[activeSection]}</h1>
        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '1.75rem' }}>Locale: <strong style={{ color: '#888' }}>{locale.toUpperCase()}</strong></p>

        {['nav', 'hero', 'about', 'contact', 'footer'].includes(activeSection) && (
          <SectionPanel key={`${activeSection}-${locale}`} section={activeSection} locale={locale} password={password} />
        )}
        {activeSection === 'work' && (
          <WorkPanel key={`work-${locale}`} locale={locale} password={password} />
        )}
        {activeSection === 'media' && (
          <MediaPanel key={`media-${locale}`} locale={locale} password={password} />
        )}
      </main>
    </div>
  );
}
