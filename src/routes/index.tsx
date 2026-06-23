import { createBrowserRouter, RouterProvider } from "react-router";
import { MainRoutes } from "./MainRoutes";
import NotFoundPage from "../pages/NotFoundPage";

const routes = createBrowserRouter([
  ...MainRoutes,
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export const AppRoutes = () => {
  return <RouterProvider router={routes} />;
};
