import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/home/Home.jsx';
import Dashboard from '../admin/Dashboard.jsx';
import HomePage from '../pages/home/Home.jsx';


const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />, 
    children: [

    ]  },
  {
    path: '/admin',
    element: <Dashboard />, // 
    children: [
   
    ]
  }
]);

export default router;
