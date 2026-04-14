import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Our Team", path: "/team" },
  { label: "Book Now", path: "/book", highlight: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-pink rounded-full flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-playfair text-xl font-semibold text-gradient">Booked</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) =>
            link.highlight ? (
              <Link key={link.path} to={link.path}>
                <Button className="gradient-pink text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 rounded-full px-6">
                  Book Now
                </Button>
              </Link>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? "bg-white/60 text-primary shadow-sm"
                    : "text-foreground/70 hover:text-foreground hover:bg-white/40"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
          <Link to="/admin" className="ml-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-full hover:bg-white/40 transition-all">
            Admin
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-white/40 transition-all"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t border-white/30 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                link.highlight
                  ? "gradient-pink text-white text-center shadow-md"
                  : "hover:bg-white/50 text-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-xs text-muted-foreground hover:bg-white/40 rounded-2xl"
          >
            Admin Dashboard
          </Link>
        </div>
      )}
    </nav>
  );
}