import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredToken } from "../api/client";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = getStoredToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
