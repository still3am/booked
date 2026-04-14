import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const CATEGORIES = ["All", "Nails", "Facials", "Lashes", "Brows", "Waxing", "Esthetics"];

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) setActiveCategory(cat);
  }, [location.search]);

  useEffect(() => {
    base44.entities.Service.filter({ is_active: true }).then(setServices).finally(() => setLoading(false));
  }, []);

  const filtered = services.filter(s => {
    const matchCat = activeCategory === "All" || s.category === activeCategory;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-playfair text-5xl font-bold text-white mb-3">Our Services</h1>
          <p className="text-white/80 text-lg">Expertly crafted beauty treatments just for you</p>
        </motion.div>

        {/* Search */}
        <div className="glass-card rounded-2xl p-2 mb-6 flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground ml-3" />
          <Input
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "gradient-pink text-white shadow-md"
                  : "glass text-foreground/70 hover:text-foreground hover:bg-white/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-3xl p-6 animate-pulse h-48" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">No services found.</p>
            <Link to="/admin/services">
              <Button className="mt-4 gradient-pink text-white border-0 rounded-full">Add Services</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:shadow-xl"
              >
                {service.image_url && (
                  <img src={service.image_url} alt={service.name} className="w-full h-40 object-cover" />
                )}
                <div className="p-5">
                  <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1">{service.category}</span>
                  <h3 className="font-playfair font-semibold text-lg mt-2 mb-1">{service.name}</h3>
                  {service.description && (
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{service.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-foreground">${service.price}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> {service.duration_minutes}min
                      </span>
                    </div>
                    <Link to={`/book?service=${service.id}`}>
                      <Button size="sm" className="gradient-pink text-white border-0 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all">
                        Book <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}