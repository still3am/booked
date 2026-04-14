import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ArrowRight, Sparkles, Heart, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function Home() {
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    base44.entities.Review.filter({ is_published: true }, "-created_date", 6).then(setReviews).catch(() => {});
    base44.entities.Service.filter({ is_active: true }, "name", 6).then(setServices).catch(() => {});
  }, []);

  const categories = [
    { name: "Nail Art", icon: "💅", desc: "Gel, acrylic, nail art & more", path: "/services?category=Nails" },
    { name: "Facials", icon: "✨", desc: "Glow-up treatments & skincare", path: "/services?category=Facials" },
    { name: "Lashes", icon: "👁️", desc: "Classic, hybrid & volume sets", path: "/services?category=Lashes" },
    { name: "Brows", icon: "🌿", desc: "Shaping, tinting & lamination", path: "/services?category=Brows" },
    { name: "Waxing", icon: "🌸", desc: "Smooth & silky results", path: "/services?category=Waxing" },
    { name: "Esthetics", icon: "🫧", desc: "Full skin & body treatments", path: "/services?category=Esthetics" },
  ];

  const features = [
    { icon: Clock, title: "Book in Seconds", desc: "Real-time availability, instant confirmation" },
    { icon: Heart, title: "Trusted Experts", desc: "Certified nail techs & licensed estheticians" },
    { icon: Shield, title: "Easy Rescheduling", desc: "Flexible cancellation up to 24hrs before" },
  ];

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "5.0";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4">
        {/* Floating blobs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl relative z-10"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 text-sm font-medium text-pink-800">
            <Sparkles className="w-4 h-4" />
            <span>Nails · Lashes · Skin · Beauty</span>
          </div>
          <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
            Beauty on
            <br />
            <em>Your Terms</em>
          </h1>
          <p className="text-white/90 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Book nail, lash, and esthetic appointments effortlessly. Real-time availability, instant confirmation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/book">
              <Button size="lg" className="bg-white text-pink-600 hover:bg-white/90 shadow-xl rounded-full px-10 py-6 text-base font-semibold hover:scale-105 transition-all duration-200">
                Book an Appointment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="border-white/60 text-white hover:bg-white/20 rounded-full px-8 py-6 text-base backdrop-blur-sm">
                View Services
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          {reviews.length > 0 && (
            <div className="mt-10 inline-flex items-center gap-3 glass rounded-2xl px-6 py-3">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-white font-semibold">{avgRating}</span>
              <span className="text-white/70 text-sm">({reviews.length} reviews)</span>
            </div>
          )}
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-playfair text-4xl font-bold text-white mb-3">Our Services</h2>
            <p className="text-white/80 text-lg">Everything you need to feel your most beautiful</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to={cat.path}>
                  <div className="glass-card rounded-3xl p-6 text-center hover:scale-105 transition-all duration-300 hover:shadow-xl cursor-pointer group">
                    <div className="text-4xl mb-3">{cat.icon}</div>
                    <h3 className="font-playfair font-semibold text-foreground text-lg mb-1">{cat.name}</h3>
                    <p className="text-muted-foreground text-sm">{cat.desc}</p>
                    <div className="mt-3 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      Explore <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 gradient-pink rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-playfair font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-playfair text-4xl font-bold text-white mb-3">What Clients Say</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.slice(0, 6).map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card rounded-3xl p-6"
                >
                  <div className="flex mb-3">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <p className="text-foreground/80 text-sm leading-relaxed mb-4 italic">"{r.comment}"</p>
                  <p className="font-medium text-sm text-foreground">{r.client_name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-10 md:p-14">
            <h2 className="font-playfair text-4xl font-bold mb-4">Ready to Glow?</h2>
            <p className="text-muted-foreground mb-8 text-lg">Book your appointment in under 2 minutes.</p>
            <Link to="/book">
              <Button size="lg" className="gradient-pink text-white border-0 shadow-lg rounded-full px-12 py-6 text-base font-semibold hover:scale-105 hover:shadow-xl transition-all duration-200">
                Book Now — It's Free
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center">
        <p className="text-white/60 text-sm">© 2026 Booked · Made with 💕 for beauty lovers</p>
      </footer>
    </div>
  );
}