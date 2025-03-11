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
import VaccinePriceList from "./pages/homepage/vaccineShop/vaccineShopPage";
import BlogList from "./pages/blog/BlogList";
import BlogManagement from "./pages/usersRole/admin/BlogManagement";
// import NewsList from "./pages/news/NewsList";
import NewsManagement from "./pages/usersRole/admin/NewsManagement";
import OverviewPage from "./pages/usersRole/admin/overviewPage";
import RegisterInjection from "./pages/homepage/registeInjection/registerInjection";
import ForgotPassword from "./pages/login/forgotPassword";
import Welcome from "./pages/welcome/Welcome";
import Thank from "./pages/thanks/Thank";
import StaffLayout from "./pages/usersRole/staff/staffLayout";
import AppointmentManagement from "./pages/usersRole/staff/appointmentManagement";
import ProfileInfo from "./pages/homepage/profile/components/ProfileInfo";
import ProfileHistory from "./pages/homepage/profile/components/ProfileHistory";
import Profile from "./pages/homepage/profile/Profile";
import ProfileAccount from "./pages/homepage/profile/components/ProfileAccount";

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
  // {
  //   path: "/news",
  //   element: <NewsList />,
  // },
  {
    path: "/blogs",
    element: <BlogList />,
  },
  {
    path: "/staffLayout",
    element: <StaffLayout />,
    children: [
      {
        path: "",
        element: <div>Chào mừng đến trang quản lý của Staff</div>,
      },

      {
        path: "appointments",
        element: <AppointmentManagement />,
      },
      {
        path: "customers",
        element: <AllCustomerPage />,
      },
    ],
  },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "",
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
        path: "customers",
        element: <AllCustomerPage />,
      },
      {
        path: "blog",
        element: <BlogManagement />,
      },
      {
        path: "newsManagement",
        element: <NewsManagement />,
      },
    ],
  },
  {
    path: "/profile",
    element: <Profile />,
    children: [
      {
        path: "", // Default route
        element: <ProfileInfo />,
      },
      {
        path: "account",
        element: <ProfileAccount />,
      },
      {
        path: "history",
        element: <ProfileHistory />,
      },
    ],
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
