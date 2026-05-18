import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-2 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col lg:ml-0">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 no-print">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
