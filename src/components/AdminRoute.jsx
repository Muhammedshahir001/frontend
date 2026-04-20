import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { adminInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!adminInfo || !adminInfo.token || adminInfo.role !== 'admin') {
    // Redirect to admin login but save the current location
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
