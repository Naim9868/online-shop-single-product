// app/admin/page.js
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Dashboard from '@/components/Admin/Dashboard';
import ProductManege from '@/components/Admin/ProductManage';
import OrderManage from '@/components/Admin/OrderManage';

let pusherClient = null;

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ordersRef = useRef([]);

  // Initialize orders ref
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  const loadInitialOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/orders?limit=100&sortBy=createdAt&sortOrder=desc');
      
      if (!response.ok) {
        setError(`Failed to load orders: ${response.status}`);
        setConnectionStatus('error');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
        setConnectionStatus('connected');
      } else {
        setError(data.message || 'Failed to load orders');
        setConnectionStatus('error');
      }
    } catch (error) {
      setError('Network error: Could not connect to server');
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  const showBrowserNotification = useCallback((order) => {
    if (typeof window === 'undefined') return;
    
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification('🎉 New Order Received', {
          body: `From ${order.name} - ৳${order.totalCost || order.total}`,
          icon: '/favicon.ico',
          tag: `order-${order._id || order.id}`
        });

        notification.onclick = () => {
          window.focus();
          setActiveTab('orders');
          notification.close();
        };

        setTimeout(() => notification.close(), 8000);
      } catch (notifError) {
        console.error('Notification failed:', notifError);
      }
    } else if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const initializePusher = useCallback(async () => {
    if (typeof window === 'undefined') return;

    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      setConnectionStatus('polling');
      return;
    }

    try {
      const Pusher = (await import('pusher-js')).default;
      
      pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        forceTLS: true,
      });

      const channel = pusherClient.subscribe('admin-dashboard');

      channel.bind('new-order', (data) => {
        setNewOrdersCount(prev => prev + 1);
        setOrders(prev => [data.order, ...prev]);
        showBrowserNotification(data.order);
      });

      channel.bind('order-updated', (data) => {
        setOrders(prev => 
          prev.map(order => 
            order._id === data.order._id ? { ...order, ...data.order } : order
          )
        );
      });

      pusherClient.connection.bind('connected', () => {
        setConnectionStatus('connected');
      });

      pusherClient.connection.bind('disconnected', () => {
        setConnectionStatus('disconnected');
      });

      pusherClient.connection.bind('error', () => {
        setConnectionStatus('error');
      });

    } catch (error) {
      setConnectionStatus('polling');
    }
  }, [showBrowserNotification]);

  // Stable polling setup
  useEffect(() => {
    let pollInterval;

    if (connectionStatus !== 'connected') {
      pollInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/orders?limit=1&sortBy=createdAt&sortOrder=desc');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.orders.length > 0) {
              const latestOrder = data.orders[0];
              const isNewOrder = !ordersRef.current.some(order => 
                order._id === latestOrder._id
              );
              
              if (isNewOrder) {
                setNewOrdersCount(prev => prev + 1);
                setOrders(prev => [latestOrder, ...prev]);
                showBrowserNotification(latestOrder);
              }
            }
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 30000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [connectionStatus, showBrowserNotification]);

  useEffect(() => {
    const initializeAdminPanel = async () => {
      await loadInitialOrders();
      await initializePusher();
    };

    initializeAdminPanel();

    const handleAdminNavigation = (event) => {
      setActiveTab(event.detail.tab);
    };

    window.addEventListener('adminNavigation', handleAdminNavigation);

    return () => {
      if (pusherClient) {
        pusherClient.disconnect();
        pusherClient = null;
      }
      window.removeEventListener('adminNavigation', handleAdminNavigation);
    };
  }, [loadInitialOrders, initializePusher]);

  const handleTabChange = useCallback((key) => {
    setActiveTab(key);
    if (key === 'dashboard') {
      setNewOrdersCount(0);
    }
  }, []);

  const handleManualRefresh = useCallback(() => {
    setError(null);
    loadInitialOrders();
  }, [loadInitialOrders]);

  const statusConfig = {
    connecting: { color: 'bg-yellow-500', text: 'Connecting...' },
    connected: { color: 'bg-green-500', text: 'Live' },
    polling: { color: 'bg-blue-500', text: 'Polling' },
    error: { color: 'bg-red-500', text: 'Offline' },
    disconnected: { color: 'bg-gray-500', text: 'Disconnected' }
  }[connectionStatus] || { color: 'bg-gray-500', text: 'Unknown' };

  const tabs = [
    { key: 'dashboard', name: 'Dashboard', count: newOrdersCount },
    { key: 'products', name: 'Products' },
    { key: 'orders', name: 'Orders' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your store efficiently</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
                <span className="text-sm text-gray-600 font-medium">
                  {statusConfig.text}
                </span>
              </div>
              
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Refresh'
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">⚠️</span>
                  <span className="text-red-800">{error}</span>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 text-lg font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <nav className="flex space-x-8 border-b border-gray-200">
            {tabs.map(({ key, name, count }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {name}
                  {count > 0 && (
                    <span className="inline-flex items-center justify-center min-w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                      {count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            orders={orders} 
            newOrdersCount={newOrdersCount}
            onRefresh={handleManualRefresh}
            loading={loading}
          />
        )}
        {activeTab === 'products' && <ProductManege />}
        {activeTab === 'orders' && (
          <OrderManage 
            orders={orders} 
            setOrders={setOrders}
            onRefresh={handleManualRefresh}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
}