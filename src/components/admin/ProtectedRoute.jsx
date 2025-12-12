import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    //lấy tt tk
    const userStr = localStorage.getItem("currentUser");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    // quản lý nếu k phải ad thì bât cứ j cx chặn lại
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/admin/unauthorized" replace />;
    }
    return <Outlet />;
};

export default ProtectedRoute;