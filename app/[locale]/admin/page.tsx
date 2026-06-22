'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Navigation, Star, User, Briefcase, Video, Phone,
  MessageSquare, Link2, Plus, Trash2, Pencil, LogOut, Database, Globe,
  Sparkles, Save, Lock, ChevronRight, ChevronLeft, Image as ImageIcon,
  TrendingUp, BarChart2, FileText, CheckCircle2, AlertCircle,
  ArrowUpRight, Activity, Layers, Upload, ExternalLink,
  Instagram, Facebook, Youtube, Twitter, Linkedin, Mail, Users,
  Menu, X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface WorkItem { key: string; order: number; icon: string; imageName: string; imageUrl: string; color: string; link: string; videoUrl: string; translations: Record<string, { title: string; description: string }>; }
interface MediaItem { key: string; order: number; type: 'video' | 'article'; url: string; imageName: string; imageUrl: string; thumbnail: string; translations: Record<string, string>; }
interface SocialLink { key: string; order: number; name: string; url: string; icon: string; gradient: string; }

const LOCALES = ['en', 'ja', 'ne'];
const LOCALE_FLAGS: Record<string, string> = { en: '🇬🇧', ja: '🇯🇵', ne: '🇳🇵' };
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Analytics',     icon: BarChart2,     emoji: '📊' },
  { id: 'nav',       label: 'Navigation',    icon: Navigation,    emoji: '🧭' },
  { id: 'hero',      label: 'Hero',          icon: Star,          emoji: '✨' },
  { id: 'about',     label: 'About',         icon: User,          emoji: '👩' },
  { id: 'work',      label: 'Work Projects', icon: Briefcase,     emoji: '💼' },
  { id: 'media',     label: 'Media & Talks', icon: Video,         emoji: '🎬' },
  { id: 'contact',   label: 'Contact',       icon: Phone,         emoji: '📱' },
  { id: 'footer',    label: 'Footer',        icon: MessageSquare, emoji: '🔻' },
  { id: 'socials',   label: 'Social Links',  icon: Link2,         emoji: '🔗' },
];
const MULTILINE_KEYS = ['description', 'subtitle', 'mission', 'greeting', 'cta'];

// ─── Rose gradient helpers ────────────────────────────────────────────────────
const roseBtn = 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md shadow-rose-200 border-0';

