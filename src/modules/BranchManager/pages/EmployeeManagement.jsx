import React, { useState, useEffect } from 'react';
import BranchManagerLayout from '../components/BranchManagerLayout';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { auth, db } from '../../../firebase/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiUsers, FiPlus, FiEdit3, FiTrash2, FiPhone, FiMail, FiCalendar, FiFilter } from 'react-icons/fi';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'waiter',
    status: 'active',
    hiredDate: new Date().toISOString().split('T')[0]
  });
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchBranchInfo();
  }, []);

  const fetchBranchInfo = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const usersCollection = collection(db, 'users');
      const userQuery = query(usersCollection, where('uid', '==', user.uid));
      const userSnapshot = await getDocs(userQuery);
      const userData = userSnapshot.docs[0]?.data();

      if (userData?.role === 'branchManager') {
        setBranchId(userData.branchName);
        fetchEmployees(userData.branchName);
      }
    } catch (error) {
      toast.error('Failed to load branch info');
    }
  };

  const fetchEmployees = async (branch) => {
    try {
      const employeesCollection = collection(db, 'employees');
      const employeesQuery = query(employeesCollection, where('branchId', '==', branch));
      const employeesSnapshot = await getDocs(employeesQuery);
      const employeesData = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeesData);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const employeeData = {
        ...formData,
        branchId,
        updatedAt: new Date().toISOString()
      };

      if (editingEmployee) {
        await updateDoc(doc(db, 'employees', editingEmployee.id), employeeData);
        toast.success('Employee updated successfully');
      } else {
        await addDoc(collection(db, 'employees'), {
          ...employeeData,
          createdAt: new Date().toISOString()
        });
        toast.success('Employee added successfully');
      }

      resetForm();
      fetchEmployees(branchId);
    } catch (error) {
      toast.error('Failed to save employee');
    }
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteDoc(doc(db, 'employees', employeeId));
        toast.success('Employee deleted successfully');
        fetchEmployees(branchId);
      } catch (error) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const resetForm = () => {
    setModalOpen(false);
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'waiter',
      status: 'active',
      hiredDate: new Date().toISOString().split('T')[0]
    });
  };

  const filteredEmployees = employees.filter(emp => 
    filterRole === 'all' || emp.role === filterRole
  );

  const getRoleColor = (role) => {
    const colors = {
      waiter: 'bg-blue-900/20 text-blue-300',
      cashier: 'bg-yellow-900/20 text-yellow-300',
      chef: 'bg-orange-900/20 text-orange-300',
      manager: 'bg-purple-900/20 text-purple-300'
    };
    return colors[role] || 'bg-gray-900/20 text-gray-300';
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-900/20 text-green-300' 
      : 'bg-red-900/20 text-red-300';
  };

  if (loading) {
    return (
      <BranchManagerLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        </div>
      </BranchManagerLayout>
    );
  }

  return (
    <BranchManagerLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-100">Employee Management</h1>
          <button
  onClick={() => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'waiter',
      status: 'active',
      hiredDate: new Date().toISOString().split('T')[0]
    });
    setModalOpen(true);
  }}
  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
>
  <FiPlus className="h-5 w-5" />
  <span>Add Employee</span>
</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <FiUsers className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{employees.length}</p>
                <p className="text-gray-400 text-sm">Total Employees</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <FiUsers className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {employees.filter(emp => emp.status === 'active').length}
                </p>
                <p className="text-gray-400 text-sm">Active Employees</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <FiUsers className="h-8 w-8 text-red-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {employees.filter(emp => emp.status === 'inactive').length}
                </p>
                <p className="text-gray-400 text-sm">Inactive Employees</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
            >
              <option value="all">All Roles</option>
              <option value="waiter">Waiters</option>
              <option value="cashier">Cashiers</option>
              <option value="chef">Chefs</option>
              <option value="manager">Managers</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-2">{employee.name}</h3>
                  <p className="text-gray-400 text-sm mb-1">{employee.email}</p>
                  <p className="text-gray-400 text-sm">{employee.phone}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingEmployee(employee);
                      setFormData({
                        name: employee.name,
                        email: employee.email,
                        phone: employee.phone,
                        role: employee.role,
                        status: employee.status,
                        hiredDate: employee.hiredDate
                      });
                      setModalOpen(true);
                    }}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <FiEdit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Role:</span>
                  <span className={`px-2 py-1 text-xs rounded ${getRoleColor(employee.role)}`}>
                    {employee.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hired:</span>
                  <span className="text-gray-100 text-sm">
                    {new Date(employee.hiredDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-100 mb-2">No Employees Found</h3>
            <p className="text-gray-400">Add your first employee to get started</p>
          </div>
        )}

        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-gray-100 mb-6">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                  >
                    <option value="waiter">Waiter</option>
                    <option value="cashier">Cashier</option>
                    <option value="chef">Chef</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hired Date</label>
                  <input
                    type="date"
                    value={formData.hiredDate}
                    onChange={(e) => setFormData({...formData, hiredDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    {editingEmployee ? 'Update' : 'Add'} Employee
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </BranchManagerLayout>
  );
};

export default EmployeeManagement;