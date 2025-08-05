import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardRouteByRole } from '../utils/roleBasedRouting';

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const dashboardRoute = getDashboardRouteByRole(user);
  return <Navigate to={dashboardRoute} replace />;
};

export default RoleBasedRedirect; 