import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ user, allowedRoles }) => {
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
