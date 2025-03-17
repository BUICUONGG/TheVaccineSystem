import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LoginPage from "./pages/login/loginPage";
import RegisterPage from "./pages/register/registerPage";
import HomePage from "./pages/homepage/homePage";
import AdminLayout from "./pages/usersRole/admin/adminLayout";
import AccountsPage from "./pages/usersRole/admin/accountsPage";
import VaccinesPage from "./pages/usersRole/admin/vaccinesPage";
import AllCustomerPage from "./pages/usersRole/admin/allCustomerPage";
import VaccinePriceList from "./pages/homepage/vaccineShop/vaccineShopPage";
import BlogList from "./pages/blog/BlogList";
// import BlogDetail from "./pages/blog/BlogDetail";
import BlogManagement from "./pages/usersRole/admin/BlogManagement";
import NewsList from "./pages/news/NewsList";
import NewsDetail from "./pages/news/NewsDetail";
import NewsManagement from "./pages/usersRole/admin/NewsManagement";
import DashboardPage from "./pages/usersRole/admin/dashboardPage";
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
import FeedbackManagement from "./pages/usersRole/admin/FeedbackManagement";
// import VaccineShopDetailPage from "./pages/homepage/vaccineShop/vaccineShopDetailPage";
import StaffsPage from "./pages/usersRole/admin/staffsPage";
import PaymentPage from "./components/payment/payment";

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
  // {
  //   path: "/vaccineDetail",
  //   element: <VaccineShopDetailPage />,
  // },
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
    element: <NewsList />,
  },
  {
    path: "/news/detail/:id",
    element: <NewsDetail />,
  },
  {
    path: "/blogs",
    element: <BlogList />,
  },
  // {
  //   path: "/blog/:slug",
  //   element: <BlogDetail />,
  // },
  {
    path: "/staffLayout",
    element: <StaffLayout />,
    children: [
      {
        path: "",
        element: <AppointmentManagement />,
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
        element: <DashboardPage />,
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
        element: <FeedbackManagement />,
      },
      {
        path: "customers",
        element: <AllCustomerPage />,
      },
      {
        path: "staffs",
        element: <StaffsPage />,
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

  {
    path: "payment",
    element: <PaymentPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <>
    <RouterProvider router={router} />
    <ToastContainer />
  </>
);
