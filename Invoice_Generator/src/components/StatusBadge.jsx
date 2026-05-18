import React from "react";
import { STATUS_META } from "../utils/format";

const StatusBadge = ({ status, className = "" }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ${meta.bg} ${meta.text} ${meta.ring} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

export default StatusBadge;
