import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuthSelector } from "../stores/useAuthStore";

const AdminProtected = ({ children }: { children: ReactNode }) => {
  const user = useAuthSelector((state) => state.user);

  if (!user || user.role?.toLowerCase() !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtected;
