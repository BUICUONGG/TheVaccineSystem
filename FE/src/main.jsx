import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/login/loginPage";
import RegisterPage from "./pages/register/registerPage";
import HomePage from "./pages/homepage/homePage";
import AdminLayout from "./pages/usersRole/admin/adminLayout";
import AccountsPage from "./pages/usersRole/admin/accountsPage";
import VaccinesPage from "./pages/usersRole/admin/vaccinesPage";
import { ToastContainer } from "react-toastify";
// import CamnangPage from "./pages/homepage/camnang/camnang";

import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from './pages/login/loginPage';
import RegisterPage from './pages/register/registerPage';
import TestUsers from './pages/usersRole/admin/testUsers';
import HomePage from './pages/homepage/homePage';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/userList",
    element: <TestUsers />,
  },
  {
    path: "/home",
    element: <HomePage />,
  },  
]);



createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
