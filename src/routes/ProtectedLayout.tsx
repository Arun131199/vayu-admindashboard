import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import App from "../App";

export function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <App />;
}
