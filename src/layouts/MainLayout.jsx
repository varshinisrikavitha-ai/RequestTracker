import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.1),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)]">
      <div className="fixed top-0 left-1/3 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none -z-10" />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:ml-[18rem]">
        {/* Top Bar */}
        <TopBar toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto px-4 pb-6 pt-4 md:px-6 md:pb-8 md:pt-6">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