// ─── Social icon map ──────────────────────────────────────────────────────────
const SOCIAL_ICON_MAP: Record<string, React.ReactNode> = {
  Instagram:    <Instagram className="w-5 h-5" />,
  Facebook:     <Facebook className="w-5 h-5" />,
  Youtube:      <Youtube className="w-5 h-5" />,
  Twitter:      <Twitter className="w-5 h-5" />,
  Linkedin:     <Linkedin className="w-5 h-5" />,
  Mail:         <Mail className="w-5 h-5" />,
  Users:        <Users className="w-5 h-5" />,
  Link:         <Link2 className="w-5 h-5" />,
  ExternalLink: <ExternalLink className="w-5 h-5" />,
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const PER_PAGE = 10;

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / PER_PAGE);
  if (pages <= 1) return null;
  const start = (page - 1) * PER_PAGE + 1;
  const end = Math.min(page * PER_PAGE, total);
  const pageNums = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-between px-2 pt-3 border-t border-rose-50">
      <p className="text-xs text-rose-400 font-medium">{start}–{end} of {total} items</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pageNums.map((p) => (
          <button key={p} onClick={() => onChange(p)}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${p === page ? roseBtn : 'hover:bg-rose-100 text-rose-500'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => onChange(page + 1)} disabled={page === pages}
          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Image upload input ───────────────────────────────────────────────────────
function ImageUploadInput({ value, onChange, folder, password, placeholder }: {
  value: string; onChange: (url: string) => void; folder: string; password: string; placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'x-admin-password': password },
      body: fd,
    });
    const json = await res.json();
    setUploading(false);
    if (json.url) { onChange(json.url); toast.success('Image uploaded'); }
    else toast.error(json.error || 'Upload failed');
    e.target.value = '';
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'https://... or /images/...'}
          className="flex-1 px-3 py-2 rounded-xl border border-rose-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-300 text-sm outline-none"
        />
        <label className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap ${roseBtn} ${uploading ? 'opacity-70 pointer-events-none' : ''}`}>
          <Upload className="w-3.5 h-3.5" />
          {uploading ? 'Uploading…' : 'Upload Image'}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
      </div>
      {value && (
        <img src={value} alt="preview"
          className="h-28 w-full rounded-xl object-cover border-2 border-rose-100 shadow-sm"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      )}
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/sections', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: 'en', section: 'nav', data: undefined, password: pw }),
    });
    setLoading(false);
    if (res.status === 401) { toast.error('Wrong password'); return; }
    sessionStorage.setItem('admin_pw', pw);
    onLogin(pw);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-pink-50 to-red-50 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-rose-300/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-red-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <Card className="w-full max-w-sm relative z-10 border-rose-100 shadow-2xl shadow-rose-200/50 overflow-hidden">
        {/* Gradient header strip */}
        <div className="h-2 bg-gradient-to-r from-rose-400 via-pink-500 to-red-400" />
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-300/50">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent font-bold">
            Admin Panel
          </CardTitle>
          <p className="text-sm text-rose-400 mt-1">Nanami Wakayama Portfolio CMS</p>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pw" className="text-rose-700 font-medium">Password</Label>
              <Input
                id="pw" type="password" placeholder="Enter admin password"
                value={pw} onChange={(e) => setPw(e.target.value)} required
                className="border-rose-200 focus:border-rose-400 focus:ring-rose-300"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${roseBtn} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section field inside dialog ──────────────────────────────────────────────
function SectionFieldRow({ fieldKey, value, onSave }: { fieldKey: string; value: string; onSave: (v: string) => Promise<void> }) {
  const [val, setVal] = useState(value);
  const [saving, setSaving] = useState(false);
  useEffect(() => setVal(value), [value]);

  async function save() {
    setSaving(true);
    await onSave(val);
    setSaving(false);
    toast.success(`"${fieldKey}" saved`);
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">{fieldKey}</Label>
      <div className="flex gap-2">
        {MULTILINE_KEYS.includes(fieldKey)
          ? <Textarea value={val} onChange={(e) => setVal(e.target.value)} rows={3} className="resize-none flex-1 border-rose-200 focus:border-rose-400 text-sm" />
          : <Input value={val} onChange={(e) => setVal(e.target.value)} className="flex-1 border-rose-200 focus:border-rose-400 text-sm" />
        }
        <button onClick={save} disabled={saving}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${saving ? 'opacity-60' : ''} ${roseBtn}`}>
          {saving ? '…' : <Save className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ─── Simple section panel (nav / hero / about / contact / footer) ─────────────
function SectionPanel({ section, password }: { section: string; password: string }) {
  const [data, setData] = useState<Record<string, string>>({});
  const [locale, setLocale] = useState('en');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async (loc = locale) => {
    setLoading(true);
    const res = await fetch(`/api/admin/sections?locale=${loc}&section=${section}`);
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

  const previewEntries = Object.entries(data).slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Overview card */}
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md shadow-rose-200">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-rose-800 capitalize">{section} Content</p>
              <p className="text-xs text-rose-400">{Object.keys(data).length} fields • 3 languages</p>
            </div>
          </div>
          <button onClick={() => setDialogOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${roseBtn}`}>
            <Pencil className="w-3.5 h-3.5" /> Edit Content
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-rose-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {previewEntries.map(([k, v]) => (
              <div key={k} className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-rose-100">
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider w-24 shrink-0 mt-0.5">{k}</span>
                <span className="text-sm text-rose-900 truncate">{String(v)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-full sm:max-w-xl overflow-hidden p-0">
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-white text-lg font-bold capitalize flex items-center gap-2">
                <Pencil className="w-4 h-4" /> Edit {section} Content
              </DialogTitle>
            </DialogHeader>
            {/* Locale switcher inside header */}
            <div className="flex gap-1.5 mt-3">
              {LOCALES.map((l) => (
                <button key={l} onClick={() => { setLocale(l); load(l); }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${locale === l ? 'bg-white text-rose-600 shadow' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                  <span>{LOCALE_FLAGS[l]}</span> {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-rose-50 rounded-xl animate-pulse" />)}
              </div>
            ) : Object.entries(data).map(([k, v]) => (
              <SectionFieldRow key={`${locale}-${k}`} fieldKey={k} value={String(v)} onSave={(val) => saveField(k, val)} />
            ))}
          </div>

          <div className="px-6 pb-5 flex justify-end">
            <button onClick={() => setDialogOpen(false)}
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-all">
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Work panel ───────────────────────────────────────────────────────────────
const EMPTY_WORK: WorkItem = {
  key: '', order: 0, icon: '✨', imageName: '', imageUrl: '',
  color: 'from-rose-400 to-pink-400', link: '', videoUrl: '',
  translations: { en: { title: '', description: '' }, ja: { title: '', description: '' }, ne: { title: '', description: '' } },
};

function WorkForm({ initial, onSave, onClose, password }: { initial: WorkItem; onSave: (item: WorkItem) => Promise<void>; onClose: () => void; password: string }) {
  const [item, setItem] = useState<WorkItem>(initial);
  const [saving, setSaving] = useState(false);
  const set = (field: keyof WorkItem, val: any) => setItem((p) => ({ ...p, [field]: val }));
  const setTrans = (locale: string, field: 'title' | 'description', val: string) =>
    setItem((p) => ({ ...p, translations: { ...p.translations, [locale]: { ...p.translations[locale], [field]: val } } }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!item.key) return;
    setSaving(true);
    await onSave(item);
    setSaving(false);
    onClose();
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Key *</Label>
          <Input value={item.key} onChange={(e) => set('key', e.target.value)} placeholder="himeberry" required
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Icon (emoji)</Label>
          <Input value={item.icon} onChange={(e) => set('icon', e.target.value)} placeholder="🍓"
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Image Name</Label>
          <Input value={item.imageName} onChange={(e) => set('imageName', e.target.value)} placeholder="himeberry"
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Color Gradient</Label>
          <Input value={item.color} onChange={(e) => set('color', e.target.value)} placeholder="from-red-400 to-pink-400"
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Project Image</Label>
          <ImageUploadInput value={item.imageUrl ?? ''} onChange={(url) => set('imageUrl', url)} folder="projects" password={password} placeholder="/images/projects/himeberry.png or https://..." />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Project URL</Label>
          <Input value={item.link} onChange={(e) => set('link', e.target.value)} placeholder="https://..."
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Video URL (optional)</Label>
          <Input value={item.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://youtube.com/..."
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Order</Label>
          <Input type="number" value={item.order} onChange={(e) => set('order', Number(e.target.value))}
            className="border-rose-200 focus:border-rose-400" />
        </div>
      </div>

      <div className="rounded-xl bg-rose-50 border border-rose-100 p-4">
        <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-3">Translations</p>
        <Tabs defaultValue="en">
          <TabsList className="bg-rose-100/60 mb-3">
            {LOCALES.map((l) => (
              <TabsTrigger key={l} value={l} className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                {LOCALE_FLAGS[l]} {l.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
          {LOCALES.map((l) => (
            <TabsContent key={l} value={l} className="space-y-3 mt-0">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Title</Label>
                <Input value={item.translations[l]?.title ?? ''} onChange={(e) => setTrans(l, 'title', e.target.value)}
                  className="border-rose-200 focus:border-rose-400" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Description</Label>
                <Textarea rows={3} value={item.translations[l]?.description ?? ''} onChange={(e) => setTrans(l, 'description', e.target.value)}
                  className="resize-none border-rose-200 focus:border-rose-400" />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onClose}
          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className={`px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${roseBtn} ${saving ? 'opacity-70' : ''}`}>
          <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Project'}
        </button>
      </div>
    </form>
  );
}

function WorkPanel({ password }: { password: string }) {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<WorkItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/works');
    const json = await res.json();
    setItems(json.items || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(item: WorkItem) {
    await fetch('/api/admin/works', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, password }) });
    toast.success('Project saved');
    load();
  }

  async function remove(key: string) {
    if (!confirm(`Delete "${key}"?`)) return;
    await fetch('/api/admin/works', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, password }) });
    toast.success('Project deleted');
    load();
  }

  function openNew() { setEditing({ ...EMPTY_WORK }); setDialogOpen(true); }
  function openEdit(item: WorkItem) { setEditing({ ...item }); setDialogOpen(true); }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💼</span>
          <div>
            <p className="font-bold text-rose-800">Work Projects</p>
            <p className="text-xs text-rose-400">{items.length} projects in portfolio</p>
          </div>
        </div>
        <button onClick={openNew}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${roseBtn}`}>
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-full sm:max-w-lg overflow-hidden p-0">
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {editing?.key ? `Edit: ${editing.key}` : 'New Project'}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            {editing && <WorkForm initial={editing} onSave={save} onClose={() => setDialogOpen(false)} password={password} />}
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-rose-50 rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 p-12 text-center">
          <span className="text-4xl mb-3 block">💼</span>
          <p className="text-rose-600 font-medium">No projects yet</p>
          <p className="text-rose-400 text-sm mt-1">Click "Add Project" or "Seed from files" to get started</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-rose-100 overflow-x-auto shadow-sm shadow-rose-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-100 hover:bg-rose-50">
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider w-14">#</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider w-14">Image</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">Key</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">🇬🇧 EN Title</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">🇯🇵 JA Title</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">🇳🇵 NE Title</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">Description</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">Color</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">Link</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">Video</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((item, i) => (
                <TableRow key={item.key} className={`border-rose-50 hover:bg-rose-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-rose-50/20'}`}>
                  <TableCell className="text-xs text-rose-400 font-mono">#{item.order}</TableCell>
                  <TableCell>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.key} className="w-10 h-10 rounded-lg object-cover border border-rose-100" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                      : <span className="text-2xl">{item.icon}</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-mono bg-rose-100 text-rose-700 px-2 py-0.5 rounded-lg w-fit">{item.key}</span>
                      <span className="text-xs text-rose-400">{item.icon} {item.imageName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-rose-900 max-w-[140px]">
                    <p className="truncate">{item.translations.en?.title || <span className="text-rose-300">—</span>}</p>
                  </TableCell>
                  <TableCell className="text-rose-700 max-w-[140px]">
                    <p className="truncate text-sm">{item.translations.ja?.title || <span className="text-rose-300">—</span>}</p>
                  </TableCell>
                  <TableCell className="text-rose-700 max-w-[140px]">
                    <p className="truncate text-sm">{item.translations.ne?.title || <span className="text-rose-300">—</span>}</p>
                  </TableCell>
                  <TableCell className="text-xs text-rose-600 max-w-[180px]">
                    <p className="line-clamp-2">{item.translations.en?.description || <span className="text-rose-300">—</span>}</p>
                  </TableCell>
                  <TableCell className="max-w-[120px]">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${item.color} shrink-0`} />
                      <span className="text-xs text-rose-400 truncate">{item.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.link
                      ? <a href={item.link} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-rose-500 hover:text-rose-700 hover:underline truncate max-w-[130px] block">
                          {item.link.replace(/^https?:\/\//, '')}
                        </a>
                      : <span className="text-rose-300 text-xs">—</span>}
                  </TableCell>
                  <TableCell>
                    {item.videoUrl
                      ? <a href={item.videoUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:underline">
                          🎥 Video
                        </a>
                      : <span className="text-rose-300 text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(item.key)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} total={items.length} onChange={(p) => { setPage(p); }} />
        </div>
      )}
    </div>
  );
}

// ─── Media panel ──────────────────────────────────────────────────────────────
const EMPTY_MEDIA: MediaItem = { key: '', order: 0, type: 'article', url: '', imageName: '', imageUrl: '', thumbnail: '', translations: { en: '', ja: '', ne: '' } };

function MediaForm({ initial, onSave, onClose, password }: { initial: MediaItem; onSave: (item: MediaItem) => Promise<void>; onClose: () => void; password: string }) {
  const [item, setItem] = useState<MediaItem>(initial);
  const [saving, setSaving] = useState(false);
  const set = (field: keyof MediaItem, val: any) => setItem((p) => ({ ...p, [field]: val }));
  const setTrans = (locale: string, val: string) => setItem((p) => ({ ...p, translations: { ...p.translations, [locale]: val } }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!item.key) return;
    setSaving(true);
    await onSave(item);
    setSaving(false);
    onClose();
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Key *</Label>
          <Input value={item.key} onChange={(e) => set('key', e.target.value)} placeholder="tedx" required
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Type</Label>
          <Select value={item.type} onValueChange={(v) => set('type', v)}>
            <SelectTrigger className="border-rose-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="video">🎬 Video</SelectItem>
              <SelectItem value="article">📰 Article</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">URL *</Label>
          <Input value={item.url} onChange={(e) => set('url', e.target.value)} placeholder="https://..." required
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Image Name</Label>
          <Input value={item.imageName} onChange={(e) => set('imageName', e.target.value)} placeholder="tedx"
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Thumbnail Emoji</Label>
          <Input value={item.thumbnail} onChange={(e) => set('thumbnail', e.target.value)} placeholder="🎤"
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Order</Label>
          <Input type="number" value={item.order} onChange={(e) => set('order', Number(e.target.value))}
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Thumbnail Image</Label>
          <ImageUploadInput value={item.imageUrl ?? ''} onChange={(url) => set('imageUrl', url)} folder="media" password={password} placeholder="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg" />
        </div>
      </div>

      <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 space-y-3">
        <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">Labels per language</p>
        {LOCALES.map((l) => (
          <div key={l} className="flex items-center gap-2">
            <span className="text-lg shrink-0">{LOCALE_FLAGS[l]}</span>
            <span className="text-xs font-bold text-rose-600 w-6 shrink-0">{l.toUpperCase()}</span>
            <Input value={item.translations[l] ?? ''} onChange={(e) => setTrans(l, e.target.value)} placeholder={`Label in ${l}`}
              className="border-rose-200 focus:border-rose-400 text-sm" />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onClose}
          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className={`px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${roseBtn} ${saving ? 'opacity-70' : ''}`}>
          <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Item'}
        </button>
      </div>
    </form>
  );
}

function MediaPanel({ password }: { password: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/media');
    const json = await res.json();
    setItems(json.items || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(item: MediaItem) {
    await fetch('/api/admin/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, password }) });
    toast.success('Item saved');
    load();
  }

  async function remove(key: string) {
    if (!confirm(`Delete "${key}"?`)) return;
    await fetch('/api/admin/media', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, password }) });
    toast.success('Item deleted');
    load();
  }

  function openNew() { setEditing({ ...EMPTY_MEDIA }); setDialogOpen(true); }
  function openEdit(item: MediaItem) { setEditing({ ...item }); setDialogOpen(true); }

  const videos = items.filter((i) => i.type === 'video');
  const articles = items.filter((i) => i.type === 'article');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <div>
            <p className="font-bold text-rose-800">Media & Talks</p>
            <p className="text-xs text-rose-400">{videos.length} videos · {articles.length} articles</p>
          </div>
        </div>
        <button onClick={openNew}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${roseBtn}`}>
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-full sm:max-w-lg overflow-hidden p-0">
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
                <Video className="w-4 h-4" />
                {editing?.key ? `Edit: ${editing.key}` : 'New Media Item'}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            {editing && <MediaForm initial={editing} onSave={save} onClose={() => setDialogOpen(false)} password={password} />}
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-rose-50 rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 p-12 text-center">
          <span className="text-4xl mb-3 block">🎬</span>
          <p className="text-rose-600 font-medium">No media items yet</p>
          <p className="text-rose-400 text-sm mt-1">Click "Seed from files" to import all items</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-rose-100 overflow-x-auto shadow-sm shadow-rose-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-100 hover:bg-rose-50">
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider w-10">#</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider w-16">Thumb</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">Key</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">🇬🇧 EN Label</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">🇯🇵 JA Label</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">🇳🇵 NE Label</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">URL</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((item, i) => (
                <TableRow key={item.key} className={`border-rose-50 hover:bg-rose-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-rose-50/20'}`}>
                  <TableCell className="text-xs text-rose-400 font-mono">#{item.order}</TableCell>
                  <TableCell>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.key} className="w-14 h-10 rounded-lg object-cover border border-rose-100" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      : <span className="text-2xl">{item.thumbnail || (item.type === 'video' ? '🎬' : '📰')}</span>}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${item.type === 'video' ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : 'bg-gradient-to-r from-purple-400 to-indigo-400 text-white'}`}>
                      {item.type === 'video' ? '🎬' : '📰'} {item.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-mono bg-rose-100 text-rose-700 px-2 py-0.5 rounded-lg w-fit">{item.key}</span>
                      {item.imageName && <span className="text-xs text-rose-400">{item.imageName}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-rose-900 max-w-[160px]">
                    <p className="truncate">{item.translations.en || <span className="text-rose-300">—</span>}</p>
                  </TableCell>
                  <TableCell className="text-sm text-rose-700 max-w-[160px]">
                    <p className="truncate">{item.translations.ja || <span className="text-rose-300">—</span>}</p>
                  </TableCell>
                  <TableCell className="text-sm text-rose-700 max-w-[160px]">
                    <p className="truncate">{item.translations.ne || <span className="text-rose-300">—</span>}</p>
                  </TableCell>
                  <TableCell>
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-rose-500 hover:text-rose-700 hover:underline truncate max-w-[150px] block">
                      {item.url.replace(/^https?:\/\//, '')}
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(item.key)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} total={items.length} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

// ─── Social links panel ───────────────────────────────────────────────────────
const ICON_OPTIONS = ['Instagram', 'Facebook', 'Link', 'Users', 'Youtube', 'Twitter', 'Linkedin', 'Mail', 'ExternalLink'];
const EMPTY_SOCIAL: SocialLink = { key: '', order: 0, name: '', url: '', icon: 'Link', gradient: 'from-rose-500 to-pink-500' };

function SocialForm({ initial, onSave, onClose }: { initial: SocialLink; onSave: (item: SocialLink) => Promise<void>; onClose: () => void }) {
  const [item, setItem] = useState<SocialLink>(initial);
  const [saving, setSaving] = useState(false);
  const set = (field: keyof SocialLink, val: any) => setItem((p) => ({ ...p, [field]: val }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!item.key || !item.url) return;
    setSaving(true);
    await onSave(item);
    setSaving(false);
    onClose();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Key *</Label>
          <Input value={item.key} onChange={(e) => set('key', e.target.value)} placeholder="instagram" required
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Name *</Label>
          <Input value={item.name} onChange={(e) => set('name', e.target.value)} placeholder="Instagram" required
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">URL *</Label>
          <Input value={item.url} onChange={(e) => set('url', e.target.value)} placeholder="https://..." required
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Icon</Label>
          <Select value={item.icon} onValueChange={(v) => set('icon', v)}>
            <SelectTrigger className="border-rose-200">
              <div className="flex items-center gap-2">
                <span className="text-rose-600">{SOCIAL_ICON_MAP[item.icon] ?? <Link2 className="w-4 h-4" />}</span>
                <span>{item.icon}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {ICON_OPTIONS.map((ic) => (
                <SelectItem key={ic} value={ic}>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-500">{SOCIAL_ICON_MAP[ic] ?? <Link2 className="w-4 h-4" />}</span>
                    <span>{ic}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Gradient Classes</Label>
          <Input value={item.gradient} onChange={(e) => set('gradient', e.target.value)} placeholder="from-rose-600 to-pink-600"
            className="border-rose-200 focus:border-rose-400" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Order</Label>
          <Input type="number" value={item.order} onChange={(e) => set('order', Number(e.target.value))}
            className="border-rose-200 focus:border-rose-400" />
        </div>
        {item.gradient && (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-rose-700 uppercase tracking-widest">Preview</Label>
            <div className={`h-10 rounded-xl bg-gradient-to-r ${item.gradient} shadow-sm`} />
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onClose}
          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className={`px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${roseBtn} ${saving ? 'opacity-70' : ''}`}>
          <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Link'}
        </button>
      </div>
    </form>
  );
}

function SocialsPanel({ password }: { password: string }) {
  const [items, setItems] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/socials');
    const json = await res.json();
    setItems(json.items || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(item: SocialLink) {
    await fetch('/api/admin/socials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, password }) });
    toast.success('Link saved');
    load();
  }

  async function remove(key: string) {
    if (!confirm(`Delete "${key}"?`)) return;
    await fetch('/api/admin/socials', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, password }) });
    toast.success('Link deleted');
    load();
  }

  function openNew() { setEditing({ ...EMPTY_SOCIAL }); setDialogOpen(true); }
  function openEdit(item: SocialLink) { setEditing({ ...item }); setDialogOpen(true); }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔗</span>
          <div>
            <p className="font-bold text-rose-800">Social Links</p>
            <p className="text-xs text-rose-400">{items.length} links configured</p>
          </div>
        </div>
        <button onClick={openNew}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${roseBtn}`}>
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-full sm:max-w-md overflow-hidden p-0">
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-white text-lg font-bold flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                {editing?.key ? `Edit: ${editing.key}` : 'New Social Link'}
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            {editing && <SocialForm initial={editing} onSave={save} onClose={() => setDialogOpen(false)} />}
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-rose-50 rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 p-12 text-center">
          <span className="text-4xl mb-3 block">🔗</span>
          <p className="text-rose-600 font-medium">No social links yet</p>
          <p className="text-rose-400 text-sm mt-1">Click "Seed from files" to import</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-rose-100 overflow-x-auto shadow-sm shadow-rose-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-100 hover:bg-rose-50">
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider w-10">#</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider w-16">Icon</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">Name</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">Key</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">Icon Name</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">URL</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider">Gradient</TableHead>
                <TableHead className="text-rose-600 font-bold text-xs uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((item, i) => (
                <TableRow key={item.key} className={`border-rose-50 hover:bg-rose-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-rose-50/20'}`}>
                  <TableCell className="text-xs text-rose-400 font-mono">#{item.order}</TableCell>
                  <TableCell>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-sm`}>
                      {SOCIAL_ICON_MAP[item.icon] ?? <Link2 className="w-4 h-4" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-rose-900">{item.name}</TableCell>
                  <TableCell>
                    <span className="text-xs font-mono bg-rose-100 text-rose-700 px-2 py-0.5 rounded-lg">{item.key}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs bg-rose-50 text-rose-500 px-2 py-0.5 rounded border border-rose-100">{item.icon}</span>
                  </TableCell>
                  <TableCell>
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-rose-500 hover:text-rose-700 hover:underline truncate max-w-[180px] block">
                      {item.url.replace(/^https?:\/\//, '')}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-6 rounded-md bg-gradient-to-r ${item.gradient} shrink-0`} />
                      <span className="text-xs text-rose-400 truncate max-w-[140px]">{item.gradient}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(item.key)} className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination page={page} total={items.length} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

