import {
  lazy,
  type ComponentType,
  type LazyExoticComponent,
  Suspense,
} from "react";
import type { RouteObject } from "react-router";
import AdminLayout from "../common/layouts/AdminLayout";
import AdminProtected from "../common/layouts/AdminProtected";

const AdminCategories = lazy(() => import("../pages/admin/AdminCategories"));
const AdminCheckIn = lazy(() => import("../pages/admin/AdminCheckIn"));
const AdminConcession = lazy(() => import("../pages/admin/AdminConcession"));
const AdminCounterBooking = lazy(
  () => import("../pages/admin/AdminCounterBooking"),
);
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminMovies = lazy(() => import("../pages/admin/AdminMovies"));
const AdminProducts = lazy(() => import("../pages/admin/AdminProducts"));
const AdminPromotions = lazy(() => import("../pages/admin/AdminPromotions"));
const AdminRooms = lazy(() => import("../pages/admin/AdminRooms"));
const AdminSeatLayout = lazy(() => import("../pages/admin/AdminSeatLayout"));
const AdminShowtimes = lazy(() => import("../pages/admin/AdminShowtimes"));
const AdminTickets = lazy(() => import("../pages/admin/AdminTickets"));

const adminRouteFallback = (
  <div className="flex min-h-[320px] items-center justify-center text-sm text-gray-500">
    Loading admin page...
  </div>
);

const lazyElement = (Page: LazyExoticComponent<ComponentType>) => (
  <Suspense fallback={adminRouteFallback}>
    <Page />
  </Suspense>
);

export const AdminRoutes: RouteObject[] = [
  {
    path: "admin",
    element: (
      <AdminProtected>
        <AdminLayout />
      </AdminProtected>
    ),
    children: [
      { index: true, element: lazyElement(AdminDashboard) },
      { path: "movies", element: lazyElement(AdminMovies) },
      { path: "showtimes", element: lazyElement(AdminShowtimes) },
      { path: "tickets", element: lazyElement(AdminTickets) },
      { path: "counter", element: lazyElement(AdminCounterBooking) },
      { path: "concession", element: lazyElement(AdminConcession) },
      { path: "products", element: lazyElement(AdminProducts) },
      { path: "promotions", element: lazyElement(AdminPromotions) },
      { path: "categories", element: lazyElement(AdminCategories) },
      { path: "rooms", element: lazyElement(AdminRooms) },
      { path: "rooms/:roomId/seats", element: lazyElement(AdminSeatLayout) },
      { path: "check-in", element: lazyElement(AdminCheckIn) },
    ],
  },
];
