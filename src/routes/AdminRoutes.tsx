import type { RouteObject } from "react-router";
import AdminLayout from "../common/layouts/AdminLayout";
import AdminProtected from "../common/layouts/AdminProtected";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminMovies from "../pages/admin/AdminMovies";
import AdminRooms from "../pages/admin/AdminRooms";
import AdminSeatLayout from "../pages/admin/AdminSeatLayout";

export const AdminRoutes: RouteObject[] = [
  {
    path: "admin",
    element: (
      <AdminProtected>
        <AdminLayout />
      </AdminProtected>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "movies", element: <AdminMovies /> },
      { path: "categories", element: <AdminCategories /> },
      { path: "rooms", element: <AdminRooms /> },
      { path: "rooms/:roomId/seats", element: <AdminSeatLayout /> },
    ],
  },
];
