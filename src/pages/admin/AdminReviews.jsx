import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Eye, EyeOff, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="font-playfair text-3xl font-bold mb-1">Reviews</h1>
            <p className="text-muted-foreground">{reviews.length} total · Avg: ⭐ {avgRating}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="glass-card rounded-2xl h-20 animate-pulse" />)}</div>
        ) : reviews.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No reviews yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`glass-card rounded-2xl p-4 flex items-start justify-between gap-4 ${!r.is_published ? "opacity-60" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
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
    </div>
  );
}