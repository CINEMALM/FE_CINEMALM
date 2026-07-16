import type { RouteObject } from "react-router";
import MainLayout from "../common/layouts/MainLayout";
import HomePage from "../pages/client/home/Homepage";
import Profile from "../pages/client/user/Profile";
import ProfileLayout from "../common/layouts/ProfileLayout";
import MyTicket from "../pages/client/user/MyTicket";
import VerifyEmail from "../pages/client/auth/VerifyEmail";
import ResetPassword from "../pages/client/auth/ResetPassword";
export const MainRoutes: RouteObject[] = [
  {
    path: "",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "verify-email",
        element: <VerifyEmail />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "profile",
        element: <ProfileLayout />,
        children: [
          {
            index: true,
            element: <Profile />,
          },
          {
            path: "ticket",
            element: <MyTicket />,
          },
        ],
      },
    ],
  },
];
