import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { motion } from 'framer-motion';
import { UsersIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { FiFilter } from 'react-icons/fi';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesSnap, branchesSnap] = await Promise.all([
        getDocs(collection(db, 'employees')),
        getDocs(collection(db, 'branches'))
      ]);

      setEmployees(employeesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setBranches(branchesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = selectedBranch === 'all'
    ? employees
    : employees.filter(emp => emp.branchId === selectedBranch);

  const getBranchName = (branchId) =>
    branches.find(b => b.id === branchId)?.branchName || 'Unknown';

  const getRoleColor = (role) => ({
    waiter: 'bg-blue-900/20 text-blue-300',
    cashier: 'bg-yellow-900/20 text-yellow-300',
    chef: 'bg-orange-900/20 text-orange-300',
    manager: 'bg-purple-900/20 text-purple-300'
  }[role] || 'bg-gray-900/20 text-gray-300');

  const getStatusColor = (status) =>
    status === 'active'
      ? 'bg-green-900/20 text-green-300'
      : 'bg-red-900/20 text-red-300';

  if (loading) {
    return <AdminLayout><div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        </div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-100">All Employees</h1>
          <p className="text-gray-400">View-only: employees across all branches</p>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <FiFilter className="h-5 w-5 text-gray-400" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
          >
            <option value="all">All Branches ({employees.length})</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.branchName} ({employees.filter(e => e.branchId === branch.id).length})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((emp) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  <UsersIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-100">{emp.name}</h3>
                  <p className="text-gray-400 text-sm">{emp.email}</p>
                  <p className="text-gray-400 text-sm">{emp.phone}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Branch:</span>
                  <span className="text-gray-100">{getBranchName(emp.branchId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Role:</span>
                  <span className={`px-2 py-1 text-xs rounded ${getRoleColor(emp.role)}`}>{emp.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(emp.status)}`}>{emp.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hired:</span>
                  <span className="text-gray-100 text-sm">{new Date(emp.hiredDate).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No employees found</p>
            <p className="text-gray-500 text-sm mt-2">
              {selectedBranch === 'all' ? 'Employees will appear when branch managers add them' : 'No employees in this branch yet'}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Employees;