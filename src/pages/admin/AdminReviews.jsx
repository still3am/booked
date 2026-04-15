import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Eye, EyeOff, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ client_name: "", client_email: "", rating: 5, comment: "", is_published: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Review.list("-created_date", 100).then(setReviews).finally(() => setLoading(false));
  }, []);

  const togglePublish = async (r) => {
    const updated = await base44.entities.Review.update(r.id, { is_published: !r.is_published });
    setReviews(prev => prev.map(x => x.id === r.id ? updated : x));
  };

  const remove = async (id) => {
    await base44.entities.Review.delete(id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const save = async () => {
    setSaving(true);
    const created = await base44.entities.Review.create(form);
    setReviews(prev => [created, ...prev]);
    setSaving(false);
    setOpen(false);
    setForm({ client_name: "", client_email: "", rating: 5, comment: "", is_published: true });
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    stars: r,
    count: reviews.filter(x => x.rating === r).length,
    percent: reviews.length > 0 ? Math.round((reviews.filter(x => x.rating === r).length / reviews.length) * 100) : 0
  }));

  const published = reviews.filter(r => r.is_published).length;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="font-playfair text-3xl font-bold mb-1">Reviews</h1>
            <p className="text-muted-foreground">{reviews.length} total · {published} published · Avg: ⭐ {avgRating}</p>
          </div>
          <Button onClick={() => setOpen(true)} className="gradient-pink text-white border-0 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all">
            <Plus className="w-4 h-4 mr-1" /> Add Review
          </Button>
        </div>

        {/* Rating Distribution */}
        {reviews.length > 0 && (
          <div className="glass-card rounded-3xl p-6 mb-6">
            <h3 className="font-semibold mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {ratingDist.map(d => (
                <div key={d.stars} className="flex items-center gap-3">
                  <span className="text-sm w-12">{d.stars}★</span>
                  <div className="flex-1 h-6 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400"
                      style={{ width: `${d.percent}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="glass-card rounded-2xl h-20 animate-pulse" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No reviews yet.</p>
            <Button onClick={() => setOpen(true)} className="gradient-pink text-white border-0 rounded-full">Add First Review</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`glass-card rounded-2xl p-4 flex items-start justify-between gap-4 ${!r.is_published ? "opacity-60" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-sm">{r.client_name}</p>
                    <div className="flex">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}
                    </div>
                    {!r.is_published && <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">Hidden</span>}
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground italic line-clamp-2">"{r.comment}"</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => togglePublish(r)} className="p-1.5 rounded-lg hover:bg-white/60 text-muted-foreground hover:text-foreground transition-all" title={r.is_published ? "Hide" : "Publish"}>
                    {r.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-card border-white/50 rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl">Add Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm mb-1.5 block">Client Name *</Label>
              <Input value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} placeholder="e.g. Sarah" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Email</Label>
              <Input value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} type="email" placeholder="sarah@example.com" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Rating *</Label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    onClick={() => setForm({...form, rating: s})}
                    className="p-2 transition-all"
                  >
                    <Star className={`w-6 h-6 ${s <= form.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Comment</Label>
              <Textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} placeholder="What did they think?" className="rounded-xl resize-none" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
            <Button onClick={save} disabled={!form.client_name || saving} className="gradient-pink text-white border-0 rounded-full">
              {saving ? "Adding..." : "Add Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}