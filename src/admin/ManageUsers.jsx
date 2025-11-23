import React, { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout.jsx";
import { 
  Plus, Search, Edit, Trash2, X, Save, Loader2, 
  AlertTriangle, CheckCircle, Filter, Lock, Unlock, Shield, User 
} from "lucide-react";

export default function ManageUsers() {
  // --- 1. STATE MANAGEMENT ---
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL"); // ALL, ADMIN, USER, STAFF
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, ACTIVE, BANNED

  // Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Modal Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Notification
  const [notification, setNotification] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", role: "USER", status: "ACTIVE", password: ""
  });

  // --- 2. HELPERS ---
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- 3. FETCH DATA (Giả lập API) ---
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // --- TODO: GỌI API THẬT ---
      // const res = await axios.get('/api/users');
      // setUsers(res.data);

      setTimeout(() => {
        setUsers([
          { id: 1, fullName: "Nguyễn Văn Admin", email: "admin@ticket.vn", phone: "0909000111", role: "ADMIN", status: "ACTIVE", avatar: null },
          { id: 2, fullName: "Trần Thị Khách", email: "khach1@gmail.com", phone: "0912345678", role: "USER", status: "ACTIVE", avatar: "https://i.pravatar.cc/150?u=2" },
          { id: 3, fullName: "Lê Văn Phá", email: "spam@gmail.com", phone: "0987654321", role: "USER", status: "BANNED", avatar: null },
          { id: 4, fullName: "Nhân Viên A", email: "staff@ticket.vn", phone: "0999888777", role: "STAFF", status: "ACTIVE", avatar: "https://i.pravatar.cc/150?u=4" },
        ]);
        setIsLoading(false);
      }, 600);
    } catch (error) {
      console.error("Lỗi tải dữ liệu", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- 4. HANDLERS ---
  const handleAddNew = () => {
    setCurrentUser(null);
    setFormData({ fullName: "", email: "", phone: "", role: "USER", status: "ACTIVE", password: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    // Khi sửa thì không cần load password, chỉ cần các thông tin khác
    setFormData({ ...user, password: "" }); 
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // --- 1. VALIDATION (KIỂM TRA DỮ LIỆU) ---
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
        showNotification("Vui lòng nhập đầy đủ Họ tên, Email và Số điện thoại!", "error");
        return;
    }

    // VALIDATE SỐ ĐIỆN THOẠI (Chặt chẽ hơn)
    const phoneRegex = /^0\d{9}$/; // Bắt đầu bằng 0, theo sau là 9 chữ số (tổng 10 số)
    if (!phoneRegex.test(formData.phone.trim())) {
        showNotification("Số điện thoại không hợp lệ! (Phải có 10 số và bắt đầu bằng 0)", "error");
        return;
    }

    // Kiểm tra mật khẩu chỉ khi TẠO MỚI (currentUser === null)
    if (!currentUser) {
        if (!formData.password) {
            showNotification("Vui lòng nhập mật khẩu khởi tạo!", "error");
            return;
        }
        if (formData.password.length < 6) {
            showNotification("Mật khẩu phải có ít nhất 6 ký tự!", "error");
            return;
        }
    }

    // --- 2. XỬ LÝ LOGIC ---
    try {
        if (currentUser) {
            // --- TODO: API PUT ---
            // await axios.put(`/api/users/${currentUser.id}`, formData);
            
            setUsers(users.map(u => u.id === currentUser.id ? { ...formData, id: u.id, avatar: u.avatar } : u));
            showNotification("Cập nhật thông tin thành công!");
        } else {
            // --- TODO: API POST ---
            // await axios.post('/api/users', formData);

            const newId = users.length + 1;
            setUsers([...users, { ...formData, id: newId, avatar: null }]);
            showNotification("Thêm người dùng mới thành công!");
        }
        setIsModalOpen(false);
    } catch (error) {
        showNotification("Lỗi khi lưu dữ liệu!", "error");
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteExecute = async () => {
    if (!userToDelete) return;
    try {
        // --- TODO: API DELETE ---
        // await axios.delete(`/api/users/${userToDelete.id}`);
        
        setUsers(users.filter(u => u.id !== userToDelete.id));
        showNotification("Đã xóa người dùng thành công");
    } catch (error) {
        showNotification("Xóa thất bại!", "error");
    } finally {
        setDeleteModalOpen(false);
        setUserToDelete(null);
    }
  };

  // Logic lọc dữ liệu
  const filteredUsers = users.filter(u => {
    const matchSearch = 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm);
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchStatus = statusFilter === "ALL" || u.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen relative">
        
        {/* --- TOAST NOTIFICATION --- */}
        {notification && (
            <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white transform transition-all animate-in slide-in-from-top-5 duration-300 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span className="font-medium">{notification.message}</span>
            </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h1>
            <p className="text-gray-500 text-sm">Quản lý tài khoản Admin, Nhân viên và Khách hàng.</p>
          </div>
          <button onClick={handleAddNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
            <Plus size={20} />
            <span>Thêm tài khoản</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Tìm tên, email, số điện thoại..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
                <div className="relative">
                    <select 
                        className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="ALL">Tất cả vai trò</option>
                        <option value="ADMIN">Quản trị viên</option>
                        <option value="STAFF">Nhân viên</option>
                        <option value="USER">Khách hàng</option>
                    </select>
                    <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                </div>

                <div className="relative">
                    <select 
                        className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="BANNED">Đã khóa</option>
                    </select>
                    <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                </div>
            </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                        <tr>
                            <th className="p-4 w-16">Avatar</th>
                            <th className="p-4">Họ và tên</th>
                            <th className="p-4">Liên hệ</th>
                            <th className="p-4">Vai trò</th>
                            <th className="p-4 text-center">Trạng thái</th>
                            <th className="p-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover border"/>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                {user.fullName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">{user.fullName}</td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <div className="flex flex-col">
                                            <span>{user.email}</span>
                                            <span className="text-gray-400 text-xs">{user.phone}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {user.role === 'ADMIN' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold"><Shield size={12}/> Admin</span>}
                                        {user.role === 'STAFF' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold"><User size={12}/> Staff</span>}
                                        {user.role === 'USER' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">User</span>}
                                    </td>
                                    <td className="p-4 text-center">
                                        {user.status === 'ACTIVE' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Hoạt động
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                <Lock size={10}/> Đã khóa
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => handleEdit(user)} className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title="Sửa">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => confirmDelete(user)} className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Xóa">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-500">Không tìm thấy người dùng nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* --- MODAL FORM (THÊM / SỬA) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">{currentUser ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form onSubmit={handleSave}>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <input type="text" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                    placeholder="09xxxx (10 số)"/>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Tên đăng nhập)</label>
                            <input type="email" required disabled={currentUser !== null} // Không cho sửa email nếu là edit
                                className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${currentUser ? 'bg-gray-100 text-gray-500' : ''}`}
                                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>

                        {!currentUser && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu khởi tạo</label>
                                <input type="password" required className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập mật khẩu..."
                                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                                <select className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                    <option value="USER">Khách hàng (User)</option>
                                    <option value="STAFF">Nhân viên (Staff)</option>
                                    <option value="ADMIN">Quản trị (Admin)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="BANNED">Khóa tài khoản</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Hủy</button>
                        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm shadow-sm"><Save size={16}/> {currentUser ? "Lưu thay đổi" : "Tạo tài khoản"}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- MODAL CONFIRM DELETE --- */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xóa?</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Bạn có chắc muốn xóa tài khoản <strong>{userToDelete?.email}</strong>? Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Hủy bỏ</button>
                    <button onClick={handleDeleteExecute} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Xóa ngay</button>
                </div>
            </div>
        </div>
      )}
    </AdminLayout>
  );
}