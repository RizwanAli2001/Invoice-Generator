import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Package,
  Edit2,
  Trash2,
  Loader2,
  Tag,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { formatMoney } from "../utils/format";

const blankProduct = () => ({
  name: "",
  description: "",
  sku: "",
  category: "",
  unit: "unit",
  unitPrice: 0,
  taxRate: 0,
  stock: "",
  active: true,
});

const Products = () => {
  const { user } = useAuth();
  const currency = user?.defaultCurrency || "USD";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [editing, setEditing] = useState(null); // null | "new" | product
  const [form, setForm] = useState(blankProduct());
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", { params: { limit: 500 } });
      setProducts(data.data.products);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load products"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return [p.name, p.description, p.sku, p.category].some((v) =>
          (v || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, search, categoryFilter]);

  const totalsByCategory = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const key = p.category || "Uncategorized";
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [products]);

  const openNew = () => {
    setForm(blankProduct());
    setEditing("new");
  };

  const openEdit = (p) => {
    setForm({
      name: p.name || "",
      description: p.description || "",
      sku: p.sku || "",
      category: p.category || "",
      unit: p.unit || "unit",
      unitPrice: p.unitPrice ?? 0,
      taxRate: p.taxRate ?? 0,
      stock: p.stock ?? "",
      active: p.active !== false,
    });
    setEditing(p);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim()) return toast.error("Product name is required");
    setSaving(true);
    try {
      const payload = {
        ...form,
        unitPrice: Number(form.unitPrice) || 0,
        taxRate: Number(form.taxRate) || 0,
        stock: form.stock === "" ? null : Number(form.stock),
      };
      if (editing === "new") {
        const { data } = await api.post("/products", payload);
        setProducts((ps) => [data.data.product, ...ps].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success("Product added");
      } else {
        const { data } = await api.put(`/products/${editing._id}`, payload);
        setProducts((ps) =>
          ps.map((p) => (p._id === editing._id ? data.data.product : p))
        );
        toast.success("Product updated");
      }
      setEditing(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save product"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      setProducts((ps) => ps.filter((p) => p._id !== deleteTarget._id));
      toast.success("Product deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete product"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
            Products & services
          </h1>
          <p className="text-muted text-sm mt-1">
            Your catalog — reuse items across invoices and keep pricing consistent.
          </p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus className="w-4 h-4" />
          New product
        </button>
      </div>

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            label="Total items"
            value={products.length}
            icon={Package}
            tint="bg-primary/10 text-primary"
          />
          <SummaryCard
            label="Active"
            value={products.filter((p) => p.active).length}
            icon={Tag}
            tint="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          />
          <SummaryCard
            label="Categories"
            value={categories.length}
            icon={Tag}
            tint="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
          />
          <SummaryCard
            label="Avg. price"
            value={formatMoney(
              products.length
                ? products.reduce((s, p) => s + (Number(p.unitPrice) || 0), 0) /
                    products.length
                : 0,
              currency
            )}
            icon={DollarSign}
            tint="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          />
        </div>
      )}

      <div className="card">
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-2" />
            <input
              type="text"
              placeholder="Search by name, SKU, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <CategoryPill
                active={categoryFilter === ""}
                onClick={() => setCategoryFilter("")}
                label={`All (${products.length})`}
              />
              {categories.map((c) => (
                <CategoryPill
                  key={c}
                  active={categoryFilter === c}
                  onClick={() => setCategoryFilter(c)}
                  label={`${c} (${totalsByCategory[c] || 0})`}
                />
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" className="text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title={
              search || categoryFilter
                ? "No matching products"
                : "Your catalog is empty"
            }
            description={
              search || categoryFilter
                ? "Try a different search or category."
                : "Add the products or services you bill for, then pick them when creating invoices."
            }
            action={
              !search &&
              !categoryFilter && (
                <button onClick={openNew} className="btn-primary">
                  <Plus className="w-4 h-4" /> Add product
                </button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="table-head">Product</th>
                  <th className="table-head">SKU</th>
                  <th className="table-head">Category</th>
                  <th className="table-head text-right">Price</th>
                  <th className="table-head text-right">Tax</th>
                  <th className="table-head text-right">Stock</th>
                  <th className="table-head text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-surface-2/60 transition group">
                    <td className="table-cell">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate flex items-center gap-2">
                            {p.name}
                            {!p.active && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted uppercase tracking-wider">
                                Inactive
                              </span>
                            )}
                          </div>
                          {p.description && (
                            <p className="text-xs text-muted truncate max-w-xs">
                              {p.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-muted">{p.sku || "—"}</td>
                    <td className="table-cell">
                      {p.category ? (
                        <span className="inline-flex px-2 py-1 rounded-md text-xs bg-surface-3 text-foreground">
                          {p.category}
                        </span>
                      ) : (
                        <span className="text-muted-2">—</span>
                      )}
                    </td>
                    <td className="table-cell text-right tabular-nums font-medium">
                      {formatMoney(p.unitPrice, currency)}
                      <div className="text-[11px] text-muted-2">/ {p.unit || "unit"}</div>
                    </td>
                    <td className="table-cell text-right tabular-nums text-muted">
                      {p.taxRate || 0}%
                    </td>
                    <td className="table-cell text-right tabular-nums text-muted">
                      {p.stock === null || p.stock === undefined ? "—" : p.stock}
                    </td>
                    <td className="table-cell text-right pr-5">
                      <div className="inline-flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                        <button
                          onClick={() => openEdit(p)}
                          className="btn-ghost p-1.5"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / edit modal */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "New product" : "Edit product"}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={saving}
              className="btn-primary"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing === "new" ? "Add product" : "Save changes"}
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Name *"
              required
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="e.g. Website design"
            />
            <FormField
              label="SKU"
              value={form.sku}
              onChange={(v) => setForm({ ...form, sku: v })}
              placeholder="WEB-DESIGN-01"
            />
            <FormField
              label="Category"
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v })}
              placeholder="Services"
            />
            <FormField
              label="Unit"
              value={form.unit}
              onChange={(v) => setForm({ ...form, unit: v })}
              placeholder="hour, unit, project…"
            />
            <FormField
              label="Unit price *"
              type="number"
              required
              value={form.unitPrice}
              onChange={(v) => setForm({ ...form, unitPrice: v })}
              min="0"
              step="0.01"
            />
            <FormField
              label="Tax rate (%)"
              type="number"
              value={form.taxRate}
              onChange={(v) => setForm({ ...form, taxRate: v })}
              min="0"
              max="100"
              step="0.01"
            />
            <FormField
              label="Stock (optional)"
              type="number"
              value={form.stock}
              onChange={(v) => setForm({ ...form, stock: v })}
              placeholder="leave empty for services"
              min="0"
            />
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary/30"
                />
                Active (selectable on new invoices)
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="input-field resize-none"
                placeholder="Optional details shown as the line item description."
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this product?"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="btn-danger"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-muted">
          <b className="text-foreground">{deleteTarget?.name}</b> will be removed
          from your catalog. Invoices that already use this item are not affected.
        </p>
      </Modal>
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, tint }) => (
  <div className="card p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tint}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
      <p className="text-lg font-semibold text-foreground truncate tabular-nums">
        {value}
      </p>
    </div>
  </div>
);

const CategoryPill = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
      active
        ? "bg-primary text-white"
        : "bg-surface-3 text-muted hover:bg-surface-3/70 hover:text-foreground"
    }`}
  >
    {label}
  </button>
);

const FormField = ({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  min,
  max,
  step,
}) => (
  <div>
    <label className="block text-xs font-medium text-foreground mb-1.5">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className="input-field"
    />
  </div>
);

export default Products;
