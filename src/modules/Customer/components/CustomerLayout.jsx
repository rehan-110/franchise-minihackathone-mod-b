import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import CustomerNavbar from './CustomerNavbar';
import CustomerSidebar from './CustomerSidebar';

const CustomerLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-800 dark:bg-dark-100">
      <CustomerNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <CustomerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default CustomerLayout;