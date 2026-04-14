import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Users, DollarSign, Star, Clock, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format, isToday, parseISO } from "date-fns";

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Appointment.list("-date", 100),
      base44.entities.Staff.list(),
      base44.entities.Review.list("-created_date", 10),
    ]).then(([appts, staffList, revs]) => {
      setAppointments(appts);
      setStaff(staffList);
      setReviews(revs);
    }).finally(() => setLoading(false));
  }, []);

  const todayAppts = appointments.filter(a => isToday(parseISO(a.date)));
  const pending = appointments.filter(a => a.status === "pending").length;
  const revenue = appointments.filter(a => a.status === "completed").reduce((s, a) => s + (a.price || 0), 0);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  const stats = [
    { label: "Today's Appointments", value: todayAppts.length, icon: CalendarCheck, color: "from-pink-400 to-rose-500" },
    { label: "Pending Requests", value: pending, icon: Clock, color: "from-purple-400 to-pink-500" },
    { label: "Total Revenue", value: `$${revenue.toFixed(0)}`, icon: DollarSign, color: "from-rose-400 to-pink-600" },
    { label: "Average Rating", value: avgRating, icon: Star, color: "from-yellow-400 to-orange-400" },
  ];

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    no_show: "bg-gray-100 text-gray-700",
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-playfair text-3xl font-bold mb-1">Good morning ✨</h1>
        <p className="text-muted-foreground mb-8">Here's what's happening today</p>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold">{loading ? "—" : s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-playfair text-xl font-semibold mb-4 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary" /> Today's Schedule
            </h2>
            {todayAppts.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No appointments today.</p>
            ) : (
              <div className="space-y-3">
                {todayAppts.sort((a, b) => a.time_slot.localeCompare(b.time_slot)).map(appt => (
                  <div key={appt.id} className="flex items-center justify-between p-3 bg-white/50 rounded-2xl">
                    <div>
                      <p className="font-medium text-sm">{appt.client_name}</p>
                      <p className="text-xs text-muted-foreground">{appt.service_name} · {appt.staff_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{appt.time_slot}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[appt.status]}`}>{appt.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-playfair text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" /> Recent Reviews
            </h2>
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.slice(0, 4).map(r => (
                  <div key={r.id} className="p-3 bg-white/50 rounded-2xl">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{r.client_name}</p>
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-xs text-muted-foreground line-clamp-2 italic">"{r.comment}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}