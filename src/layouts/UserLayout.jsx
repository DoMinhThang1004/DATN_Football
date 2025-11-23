import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/user/Header';
import Footer from '../components/user/Footer';

export default function UserLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen pt-16">
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>

      <main className="flex-1 p-4">
        {children ? children : <Outlet />}
      </main>
      
      <Footer />
    </div>
  );
}