import React from "react";

export default function TopNav() {
  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center w-full">
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <div>
        <button className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">Logout</button>
      </div>
    </header>
  );
}
