import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/login/loginPage";
import RegisterPage from "./pages/register/registerPage";
import HomePage from "./pages/homepage/homePage";
import AdminPage from "./pages/usersRole/admin/adminPage";
import AccountsPage from "./pages/usersRole/admin/accountsPage";

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
    element: <AdminPage />,
  },
  {
    path: "/admin/overview",
    element: <AdminPage />,
  },
  {
    path: "/admin/accounts",
    element: <AccountsPage />,
  },
  {
    path: "/admin/vaccines",
    element: <div>Vaccines Management</div>,
  },
  {
    path: "/admin/feedback",
    element: <div>Feedback Management</div>,
  },
  {
    path: "/admin/appointments",
    element: <div>Appointments Management</div>,
  },
  {
    path: "/admin/consultations",
    element: <div>Consultations Management</div>,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
