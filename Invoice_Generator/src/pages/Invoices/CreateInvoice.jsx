import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Wand2,
  ChevronDown,
  CreditCard,
  Banknote,
  Building2,
  HelpCircle,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import { api, getErrorMessage } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { formatMoney, formatDateInput } from "../../utils/format";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD", "AED", "SAR", "PKR"];

const PAYMENT_METHODS = [
  { value: "card", label: "Card", icon: CreditCard },
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "bank_transfer", label: "Bank transfer", icon: Building2 },
  { value: "other", label: "Other", icon: HelpCircle },
];

const blankItem = () => ({ name: "", description: "", quantity: 1, unitPrice: 0 });

const CreateInvoice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEdit = Boolean(editId);

  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  const [form, setForm] = useState({
    billTo: { name: "", email: "", phone: "", company: "", address: "" },
    items: [blankItem()],
    issueDate: formatDateInput(new Date()),
    dueDate: formatDateInput(moment().add(14, "days")),
    currency: "USD",
    taxRate: 0,
    discount: 0,
    notes: "",
    terms: "",
    status: "pending",
    paymentMethod: "card",
    paymentReference: "",
  });

  // Load clients + products for the pickers
  useEffect(() => {
    (async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get("/clients", { params: { limit: 200 } }),
          api.get("/products", { params: { limit: 500, active: "true" } }),
        ]);
        setClients(cRes.data.data.clients);
        setProducts(pRes.data.data.products);
      } catch {
        // non-blocking
      }
    })();
  }, []);

  // Default currency from user profile once available
  useEffect(() => {
    if (user?.defaultCurrency && !isEdit) {
      setForm((f) => ({ ...f, currency: user.defaultCurrency }));
    }
  }, [user, isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data } = await api.get(`/invoices/${editId}`);
        const inv = data.data.invoice;
        setForm({
          billTo: {
            name: inv.billTo?.name || "",
            email: inv.billTo?.email || "",
            phone: inv.billTo?.phone || "",
            company: inv.billTo?.company || "",
            address: inv.billTo?.address || "",
          },
          items: inv.items?.length
            ? inv.items.map((it) => ({
                name: it.name,
                description: it.description || "",
                quantity: it.quantity,
                unitPrice: it.unitPrice,
              }))
            : [blankItem()],
          issueDate: formatDateInput(inv.issueDate),
          dueDate: formatDateInput(inv.dueDate),
          currency: inv.currency || "USD",
          taxRate: inv.taxRate || 0,
          discount: inv.discount || 0,
          notes: inv.notes || "",
          terms: inv.terms || "",
          status: inv.status || "pending",
          paymentMethod: inv.paymentMethod || "card",
          paymentReference: inv.paymentReference || "",
        });
        if (inv.client?._id) setSelectedClientId(inv.client._id);
      } catch (err) {
        toast.error(getErrorMessage(err, "Invoice not found"));
        navigate("/invoices");
      } finally {
        setLoadingEdit(false);
      }
    })();
  }, [isEdit, editId, navigate]);

  const updateBillTo = (key, value) =>
    setForm((f) => ({ ...f, billTo: { ...f.billTo, [key]: value } }));

  const updateItem = (idx, key, value) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === idx ? { ...it, [key]: value } : it)),
    }));

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, blankItem()] }));
  const removeItem = (idx) =>
    setForm((f) => ({
      ...f,
      items: f.items.length > 1 ? f.items.filter((_, i) => i !== idx) : f.items,
    }));

  const pickProductIntoRow = (idx, productId) => {
    if (!productId) return;
    const p = products.find((x) => x._id === productId);
    if (!p) return;
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) =>
        i === idx
          ? {
              name: p.name,
              description: p.description || it.description,
              quantity: Number(it.quantity) || 1,
              unitPrice: p.unitPrice ?? it.unitPrice,
            }
          : it
      ),
    }));
  };

  const addProductAsNewRow = (productId) => {
    if (!productId) return;
    const p = products.find((x) => x._id === productId);
    if (!p) return;
    setForm((f) => {
      const firstRowEmpty =
        f.items.length === 1 &&
        !f.items[0].name.trim() &&
        Number(f.items[0].unitPrice) === 0;
      const newRow = {
        name: p.name,
        description: p.description || "",
        quantity: 1,
        unitPrice: p.unitPrice ?? 0,
      };
      return {
        ...f,
        items: firstRowEmpty ? [newRow] : [...f.items, newRow],
      };
    });
  };

  const handleSelectClient = (id) => {
    setSelectedClientId(id);
    const c = clients.find((x) => x._id === id);
    if (c) {
      setForm((f) => ({
        ...f,
        billTo: {
          name: c.name || "",
          email: c.email || "",
          phone: c.phone || "",
          company: c.company || "",
          address: c.address || "",
        },
      }));
    }
  };

  // Live totals matching the backend's calculation
  const totals = useMemo(() => {
    const subtotal = form.items.reduce(
      (s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
      0
    );
    const discount = Number(form.discount) || 0;
    const taxable = Math.max(0, subtotal - discount);
    const tax = (taxable * (Number(form.taxRate) || 0)) / 100;
    return {
      subtotal,
      tax,
      discount,
      total: taxable + tax,
    };
  }, [form.items, form.taxRate, form.discount]);

  const handleParse = async () => {
    if (text.trim().length < 10) {
      toast.error("Paste a bit more text for the AI to work with");
      return;
    }
    setParsing(true);
    try {
      const { data } = await api.post("/invoices/parse", { text });
      const d = data.data.draft;
      setForm((f) => ({
        ...f,
        billTo: {
          name: d.billTo?.name || f.billTo.name,
          email: d.billTo?.email || f.billTo.email,
          phone: d.billTo?.phone || f.billTo.phone,
          company: d.billTo?.company || f.billTo.company,
          address: d.billTo?.address || f.billTo.address,
        },
        items: d.items?.length
          ? d.items.map((it) => ({
              name: it.name || "",
              description: it.description || "",
              quantity: it.quantity || 1,
              unitPrice: it.unitPrice || 0,
            }))
          : f.items,
        currency: d.currency || f.currency,
        taxRate: d.taxRate ?? f.taxRate,
        discount: d.discount ?? f.discount,
        issueDate: d.issueDate ? formatDateInput(d.issueDate) : f.issueDate,
        dueDate: d.dueDate ? formatDateInput(d.dueDate) : f.dueDate,
        notes: d.notes || f.notes,
        terms: d.terms || f.terms,
      }));
      const source = data.data.source;
      toast.success(
        source === "gemini"
          ? "Filled from AI (Gemini)"
          : source === "openai"
          ? "Filled from AI (OpenAI)"
          : "Filled from text — review and tweak as needed"
      );

      if (d.paymentMethod) {
        setForm((f) => ({ ...f, paymentMethod: d.paymentMethod }));
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not parse text"));
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e, status) => {
    e?.preventDefault?.();
    if (submitting) return;

    if (!form.billTo.name.trim()) return toast.error("Client name is required");
    if (!form.dueDate) return toast.error("Due date is required");
    const validItems = form.items.filter((it) => it.name.trim());
    if (validItems.length === 0) return toast.error("Add at least one item");

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        status: status || form.status,
        items: validItems.map((it) => ({
          name: it.name,
          description: it.description,
          quantity: Number(it.quantity) || 0,
          unitPrice: Number(it.unitPrice) || 0,
        })),
        taxRate: Number(form.taxRate) || 0,
        discount: Number(form.discount) || 0,
        clientId: selectedClientId || undefined,
      };
      if (isEdit) {
        await api.put(`/invoices/${editId}`, payload);
        toast.success("Invoice updated");
        navigate(`/invoices/${editId}`);
      } else {
        const { data } = await api.post("/invoices", payload);
        toast.success("Invoice created");
        navigate(`/invoices/${data.data.invoice._id}`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not create invoice"));
      setSubmitting(false);
    }
  };

  if (loadingEdit) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/invoices"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> All invoices
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
            {isEdit ? "Edit invoice" : "Generate invoice"}
          </h1>
          <p className="text-muted text-sm mt-1">
            {isEdit
              ? "Update line items, dates, and billing details."
              : "Paste text to auto-fill, or enter details manually."}
          </p>
        </div>
      </div>

      {!isEdit && (
      <div className="card p-5 mb-6 border-l-4 border-l-primary">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-gray-900 dark:text-white">AI Quick Fill</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Paste freeform invoice text (emails, notes, chat messages) and we'll
          extract client, items, totals, and due dates.
        </p>
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Example: Bill to Acme Corp (billing@acme.com). Website design - 1 x 15000. Consultation 2hrs @ 1500. Tax 10%. Due 2026-06-30."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition placeholder:text-gray-400 resize-none"
        />
        <button
          onClick={handleParse}
          disabled={parsing}
          className="mt-3 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition disabled:opacity-60"
        >
          {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {parsing ? "Parsing…" : "Fill from text"}
        </button>
      </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        {/* Bill To */}
        <Section title="Bill to">
          {clients.length > 0 && (
            <div className="mb-4">
              <Label>Pick a saved client (optional)</Label>
              <div className="relative">
                <select
                  value={selectedClientId}
                  onChange={(e) => handleSelectClient(e.target.value)}
                  className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">— None —</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.company ? `(${c.company})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name *" value={form.billTo.name} onChange={(v) => updateBillTo("name", v)} required />
            <Field label="Email" type="email" value={form.billTo.email} onChange={(v) => updateBillTo("email", v)} />
            <Field label="Company" value={form.billTo.company} onChange={(v) => updateBillTo("company", v)} />
            <Field label="Phone" value={form.billTo.phone} onChange={(v) => updateBillTo("phone", v)} />
            <div className="sm:col-span-2">
              <Field
                label="Address"
                value={form.billTo.address}
                onChange={(v) => updateBillTo("address", v)}
              />
            </div>
          </div>
        </Section>

        {/* Items */}
        <Section
          title="Line items"
          action={
            <div className="flex items-center gap-2">
              {products.length > 0 && (
                <div className="relative">
                  <select
                    value=""
                    onChange={(e) => {
                      addProductAsNewRow(e.target.value);
                      e.target.value = "";
                    }}
                    className="appearance-none text-xs pl-8 pr-7 py-1.5 rounded-md border border-border bg-surface text-foreground hover:bg-surface-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
                  >
                    <option value="">From catalog…</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} — {formatMoney(p.unitPrice, form.currency)}
                      </option>
                    ))}
                  </select>
                  <Package className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary pointer-events-none" />
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-2 pointer-events-none" />
                </div>
              )}
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                <Plus className="w-4 h-4" /> Add item
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            {form.items.map((it, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg"
              >
                <div className="col-span-12 sm:col-span-5">
                  <div className="flex items-stretch gap-1">
                    <input
                      type="text"
                      placeholder="Item name *"
                      value={it.name}
                      onChange={(e) => updateItem(i, "name", e.target.value)}
                      className="flex-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary"
                    />
                    {products.length > 0 && (
                      <div className="relative">
                        <select
                          value=""
                          onChange={(e) => {
                            pickProductIntoRow(i, e.target.value);
                            e.target.value = "";
                          }}
                          title="Use a product from your catalog"
                          className="appearance-none h-full w-9 pl-2 pr-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-transparent text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary cursor-pointer"
                        >
                          <option value="">From catalog…</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id} className="text-foreground">
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <Package className="absolute inset-0 m-auto w-4 h-4 text-primary pointer-events-none" />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={it.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                    className="w-full px-3 py-2 mt-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Qty"
                    value={it.quantity}
                    onChange={(e) => updateItem(i, "quantity", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={it.unitPrice}
                    onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2 flex items-center justify-end text-sm font-semibold text-gray-900 dark:text-white py-2 px-2">
                  {formatMoney(
                    (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
                    form.currency
                  )}
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-md transition"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Meta + totals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Section title="Details" className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Issue date"
                type="date"
                value={form.issueDate}
                onChange={(v) => setForm((f) => ({ ...f, issueDate: v }))}
              />
              <Field
                label="Due date *"
                type="date"
                value={form.dueDate}
                onChange={(v) => setForm((f) => ({ ...f, dueDate: v }))}
                required
              />
              <div>
                <Label>Currency</Label>
                <div className="relative">
                  <select
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                    className="appearance-none w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <Field
                label="Tax rate (%)"
                type="number"
                value={form.taxRate}
                onChange={(v) => setForm((f) => ({ ...f, taxRate: v }))}
              />
              <Field
                label="Discount"
                type="number"
                value={form.discount}
                onChange={(v) => setForm((f) => ({ ...f, discount: v }))}
              />
            </div>

            {/* Payment method */}
            <div className="mt-5">
              <Label>Payment method</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PAYMENT_METHODS.map((pm) => {
                  const active = form.paymentMethod === pm.value;
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, paymentMethod: pm.value }))
                      }
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-surface text-foreground hover:bg-surface-3"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-2"}`} />
                      {pm.label}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                placeholder={
                  form.paymentMethod === "cash"
                    ? "Receipt # (optional)"
                    : form.paymentMethod === "bank_transfer"
                    ? "Transaction reference (optional)"
                    : "Payment reference (optional)"
                }
                value={form.paymentReference}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentReference: e.target.value }))
                }
                className="w-full mt-2 px-4 py-2.5 rounded-lg border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <Label>Notes</Label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Thanks for your business…"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>
              <div>
                <Label>Terms</Label>
                <textarea
                  rows={2}
                  value={form.terms}
                  onChange={(e) => setForm((f) => ({ ...f, terms: e.target.value }))}
                  placeholder="Net 14 — please pay by the due date"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>
            </div>
          </Section>

          <Section title="Summary">
            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatMoney(totals.subtotal, form.currency)} />
              {totals.discount > 0 && (
                <Row
                  label="Discount"
                  value={`-${formatMoney(totals.discount, form.currency)}`}
                />
              )}
              {Number(form.taxRate) > 0 && (
                <Row
                  label={`Tax (${form.taxRate}%)`}
                  value={formatMoney(totals.tax, form.currency)}
                />
              )}
              <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
              <Row
                label="Total"
                value={formatMoney(totals.total, form.currency)}
                bold
              />
            </div>
          </Section>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "draft")}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-60"
          >
            Save as draft
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Create invoice"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Section = ({ title, action, children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const Label = ({ children }) => (
  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
    {children}
  </label>
);

const Field = ({ label, value, onChange, type = "text", required }) => (
  <div>
    <Label>{label}</Label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition placeholder:text-gray-400"
    />
  </div>
);

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

export default CreateInvoice;
