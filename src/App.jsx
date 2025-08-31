import React, { useEffect } from 'react';
    document.documentElement.classList.add("dark");
    document.documentElement.classList.add("dark");
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import { setUser, setLoading, logout } from './store/slices/authSlice';
import { setDarkTheme } from './store/slices/themeSlice';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './modules/Admin/pages/Dashboard';
import BranchManagerDashboard from './modules/BranchManager/pages/Dashboard';
import Loader from './components/common/Loader';
import AdminBranchManagement from './modules/Admin/pages/BranchManagement';
import BranchesList from './modules/Admin/pages/BranchesList';
import AddBranch from './modules/Admin/pages/AddBranch';
import ProductsList from './modules/Admin/pages/ProductsList';
import AddProduct from './modules/Admin/pages/AddProducts';
import ManageInventory from './modules/Admin/pages/ManageInventory';
import Employees from './modules/Admin/pages/Emoloyees';
import Offers from './modules/Admin/pages/Offers';
import BranchProductsList from './modules/BranchManager/pages/ProductsList';
import BranchInventory from './modules/BranchManager/pages/BranchInventory';
import EmployeeManagement from './modules/BranchManager/pages/EmployeeManagement';
import Reviews from './modules/BranchManager/pages/Reviews';
import CustomerDashboard from './modules/Customer/pages/Dashboard.jsx';
import CustomerOrders from './modules/Customer/pages/CustomerOrders.jsx';
import Products from './modules/Customer/pages/Products.jsx';
import OrderPlacement from './modules/Customer/pages/OrderPlacement.jsx';
import CustomerReview from './modules/Customer/pages/CustomerReview.jsx';
import BranchOrders from './modules/BranchManager/pages/BranchOrders.jsx';
function App() {
  const dispatch = useDispatch();
  const { user, role, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.add("dark");
    dispatch(setDarkTheme());
    

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        dispatch(setUser({ 
          user: firebaseUser,
          role: userData?.role || 'customer' 
        }));
      } else {
        dispatch(logout());
      }
      dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);

  if (isLoading) {
    return <Loader />;
  }

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'branchManager':
        return <BranchManagerDashboard />;
      case 'customer':
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
<Router>
<Routes>
<Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
<Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
<Route path="/dashboard" element={user ? renderDashboard() : <Navigate to="/login" />} />
<Route path="/customer/orders"  element={user && role === 'customer' ? <CustomerOrders />  : <Navigate to="/login" />} />
<Route path="/customer/products" element={user && role === 'customer' ? <Products /> : <Navigate to="/login" />} />
<Route path="/customer/order-placement" element={user ? <OrderPlacement /> : <Navigate to="/login" />} />
<Route path="/customer/review-branch/:branchId" element={<CustomerReview />} />
<Route path="/admin/manage-inventory" element={user && role === 'admin' ? <ManageInventory /> : <Navigate to="/login" />} />
<Route path="/admin/branches" element={user && role === 'admin' ? <AdminBranchManagement /> : <Navigate to="/login" />} />
<Route path="/admin/branches-list" element={user && role === 'admin' ? <BranchesList /> : <Navigate to="/login" />} />
<Route path="/admin/add-branch" element={user && role === 'admin' ? <AddBranch /> : <Navigate to="/login" />} />
<Route path="/admin/products-list" element={user && role === 'admin' ? <ProductsList /> : <Navigate to="/login" />} />
<Route path="/admin/add-product" element={user && role === 'admin' ? <AddProduct /> : <Navigate to="/login" />} />
<Route path="/admin/employees" element={user && role === 'admin' ? <Employees /> : <Navigate to="/login" />} />
<Route path="/admin/offers" element={user && role === 'admin' ? <Offers /> : <Navigate to="/login" />} />
<Route path="/branch-manager/menu" element={user && role === 'branchManager' ? <BranchManagerMenu /> : <Navigate to="/login" />} />
<Route path="/branch-manager/staff" element={user && role === 'branchManager' ? <BranchManagerStaff /> : <Navigate to="/login" />} />
<Route path="/branch-manager/products" element={user && role === 'branchManager' ? <BranchProductsList /> : <Navigate to="/login" />} />
<Route path="/branch-manager/inventory" element={user && role === 'branchManager' ? <BranchInventory /> : <Navigate to="/login" />} />
<Route path="/branch-manager/employees" element={user && role === 'branchManager' ? <EmployeeManagement /> : <Navigate to="/login" />} />
<Route path="/branch-manager/reviews" element={user && role === 'branchManager' ? <Reviews /> : <Navigate to="/login" />} />
<Route path="/branch-manager/branch-orders" element={user && role === 'branchManager' ? <BranchOrders /> : <Navigate to="/login" />} />
<Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
</Routes>
</Router>
    </div>
  );
}

export default App;