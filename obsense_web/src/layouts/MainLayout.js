import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

export const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <Navbar
        onToggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleMobileSidebar={toggleMobileSidebar}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Backdrop overlay for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      <div className="flex">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={closeMobileSidebar}
        />
        <main
          className={`flex-1 w-full min-w-0 p-4 sm:p-6 md:p-8 transition-all duration-300 ${
            isSidebarCollapsed ? 'md:ml-18' : 'md:ml-64'
          } ml-0`}
        >
          <div className="mx-auto max-w-7xl w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

