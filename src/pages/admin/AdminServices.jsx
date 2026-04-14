import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";

const CATEGORIES = ["Nails", "Esthetics", "Lashes", "Brows", "Waxing", "Facials"];
const EMPTY = { name: "", category: "Nails", description: "", duration_minutes: 60, price: 0, image_url: "", is_active: true };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Service.list().then(setServices).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm(s); setOpen(true); };

  const save = async () => {
    setSaving(true);
    if (editing) {
      const updated = await base44.entities.Service.update(editing.id, form);
      setServices(prev => prev.map(s => s.id === editing.id ? updated : s));
    } else {
      const created = await base44.entities.Service.create(form);
      setServices(prev => [...prev, created]);
    }
    setSaving(false);
    setOpen(false);
  };

  const remove = async (id) => {
    await base44.entities.Service.delete(id);
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const toggleActive = async (s) => {
    const updated = await base44.entities.Service.update(s.id, { is_active: !s.is_active });
    setServices(prev => prev.map(x => x.id === s.id ? updated : x));
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="font-playfair text-3xl font-bold mb-1">Services</h1>
            <p className="text-muted-foreground">Manage your service menu</p>
          </div>
          <Button onClick={openCreate} className="gradient-pink text-white border-0 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all">
            <Plus className="w-4 h-4 mr-1" /> Add Service
          </Button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="glass-card rounded-2xl h-36 animate-pulse" />)}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`glass-card rounded-2xl p-5 ${!s.is_active ? "opacity-60" : ""}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1">{s.category}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-white/60 text-muted-foreground hover:text-foreground transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => remove(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-base mb-1">{s.name}</h3>
                {s.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{s.description}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">${s.price}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{s.duration_minutes}m</span>
                  </div>
                  <button onClick={() => toggleActive(s)} className={`text-xs px-3 py-1 rounded-full transition-all ${s.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.is_active ? "Active" : "Hidden"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {services.length === 0 && !loading && (
          <div className="glass-card rounded-3xl p-12 text-center mt-4">
            <p className="text-muted-foreground mb-4">No services added yet.</p>
            <Button onClick={openCreate} className="gradient-pink text-white border-0 rounded-full">Add Your First Service</Button>
          </div>
        )}
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-card border-white/50 rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl">{editing ? "Edit Service" : "New Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm mb-1.5 block">Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Gel Manicure" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Category *</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm mb-1.5 block">Price ($) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} className="rounded-xl" />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Duration (min) *</Label>
                <Input type="number" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: parseInt(e.target.value)})} className="rounded-xl" />
              </div>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Description</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="rounded-xl resize-none" rows={2} />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Image URL</Label>
              <Input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={save} disabled={!form.name || saving} className="gradient-pink text-white border-0 rounded-full">
              {saving ? "Saving..." : "Save Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}