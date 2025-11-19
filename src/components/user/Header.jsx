import React from "react";
import { Search, User, ShoppingCart, Home, Calendar, Ticket, Newspaper } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-gray-800 text-white sticky top-0 z-50 shadow-xl">
      <div className="container mx-auto p-4 flex items-center justify-between">
        
        <div className="flex items-center gap-2 text-2xl font-extrabold text-white pr-4">
          <Ticket size={27} />
          <span>FootballTic</span>
        </div>

        <div className="max-w-xl flex-6 mx-8"> 
          <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={20} />
            <input
              type="text"
              placeholder="Tìm trận đấu..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-black text-white focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            />
          </div>
        </div>
          <nav className="flex items-center space-x-6 font-medium">
            <a href="/" className="flex items-center gap-1 group">
              <Home size={18} className=" text-white group-hover:text-yellow-400" /> 
              <span className=" text-white group-hover:text-yellow-400">Trang chủ</span>
            </a>
            <a href="" className="flex items-center gap-1 group">
              <Calendar size={18} className=" text-white group-hover:text-yellow-400" /> 
              <span className=" text-white group-hover:text-yellow-400">Trận đấu</span>
            </a>
            <a href="/tickets" className="flex items-center gap-1 group">
              <Ticket size={18} className=" text-white group-hover:text-yellow-400" /> 
              <span className=" text-white group-hover:text-yellow-400">Vé</span>
            </a>
            <a href="/news" className="flex items-center gap-1 group">
              <Newspaper size={18} className=" text-white group-hover:text-yellow-400" /> 
              <span className="text-white group-hover:text-yellow-400">Tin tức</span>
            </a>
            <div className="pl-4 border-l border-white flex items-center space-x-6">
              <a href="/cart" className="flex items-center gap-1 group">
                <ShoppingCart size={18} className=" text-white group-hover:text-yellow-400" /> 
                <span className=" text-white group-hover:text-yellow-400">Giỏ hàng</span>
              </a>
              <a href="/login" className="flex items-center gap-1 px-3 py-1.5 rounded-full group hover:bg-yellow-200 transition-colors">
                <User size={18} className=" text-white group-hover:text-yellow-400" /> 
                <span className=" text-white group-hover:text-yellow-400">Đăng nhập</span>
              </a>
            </div>
          </nav>
      </div>
    </header>
  );
}

           