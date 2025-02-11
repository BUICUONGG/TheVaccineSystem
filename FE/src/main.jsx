import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/login/loginPage";
import RegisterPage from "./pages/register/registerPage";
import TestUsers from "./pages/usersRole/admin/testUsers";
import HomePage from "./pages/homepage/homePage";
import AdminPage from "./pages/usersRole/admin/adminPage";

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
    path: "/",
    element: <HomePage />, // page mặc định
  },
  {
    path: "/homePage",
    element: <HomePage />, // page mặc định
  },
  {
    path: "/admin",
    element: <AdminPage />, // page mặc định
  },
  {
    path: "/homeUser",
    element: <TestUsers />,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
