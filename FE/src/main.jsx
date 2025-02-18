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
// import CamnangPage from "./pages/homepage/camnang/camnang";
import VaccinePriceList from "./pages/homepage/vaccineShop/vaccineShopPage";
import CheckOutPrice from "./pages/homepage/vaccineShop/checkoutPrice";
import Profile from "./pages/homepage/profile/profile";


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
      path: "/pricelist",
      element: <VaccinePriceList />,
  },
  {
    path: "/checkoutprice",
    element: <CheckOutPrice />,
},
  {
    path: "/register",
    element: <RegisterPage />,
  },
  // {
  //   path: "/camnang",
  //   element: <CamnangPage />,
  // },
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
      {
        path: "customers",
        element: <AllCustomerPage />,
      },
    ],
  },
  {
    path: "/profile",
    element: <Profile />,
  },
]);

createRoot(document.getElementById("root")).render(
  <>
    <RouterProvider router={router} />
    <ToastContainer />
  </>
);
