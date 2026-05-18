import React, { useEffect, useState } from "react";
import { Plus, Search, Users, Edit2, Trash2, Loader2, Mail, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "../lib/api";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { initialsOf } from "../utils/format";

const blankClient = () => ({
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  taxId: "",
  notes: "",
});

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState(null); // null | "new" | client object
  const [form, setForm] = useState(blankClient());
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/clients", { params: { limit: 200 } });
      setClients(data.data.clients);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load clients"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = search.trim()
    ? clients.filter((c) => {
        const q = search.toLowerCase();
        return [c.name, c.email, c.company, c.phone].some((v) =>
          (v || "").toLowerCase().includes(q)
        );
      })
    : clients;

  const openNew = () => {
    setForm(blankClient());
    setEditing("new");
  };

  const openEdit = (client) => {
    setForm({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      address: client.address || "",
      taxId: client.taxId || "",
      notes: client.notes || "",
    });
    setEditing(client);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim()) return toast.error("Client name is required");
    setSaving(true);
    try {
      if (editing === "new") {
        const { data } = await api.post("/clients", form);
        setClients((cs) => [data.data.client, ...cs]);
        toast.success("Client added");
      } else {
        const { data } = await api.put(`/clients/${editing._id}`, form);
        setClients((cs) => cs.map((c) => (c._id === editing._id ? data.data.client : c)));
        toast.success("Client updated");
      }
      setEditing(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save client"));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/clients/${deleteTarget._id}`);
      setClients((cs) => cs.filter((c) => c._id !== deleteTarget._id));
      toast.success("Client deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete client"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Your saved customers for faster invoicing.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" className="text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? "No matching clients" : "No clients yet"}
            description={
              search
                ? "Try a different search term."
                : "Add your first client to streamline invoice creation."
            }
            action={
              !search && (
                <button
                  onClick={openNew}
                  className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark"
                >
                  <Plus className="w-4 h-4" /> Add Client
                </button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filtered.map((c) => (
              <div
                key={c._id}
                className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:shadow-sm transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {initialsOf(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {c.name}
                    </p>
                    {c.company && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {c.company}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                  {c.email && (
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> {c.email}
                    </p>
                  )}
                  {c.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {c.phone}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / edit modal */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add Client" : "Edit Client"}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="client-form"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing === "new" ? "Add client" : "Save changes"}
            </button>
          </>
        }
      >
        <form id="client-form" onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Name *" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <FormField label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
            <FormField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <FormField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <div className="sm:col-span-2">
              <FormField label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
            </div>
            <div className="sm:col-span-2">
              <FormField label="Tax ID" value={form.taxId} onChange={(v) => setForm({ ...form, taxId: v })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Notes
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete modal */}
      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this client?"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition flex items-center gap-2 disabled:opacity-60"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <b>{deleteTarget?.name}</b> will be removed. Existing invoices for
          this client are kept (the link is detached).
        </p>
      </Modal>
    </div>
  );
};

const FormField = ({ label, value, onChange, type = "text", required }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
    />
  </div>
);

export default Clients;
