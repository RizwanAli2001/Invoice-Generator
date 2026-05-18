import React from "react";

const sizes = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-[3px]",
};

const Spinner = ({ size = "md", className = "" }) => (
  <div
    className={`inline-block rounded-full border-current border-t-transparent animate-spin ${sizes[size]} ${className}`}
    role="status"
    aria-label="Loading"
  />
);

export const FullPageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
    <Spinner size="lg" className="text-primary" />
  </div>
);

export default Spinner;
