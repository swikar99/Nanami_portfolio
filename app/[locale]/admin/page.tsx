'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  LayoutDashboard, Navigation, Star, User, Briefcase, Video, Phone,
  MessageSquare, Link2, Plus, Trash2, Pencil, LogOut, Database, Globe,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface WorkItem { key: string; order: number; icon: string; imageName: string; color: string; link: string; videoUrl: string; translations: Record<string, { title: string; description: string }>; }
interface MediaItem { key: string; order: number; type: 'video' | 'article'; url: string; imageName: string; thumbnail: string; translations: Record<string, string>; }
interface SocialLink { key: string; order: number; name: string; url: string; icon: string; gradient: string; }

const LOCALES = ['en', 'ja', 'ne'];
const NAV_ITEMS = [
  { id: 'nav', label: 'Navigation', icon: Navigation },
  { id: 'hero', label: 'Hero', icon: Star },
  { id: 'about', label: 'About', icon: User },
  { id: 'work', label: 'Work Projects', icon: Briefcase },
  { id: 'media', label: 'Media & Talks', icon: Video },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'footer', label: 'Footer', icon: MessageSquare },
  { id: 'socials', label: 'Social Links', icon: Link2 },
];
const MULTILINE_KEYS = ['description', 'subtitle', 'mission', 'greeting', 'cta'];

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
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Admin Panel</CardTitle>
          <p className="text-sm text-muted-foreground">Nanami Wakayama Portfolio</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pw">Password</Label>
              <Input id="pw" type="password" placeholder="Enter password" value={pw}
                onChange={(e) => setPw(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Field row for simple sections ───────────────────────────────────────────
function SectionField({ fieldKey, value, onSave }: { fieldKey: string; value: string; onSave: (v: string) => Promise<void> }) {
  const [val, setVal] = useState(value);
  const [saving, setSaving] = useState(false);
  useEffect(() => setVal(value), [value]);

  async function save() {
    setSaving(true);
    await onSave(val);
    setSaving(false);
    toast.success(`${fieldKey} saved`);
  }

  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{fieldKey}</Label>
      <div className="flex gap-2">
        {MULTILINE_KEYS.includes(fieldKey)
          ? <Textarea value={val} onChange={(e) => setVal(e.target.value)} rows={3} className="resize-none flex-1" />
          : <Input value={val} onChange={(e) => setVal(e.target.value)} className="flex-1" />}
        <Button size="sm" onClick={save} disabled={saving} variant="outline">
          {saving ? '…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}

// ─── Simple section panel (nav / hero / about / contact / footer) ─────────────
function SectionPanel({ section, password }: { section: string; password: string }) {
  const [data, setData] = useState<Record<string, string>>({});
  const [locale, setLocale] = useState('en');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Language</span>
        <Tabs value={locale} onValueChange={(v) => setLocale(v)}>
          <TabsList className="h-8">
            {LOCALES.map((l) => <TabsTrigger key={l} value={l} className="text-xs px-3">{l.toUpperCase()}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>
      <Separator />
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(data).map(([k, v]) => (
            <SectionField key={`${locale}-${k}`} fieldKey={k} value={String(v)} onSave={(val) => saveField(k, val)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Work panel ───────────────────────────────────────────────────────────────
const EMPTY_WORK: WorkItem = { key: '', order: 0, icon: '✨', imageName: '', color: 'from-purple-400 to-pink-400', link: '', videoUrl: '', translations: { en: { title: '', description: '' }, ja: { title: '', description: '' }, ne: { title: '', description: '' } } };

function WorkForm({ initial, onSave, onClose }: { initial: WorkItem; onSave: (item: WorkItem) => Promise<void>; onClose: () => void }) {
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
    <form onSubmit={submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Key *</Label><Input value={item.key} onChange={(e) => set('key', e.target.value)} placeholder="himeberry" required /></div>
        <div className="space-y-1"><Label>Icon (emoji)</Label><Input value={item.icon} onChange={(e) => set('icon', e.target.value)} placeholder="🍓" /></div>
        <div className="space-y-1"><Label>Image name</Label><Input value={item.imageName} onChange={(e) => set('imageName', e.target.value)} placeholder="himeberry" /></div>
        <div className="space-y-1"><Label>Color gradient</Label><Input value={item.color} onChange={(e) => set('color', e.target.value)} placeholder="from-red-400 to-pink-400" /></div>
        <div className="col-span-2 space-y-1"><Label>Link URL</Label><Input value={item.link} onChange={(e) => set('link', e.target.value)} placeholder="https://..." /></div>
        <div className="col-span-2 space-y-1"><Label>Video URL (optional)</Label><Input value={item.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://youtube.com/..." /></div>
        <div className="space-y-1"><Label>Order</Label><Input type="number" value={item.order} onChange={(e) => set('order', Number(e.target.value))} /></div>
      </div>
      <Separator />
      <Tabs defaultValue="en">
        <TabsList>{LOCALES.map((l) => <TabsTrigger key={l} value={l}>{l.toUpperCase()}</TabsTrigger>)}</TabsList>
        {LOCALES.map((l) => (
          <TabsContent key={l} value={l} className="space-y-3 mt-3">
            <div className="space-y-1"><Label>Title</Label><Input value={item.translations[l]?.title ?? ''} onChange={(e) => setTrans(l, 'title', e.target.value)} /></div>
            <div className="space-y-1"><Label>Description</Label><Textarea rows={3} value={item.translations[l]?.description ?? ''} onChange={(e) => setTrans(l, 'description', e.target.value)} className="resize-none" /></div>
          </TabsContent>
        ))}
      </Tabs>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Project'}</Button>
      </div>
    </form>
  );
}

function WorkPanel({ password }: { password: string }) {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<WorkItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} projects</p>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" />Add Project</Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing?.key ? `Edit: ${editing.key}` : 'New Project'}</DialogTitle></DialogHeader>
            {editing && <WorkForm initial={editing} onSave={save} onClose={() => setDialogOpen(false)} />}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <div className="h-40 bg-muted rounded animate-pulse" /> : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Title (EN)</TableHead>
                <TableHead>Link</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No projects yet. Click "Add Project" to seed.</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.key}>
                  <TableCell className="text-xl">{item.icon}</TableCell>
                  <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{item.key}</code></TableCell>
                  <TableCell className="font-medium">{item.translations.en?.title}</TableCell>
                  <TableCell>{item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate max-w-[160px] block">{item.link}</a> : <span className="text-muted-foreground text-xs">—</span>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => remove(item.key)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Media panel ──────────────────────────────────────────────────────────────
const EMPTY_MEDIA: MediaItem = { key: '', order: 0, type: 'article', url: '', imageName: '', thumbnail: '', translations: { en: '', ja: '', ne: '' } };

function MediaForm({ initial, onSave, onClose }: { initial: MediaItem; onSave: (item: MediaItem) => Promise<void>; onClose: () => void }) {
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
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Key *</Label><Input value={item.key} onChange={(e) => set('key', e.target.value)} placeholder="tedx" required /></div>
        <div className="space-y-1">
          <Label>Type</Label>
          <Select value={item.type} onValueChange={(v) => set('type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="article">Article</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1"><Label>URL *</Label><Input value={item.url} onChange={(e) => set('url', e.target.value)} placeholder="https://..." required /></div>
        <div className="space-y-1"><Label>Image name</Label><Input value={item.imageName} onChange={(e) => set('imageName', e.target.value)} placeholder="tedx" /></div>
        <div className="space-y-1"><Label>Thumbnail emoji</Label><Input value={item.thumbnail} onChange={(e) => set('thumbnail', e.target.value)} placeholder="🎤" /></div>
        <div className="space-y-1"><Label>Order</Label><Input type="number" value={item.order} onChange={(e) => set('order', Number(e.target.value))} /></div>
      </div>
      <Separator />
      <div className="space-y-3">
        <Label className="text-sm font-medium">Labels per language</Label>
        {LOCALES.map((l) => (
          <div key={l} className="flex items-center gap-2">
            <Badge variant="outline" className="w-8 justify-center text-xs">{l.toUpperCase()}</Badge>
            <Input value={item.translations[l] ?? ''} onChange={(e) => setTrans(l, e.target.value)} placeholder={`Label in ${l}`} />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Item'}</Button>
      </div>
    </form>
  );
}

function MediaPanel({ password }: { password: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} items</p>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" />Add Item</Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing?.key ? `Edit: ${editing.key}` : 'New Media Item'}</DialogTitle></DialogHeader>
            {editing && <MediaForm initial={editing} onSave={save} onClose={() => setDialogOpen(false)} />}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <div className="h-40 bg-muted rounded animate-pulse" /> : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Label (EN)</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No items yet. Click "Seed from files" to import.</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.key}>
                  <TableCell><Badge variant={item.type === 'video' ? 'default' : 'secondary'} className="text-xs">{item.type}</Badge></TableCell>
                  <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{item.key}</code></TableCell>
                  <TableCell className="text-sm">{item.translations.en}</TableCell>
                  <TableCell><a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate max-w-[160px] block">{item.url}</a></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => remove(item.key)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Social links panel ───────────────────────────────────────────────────────
const ICON_OPTIONS = ['Instagram', 'Facebook', 'Link', 'Users', 'Youtube', 'Twitter', 'Linkedin', 'Mail', 'ExternalLink'];
const EMPTY_SOCIAL: SocialLink = { key: '', order: 0, name: '', url: '', icon: 'Link', gradient: 'from-purple-500 to-pink-500' };

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
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Key *</Label><Input value={item.key} onChange={(e) => set('key', e.target.value)} placeholder="instagram" required /></div>
        <div className="space-y-1"><Label>Name *</Label><Input value={item.name} onChange={(e) => set('name', e.target.value)} placeholder="Instagram" required /></div>
        <div className="col-span-2 space-y-1"><Label>URL *</Label><Input value={item.url} onChange={(e) => set('url', e.target.value)} placeholder="https://..." required /></div>
        <div className="space-y-1">
          <Label>Icon</Label>
          <Select value={item.icon} onValueChange={(v) => set('icon', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ICON_OPTIONS.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Gradient classes</Label><Input value={item.gradient} onChange={(e) => set('gradient', e.target.value)} placeholder="from-purple-600 to-pink-600" /></div>
        <div className="space-y-1"><Label>Order</Label><Input type="number" value={item.order} onChange={(e) => set('order', Number(e.target.value))} /></div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Link'}</Button>
      </div>
    </form>
  );
}

function SocialsPanel({ password }: { password: string }) {
  const [items, setItems] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} links</p>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" />Add Link</Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editing?.key ? `Edit: ${editing.key}` : 'New Social Link'}</DialogTitle></DialogHeader>
            {editing && <SocialForm initial={editing} onSave={save} onClose={() => setDialogOpen(false)} />}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <div className="h-40 bg-muted rounded animate-pulse" /> : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Gradient</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No links yet. Click "Seed from files" to import.</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.key}>
                  <TableCell><Badge variant="outline" className="text-xs">{item.icon}</Badge></TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell><a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate max-w-[200px] block">{item.url}</a></TableCell>
                  <TableCell><code className="text-xs text-muted-foreground">{item.gradient}</code></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => remove(item.key)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [active, setActive] = useState('hero');
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

  if (!password) return <LoginPage onLogin={setPassword} />;

  const activeNav = NAV_ITEMS.find((n) => n.id === active)!;
  const SIMPLE_SECTIONS = ['nav', 'hero', 'about', 'contact', 'footer'];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 border-r flex flex-col bg-muted/30 shrink-0">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Admin</p>
              <p className="text-xs text-muted-foreground mt-0.5">Portfolio CMS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActive(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${active === id ? 'bg-background text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'}`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs" onClick={migrate} disabled={migrating}>
            <Database className="w-3.5 h-3.5" />
            {migrating ? 'Seeding…' : 'Seed from files'}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs text-muted-foreground" onClick={logout}>
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="border-b px-6 py-4 flex items-center gap-3 bg-background/80 backdrop-blur sticky top-0 z-10">
          <activeNav.icon className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-base font-semibold">{activeNav.label}</h1>
        </div>

        <div className="p-6 max-w-4xl">
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
