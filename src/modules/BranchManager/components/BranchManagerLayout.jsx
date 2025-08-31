import React, { useState } from 'react';
import BranchManagerNavbar from './BranchManagerNavbar';
import BranchManagerSidebar from './BranchManagerSidebar';

const BranchManagerLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <BranchManagerNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <BranchManagerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {children}
      </main>
    </div>
  );
};

export default BranchManagerLayout;