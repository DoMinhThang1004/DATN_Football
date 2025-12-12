import { createBrowserRouter, Navigate } from 'react-router-dom';

import Dashboard from '../admin/Dashboard.jsx';
import ManageMatches from '../admin/ManageMatchets.jsx';
import ManageOrders from '../admin/ManageOrder.jsx';   
import ManageUsers from '../admin/ManageUsers.jsx';
import ManageStadiums from '../admin/ManageStadiums.jsx';
import ManageTickets from '../admin/ManageTickets.jsx';
import MatchTicketConfig from '../admin/MatchTicketConfig.jsx';
import ManageComments from '../admin/ManageComments.jsx';
import ManageNews from '../admin/ManageNews.jsx';
import LiveChat from '../admin/AdminLiveChat.jsx';
import Unauthorized from '../admin/Unauthorized.jsx';

import HomePage from '../pages/home/Home.jsx';
import NewsPage from '../pages/news/NewPage.jsx';
import NewsDetailPage from '../pages/news/NewsPageDetail.jsx';
import ContactPage from '../pages/contact/ContactPage.jsx';
import MatchPage from '../pages/matches/MatchPage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import CartPage from '../pages/orders/CartPage.jsx';
import MatchDetailPage from '../pages/matches/MatchDetailPage.jsx';
import CheckoutPage from '../pages/orders/CheckoutPage.jsx';
import PaymentReturn from '../pages/orders/PaymentReturn.jsx';

import UserProfile from '../pages/user/UserProfile.jsx';
import AddressBook from '../pages/user/AddressBook.jsx';
import MyTickets from '../pages/user/MyTickets.jsx';
import ProfileLayout from '../layouts/ProfileLayout.jsx'; 

import NotFoundPage from '../pages/home/NotFoundPage.jsx';
import PolicyPage from '../pages/support/PolicyPage.jsx';
import FAQPage from '../pages/support/FAQ.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';

import ProtectedRoute from '../components/admin/ProtectedRoute.jsx';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/home', element: <Navigate to="/" replace /> },
  { path: '/news', element: <NewsPage /> },
  { path: '/news/:id', element: <NewsDetailPage /> },
  { path: '/matches', element: <MatchPage /> },
  { path: '/matches/:id', element: <MatchDetailPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/faq', element: <FAQPage /> },
  { path: '/policy', element: <PolicyPage /> },

  {
    element: <ProtectedRoute allowedRoles={['USER', 'STAFF', 'ADMIN']} />,
    children: [
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/payment-return', element: <PaymentReturn /> },
      
      { 
        path: '/profile', 
        element: <ProfileLayout />,
        children: [
          { index: true, element: <UserProfile /> },
          { path: 'tickets', element: <MyTickets /> },
          { path: 'address', element: <AddressBook /> } 
        ]
      },
    ]
  },

  { path: '/admin/unauthorized', element: <Unauthorized /> },
  {
    element: <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']} />,
    children: [
      { path: '/admin/dashboard', element: <Dashboard /> },
      { path: '/admin/manage-matches', element: <ManageMatches /> },
      { path: '/admin/mticketconfig/:id', element: <MatchTicketConfig /> },
      { path: '/admin/manage-orders', element: <ManageOrders /> },
      { path: '/admin/manage-comments', element: <ManageComments /> },
      { path: '/admin/manage-news', element: <ManageNews /> },
      { path: '/admin/live-chat', element: <LiveChat /> },
    ]
  },

  {
    element: <ProtectedRoute allowedRoles={['ADMIN']} />,
    children: [
      { path: '/admin/manage-stadiums', element: <ManageStadiums /> },
      { path: '/admin/manage-tickets', element: <ManageTickets /> },
      { path: '/admin/manage-users', element: <ManageUsers /> },
    ]
  },

  { path: '*', element: <NotFoundPage /> }
]);

export default router;