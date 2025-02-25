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
import AllCustomerPage from "./pages/usersRole/customer/allCustomerPage";
import News from "./pages/homepage/news/news";
import Handbook from "./pages/homepage/handbook/handbook";
import Advise from "./pages/homepage/Advise/advise";
import VaccinePriceList from "./pages/homepage/vaccineShop/vaccineShopPage";
import Profile from "./pages/homepage/profile/profile";
import BlogList from "./pages/blog/BlogList";
import BlogManagement from "./pages/usersRole/admin/BlogManagement";
import OverviewPage from "./pages/usersRole/admin/overviewPage";
import RegisterInjection from "./pages/homepage/registeInjection/registerInjection";
import ForgotPassword from "./pages/login/forgotPassword";
import Welcome from "./pages/welcome/Welcome";
import Thank from "./pages/thanks/Thank";

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
    path: "/welcome",
    element: <Welcome />,
  },
  {
    path: "/thank-you",
    element: <Thank />,
  },
  {
    path: "/pricelist",
    element: <VaccinePriceList />,
  },
  {
    path: "/registerinjection",
    element: <RegisterInjection />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/news",
    element: <News />,
  },
  {
    path: "/handbook",
    element: <Handbook />,
  },
  {
    path: "/advise",
    element: <Advise />,
  },
  {
    path: "/blogs",
    element: <BlogList />,
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
        element: <OverviewPage />,
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
      {
        path: "customers",
        element: <AllCustomerPage />,
      },
      {
        path: "blog",
        element: <BlogManagement />,
      },
    ],
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
]);

createRoot(document.getElementById("root")).render(
  <>
    <RouterProvider router={router} />
    <ToastContainer />
  </>
);
