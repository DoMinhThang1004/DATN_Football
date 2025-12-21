import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/user/Header';
import Footer from '../components/user/Footer';
import FloatingButtons from '../components/user/FloatingButtons.jsx';
import ChatBox from '../components/support_user/ChatBox.jsx'; 
import ScrollToTop from '../components/common/ScrollToTop.jsx';

export default function UserLayout({ children }) {
  // lấy tt user cho chat
  const [currentUser, setCurrentUser] = useState(null);
  

  useEffect(() => {
    // lấy tt user đã đn từ local
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Lỗi parse user:", e);
      }
    }
  }, []);

  const userId = currentUser?.id || null;
  const userName = currentUser?.full_name || "Quý Khách";

  return (
    <div className="flex flex-col min-h-screen pt-16">
      <div className="fixed top-0 left-0 w-full z-50">
        <ScrollToTop/>
        <Header />
      </div>

      <main className="flex-1 p-4">
        {children ? children : <Outlet />}
      </main>
      
      <Footer />

      <FloatingButtons />

      <ChatBox 
        userId={userId} 
        userFullName={userName} 
      />
    </div>
  );
}