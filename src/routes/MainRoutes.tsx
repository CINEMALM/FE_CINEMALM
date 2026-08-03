import {
  lazy,
  type ComponentType,
  type LazyExoticComponent,
  Suspense,
} from "react";
import type { RouteObject } from "react-router";
import MainLayout from "../common/layouts/MainLayout";
import ProfileLayout from "../common/layouts/ProfileLayout";

const HomePage = lazy(() => import("../pages/client/home/Homepage"));
const Profile = lazy(() => import("../pages/client/user/Profile"));
const MyTicket = lazy(() => import("../pages/client/user/MyTicket"));
const VerifyEmail = lazy(() => import("../pages/client/auth/VerifyEmail"));
const ResetPassword = lazy(() => import("../pages/client/auth/ResetPassword"));
const ListMovies = lazy(() => import("../pages/client/movie/ListMovies"));
const DetailMovie = lazy(
  () => import("../pages/client/movie/detail/DetailMovie"),
);
const ShowtimePicker = lazy(
  () => import("../pages/client/movie/detail/components/ShowTimePicker"),
);
const PaymentResult = lazy(
  () => import("../pages/client/payment/PaymentResult"),
);
const TicketDetail = lazy(() => import("../pages/client/user/TicketDetail"));
const GoogleAuthResult = lazy(
  () => import("../pages/client/auth/GoogleAuthResult"),
);

const routeFallback = (
  <div className="flex min-h-[320px] items-center justify-center text-sm text-gray-500">
    Loading page...
  </div>
);

const lazyElement = (Page: LazyExoticComponent<ComponentType>) => (
  <Suspense fallback={routeFallback}>
    <Page />
  </Suspense>
);

export const MainRoutes: RouteObject[] = [
  {
    path: "",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: lazyElement(HomePage),
      },
      {
        path: "movie",
        element: lazyElement(ListMovies),
      },
      {
        path: "movie/:id",
        element: lazyElement(DetailMovie),
        children: [
          { index: true, element: lazyElement(ShowtimePicker) },
          { path: ":showtimeId/:roomId", element: lazyElement(ShowtimePicker) },
        ],
      },
      {
        path: "verify-email",
        element: lazyElement(VerifyEmail),
      },
      {
        path: "reset-password",
        element: lazyElement(ResetPassword),
      },
      { path: "auth/google/:result", element: lazyElement(GoogleAuthResult) },
      {
        path: "profile",
        element: <ProfileLayout />,
        children: [
          {
            index: true,
            element: lazyElement(Profile),
          },
          {
            path: "ticket",
            element: lazyElement(MyTicket),
          },
          {
            path: "ticket/:ticketId",
            element: lazyElement(TicketDetail),
          },
        ],
      },
      {
        path: "payment/result",
        element: lazyElement(PaymentResult),
      },
      { path: "payment/success", element: lazyElement(PaymentResult) },
      { path: "payment/failed", element: lazyElement(PaymentResult) },
    ],
  },
];
