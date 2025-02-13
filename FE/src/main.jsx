import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/login/loginPage";
import RegisterPage from "./pages/register/registerPage";
import TestUsers from "./pages/usersRole/admin/testUsers";
import HomePage from "./pages/homepage/homePage";
import AdminPage from "./pages/usersRole/admin/adminPage";
import CustomersTable from "./components/CustomersTable";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />, // page mặc định
  },
  {
    path: "/homepage",
    element: <HomePage />, // page mặc định
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/userlist",
    element: <TestUsers />,
  },
  {
    path: "/admin",
    element: <AdminPage />, // page mặc định
  },
  {
    path: "/homeuser",
    element: <TestUsers />,
  },
  {
    path: "/admin/customers",
    element: <CustomersTable />,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
