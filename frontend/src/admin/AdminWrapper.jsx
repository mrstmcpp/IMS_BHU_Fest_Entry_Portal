import React from 'react';  
import { Navigate } from 'react-router-dom';
const AdminRoute = ({ token, isAdmin, children }) => {
  if (!token) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/scan" />; // redirect non-admins
  return children;
};

export default AdminRoute;
