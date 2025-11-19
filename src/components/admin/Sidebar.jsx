import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col min-h-screen">
      <div className="text-2xl font-bold p-4">Admin Panel</div>
      <nav className="flex-1 p-2 space-y-2">
        <Link to="/admin/dashboard" className="block p-2 rounded hover:bg-gray-700">Dashboard</Link>
        <Link to="/admin/manage-matches" className="block p-2 rounded hover:bg-gray-700">Matches</Link>
        <Link to="/admin/manage-tickets" className="block p-2 rounded hover:bg-gray-700">Tickets</Link>
        <Link to="/admin/manage-stadiums" className="block p-2 rounded hover:bg-gray-700">Stadiums</Link>
        <Link to="/admin/manage-orders" className="block p-2 rounded hover:bg-gray-700">Orders</Link>
        <Link to="/admin/manage-users" className="block p-2 rounded hover:bg-gray-700">Users</Link>
      </nav>
      <footer className="p-4 text-sm text-gray-400">© 2025 Admin</footer>
    </aside>
  );
}
