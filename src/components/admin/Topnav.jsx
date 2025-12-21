import React from "react";
import { Search, Bell, HelpCircle, Menu } from "lucide-react";

export default function TopNav() {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-10 border-b border-gray-100">
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700 lg:hidden">
          <Menu size={24} />
        </button>
        <div>
            <h2 className="text-xl font-bold text-gray-800">Quản trị viên</h2>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/*<button className="text-gray-400 hover:text-blue-600 transition-colors" title="Trợ giúp">
          <HelpCircle size={20} />
        </button>
        <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Thông báo">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button> */}
        <div className="hidden lg:block border-l border-gray-200 pl-4 ml-2">
            <span className="text-sm font-medium text-gray-600">
                {new Date().toLocaleDateString('vi-VN')}
            </span>
        </div>

      </div>
    </header>
  );
}