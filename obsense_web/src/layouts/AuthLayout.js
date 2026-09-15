import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="auth-layout-root">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
