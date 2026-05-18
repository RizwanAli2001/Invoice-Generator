import React from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Hammer,
  ArrowRight,
  Receipt,
  Wand2,
  Mail,
  BarChart3,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Hammer className="w-5 h-5 text-white" strokeWidth={2.25} />
          </div>
          <span className="font-heading text-lg font-semibold text-foreground">
            Invoice Forge
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted">
          <a href="#workflow" className="hover:text-foreground transition">Workflow</a>
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <Link to="/login" className="hover:text-foreground transition">Sign in</Link>
          <button onClick={toggleDarkMode} className="btn-ghost p-2 rounded-full">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link to="/signup" className="btn-primary">
            Open workspace <ArrowRight className="w-4 h-4" />
          </Link>
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggleDarkMode} className="btn-ghost p-2">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setOpen(!open)} className="p-2 text-muted">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border px-4 py-4 flex flex-col gap-3 bg-surface">
          <a href="#workflow" onClick={() => setOpen(false)}>Workflow</a>
          <a href="#features" onClick={() => setOpen(false)}>Features</a>
          <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
          <Link to="/signup" className="btn-primary text-center" onClick={() => setOpen(false)}>
            Open workspace
          </Link>
        </div>
      )}
    </header>
  );
};

const PreviewInvoice = () => (
  <div className="card p-6 max-w-md w-full">
    <div className="flex justify-between items-start mb-6 pb-4 border-b border-border">
      <div>
        <p className="text-xs text-muted-2 uppercase tracking-widest">Invoice</p>
        <p className="font-heading text-xl font-semibold text-foreground mt-1">INV-1042</p>
      </div>
      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
        Paid
      </span>
    </div>
    <p className="text-sm font-medium text-foreground mb-4">Acme Corporation</p>
    <ul className="space-y-2.5 text-sm">
      {[
        ["Website design", "$15,000"],
        ["Consultation (2h)", "$3,000"],
        ["Hosting setup", "$2,500"],
      ].map(([n, a]) => (
        <li key={n} className="flex justify-between text-muted">
          <span>{n}</span>
          <span className="font-medium text-foreground tabular-nums">{a}</span>
        </li>
      ))}
    </ul>
    <div className="mt-5 pt-4 border-t border-border flex justify-between font-semibold text-foreground">
      <span>Total</span>
      <span className="tabular-nums">$20,500</span>
    </div>
  </div>
);

const HomePage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-2">
      <Navbar />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              Invoice workspace
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl font-semibold text-foreground leading-[1.1] tracking-tight">
              Forge invoices.
              <br />
              <span className="text-primary">Track what you&apos;re owed.</span>
            </h1>
            <p className="mt-6 text-muted text-lg leading-relaxed max-w-lg">
              A focused workspace for freelancers and small teams — generate invoices,
              manage clients, send PDFs, and see revenue at a glance. No clutter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" className="btn-primary px-6 py-3">
                Start free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn-secondary px-6 py-3">
                Sign in
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <PreviewInvoice />
          </div>
        </div>
      </section>

      <section id="workflow" className="border-y border-border bg-surface py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-10">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Generate", desc: "Paste text or fill the form. Line items and totals calculate automatically.", icon: Wand2 },
              { step: "02", title: "Send", desc: "Download a PDF or email the invoice directly to your client.", icon: Mail },
              { step: "03", title: "Track", desc: "Dashboard shows paid, pending, and overdue — with payment reminders.", icon: BarChart3 },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="card-flat p-6">
                <span className="text-xs font-mono text-muted-2">{step}</span>
                <Icon className="w-5 h-5 text-primary mt-4 mb-3" strokeWidth={2} />
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Everything in one workspace
            </h2>
            <ul className="mt-6 space-y-4">
              {[
                "Invoice history with search and status filters",
                "Client directory for repeat billing",
                "AI text parsing when you need speed",
                "Business profile on every PDF",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-muted">
                  <Receipt className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-8 bg-sidebar text-sidebar-text-active">
            <p className="text-sm opacity-80">This month</p>
            <p className="font-heading text-3xl font-semibold mt-2">$24,800</p>
            <p className="text-xs mt-1 opacity-60">Collected revenue</p>
            <div className="mt-6 flex gap-2 items-end h-24">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-primary/80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-2 font-medium text-foreground">
            <Hammer className="w-4 h-4 text-primary" /> Invoice Forge
          </span>
          <span>&copy; {new Date().getFullYear()} Invoice Forge</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
