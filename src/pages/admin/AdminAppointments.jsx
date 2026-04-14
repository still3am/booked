import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, CalendarCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  no_show: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled", "no_show"];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    base44.entities.Appointment.list("-date", 200).then(setAppointments).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    await base44.entities.Appointment.update(id, { status });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const filtered = appointments.filter(a => {
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchSearch = !search || a.client_name?.toLowerCase().includes(search.toLowerCase()) || a.service_name?.toLowerCase().includes(search.toLowerCase()) || a.staff_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-playfair text-3xl font-bold mb-1">Appointments</h1>
        <p className="text-muted-foreground mb-6">Manage all bookings</p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients, services..." className="pl-9 rounded-xl glass-card border-white/50" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 rounded-xl glass-card border-white/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="glass-card rounded-2xl h-16 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No appointments found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((appt, i) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{appt.client_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[appt.status]}`}>{appt.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{appt.service_name} · {appt.staff_name}</p>
                  <p className="text-xs text-muted-foreground">{appt.date} at {appt.time_slot} · {appt.client_email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-bold text-sm">${appt.price}</span>
                  <Select value={appt.status} onValueChange={val => updateStatus(appt.id, val)}>
                    <SelectTrigger className="w-32 h-8 text-xs rounded-xl bg-white/60 border-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["pending","confirmed","completed","cancelled","no_show"].map(s => (
                        <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}