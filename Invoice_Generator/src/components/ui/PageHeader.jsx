import React from "react";

export default function PageHeader({ title, description, action, className = "" }) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 ${className}`}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-heading">
          {title}
        </h1>
        {description && (
          <p className="text-muted text-sm mt-1 max-w-xl">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
