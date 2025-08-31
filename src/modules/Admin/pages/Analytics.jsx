import React from 'react';
import AdminLayout from '../components/AdminLayout';

const AdminAnalytics = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">
          Analytics
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 dark:bg-gray-900 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              Sales Overview
            </h3>
            <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart will be displayed here</p>
            </div>
          </div>
          <div className="bg-gray-900 dark:bg-gray-900 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              Customer Growth
            </h3>
            <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;