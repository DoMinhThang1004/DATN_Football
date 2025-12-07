import React from "react";
import Sidebar from "../components/admin/Sidebar";
import TopNav from "../components/admin/Topnav";   

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      
      <div className="flex-none">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-none z-10">
          <TopNav />
        </div>

        <main className="flex-1 overflow-y-auto p-0 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}