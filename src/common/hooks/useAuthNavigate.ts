import { useNavigate } from "react-router";
import { useAuthSelector } from "../stores/useAuthStore";

export const useAuthNavigate = () => {
  const setOpen = useAuthSelector((state) => state.setOpenModal);
  const nav = useNavigate();
  const isAuthenticated = useAuthSelector((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return nav;
  }
  const handleNav = () => {
    setOpen(true);
  };
  return handleNav;
};
