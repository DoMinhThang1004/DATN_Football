import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import TopNav from "../components/admin/Topnav";

export default function AdminLayout() {
  return (
   <div className="flex min-h-screen w-full overflow-hidden">
  <Sidebar />

  <div className="flex-1 flex flex-col min-h-screen">
    <TopNav />

    <main className="flex-1 p-4 overflow-auto">
      <Outlet />
    </main>
  </div>
</div>

  );
}
