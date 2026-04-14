import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Check, Clock, Calendar, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { format, addDays, isBefore, startOfDay } from "date-fns";

const TIME_SLOTS = ["9:00","9:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];

const STEPS = ["Service", "Staff", "Date & Time", "Your Info", "Confirm"];

export default function Book() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [form, setForm] = useState({ client_name: "", client_email: "", client_phone: "", notes: "" });

  useEffect(() => {
    base44.entities.Service.filter({ is_active: true }).then(list => {
      setServices(list);
      const preId = params.get("service");
      if (preId) {
        const found = list.find(s => s.id === preId);
        if (found) { setSelectedService(found); setStep(1); }
      }
    });
    base44.entities.Staff.filter({ is_active: true }).then(list => {
      setStaff(list);
      const preId = params.get("staff");
      if (preId) {
        const found = list.find(s => s.id === preId);
        if (found) setSelectedStaff(found);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedStaff && selectedDate) {
      base44.entities.Appointment.filter({
        staff_id: selectedStaff.id,
        date: format(selectedDate, "yyyy-MM-dd"),
        status: "confirmed"
      }).then(appts => setBookedSlots(appts.map(a => a.time_slot))).catch(() => {});
    }
  }, [selectedStaff, selectedDate]);

  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) dates.push(addDays(new Date(), i + 1));
    return dates;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.Appointment.create({
      ...form,
      service_id: selectedService.id,
      service_name: selectedService.name,
      staff_id: selectedStaff.id,
      staff_name: selectedStaff.name,
      date: format(selectedDate, "yyyy-MM-dd"),
      time_slot: selectedTime,
      duration_minutes: selectedService.duration_minutes,
      price: selectedService.price,
      status: "pending"
    });
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card rounded-3xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 gradient-pink rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-playfair text-3xl font-bold mb-3">You're Booked! 🌸</h2>
          <p className="text-muted-foreground mb-2">{selectedService?.name} with {selectedStaff?.name}</p>
          <p className="text-muted-foreground mb-6">{format(selectedDate, "MMMM d, yyyy")} at {selectedTime}</p>
          <p className="text-sm text-muted-foreground mb-8">A confirmation will be sent to <strong>{form.client_email}</strong></p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/")} variant="outline" className="rounded-full glass border-white/50">Home</Button>
            <Button onClick={() => { setDone(false); setStep(0); setSelectedService(null); setSelectedStaff(null); setSelectedDate(null); setSelectedTime(null); }} className="gradient-pink text-white border-0 rounded-full">
              Book Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-playfair text-4xl font-bold text-white mb-2">Book Appointment</h1>
          <p className="text-white/70">Fill in the steps below — takes less than 2 minutes</p>
        </motion.div>

        {/* Progress */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex flex-col items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                    i < step ? "gradient-pink text-white shadow-md" :
                    i === step ? "bg-primary text-white shadow-md" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block ${i === step ? "text-primary font-medium" : "text-muted-foreground"}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 transition-all duration-300 ${i < step ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <AnimatePresence mode="wait">
            {/* STEP 0: Service */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-playfair text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Choose a Service
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {services.map(service => (
                    <button
                      key={service.id}
                      onClick={() => { setSelectedService(service); setStep(1); }}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.01] ${
                        selectedService?.id === service.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {service.duration_minutes} min · {service.category}
                          </p>
                        </div>
                        <span className="font-bold text-primary text-lg">${service.price}</span>
                      </div>
                    </button>
                  ))}
                  {services.length === 0 && <p className="text-muted-foreground text-center py-8">No services available yet.</p>}
                </div>
              </motion.div>
            )}

            {/* STEP 1: Staff */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-playfair text-2xl font-semibold mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Choose Your Artist
                </h2>
                <div className="space-y-3">
                  {staff.map((member, i) => (
                    <button
                      key={member.id}
                      onClick={() => { setSelectedStaff(member); setStep(2); }}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.01] ${
                        selectedStaff?.id === member.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {member.photo_url ? (
                          <img src={member.photo_url} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 gradient-pink rounded-full flex items-center justify-center text-white font-bold">
                            {member.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.title}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {staff.length === 0 && <p className="text-muted-foreground text-center py-8">No staff available yet.</p>}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Date & Time */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-playfair text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Pick Date & Time
                </h2>
                <div className="mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Select Date</p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {getDates().map(date => (
                      <button
                        key={date.toISOString()}
                        onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                        className={`flex-shrink-0 w-16 p-2 rounded-2xl text-center transition-all duration-200 ${
                          selectedDate && format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                            ? "gradient-pink text-white shadow-md"
                            : "glass hover:bg-white/60"
                        }`}
                      >
                        <p className="text-xs font-medium">{format(date, "EEE")}</p>
                        <p className="text-lg font-bold">{format(date, "d")}</p>
                        <p className="text-xs">{format(date, "MMM")}</p>
                      </button>
                    ))}
                  </div>
                </div>
                {selectedDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">Available Times</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {TIME_SLOTS.map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            disabled={isBooked}
                            onClick={() => setSelectedTime(slot)}
                            className={`p-2.5 rounded-xl text-sm font-medium transition-all ${
                              isBooked ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground" :
                              selectedTime === slot ? "gradient-pink text-white shadow-md" :
                              "glass hover:bg-white/60"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <Button
                  className="w-full mt-6 gradient-pink text-white border-0 rounded-full py-3"
                  disabled={!selectedDate || !selectedTime}
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* STEP 3: Info */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-playfair text-2xl font-semibold mb-6">Your Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Full Name *</Label>
                    <Input value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} placeholder="Your name" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Email *</Label>
                    <Input value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} placeholder="your@email.com" type="email" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Phone</Label>
                    <Input value={form.client_phone} onChange={e => setForm({...form, client_phone: e.target.value})} placeholder="(555) 000-0000" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Notes (optional)</Label>
                    <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Any special requests or allergies..." className="rounded-xl resize-none" rows={3} />
                  </div>
                </div>
                <Button
                  className="w-full mt-6 gradient-pink text-white border-0 rounded-full py-3"
                  disabled={!form.client_name || !form.client_email}
                  onClick={() => setStep(4)}
                >
                  Review Booking
                </Button>
              </motion.div>
            )}

            {/* STEP 4: Confirm */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-playfair text-2xl font-semibold mb-6">Confirm Booking</h2>
                <div className="space-y-3 mb-8">
                  {[
                    { label: "Service", value: `${selectedService?.name} · $${selectedService?.price}` },
                    { label: "Duration", value: `${selectedService?.duration_minutes} minutes` },
                    { label: "Artist", value: selectedStaff?.name },
                    { label: "Date", value: selectedDate && format(selectedDate, "EEEE, MMMM d yyyy") },
                    { label: "Time", value: selectedTime },
                    { label: "Name", value: form.client_name },
                    { label: "Email", value: form.client_email },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="font-medium text-sm">{value}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full gradient-pink text-white border-0 rounded-full py-3 text-base font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? "Confirming..." : "Confirm Appointment 🌸"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back button */}
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}