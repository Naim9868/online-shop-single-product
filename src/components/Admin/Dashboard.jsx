"use client";

import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    productsCount: 0,
    averageOrder: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the token from localStorage
      const token = localStorage.getItem('adminToken');
      // console.log('🔐 Token from localStorage:', token);

      if (!token) {
        console.log('❌ No token found in localStorage');
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      // console.log('📡 Making request to /api/dashboard with token...');
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // console.log("Dashboard API response: ", response);
      // console.log('📊 Response status:', response.status);
      // console.log('📊 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          // Clear invalid token
          localStorage.removeItem('adminToken');
          // Redirect to login
          // window.location.href = '/admin/login';
          return; 
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      //  console.log('✅ Success response data:', data);

      
      // Set the data with proper fallbacks
      setStats({
        totalOrders: data.stats?.totalOrders || 0,
        pendingOrders: data.stats?.pendingOrders || 0,
        totalRevenue: data.stats?.totalRevenue || 0,
        productsCount: data.stats?.productsCount || 0,
        averageOrder: data.stats?.averageOrder || 0
      });
      
      setRecentOrders(data.recentOrders || []);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        alert('Please log in again.');
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });

      if (response.ok) {
        loadDashboardData(); // Reload data
      } else if (response.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Network error. Please try again.');
    }
  };

  const navigateToProducts = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adminNavigation', { 
        detail: { tab: 'products' } 
      }));
    }
  };

  const navigateToOrders = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adminNavigation', { 
        detail: { tab: 'orders' } 
      }));
    }
  };

  if (loading) {
    return (
      <div className="dashboard p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700 font-semibold">Error</div>
          <div className="text-red-600">{error}</div>
          <button 
            onClick={loadDashboardData}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Orders</h3>
          <p className="stat-number text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
        </div>
        
        <div className="stat-card bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Pending Orders</h3>
          <p className="stat-number text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
        </div>
        
        <div className="stat-card bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Revenue</h3>
          <p className="stat-number text-3xl font-bold text-green-600">৳{stats.totalRevenue}</p>
        </div>
        
        <div className="stat-card bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Products</h3>
          <p className="stat-number text-3xl font-bold text-purple-600">{stats.productsCount}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="recent-orders bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {recentOrders.map(order => (
              <div key={order._id || order.id} className="order-item border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 sm:justify-between">
                  <div className="order-info flex-1">
                    <div className="flex flex-wrap items-center gap-4 mb-2">
                      <strong className="text-gray-900">{order.name}</strong>
                      <span className="text-sm text-gray-600">#{order._id?.toString().slice(-8) || order.id}</span>
                      <span className="text-sm font-semibold text-green-600">৳{order.totalCost}</span>
                      <span className={`status px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.district} • {order.phone_1} • {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="order-actions mt-2 md:mt-0">
                    <select 
                      value={order.status} 
                      onChange={(e) => updateOrderStatus(order._id || order.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h3>
        <div className="action-buttons flex gap-4">
          <button 
            onClick={navigateToProducts}
            className="action-btn bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Add New Product
          </button>
          <button 
            onClick={navigateToOrders}
            className="action-btn bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
}