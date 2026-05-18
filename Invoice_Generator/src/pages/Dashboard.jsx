import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  Users,
  Receipt,
  Package,
  TrendingUp,
  CreditCard,
  Banknote,
  Building2,
  HelpCircle,
  Sparkles,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { formatMoney, formatDate } from "../utils/format";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PAYMENT_META = {
  card: { label: "Card", icon: CreditCard, tint: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  cash: { label: "Cash", icon: Banknote, tint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  bank_transfer: { label: "Bank transfer", icon: Building2, tint: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" },
  other: { label: "Other", icon: HelpCircle, tint: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, overdueRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/overdue"),
        ]);
        if (!cancelled) {
          setStats(statsRes.data.data);
          setOverdue(overdueRes.data.data.invoices || []);
        }
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load dashboard"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const currency = user?.defaultCurrency || "USD";

  const kpis = useMemo(() => {
    const c = stats?.counts || {};
    const r = stats?.revenue || {};
    return [
      {
        label: "Revenue (paid)",
        value: formatMoney(r.total ?? 0, currency),
        sub: `${c.paid ?? 0} paid invoices`,
        icon: TrendingUp,
        tint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      },
      {
        label: "Outstanding",
        value: formatMoney(r.outstanding ?? 0, currency),
        sub: `${(c.pending ?? 0) + (c.overdue ?? 0)} unpaid`,
        icon: Wallet,
        tint: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      },
      {
        label: "Total invoices",
        value: c.total ?? 0,
        sub: `${c.draft ?? 0} drafts`,
        icon: Receipt,
        tint: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
      },
      {
        label: "Catalog",
        value: c.products ?? 0,
        sub: `${c.clients ?? 0} clients`,
        icon: Package,
        tint: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
      },
    ];
  }, [stats, currency]);

  const monthly = stats?.monthly || [];
  const maxMonthly = Math.max(1, ...monthly.map((m) => Math.max(m.revenue || 0, m.billed || 0)));

  const paymentTotal = (stats?.paymentMethods || []).reduce((s, p) => s + (p.total || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
            Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}.
          </h1>
          <p className="text-muted text-sm mt-1">
            Here's your invoice activity at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/products" className="btn-secondary">
            <Package className="w-4 h-4" /> Products
          </Link>
          <Link to="/invoices/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Generate invoice
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" className="text-primary" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((k) => (
              <Kpi key={k.label} {...k} />
            ))}
          </div>

          {/* Status breakdown strip */}
          <div className="card p-4 mb-6">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <StatusChip
                color="bg-emerald-500"
                label="Paid"
                count={stats?.counts?.paid || 0}
              />
              <StatusChip
                color="bg-amber-500"
                label="Pending"
                count={stats?.counts?.pending || 0}
              />
              <StatusChip
                color="bg-rose-500"
                label="Overdue"
                count={stats?.counts?.overdue || 0}
              />
              <StatusChip
                color="bg-slate-400"
                label="Draft"
                count={stats?.counts?.draft || 0}
              />
              <StatusChip
                color="bg-gray-300"
                label="Cancelled"
                count={stats?.counts?.cancelled || 0}
              />
              <div className="flex-1" />
              <Link
                to="/invoices"
                className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
              >
                View all invoices <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Chart + side cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-foreground">Monthly performance</p>
                  <p className="text-xs text-muted">Paid revenue vs. billed amount</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Paid
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-primary/25" /> Billed
                  </span>
                </div>
              </div>

              {monthly.length === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No data yet"
                  description="Create your first invoice to start tracking trends."
                />
              ) : (
                <div className="flex items-end gap-3 h-48">
                  {monthly.map((m) => {
                    const revPct = Math.round(((m.revenue || 0) / maxMonthly) * 100);
                    const billPct = Math.round(((m.billed || 0) / maxMonthly) * 100);
                    return (
                      <div key={`${m.year}-${m.month}`} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                        <div className="w-full flex items-end gap-1 h-40">
                          <div
                            className="flex-1 rounded-t bg-primary/25 transition-all"
                            style={{ height: `${Math.max(billPct, 2)}%` }}
                            title={`Billed ${formatMoney(m.billed, currency)}`}
                          />
                          <div
                            className="flex-1 rounded-t bg-primary transition-all"
                            style={{ height: `${Math.max(revPct, 2)}%` }}
                            title={`Paid ${formatMoney(m.revenue, currency)}`}
                          />
                        </div>
                        <span className="text-[11px] text-muted-2 tracking-wide">
                          {MONTHS[m.month - 1]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment methods */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-foreground">Payment methods</p>
                <CreditCard className="w-4 h-4 text-muted-2" />
              </div>

              {(stats?.paymentMethods || []).length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="No paid invoices"
                  description="Payment method breakdown will appear once invoices are paid."
                />
              ) : (
                <ul className="space-y-4">
                  {stats.paymentMethods.map((p) => {
                    const meta = PAYMENT_META[p.method] || PAYMENT_META.other;
                    const pct = paymentTotal > 0 ? Math.round((p.total / paymentTotal) * 100) : 0;
                    const Icon = meta.icon;
                    return (
                      <li key={p.method}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="inline-flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-md flex items-center justify-center ${meta.tint}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-foreground font-medium">{meta.label}</span>
                          </span>
                          <span className="text-foreground tabular-nums font-medium">
                            {formatMoney(p.total, currency)}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-2 mt-1">
                          {p.count} invoice{p.count === 1 ? "" : "s"} • {pct}% of paid revenue
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* History + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent invoice history with line items */}
            <div className="lg:col-span-2 card overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Recent invoices</p>
                  <p className="text-xs text-muted">Latest activity with line items</p>
                </div>
                <Link
                  to="/invoices"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  History <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {(stats?.recentInvoices || []).length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No invoices yet"
                  description="Create your first invoice to get started."
                  action={
                    <Link to="/invoices/new" className="btn-primary">
                      <Plus className="w-4 h-4" /> Create invoice
                    </Link>
                  }
                />
              ) : (
                <ul className="divide-y divide-border">
                  {stats.recentInvoices.map((inv) => {
                    const itemCount = (inv.items || []).length;
                    const pmMeta = PAYMENT_META[inv.paymentMethod] || PAYMENT_META.other;
                    return (
                      <li key={inv._id} className="p-5 hover:bg-surface-2/60 transition">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                to={`/invoices/${inv._id}`}
                                className="font-semibold text-foreground hover:text-primary"
                              >
                                {inv.invoiceNumber}
                              </Link>
                              <StatusBadge status={inv.status} />
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted bg-surface-3 px-2 py-0.5 rounded-md">
                                <pmMeta.icon className="w-3 h-3" />
                                {pmMeta.label}
                              </span>
                            </div>
                            <p className="text-sm text-muted mt-1">
                              {inv.billTo?.name || "—"}
                              {inv.billTo?.company ? ` • ${inv.billTo.company}` : ""}
                            </p>
                            <p className="text-[11px] text-muted-2 mt-0.5">
                              Issued {formatDate(inv.issueDate, "MMM D, YYYY")} • Due{" "}
                              {formatDate(inv.dueDate, "MMM D, YYYY")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-bold text-foreground tabular-nums">
                              {formatMoney(inv.total, inv.currency)}
                            </p>
                            <p className="text-[11px] text-muted-2">
                              {itemCount} item{itemCount === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>

                        {itemCount > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {inv.items.slice(0, 4).map((it, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-surface-2 border border-border text-foreground"
                              >
                                <span className="text-muted-2">{it.quantity}×</span>
                                <span className="truncate max-w-[140px]">{it.name}</span>
                                <span className="text-muted tabular-nums">
                                  {formatMoney(it.total ?? it.quantity * it.unitPrice, inv.currency)}
                                </span>
                              </span>
                            ))}
                            {itemCount > 4 && (
                              <span className="inline-flex items-center text-[11px] px-2 py-1 rounded-md bg-surface-3 text-muted">
                                +{itemCount - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Top products */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-foreground">Top products</p>
                    <p className="text-xs text-muted">By revenue across invoices</p>
                  </div>
                  <Package className="w-4 h-4 text-muted-2" />
                </div>

                {(stats?.topProducts || []).length === 0 ? (
                  <p className="text-sm text-muted">
                    No data yet — once you create invoices with line items,
                    your top sellers will appear here.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {stats.topProducts.map((p, i) => (
                      <li key={p.name + i} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-muted-2">
                            {p.quantity} sold • {p.invoices} invoice{p.invoices === 1 ? "" : "s"}
                          </p>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {formatMoney(p.revenue, currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Needs attention */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-foreground inline-flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Needs attention
                  </p>
                  {overdue.length > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 font-medium">
                      {overdue.length}
                    </span>
                  )}
                </div>

                {overdue.length === 0 ? (
                  <p className="text-sm text-muted flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    You're all caught up.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {overdue.slice(0, 5).map((inv) => (
                      <li key={inv._id}>
                        <Link
                          to={`/invoices/${inv._id}`}
                          className="flex items-center justify-between text-sm py-2 px-3 -mx-2 rounded-lg hover:bg-surface-2"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {inv.invoiceNumber}
                            </p>
                            <p className="text-xs text-muted truncate">
                              {inv.billTo?.name} • Due {formatDate(inv.dueDate, "MMM D")}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-rose-600 tabular-nums">
                            {formatMoney(inv.total, inv.currency)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Quick actions */}
              <div className="card p-5">
                <p className="font-semibold text-foreground mb-3">Quick actions</p>
                <div className="space-y-1">
                  <QuickAction to="/invoices/new" icon={Sparkles} label="Generate invoice with AI" />
                  <QuickAction to="/products" icon={Package} label="Manage products" />
                  <QuickAction to="/clients" icon={Users} label="Manage clients" />
                  <QuickAction to="/invoices" icon={Clock} label="View invoice history" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Kpi = ({ label, value, sub, icon: Icon, tint }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <p className="text-xs uppercase tracking-wider text-muted font-medium">{label}</p>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tint}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
      {value}
    </p>
    <p className="text-xs text-muted-2 mt-1">{sub}</p>
  </div>
);

const StatusChip = ({ color, label, count }) => (
  <div className="flex items-center gap-2">
    <span className={`w-2 h-2 rounded-full ${color}`} />
    <span className="text-sm text-foreground font-medium">{label}</span>
    <span className="text-sm text-muted tabular-nums">{count}</span>
  </div>
);

const QuickAction = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-3 py-2.5 -mx-1 rounded-lg text-sm text-foreground hover:bg-surface-2 transition"
  >
    <Icon className="w-4 h-4 text-primary" />
    <span className="flex-1">{label}</span>
    <ArrowRight className="w-3.5 h-3.5 text-muted-2" />
  </Link>
);

export default Dashboard;
