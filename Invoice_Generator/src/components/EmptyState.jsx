import React from "react";

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-16 px-6">
    {Icon && (
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-gray-400 dark:text-gray-500" />
      </div>
    )}
    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
    {description && (
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
        {description}
      </p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
