import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import {  Plus, Search, Edit, Trash2, X, Save, Loader2, 
  AlertTriangle, CheckCircle, Filter, Lock, Shield, User, UploadCloud, RefreshCcw, Calendar, Info} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/users";
const UPLOAD_URL = "http://localhost:5000/api/upload";

export default function ManageUsers() {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL"); 
  const [statusFilter, setStatusFilter] = useState("ALL"); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); 
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [deleteType, setDeleteType] = useState("soft"); 

  const [formData, setFormData] = useState({
    full_name: "", email: "", phone: "", 
    role: "USER", status: "ACTIVE", password: "", avatar_url: "",
    gender: "Nam", birth_date: "" 
  });
  
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getAuthHeaders = () => {
      const token = localStorage.getItem("token");
      return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      };
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL, { method: "GET", headers: getAuthHeaders() });
      if (res.status === 401 || res.status === 403) {
          showNotification("Phiên đăng nhập hết hạn hoặc không đủ quyền!", "error");
          navigate("/login");
          return;
      }
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu", error);
      showNotification("Không thể kết nối Server!", "error");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => { fetchUsers(); }, []);

  const handleAddNew = () => { 
      setCurrentUser(null); 
      setFormData({ 
          full_name: "", email: "", phone: "", 
          role: "USER", status: "ACTIVE", password: "", avatar_url: "",
          gender: "Nam", birth_date: ""
      }); 
      setIsModalOpen(true); 
  };

  const handleEdit = (user) => { 
      setCurrentUser(user); 
      
      //định dạng ngày sinh
      let bDate = "";
      if (user.birth_date) {
          bDate = new Date(user.birth_date).toISOString().split('T')[0];
      }

      setFormData({ 
          full_name: user.full_name, 
          email: user.email, 
          phone: user.phone, 
          role: user.role, 
          status: user.status, 
          avatar_url: user.avatar_url || "", 
          password: "", 
          gender: user.gender || "Nam",
          birth_date: bDate
      }); 
      setIsModalOpen(true); 
  };
  
  const handleFileChange = async (e) => { 
      const file = e.target.files[0]; if (!file) return; setIsUploading(true);
      const data = new FormData(); data.append("file", file);
      try { 
          const res = await fetch(UPLOAD_URL, { method: "POST", body: data }); 
          const result = await res.json(); 
          setFormData({ ...formData, avatar_url: result.url }); 
          showNotification("Upload avatar thành công!"); 
      } 
      catch (error) { showNotification("Lỗi upload ảnh!", "error"); } finally { setIsUploading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.email.trim()) { showNotification("Vui lòng nhập đủ thông tin!", "error"); return; }
    if (!currentUser && !formData.password) { showNotification("Vui lòng nhập mật khẩu khởi tạo!", "error"); return; }
    
    try {
        let response;
        if (currentUser) {
            response = await fetch(`${API_URL}/${currentUser.id}`, { 
                method: 'PUT', 
                headers: getAuthHeaders(), 
                body: JSON.stringify(formData) 
            });
        } else {
            response = await fetch(API_URL, { 
                method: 'POST', 
                headers: getAuthHeaders(), 
                body: JSON.stringify(formData) 
            });
        }

        if (response.ok) { 
            showNotification(currentUser ? "Cập nhật thành công!" : "Thêm mới thành công!"); 
            fetchUsers(); 
            setIsModalOpen(false); 
        } 
        else { 
            const err = await response.json(); 
            showNotification(err.message || "Lỗi lưu dữ liệu", "error"); 
        }
    } catch (error) { showNotification("Lỗi kết nối!", "error"); }
  };

  const confirmDelete = (user) => { setUserToDelete(user); setDeleteType("soft"); setDeleteModalOpen(true); };

  const handleDeleteExecute = async () => {
    if (!userToDelete) return;
    try {
        let apiUrl = `${API_URL}/${userToDelete.id}`;
        let method = 'DELETE';
        let body = null;

        if (userToDelete.status === 'DELETED' && deleteType === 'restore') {
            apiUrl = `${API_URL}/${userToDelete.id}`;
            method = 'PUT'; 
            body = JSON.stringify({ ...userToDelete, status: 'ACTIVE' }); //set active
        } else if (deleteType === 'hard') {
            apiUrl = `${API_URL}/${userToDelete.id}/permanent`;
        } 

        const res = await fetch(apiUrl, {
            method: method,
            headers: getAuthHeaders(),
            body: body
        });

        if (res.ok) {
            showNotification(deleteType === 'restore' ? "Đã khôi phục!" : "Đã xóa thành công!");
            fetchUsers();
        } else {
            const err = await res.json();
            showNotification(err.message || "Lỗi xử lý!", "error");
        }
    } catch (error) { showNotification("Lỗi kết nối!", "error"); } 
    finally { setDeleteModalOpen(false); setUserToDelete(null); }
  };

  const getStatusBadge = (status) => {
      switch (status) {
          case 'ACTIVE': return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Hoạt động</span>;
          case 'BANNED': return <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"><Lock size={10}/> Đã khóa</span>;
          case 'DELETED': return <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium"><Trash2 size={10}/> Đã xóa</span>;
          default: return status;
      }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen relative">
        {notification && (<div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-top-5 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}<span className="font-medium">{notification.message}</span></div>)}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div><h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h1><p className="text-gray-500 text-sm">Quản lý tài khoản Admin, Nhân viên và Khách hàng.</p></div>
          <button onClick={handleAddNew} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 shadow-sm"><Plus size={20} /><span>Thêm tài khoản</span></button>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Tìm tên, email..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            <div className="flex gap-3">
                <div className="relative"><select className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg cursor-pointer" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}><option value="ALL">Tất cả vai trò</option><option value="ADMIN">Quản trị viên</option><option value="STAFF">Nhân viên</option><option value="USER">Khách hàng</option></select><Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/></div>
                <div className="relative"><select className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="ALL">Tất cả trạng thái</option><option value="ACTIVE">Hoạt động</option><option value="BANNED">Đã khóa</option><option value="DELETED">Đã xóa</option></select><Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/></div>
            </div>
        </div>
        {isLoading ? <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100"><Loader2 className="animate-spin text-blue-600" size={40} /></div> : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold"><tr><th className="p-4 w-16">Avatar</th><th className="p-4">Họ và tên</th><th className="p-4">Liên hệ</th><th className="p-4">Vai trò</th><th className="p-4 text-center">Trạng thái</th><th className="p-4 text-right">Hành động</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className={`transition-colors ${user.status === 'DELETED' ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>
                                    <td className="p-4">{user.avatar_url ? <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border"/> : <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">{user.full_name.charAt(0).toUpperCase()}</div>}</td>
                                    <td className="p-4 font-medium text-gray-800">{user.full_name}</td>
                                    <td className="p-4 text-sm text-gray-600"><div className="flex flex-col"><span>{user.email}</span><span className="text-gray-400 text-xs">{user.phone}</span></div></td>
                                    <td className="p-4">{user.role === 'ADMIN' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold"><Shield size={12}/> Admin</span>}{user.role === 'STAFF' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold"><User size={12}/> Staff</span>}{user.role === 'USER' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">User</span>}</td>
                                    <td className="p-4 text-center">{getStatusBadge(user.status)}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => handleEdit(user)} className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title="Sửa"><Edit size={18} /></button>
                                        
                                        {user.status === 'DELETED' ? (
                                            <button onClick={() => {setUserToDelete(user); setDeleteType("restore"); setDeleteModalOpen(true);}} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Khôi phục"><RefreshCcw size={18}/></button>
                                        ) : (
                                            <button onClick={() => confirmDelete(user)} className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Xóa"><Trash2 size={18} /></button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (<tr><td colSpan="6" className="p-8 text-center text-gray-500">Không tìm thấy người dùng nào.</td></tr>)}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${deleteType === 'restore' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {deleteType === 'restore' ? <RefreshCcw size={24} /> : <AlertTriangle size={24} />}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {deleteType === 'restore' ? "Khôi phục tài khoản?" : "Xác nhận xóa"}
                </h3>
                
                {deleteType !== 'restore' && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-4 text-left text-sm border border-gray-200">
                        <label className="flex items-start gap-3 cursor-pointer mb-3">
                            <input type="radio" name="delType" checked={deleteType === 'soft'} onChange={() => setDeleteType('soft')} className="mt-1"/>
                            <div><span className="font-bold block">Xóa tạm thời (Khuyên dùng)</span><span className="text-xs text-gray-500">Chuyển trạng thái sang DELETED. Giữ lại lịch sử đơn hàng, vé.</span></div>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="radio" name="delType" checked={deleteType === 'hard'} onChange={() => setDeleteType('hard')} className="mt-1 accent-red-600"/>
                            <div><span className="font-bold block text-red-600">Xóa vĩnh viễn</span><span className="text-xs text-gray-500">Xóa sạch tài khoản và mọi dữ liệu liên quan. Không thể khôi phục.</span></div>
                        </label>
                    </div>
                )}
                <div className="flex gap-3 justify-center">
                    <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Hủy</button>
                    <button onClick={handleDeleteExecute} className={`px-4 py-2 text-white rounded-lg ${deleteType === 'restore' ? 'bg-green-600 hover:bg-green-700' : deleteType === 'hard' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
                        {deleteType === 'restore' ? "Khôi phục ngay" : deleteType === 'hard' ? "Xóa vĩnh viễn" : "Xóa tạm thời"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                   <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                       <h3 className="text-lg font-bold text-gray-800">{currentUser ? "Cập nhật quyền hạn" : "Thêm tài khoản mới"}</h3>
                       <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                   </div>
                   <form onSubmit={handleSave}>
                       <div className="p-6 space-y-4">
                           <div className="flex justify-center">
                               <label className={`relative w-24 h-24 rounded-full border-2 border-gray-300 border-dashed ${!currentUser ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed'} bg-gray-50 overflow-hidden group`}>
                                   {isUploading ? <div className="absolute inset-0 flex items-center justify-center bg-white/80"><Loader2 className="animate-spin text-blue-500"/></div> : (formData.avatar_url ? <img src={formData.avatar_url} alt="" className="w-full h-full object-cover"/> : <div className="flex flex-col items-center justify-center h-full text-gray-400"><UploadCloud size={24}/><span className="text-[10px] mt-1">Upload</span></div>)}
                                   <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={!!currentUser} />
                               </label>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                    <input type="text" required className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} disabled={!!currentUser} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <input type="text" className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} disabled={!!currentUser} />
                                </div>
                           </div>
                           <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" required className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={!!currentUser} />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                    <input type="date" className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500" value={formData.birth_date} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} disabled={!!currentUser} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                                    <select className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} disabled={!!currentUser}>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                           </div>
                           {!currentUser && (
                               <div>
                                   <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                                   <input type="password" required className="w-full border rounded-lg px-3 py-2" placeholder="Nhập mật khẩu..." value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                               </div>
                           )}
                           <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 mt-2">
                               <div>
                                   <label className="block text-sm font-bold text-red-700 mb-1">Vai trò</label>
                                   <select className="w-full border-2 border-blue-100 rounded-lg px-3 py-2 font-medium focus:border-blue-500 outline-none" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                       <option value="USER">Khách hàng</option>
                                       <option value="STAFF">Nhân viên</option>
                                       <option value="ADMIN">Quản trị</option>
                                   </select>
                               </div>
                               <div>
                                   <label className="block text-sm font-bold text-red-700 mb-1">Trạng thái</label>
                                   <select className="w-full border-2 border-blue-100 rounded-lg px-3 py-2 font-medium focus:border-blue-500 outline-none" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                       <option value="ACTIVE">Hoạt động</option>
                                       <option value="BANNED">Khóa tài khoản</option>
                                       <option value="DELETED">Đã xóa</option>
                                   </select>
                               </div>
                           </div>
                       </div>
                       <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                           <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Hủy</button>
                           <button type="submit" disabled={isUploading} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg text-sm shadow-sm"><Save size={16}/> {currentUser ? "Lưu thay đổi" : "Tạo tài khoản"}</button>
                       </div>
                   </form>
               </div>
           </div>
      )}
    </AdminLayout>
  );
}