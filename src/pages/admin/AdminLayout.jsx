import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Scissors, Users, CalendarCheck, Star, Sparkles } from "lucide-react";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/appointments", label: "Appointments", icon: CalendarCheck },
  { path: "/admin/services", label: "Services", icon: Scissors },
  { path: "/admin/staff", label: "Staff", icon: Users },
  { path: "/admin/reviews", label: "Reviews", icon: Star },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-card md:min-h-screen p-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 gradient-pink rounded-full flex items-center justify-center shadow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-playfair text-xl font-semibold text-gradient">Booked</span>
          <span className="text-xs text-muted-foreground ml-1 mt-0.5">Admin</span>
        </div>
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                location.pathname === item.path
                  ? "gradient-pink text-white shadow-md"
                  : "hover:bg-white/50 text-foreground/70 hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block mt-auto pt-8">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl hover:bg-white/40 transition-all block">
            ← Back to App
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}