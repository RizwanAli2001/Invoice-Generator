import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Trash2,
  Bell,
  Loader2,
  Pencil,
  Copy,
  Printer,
  CreditCard,
  Banknote,
  Building2,
  HelpCircle,
  Hash,
  Calendar,
  FileText,
  Receipt,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "../../lib/api";
import { formatMoney, formatDate } from "../../utils/format";
import StatusBadge from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";
import Modal from "../../components/Modal";

const PAYMENT_META = {
  card: { label: "Card", icon: CreditCard },
  cash: { label: "Cash", icon: Banknote },
  bank_transfer: { label: "Bank transfer", icon: Building2 },
  other: { label: "Other", icon: HelpCircle },
};

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const [sendOpen, setSendOpen] = useState(false);
  const [remindOpen, setRemindOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sendForm, setSendForm] = useState({ to: "", subject: "", message: "" });

  const fetchInvoice = async () => {
    try {
      const { data } = await api.get(`/invoices/${id}`);
      setInvoice(data.data.invoice);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load invoice"));
      navigate("/invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (status) => {
    setActionLoading(status);
    try {
      const { data } = await api.patch(`/invoices/${id}/status`, { status });
      setInvoice(data.data.invoice);
      toast.success(`Marked as ${status}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update status"));
    } finally {
      setActionLoading("");
    }
  };

  const openSend = () => {
    setSendForm({
      to: invoice.billTo?.email || "",
      subject: `Invoice ${invoice.invoiceNumber}`,
      message: "Please find your invoice attached. Let me know if you have any questions.",
    });
    setSendOpen(true);
  };

  const openRemind = () => {
    setSendForm({
      to: invoice.billTo?.email || "",
      subject: `Reminder: Invoice ${invoice.invoiceNumber}`,
      message: "",
    });
    setRemindOpen(true);
  };

  const submitSend = async () => {
    setActionLoading("send");
    try {
      const { data } = await api.post(`/invoices/${id}/send`, sendForm);
      setInvoice(data.data.invoice);
      toast.success(data.message || "Invoice sent");
      setSendOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not send invoice"));
    } finally {
      setActionLoading("");
    }
  };

  const submitRemind = async () => {
    setActionLoading("remind");
    try {
      const { data } = await api.post(`/invoices/${id}/remind`, sendForm);
      toast.success(data.message || "Reminder sent");
      setRemindOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not send reminder"));
    } finally {
      setActionLoading("");
    }
  };

  const submitDelete = async () => {
    setActionLoading("delete");
    try {
      await api.delete(`/invoices/${id}`);
      toast.success("Invoice deleted");
      navigate("/invoices");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete invoice"));
      setActionLoading("");
    }
  };

  const duplicateInvoice = async () => {
    setActionLoading("duplicate");
    try {
      const { data } = await api.post(`/invoices/${id}/duplicate`);
      toast.success("Invoice duplicated");
      navigate(`/invoices/${data.data.invoice._id}/edit`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not duplicate"));
    } finally {
      setActionLoading("");
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (!invoice) return null;

  const currency = invoice.currency;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> All invoices
      </Link>

      {/* Header — title + actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
            Invoice {invoice.invoiceNumber}
          </h1>
          <StatusBadge status={invoice.status} />
          <PaymentChip method={invoice.paymentMethod} />
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <ActionButton onClick={() => navigate(`/invoices/${id}/edit`)} icon={Pencil}>
            Edit
          </ActionButton>
          <ActionButton
            onClick={duplicateInvoice}
            loading={actionLoading === "duplicate"}
            icon={Copy}
          >
            Duplicate
          </ActionButton>
          <ActionButton onClick={handlePrint} icon={Printer}>
            Print
          </ActionButton>
          <ActionButton onClick={openSend} loading={actionLoading === "send"} icon={Send}>
            Send
          </ActionButton>
          {invoice.status !== "paid" && (
            <ActionButton onClick={openRemind} loading={actionLoading === "remind"} icon={Bell}>
              Reminder
            </ActionButton>
          )}
          {invoice.status !== "paid" && (
            <ActionButton
              onClick={() => updateStatus("paid")}
              loading={actionLoading === "paid"}
              icon={CheckCircle2}
              variant="primary"
            >
              Mark Paid
            </ActionButton>
          )}
          <ActionButton
            onClick={() => setDeleteOpen(true)}
            loading={actionLoading === "delete"}
            icon={Trash2}
            variant="danger"
          />
        </div>
      </div>

      {/* Quick summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 no-print">
        <SummaryTile icon={Hash} label="Invoice #" value={invoice.invoiceNumber} />
        <SummaryTile icon={Calendar} label="Issued" value={formatDate(invoice.issueDate)} />
        <SummaryTile
          icon={Calendar}
          label="Due"
          value={formatDate(invoice.dueDate)}
          tone={invoice.status === "overdue" ? "danger" : undefined}
        />
        <SummaryTile
          icon={Receipt}
          label="Total"
          value={formatMoney(invoice.total, currency)}
          strong
        />
      </div>

      {/* Invoice paper — clean preview */}
      <div className="card overflow-hidden">
        <div className="p-6 sm:p-10 print:p-0 bg-surface">
          {/* Header band */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-border">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-2 font-semibold mb-1">
                Invoice
              </p>
              <p className="text-2xl font-semibold text-foreground font-heading tabular-nums">
                {invoice.invoiceNumber}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge status={invoice.status} />
                <PaymentChip method={invoice.paymentMethod} />
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-2 font-semibold mb-1">
                Amount due
              </p>
              <p className="text-3xl font-semibold text-foreground tabular-nums">
                {formatMoney(invoice.total, currency)}
              </p>
              <p className="text-xs text-muted mt-1">
                Due {formatDate(invoice.dueDate, "MMM D, YYYY")}
              </p>
            </div>
          </div>

          {/* From / Bill to / Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-border">
            <PartyBlock
              label="From"
              name={invoice.billFrom?.businessName || "—"}
              email={invoice.billFrom?.email}
              phone={invoice.billFrom?.phone}
              address={invoice.billFrom?.address}
              taxId={invoice.billFrom?.taxId}
            />
            <PartyBlock
              label="Bill to"
              name={invoice.billTo?.name || "—"}
              company={invoice.billTo?.company}
              email={invoice.billTo?.email}
              phone={invoice.billTo?.phone}
              address={invoice.billTo?.address}
              taxId={invoice.billTo?.taxId}
            />
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-2 font-semibold mb-2">
                Details
              </p>
              <DetailRow label="Issue date" value={formatDate(invoice.issueDate, "MMM D, YYYY")} />
              <DetailRow label="Due date" value={formatDate(invoice.dueDate, "MMM D, YYYY")} />
              <DetailRow label="Currency" value={invoice.currency} />
              <DetailRow
                label="Payment"
                value={`${(PAYMENT_META[invoice.paymentMethod] || PAYMENT_META.other).label}${invoice.paymentReference ? ` • ${invoice.paymentReference}` : ""}`}
              />
            </div>
          </div>

          {/* Items table */}
          <div className="pt-6 overflow-x-auto -mx-6 sm:mx-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-2 text-[11px] uppercase tracking-[0.16em] border-b border-border">
                  <th className="py-3 px-6 sm:px-0 font-semibold">#</th>
                  <th className="py-3 font-semibold">Item</th>
                  <th className="py-3 font-semibold text-right">Qty</th>
                  <th className="py-3 font-semibold text-right">Unit price</th>
                  <th className="py-3 px-6 sm:px-0 font-semibold text-right">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoice.items?.map((it, i) => (
                  <tr key={i} className="align-top">
                    <td className="py-4 px-6 sm:px-0 text-muted-2 tabular-nums w-10">
                      {i + 1}
                    </td>
                    <td className="py-4 pr-3">
                      <div className="font-medium text-foreground">{it.name}</div>
                      {it.description && (
                        <div className="text-xs text-muted mt-0.5 whitespace-pre-line">
                          {it.description}
                        </div>
                      )}
                    </td>
                    <td className="py-4 text-right text-foreground tabular-nums">
                      {it.quantity}
                    </td>
                    <td className="py-4 text-right text-foreground tabular-nums">
                      {formatMoney(it.unitPrice, currency)}
                    </td>
                    <td className="py-4 px-6 sm:px-0 text-right font-semibold text-foreground tabular-nums">
                      {formatMoney(it.total ?? it.quantity * it.unitPrice, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full sm:w-80 space-y-2 text-sm">
              <Row label="Subtotal" value={formatMoney(invoice.subtotal, currency)} />
              {invoice.discount > 0 && (
                <Row
                  label="Discount"
                  value={`-${formatMoney(invoice.discount, currency)}`}
                />
              )}
              {invoice.taxRate > 0 && (
                <Row
                  label={`Tax (${invoice.taxRate}%)`}
                  value={formatMoney(invoice.taxAmount, currency)}
                />
              )}
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between p-3 -mx-3 rounded-lg bg-primary/5">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary tabular-nums">
                  {formatMoney(invoice.total, currency)}
                </span>
              </div>
              {invoice.status === "paid" && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Paid via {(PAYMENT_META[invoice.paymentMethod] || PAYMENT_META.other).label}
                  {invoice.paidAt ? ` on ${formatDate(invoice.paidAt, "MMM D, YYYY")}` : ""}
                </div>
              )}
            </div>
          </div>

          {/* Notes & terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="mt-8 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
              {invoice.notes && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-2 font-semibold mb-1 inline-flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Notes
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                    {invoice.notes}
                  </p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-2 font-semibold mb-1">
                    Terms
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                    {invoice.terms}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-surface-2 border-t border-border px-6 py-3 text-xs text-muted flex flex-wrap gap-4 justify-between no-print">
          <span>Created {formatDate(invoice.createdAt, "MMM D, YYYY • h:mma")}</span>
          {invoice.sentAt && <span>Sent {formatDate(invoice.sentAt, "MMM D, YYYY")}</span>}
          {invoice.paidAt && <span>Paid {formatDate(invoice.paidAt, "MMM D, YYYY")}</span>}
        </div>
      </div>

      {/* Send modal */}
      <Modal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        title="Send invoice by email"
        footer={
          <>
            <button
              onClick={() => setSendOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={submitSend}
              disabled={actionLoading === "send"}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition flex items-center gap-2 disabled:opacity-60"
            >
              {actionLoading === "send" && <Loader2 className="w-4 h-4 animate-spin" />}
              Send invoice
            </button>
          </>
        }
      >
        <SendForm sendForm={sendForm} setSendForm={setSendForm} />
      </Modal>

      {/* Reminder modal */}
      <Modal
        open={remindOpen}
        onClose={() => setRemindOpen(false)}
        title="Send payment reminder"
        footer={
          <>
            <button
              onClick={() => setRemindOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={submitRemind}
              disabled={actionLoading === "remind"}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition flex items-center gap-2 disabled:opacity-60"
            >
              {actionLoading === "remind" && <Loader2 className="w-4 h-4 animate-spin" />}
              Send reminder
            </button>
          </>
        }
      >
        <SendForm sendForm={sendForm} setSendForm={setSendForm} hideMessage />
      </Modal>

      {/* Delete modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this invoice?"
        footer={
          <>
            <button
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={submitDelete}
              disabled={actionLoading === "delete"}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition flex items-center gap-2 disabled:opacity-60"
            >
              {actionLoading === "delete" && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Invoice <b>{invoice.invoiceNumber}</b> will be permanently deleted.
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

const SendForm = ({ sendForm, setSendForm, hideMessage }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        To
      </label>
      <input
        type="email"
        value={sendForm.to}
        onChange={(e) => setSendForm((f) => ({ ...f, to: e.target.value }))}
        placeholder="client@example.com"
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        Subject
      </label>
      <input
        type="text"
        value={sendForm.subject}
        onChange={(e) => setSendForm((f) => ({ ...f, subject: e.target.value }))}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
    </div>
    {!hideMessage && (
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Message
        </label>
        <textarea
          rows={4}
          value={sendForm.message}
          onChange={(e) => setSendForm((f) => ({ ...f, message: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
        />
      </div>
    )}
  </div>
);

const ActionButton = ({ onClick, loading, icon: Icon, children, variant = "default" }) => {
  const styles = {
    default:
      "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
    primary:
      "bg-primary text-white border-primary hover:bg-primary-dark",
    danger:
      "bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 border-gray-200 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-900/20",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition disabled:opacity-60 ${styles[variant]}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

const SummaryTile = ({ icon: Icon, label, value, strong, tone }) => (
  <div
    className={`card p-3 flex items-center gap-3 ${
      tone === "danger" ? "border-rose-200 dark:border-rose-900/40" : ""
    }`}
  >
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
        tone === "danger"
          ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
          : "bg-primary/10 text-primary"
      }`}
    >
      <Icon className="w-4 h-4" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-2 font-semibold">
        {label}
      </p>
      <p
        className={`tabular-nums truncate ${
          strong ? "text-base font-bold text-foreground" : "text-sm font-medium text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

const PartyBlock = ({ label, name, company, email, phone, address, taxId }) => (
  <div>
    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-2 font-semibold mb-2">
      {label}
    </p>
    <p className="font-semibold text-foreground">{name}</p>
    {company && <p className="text-sm text-foreground">{company}</p>}
    {email && <p className="text-sm text-muted">{email}</p>}
    {phone && <p className="text-sm text-muted">{phone}</p>}
    {address && (
      <p className="text-sm text-muted whitespace-pre-line mt-1">{address}</p>
    )}
    {taxId && (
      <p className="text-xs text-muted-2 mt-1">Tax ID: {taxId}</p>
    )}
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1 text-sm">
    <span className="text-muted">{label}</span>
    <span className="text-foreground font-medium text-right truncate ml-3">{value || "—"}</span>
  </div>
);

const PaymentChip = ({ method }) => {
  const meta = PAYMENT_META[method] || PAYMENT_META.other;
  const Icon = meta.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-surface-3 text-foreground">
      <Icon className="w-3 h-3 text-primary" />
      {meta.label}
    </span>
  );
};

const Row = ({ label, value, bold }) => (
  <div className="flex items-center justify-between">
    <span className={bold ? "font-semibold text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
      {label}
    </span>
    <span className={`tabular-nums ${bold ? "text-lg font-bold text-gray-900 dark:text-white" : "font-medium text-gray-900 dark:text-white"}`}>
      {value}
    </span>
  </div>
);

export default InvoiceDetails;
