// PrivateRoute.js
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/user.context';

function PrivateRoute() {
  const { token } = useAuth();

  if(token) {
    return <Outlet />;
  } 
  else {
    return <Navigate to="/login" />
  }
}

export default PrivateRoute;
