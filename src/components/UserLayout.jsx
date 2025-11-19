import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './user/Header';
import Footer from './user/Footer';

export default function UserLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4">
        {children ? children : <Outlet />}
      </main>
      <Footer />
    </div>
  );
}
