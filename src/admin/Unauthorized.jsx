import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";

export default function Unauthorized() {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-6 animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
            <ShieldAlert size={48} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Không có quyền truy cập</h1>
        <p className="text-gray-500 max-w-md mb-8">
            Xin lỗi, bạn không có quyền truy cập vào chức năng này. 
            Vui lòng liên hệ Quản trị viên nếu bạn cho rằng đây là sự nhầm lẫn.
        </p>
        <Link 
            to="/admin/dashboard" 
            className="px-2 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <ArrowLeft size={20}/> trở lại
        </Link>
      </div>
    </AdminLayout>
  );
}