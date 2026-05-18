import moment from "moment";

const CURRENCY_SYMBOLS = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹", JPY: "¥",
  CAD: "C$", AUD: "A$", AED: "د.إ", SAR: "﷼", PKR: "₨",
};

export const currencySymbol = (code = "USD") =>
  CURRENCY_SYMBOLS[String(code).toUpperCase()] || `${code} `;

export const formatMoney = (amount, currency = "USD") => {
  const n = Number(amount || 0);
  return `${currencySymbol(currency)}${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (date, fmt = "MMM D, YYYY") =>
  date ? moment(date).format(fmt) : "—";

export const formatDateInput = (date) =>
  date ? moment(date).format("YYYY-MM-DD") : "";

export const fromNow = (date) => (date ? moment(date).fromNow() : "—");

export const STATUS_META = {
  paid: {
    label: "Paid",
    dot: "bg-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-700 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-700 dark:text-amber-400",
    ring: "ring-amber-500/20",
  },
  overdue: {
    label: "Overdue",
    dot: "bg-rose-500",
    bg: "bg-rose-100 dark:bg-rose-900/40",
    text: "text-rose-700 dark:text-rose-400",
    ring: "ring-rose-500/20",
  },
  draft: {
    label: "Draft",
    dot: "bg-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    ring: "ring-gray-500/20",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-500 dark:text-gray-400 line-through",
    ring: "ring-gray-500/20",
  },
};

export const initialsOf = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "U";
