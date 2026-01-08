import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredMustChangePassword, getStoredToken } from "../api/client";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = getStoredToken();
  const mustChangePassword = getStoredMustChangePassword();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  if (!mustChangePassword && location.pathname === "/change-password") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
