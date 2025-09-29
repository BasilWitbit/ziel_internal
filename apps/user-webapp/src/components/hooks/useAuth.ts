import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { logout as logoutAction } from "../../store/authSlice";

export default function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const isAuthenticated = !!user;

  return { user, isAuthenticated, logout };
}
