import React from "react";

const StatCard = ({ label, value, icon: Icon, color = "bg-primary/10 text-primary" }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
        {Icon && <Icon className="w-4 h-4" strokeWidth={2} />}
      </div>
    </div>
    <p className="stat-value">{value}</p>
    <p className="text-sm text-muted mt-0.5">{label}</p>
  </div>
);

export default StatCard;
