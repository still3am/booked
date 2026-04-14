import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function Team() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Staff.filter({ is_active: true }).then(setStaff).finally(() => setLoading(false));
  }, []);

  const avatarColors = ["from-pink-300 to-rose-400", "from-purple-300 to-pink-400", "from-rose-300 to-pink-500", "from-fuchsia-300 to-purple-400"];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-playfair text-5xl font-bold text-white mb-3">Meet the Team</h1>
          <p className="text-white/80 text-lg">Talented artists dedicated to making you feel amazing</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="glass-card rounded-3xl h-64 animate-pulse" />)}
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg mb-4">No team members added yet.</p>
            <Link to="/admin/staff">
              <Button className="gradient-pink text-white border-0 rounded-full">Add Staff</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {staff.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300 hover:shadow-xl"
              >
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-lg border-4 border-white/60"
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} mx-auto mb-4 shadow-lg flex items-center justify-center`}>
                    <span className="text-white text-2xl font-playfair font-bold">{member.name[0]}</span>
                  </div>
                )}
                <h3 className="font-playfair font-semibold text-xl mb-1">{member.name}</h3>
                <p className="text-primary font-medium text-sm mb-3">{member.title}</p>
                {member.bio && <p className="text-muted-foreground text-sm leading-relaxed mb-4">{member.bio}</p>}
                {member.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                    {member.specialties.map(s => (
                      <span key={s} className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1">{s}</span>
                    ))}
                  </div>
                )}
                <Link to={`/book?staff=${member.id}`}>
                  <Button size="sm" className="gradient-pink text-white border-0 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all">
                    Book with {member.name.split(" ")[0]} <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}