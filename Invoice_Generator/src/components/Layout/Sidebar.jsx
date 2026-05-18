import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Hammer,
  LayoutDashboard,
  Users,
  Receipt,
  Plus,
  Package,
  PanelLeftClose,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/invoices/new", label: "Generate invoice", icon: Plus, highlight: true },
  { to: "/invoices", label: "Invoice history", icon: Receipt },
  { to: "/products", label: "Products", icon: Package },
  { to: "/clients", label: "Clients", icon: Users },
];

const Sidebar = ({ open, onClose }) => (
  <>
    {open && (
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden
      />
    )}

    <aside
      className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[260px] bg-sidebar flex flex-col transform transition-transform duration-200
      ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
        <Link
          to="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Hammer className="w-5 h-5 text-white" strokeWidth={2.25} />
          </div>
          <div>
            <span className="block text-[15px] font-semibold text-white leading-tight">
              Invoice Forge
            </span>
            <span className="block text-[10px] text-sidebar-text uppercase tracking-widest">
              Workspace
            </span>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 text-sidebar-text hover:text-white rounded-md"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, highlight }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            onClick={onClose}
            className={({ isActive }) =>
              highlight
                ? `mt-3 mb-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition`
                : isActive
                  ? "nav-item-active"
                  : "nav-item-inactive"
            }
          >
            <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-[11px] text-sidebar-text leading-relaxed">
          Your invoices, clients, and analytics in one workspace.
        </p>
      </div>
    </aside>
  </>
);

export default Sidebar;
