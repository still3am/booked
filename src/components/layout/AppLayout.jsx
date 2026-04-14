import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #fce4ec 0%, #f8bbd0 35%, #f48fb1 65%, #f06292 100%)" }}>
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}