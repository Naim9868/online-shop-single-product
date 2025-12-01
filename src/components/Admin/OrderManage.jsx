// components/Admin/OrderManager.jsx
import { useState, useEffect } from 'react';
import { Search, Filter, Phone, Mail, RefreshCw, Package, Truck, Calendar, User, Trash2, Eye } from 'lucide-react';

export default function OrderManager({ orders, setOrders, onRefresh, loading }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
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
        body: JSON.stringify({ 
          _id: orderId, 
          status: newStatus 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update order: ${response.status}`);
      }

      const result = await response.json();
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
    } catch (error) {
      console.error('Error updating order:', error);
      alert(`Error updating order status: ${error.message}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders?id=${orderId}`, { 
        method: 'DELETE' 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete order: ${response.status}`);
      }

      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      alert('Order deleted successfully');
      
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(`Error deleting order: ${error.message}`);
    }
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  // Close order details modal
  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusText = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
        {statusText[status] || status}
      </span>
    );
  };

  // Filter and search orders
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = 
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone_1?.includes(searchTerm) ||
      order.phone_2?.includes(searchTerm) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.district?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter(order => order.status === 'pending').length,
    confirmed: orders.filter(order => order.status === 'confirmed').length,
    shipped: orders.filter(order => order.status === 'shipped').length,
    delivered: orders.filter(order => order.status === 'delivered').length,
    cancelled: orders.filter(order => order.status === 'cancelled').length
  };

  return (
    <div className="admin-order-manager p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Management</h1>
        <p className="text-gray-600">Manage and track customer orders</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: orderStats.total, color: 'bg-blue-500' },
          { label: 'Pending', value: orderStats.pending, color: 'bg-yellow-500' },
          { label: 'Confirmed', value: orderStats.confirmed, color: 'bg-blue-400' },
          { label: 'Shipped', value: orderStats.shipped, color: 'bg-purple-500' },
          { label: 'Delivered', value: orderStats.delivered, color: 'bg-green-500' },
          { label: 'Cancelled', value: orderStats.cancelled, color: 'bg-red-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
              <span className="text-white font-bold text-lg">{stat.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Controls Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, phone, email, or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={onRefresh}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No orders found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || filter !== 'all' ? 'Try changing your search or filter' : 'No orders have been placed yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    {/* Customer Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{order.name}</div>
                          <div className="text-sm text-gray-500">{order.district}</div>
                        </div>
                      </div>
                    </td>

                    {/* Order Details */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1 mb-1">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span>Size: {order.size}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <span className="capitalize">{order.shipping?.replace('-', ' ')}</span>
                        </div>
                        {order.createdAt && (
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 space-y-1">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{order.phone_1}</span>
                        </div>
                        {order.phone_2 && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{order.phone_2}</span>
                          </div>
                        )}
                        {order.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-xs">{order.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={order.status} 
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        disabled={updatingOrderId === order._id}
                        className={`text-sm font-medium rounded-full border-0 focus:ring-2 focus:ring-blue-500 outline-none px-3 py-1 ${getStatusColor(order.status)} ${
                          updatingOrderId === order._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {updatingOrderId === order._id && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2 inline-block"></div>
                      )}
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ৳{order.totalCost || order.total}
                      </div>
                      <div className="text-xs text-gray-500">
                        Qty: {order.productCount || 1}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => window.open(`tel:${order.phone_1}`)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Call Customer"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                <button
                  onClick={closeOrderDetails}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-700">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">District</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{selectedOrder.district}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Primary Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.phone_1}</p>
                    </div>
                    {selectedOrder.phone_2 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Secondary Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedOrder.phone_2}</p>
                      </div>
                    )}
                    {selectedOrder.email && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedOrder.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-700">Shipping Address</h4>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedOrder.address}
                  </p>
                </div>

                {/* Order Details */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-700">Order Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Size</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.size}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Quantity</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOrder.productCount || 1}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Shipping</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">
                        {selectedOrder.shipping?.replace('-', ' ')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-700">Financial Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm font-semibold">৳{selectedOrder.subtotal || 0}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Shipping:</span>
                      <span className="text-sm font-semibold">৳{selectedOrder.shippingCost || 0}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-lg font-bold text-gray-800">Total:</span>
                      <span className="text-lg font-bold text-gray-800">৳{selectedOrder.totalCost || selectedOrder.total || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Order Date */}
                {selectedOrder.createdAt && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-700">Order Timeline</h4>
                    <p className="text-sm text-gray-600">
                      Order placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => window.open(`tel:${selectedOrder.phone_1}`)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call Customer
                </button>
                <button
                  onClick={closeOrderDetails}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}