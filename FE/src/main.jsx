import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/login/loginPage";
import RegisterPage from "./pages/register/registerPage";
import HomePage from "./pages/homepage/homePage";
import AdminLayout from "./pages/usersRole/admin/adminLayout";
import AccountsPage from "./pages/usersRole/admin/accountsPage";
import VaccinesPage from "./pages/usersRole/admin/vaccinesPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/homepage",
    element: <HomePage />,
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
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "",
        element: <div>Welcome to Admin Dashboard</div>,
      },
      {
        path: "overview",
        element: <div>Overview Page</div>,
      },
      {
        path: "accounts",
        element: <AccountsPage />,
      },
      {
        path: "vaccines",
        element: <VaccinesPage />,
      },
      {
        path: "feedback",
        element: <div>Feedback Management</div>,
      },
      {
        path: "appointments",
        element: <div>Appointments Management</div>,
      },
      {
        path: "consultations",
        element: <div>Consultations Management</div>,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
