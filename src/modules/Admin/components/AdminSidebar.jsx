// src/modules/Admin/components/AdminSidebar.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  CogIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ShoppingBagIcon,
  PlusIcon,
  ArchiveBoxIcon,
  UsersIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = ({ isOpen, onClose }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },{ name: 'Manage Inventory', path: '/admin/manage-inventory', icon: ArchiveBoxIcon },
    { 
      name: 'Manage Branches', 
      icon: BuildingStorefrontIcon,
      subItems: [
        { name: 'Branches List', path: '/admin/branches-list', icon: ClockIcon },
        { name: 'Add Branch', path: '/admin/add-branch', icon: PlusIcon }
      ]
    },
    { 
      name: 'Manage Products', 
      icon: ShoppingBagIcon,
      subItems: [
        { name: 'Products List', path: '/admin/products-list', icon: ClockIcon },
        { name: 'Add Product', path: '/admin/add-product', icon: PlusIcon }
      ]
    },{ name: 'Employees', path: '/admin/employees', icon: UsersIcon },
    { name: 'Offers & Discounts', path: '/admin/offers', icon: TagIcon },
    
  ];

  const toggleDropdown = (menuName) => {
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  return (
    <>
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-16 h-full w-64 bg-gray-800 border-r border-gray-700 shadow-xl z-40 overflow-y-auto"
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Admin Menu
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.name}>
                {item.subItems ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                      {openDropdown === item.name ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                    {openDropdown === item.name && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        className="ml-8 space-y-1 mt-1"
                      >
                        {item.subItems.map((subItem) => (
                          <NavLink
                            key={subItem.name}
                            to={subItem.path}
                            className={({ isActive }) =>
                              `flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                                isActive
                                  ? 'bg-red-900/50 text-red-300 border-l-2 border-red-500'
                                  : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                              }`
                            }
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span>{subItem.name}</span>
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-red-900/50 text-red-300 border-l-4 border-red-500'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </NavLink>
                )}
              </div>
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

export default AdminSidebar;