// ─── Analytics dashboard ──────────────────────────────────────────────────────
interface AnalyticsData {
  works: WorkItem[];
  media: MediaItem[];
  socials: SocialLink[];
}

function StatCard({ emoji, label, value, sub, gradient }: { emoji: string; label: string; value: number | string; sub: string; gradient: string }) {
  return (
    <div className={`relative rounded-2xl p-5 bg-gradient-to-br ${gradient} overflow-hidden`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-6 w-20 h-20 rounded-full bg-white/10" />
      <div className="relative">
        <span className="text-3xl">{emoji}</span>
        <p className="text-3xl font-bold text-white mt-2 leading-none">{value}</p>
        <p className="text-white/90 font-semibold text-sm mt-1">{label}</p>
        <p className="text-white/60 text-xs mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function HealthRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-rose-50 last:border-0">
      {ok
        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        : <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
      <span className="text-sm font-medium text-rose-800 flex-1">{label}</span>
      <span className="text-xs text-rose-400">{detail}</span>
    </div>
  );
}

function DashboardPanel({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [data, setData] = useState<AnalyticsData>({ works: [], media: [], socials: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/works').then((r) => r.json()),
      fetch('/api/admin/media').then((r) => r.json()),
      fetch('/api/admin/socials').then((r) => r.json()),
    ]).then(([w, m, s]) => {
      setData({ works: w.items || [], media: m.items || [], socials: s.items || [] });
      setLoading(false);
    });
  }, []);

  const videos   = data.media.filter((i) => i.type === 'video');
  const articles = data.media.filter((i) => i.type === 'article');
  const totalContent = data.works.length + data.media.length + data.socials.length;
  const mediaTotal   = data.media.length || 1;
  const videoPct     = Math.round((videos.length / mediaTotal) * 100);
  const articlePct   = 100 - videoPct;

  // Health checks
  const worksWithImage    = data.works.filter((w) => w.imageUrl).length;
  const worksWithLink     = data.works.filter((w) => w.link).length;
  const worksFullTrans    = data.works.filter((w) => LOCALES.every((l) => w.translations[l]?.title)).length;
  const mediaWithImage    = data.media.filter((m) => m.imageUrl).length;
  const mediaFullTrans    = data.media.filter((m) => LOCALES.every((l) => m.translations[l])).length;

  const QUICK_LINKS = [
    { id: 'work',    emoji: '💼', label: 'Work Projects', count: data.works.length,   gradient: 'from-rose-400 to-pink-500' },
    { id: 'media',   emoji: '🎬', label: 'Media & Talks', count: data.media.length,   gradient: 'from-pink-400 to-fuchsia-500' },
    { id: 'socials', emoji: '🔗', label: 'Social Links',  count: data.socials.length, gradient: 'from-fuchsia-400 to-purple-500' },
    { id: 'hero',    emoji: '✨', label: 'Hero Section',  count: null,                gradient: 'from-purple-400 to-indigo-500' },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-2xl bg-rose-100 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => <div key={i} className="h-48 rounded-2xl bg-rose-50 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <StatCard emoji="💼" label="Work Projects"  value={data.works.length}   sub={`${worksWithLink} have live links`}      gradient="from-rose-400 to-pink-600" />
        <StatCard emoji="🎬" label="Videos"         value={videos.length}       sub={`${articles.length} articles total`}     gradient="from-pink-400 to-fuchsia-600" />
        <StatCard emoji="🔗" label="Social Links"   value={data.socials.length} sub="Follow My Journey links"                  gradient="from-fuchsia-400 to-purple-600" />
        <StatCard emoji="🌏" label="Total Content"  value={totalContent}        sub="across 3 languages"                      gradient="from-purple-400 to-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Media breakdown ─────────────────────────────────────────── */}
        <div className="lg:col-span-1 rounded-2xl bg-white border border-rose-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <p className="font-bold text-rose-800">Media Breakdown</p>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-600">🎬 Videos</span>
                <span className="text-rose-400">{videos.length} · {videoPct}%</span>
              </div>
              <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-700" style={{ width: `${videoPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-purple-600">📰 Articles</span>
                <span className="text-rose-400">{articles.length} · {articlePct}%</span>
              </div>
              <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-fuchsia-400 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${articlePct}%` }} />
              </div>
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-600">🖼️ With Images</span>
                <span className="text-rose-400">{mediaWithImage}/{data.media.length}</span>
              </div>
              <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700"
                  style={{ width: data.media.length ? `${Math.round((mediaWithImage / data.media.length) * 100)}%` : '0%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Translation coverage ─────────────────────────────────────── */}
        <div className="lg:col-span-1 rounded-2xl bg-white border border-rose-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <p className="font-bold text-rose-800">Translation Coverage</p>
          </div>
          <div className="space-y-3">
            {LOCALES.map((l) => {
              const worksDone  = data.works.filter((w) => w.translations[l]?.title).length;
              const mediaDone  = data.media.filter((m) => m.translations[l]).length;
              const total      = data.works.length + data.media.length || 1;
              const done       = worksDone + mediaDone;
              const pct        = Math.round((done / total) * 100);
              return (
                <div key={l}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-rose-700">{LOCALE_FLAGS[l]} {l.toUpperCase()}</span>
                    <span className="text-rose-400">{done}/{total} · {pct}%</span>
                  </div>
                  <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-rose-50">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-rose-600 font-medium">
                {worksFullTrans}/{data.works.length} projects fully translated
              </span>
            </div>
          </div>
        </div>

        {/* ── Portfolio health ─────────────────────────────────────────── */}
        <div className="lg:col-span-1 rounded-2xl bg-white border border-rose-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <p className="font-bold text-rose-800">Portfolio Health</p>
          </div>
          <div>
            <HealthRow label="Work images set"       ok={worksWithImage === data.works.length}   detail={`${worksWithImage}/${data.works.length}`} />
            <HealthRow label="Work links set"        ok={worksWithLink === data.works.length}    detail={`${worksWithLink}/${data.works.length}`} />
            <HealthRow label="Work fully translated" ok={worksFullTrans === data.works.length}   detail={`${worksFullTrans}/${data.works.length}`} />
            <HealthRow label="Media images set"      ok={mediaWithImage === data.media.length}   detail={`${mediaWithImage}/${data.media.length}`} />
            <HealthRow label="Media fully translated" ok={mediaFullTrans === data.media.length}  detail={`${mediaFullTrans}/${data.media.length}`} />
            <HealthRow label="Social links added"    ok={data.socials.length > 0}                detail={`${data.socials.length} links`} />
          </div>
        </div>
      </div>

      {/* ── Quick nav cards ───────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" /> Quick Access
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map(({ id, emoji, label, count, gradient }) => (
            <button key={id} onClick={() => onNavigate(id)}
              className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-rose-100 hover:border-rose-200 hover:shadow-md hover:shadow-rose-100 transition-all text-left">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform`}>
                <span className="text-lg">{emoji}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-rose-800 truncate">{label}</p>
                {count !== null && <p className="text-xs text-rose-400">{count} items</p>}
              </div>
              <ArrowUpRight className="w-4 h-4 text-rose-300 ml-auto shrink-0 group-hover:text-rose-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Recent work projects ─────────────────────────────────────── */}
      {data.works.length > 0 && (
        <div className="rounded-2xl bg-white border border-rose-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-rose-50">
            <p className="font-bold text-rose-800">Work Projects</p>
            <button onClick={() => onNavigate('work')}
              className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1">
              Manage <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-rose-50">
            {data.works.slice(0, 5).map((w) => (
              <div key={w.key} className="flex items-center gap-4 px-5 py-3 hover:bg-rose-50/40 transition-colors">
                <span className="text-xl shrink-0">{w.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-rose-800 truncate">{w.translations.en?.title || w.key}</p>
                  <p className="text-xs text-rose-400 truncate">{w.link || 'No link set'}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {w.imageUrl  && <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 text-xs">🖼</span>}
                  {!w.imageUrl && <span className="w-5 h-5 rounded-full bg-amber-100  flex items-center justify-center text-amber-400  text-xs">!</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [active, setActive] = useState('dashboard');
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pw');
    if (saved) setPassword(saved);
  }, []);

  async function migrate() {
    setMigrating(true);
    const res = await fetch('/api/admin/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const json = await res.json();
    setMigrating(false);
    if (json.success) toast.success('Database seeded successfully');
    else toast.error(`Seed failed: ${json.error}`);
  }

  function logout() { sessionStorage.removeItem('admin_pw'); setPassword(null); }

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!password) return <LoginPage onLogin={setPassword} />;

  const activeNav = NAV_ITEMS.find((n) => n.id === active)!;
  const SIMPLE_SECTIONS = ['nav', 'hero', 'about', 'contact', 'footer'];

  function navigate(id: string) {
    setActive(id);
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50/40 to-white">

      {/* ── Mobile overlay ──────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 flex flex-col shrink-0
        bg-gradient-to-b from-rose-600 via-rose-500 to-pink-600 shadow-2xl shadow-rose-900/30
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:w-60 md:translate-x-0 md:z-auto
      `}>
        {/* Logo + mobile close */}
        <div className="px-5 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Admin CMS</p>
              <p className="text-rose-200 text-xs mt-0.5">Nanami Portfolio</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="h-px bg-white/10 mx-4" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, emoji }) => (
            <button key={id} onClick={() => navigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active === id
                  ? 'bg-white text-rose-600 shadow-lg shadow-rose-900/20 font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}>
              <span className="text-base">{emoji}</span>
              {label}
              {active === id && <ChevronRight className="w-3.5 h-3.5 ml-auto text-rose-500" />}
            </button>
          ))}
        </nav>

        <div className="h-px bg-white/10 mx-4" />

        {/* Bottom actions */}
        <div className="p-4 space-y-2">
          <button onClick={migrate} disabled={migrating}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all disabled:opacity-60">
            <Database className="w-4 h-4 shrink-0" />
            {migrating ? 'Seeding…' : 'Seed from files'}
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all">
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-rose-100 px-4 md:px-8 py-3 md:py-4 flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200 shrink-0">
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-xl md:text-2xl">{activeNav.emoji}</span>
          <div className="min-w-0">
            <h1 className="text-sm md:text-base font-bold text-rose-800 truncate">{activeNav.label}</h1>
            <p className="text-xs text-rose-400 hidden sm:block">Manage {activeNav.label.toLowerCase()} content</p>
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-rose-400 font-medium hidden sm:block">Live</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 w-full">
          {active === 'dashboard' && <DashboardPanel onNavigate={navigate} />}
          {SIMPLE_SECTIONS.includes(active) && (
            <SectionPanel key={active} section={active} password={password} />
          )}
          {active === 'work' && <WorkPanel password={password} />}
          {active === 'media' && <MediaPanel password={password} />}
          {active === 'socials' && <SocialsPanel password={password} />}
        </div>
      </main>
    </div>
  );
}
