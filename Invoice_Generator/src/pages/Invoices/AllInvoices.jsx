import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, FileText, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "../../lib/api";
import { formatMoney, formatDate } from "../../utils/format";
import StatusBadge from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" },
];

const AllInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (status) params.status = status;
      const { data } = await api.get("/invoices", { params });
      setInvoices(data.data.invoices);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load invoices"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    if (!search.trim()) return invoices;
    const q = search.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.billTo?.name?.toLowerCase().includes(q) ||
        inv.billTo?.email?.toLowerCase().includes(q) ||
        inv.billTo?.company?.toLowerCase().includes(q)
    );
  }, [invoices, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            All your invoices in one place.
          </p>
        </div>
        <Link
          to="/invoices/new"
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by number, client, or company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1">
            <Filter className="w-4 h-4 text-gray-400 mr-1 flex-shrink-0" />
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  status === s.value
                    ? "bg-primary text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" className="text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={search ? "No invoices match your search" : "No invoices yet"}
            description={
              search
                ? "Try adjusting your search or filters."
                : "Create your first invoice to get started."
            }
            action={
              !search && (
                <Link
                  to="/invoices/new"
                  className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark"
                >
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </Link>
              )
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 font-medium">Invoice</th>
                    <th className="px-6 py-3 font-medium">Client</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Issued</th>
                    <th className="px-6 py-3 font-medium">Due</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filtered.map((inv) => (
                    <tr
                      key={inv._id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition"
                    >
                      <td className="px-6 py-4 font-medium">
                        <Link
                          to={`/invoices/${inv._id}`}
                          className="text-gray-900 dark:text-white hover:text-primary"
                        >
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 dark:text-white">{inv.billTo?.name || "—"}</div>
                        {inv.billTo?.email && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {inv.billTo.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {formatMoney(inv.total, inv.currency)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {formatDate(inv.issueDate, "MMM D, YYYY")}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {formatDate(inv.dueDate, "MMM D, YYYY")}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((inv) => (
                <Link
                  key={inv._id}
                  to={`/invoices/${inv._id}`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {inv.invoiceNumber}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {inv.billTo?.name || "—"}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatMoney(inv.total, inv.currency)}
                    </span>
                    <span className="text-xs text-gray-400">
                      Due {formatDate(inv.dueDate, "MMM D")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllInvoices;
