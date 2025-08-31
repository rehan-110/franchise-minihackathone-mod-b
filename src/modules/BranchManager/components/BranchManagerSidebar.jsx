import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { FiMessageCircle, FiPackage, FiShoppingBag, FiTag, FiUsers } from 'react-icons/fi';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
  { name: 'Products', path: '/branch-manager/products', icon: FiShoppingBag },
    { name: 'Inventory', path: '/branch-manager/inventory', icon: FiPackage },
    { name: 'Employees', path: '/branch-manager/employees', icon: FiUsers },
    { name: 'Reviews', path: '/branch-manager/reviews', icon: FiMessageCircle },
    { name: 'Orders', path: '/branch-manager/branch-orders', icon: FiTag },


];

const BranchManagerSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-16 h-full w-64 bg-gray-800 border-r border-gray-700 shadow-xl z-40"
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Branch Manager Menu
          </h3>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-red-900/30 text-red-300 border-l-4 border-red-500'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </motion.div>
      
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default BranchManagerSidebar;
