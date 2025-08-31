import React from 'react';

const TestCredentials = () => (
  <div className="p-6 bg-gray-800 text-gray-100 rounded-xl shadow-lg max-w-md mx-auto">
    <h2 className="text-xl font-bold mb-4 text-center">🔑 Test Accounts</h2>

    <div className="space-y-4">
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
        <h3 className="font-bold text-red-400">Admin</h3>
        <p><span className="text-gray-400">Email:</span> adminrehan@gmail.com</p>
        <p><span className="text-gray-400">Password:</span> rehanhoonyaar</p>
      </div>

      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <h3 className="font-bold text-blue-400">Branch Manager</h3>
        <p><span className="text-gray-400">Email:</span> managerhoonyar@gmail.com</p>
        <p><span className="text-gray-400">Password:</span> branchmanagerhoonyaar</p>
      </div>

      <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
        <h3 className="font-bold text-green-400">Customer</h3>
        <p className="text-sm text-gray-300 mb-1">
          No pre-made account. Use <strong>Register</strong> first, then login.
        </p>
      </div>
    </div>
    
  </div>
  
);

export default TestCredentials;