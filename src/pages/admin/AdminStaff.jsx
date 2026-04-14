import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";

const EMPTY = { name: "", title: "", bio: "", photo_url: "", specialties: [], is_active: true };

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Staff.list().then(setStaff).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setSpecialtyInput(""); setOpen(true); };
  const openEdit = (m) => { setEditing(m); setForm(m); setSpecialtyInput(""); setOpen(true); };

  const addSpecialty = () => {
    if (specialtyInput.trim()) {
      setForm(f => ({ ...f, specialties: [...(f.specialties || []), specialtyInput.trim()] }));
      setSpecialtyInput("");
    }
  };

  const removeSpecialty = (i) => setForm(f => ({ ...f, specialties: f.specialties.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    if (editing) {
      const updated = await base44.entities.Staff.update(editing.id, form);
      setStaff(prev => prev.map(s => s.id === editing.id ? updated : s));
    } else {
      const created = await base44.entities.Staff.create(form);
      setStaff(prev => [...prev, created]);
    }
    setSaving(false);
    setOpen(false);
  };

  const remove = async (id) => {
    await base44.entities.Staff.delete(id);
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  const avatarColors = ["from-pink-300 to-rose-400", "from-purple-300 to-pink-400", "from-rose-300 to-pink-500", "from-fuchsia-300 to-purple-400"];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="font-playfair text-3xl font-bold mb-1">Staff</h1>
            <p className="text-muted-foreground">Manage your team members</p>
          </div>
          <Button onClick={openCreate} className="gradient-pink text-white border-0 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all">
            <Plus className="w-4 h-4 mr-1" /> Add Staff
          </Button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="glass-card rounded-2xl h-40 animate-pulse" />)}</div>
        ) : staff.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <p className="text-muted-foreground mb-4">No staff added yet.</p>
            <Button onClick={openCreate} className="gradient-pink text-white border-0 rounded-full">Add First Team Member</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((member, i) => (
              <motion.div key={member.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className={`glass-card rounded-2xl p-5 ${!member.is_active ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3 mb-3">
                  {member.photo_url ? (
                    <img src={member.photo_url} className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white/60" />
                  ) : (
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                      {member.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{member.name}</h3>
                    <p className="text-sm text-primary">{member.title}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(member)} className="p-1.5 rounded-lg hover:bg-white/60 text-muted-foreground transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => remove(member.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {member.bio && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{member.bio}</p>}
                {member.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {member.specialties.map(s => <span key={s} className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{s}</span>)}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-card border-white/50 rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl">{editing ? "Edit Team Member" : "New Team Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm mb-1.5 block">Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Maria" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Title *</Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Nail Technician" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Bio</Label>
              <Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="rounded-xl resize-none" rows={2} />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Photo URL</Label>
              <Input value={form.photo_url} onChange={e => setForm({...form, photo_url: e.target.value})} placeholder="https://..." className="rounded-xl" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Specialties</Label>
              <div className="flex gap-2 mb-2">
                <Input value={specialtyInput} onChange={e => setSpecialtyInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addSpecialty()} placeholder="e.g. Gel Nails" className="rounded-xl" />
                <Button onClick={addSpecialty} variant="outline" className="rounded-xl flex-shrink-0">Add</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.specialties?.map((s, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1 flex items-center gap-1">
                    {s}
                    <button onClick={() => removeSpecialty(i)} className="hover:text-red-500 ml-0.5">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={save} disabled={!form.name || !form.title || saving} className="gradient-pink text-white border-0 rounded-full">
              {saving ? "Saving..." : "Save Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}