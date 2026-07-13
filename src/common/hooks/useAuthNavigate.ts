import { useNavigate } from "react-router";
import { useAuthSelector } from "../stores/useAuthStore";

export const useAuthNavigate = () => {
  const setOpen = useAuthSelector((state) => state.setOpenModal);
  const nav = useNavigate();
  const isLogin = useAuthSelector((state) => state.token);
  if (isLogin) {
    return nav;
  }
  const handleNav = () => {
    setOpen(true);
  };
  return handleNav;
};
