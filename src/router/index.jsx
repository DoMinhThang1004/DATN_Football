import { createBrowserRouter } from 'react-router-dom';

import Dashboard from '../admin/Dashboard.jsx';
import ManageMatches from '../admin/ManageMatchets.jsx';
import ManageOrders from '../admin/ManageOrder.jsx';
import ManageUsers from '../admin/ManageUsers.jsx';
import ManageStadiums from '../admin/ManageStadiums.jsx';
import ManageTickets from '../admin/ManageTickets.jsx';
import MatchTicketConfig from '../admin/MatchTicketConfig.jsx';
import ManageComments from '../admin/ManageComments.jsx';

import HomePage from '../pages/home/Home.jsx';
import NewsPage from '../pages/news/NewPage.jsx';
import ContactPage from '../pages/contact/ContactPage.jsx';
import MatchPage from '../pages/matches/MatchPage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import CartPage from '../pages/orders/CartPage.jsx';
import MatchDetailPage from '../pages/matches/MatchDetailPage.jsx';
import CheckoutPage from '../pages/orders/CheckoutPage.jsx';
import UserProfile from '../pages/user/UserProfile.jsx';
import AddressBook from '../pages/user/AddressBook.jsx';
import MyTickets from '../pages/user/MyTickets.jsx';
import ProfileLayout from '../layouts/ProfileLayout.jsx';
import NotFoundPage from '../pages/home/NotFoundPage.jsx';
import PolicyPage from '../pages/support/PolicyPage.jsx';
import FAQPage from '../pages/support/FAQ.jsx';





const router = createBrowserRouter([
  {   path: '/home',element: <HomePage />, children: []  },
  {   path: '/news',element: <NewsPage />, children: []  },
  {   path: '/matches', element: <MatchPage/>, children: []  },
  {   path: '/contact', element: <ContactPage/>, children: []  },
  {   path: '/login', element: <LoginPage/>, children: []  },
  {   path: '/register', element: <RegisterPage/>, children: []  },
  {   path: '/cart', element: <CartPage/>, children: []  },
  {   path: '/matches/:id', element: <MatchDetailPage/>, children: []  },
  {   path: '/checkout', element: <CheckoutPage/>, children: []  },


  //Hồ sơ người dùng
  {
    path: '/profile',
    element: <ProfileLayout />, 
    children: [
      { 
        index: true, 
        element: <UserProfile /> 
      },
      { 
        path: 'tickets', 
        element: <MyTickets /> 
      },
      { 
        path: 'address',
        element: <AddressBook /> 
      },
    ]
  },



{ path: 'faq', element: <FAQPage /> },
{ path: 'policy', element: <PolicyPage /> },
{ path: '*', element: <NotFoundPage /> },


  {   path: '/admin/dashboard', element: <Dashboard />,  children: []},
  {   path: '/admin/manage-matches', element: <ManageMatches />,  children: []},
  {   path: '/admin/manage-orders', element: <ManageOrders />,  children: []},
  {   path: '/admin/manage-stadiums', element: <ManageStadiums />,  children: []},
  {   path: '/admin/manage-tickets', element: <ManageTickets />,  children: []},
  {   path: '/admin/manage-users', element: <ManageUsers />,  children: []},
  {   path: '/admin/mticketconfig/:id', element: <MatchTicketConfig />,  children: []},
  {   path: '/admin/manage-comments', element: <ManageComments />,  children: []}

]);

export default router;
