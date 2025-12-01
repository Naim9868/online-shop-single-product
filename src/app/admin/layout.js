// app/admin/layout.js

'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  

  useEffect(() => {
    // Only redirect if we're NOT on the login page and user is not authenticated
    if (!loading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, loading, pathname, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  // If we're on login page, always show children (login form)
  if (pathname === '/admin/login') {
    return children;
  }

  // If no user and not on login page (should have redirected already)
  if (!user) {
    return null;
  }

  // Only show admin layout for authenticated users on admin pages
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              <button 
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  window.location.href = '/admin/login';
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
       <ErrorBoundary>
         {children}
       </ErrorBoundary>
      </main>
    </div>
  );
}