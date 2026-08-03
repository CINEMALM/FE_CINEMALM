import { useNavigate } from "react-router";
import { useAuthSelector } from "../stores/useAuthStore";

export const useAuthNavigate = () => {
  const setOpen = useAuthSelector((state) => state.setOpenModal);
  const requestLogin = useAuthSelector((state) => state.requestLogin);
  const nav = useNavigate();
  const isAuthenticated = useAuthSelector((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return nav;
  }
  const handleNav = (path?: unknown) => {
    if (typeof path === "string") {
      requestLogin({ path });
      return;
    }
    setOpen(true);
  };
  return handleNav;
};
