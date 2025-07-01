import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Users, 
  UserCheck, 
  FileText, 
  Clock, 
  AlertTriangle, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: Home, allowedRoles: ['Admin', 'Staff'] },
    { name: 'Users', id: 'users', icon: Users, allowedRoles: ['Admin'] },
    { name: 'Clients', id: 'clients', icon: UserCheck, allowedRoles: ['Admin', 'Staff'] },
    { name: 'Documents', id: 'documents', icon: FileText, allowedRoles: ['Admin', 'Staff'] },
    { name: 'Job Times', id: 'job-times', icon: Clock, allowedRoles: ['Admin', 'Staff'] },
    { name: 'Incidents', id: 'incidents', icon: AlertTriangle, allowedRoles: ['Admin', 'Staff'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.allowedRoles.includes(user?.role || 'staff')
  );

  // Debug logging
  useEffect(() => {
  }, [user, filteredNavigation]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-blue-600 text-white">
            <div className="flex items-center space-x-2">
              <UserCheck size={24} />
              <span className="font-bold text-lg">CarePortal</span>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.fullName || 'Unknown User'}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role || 'No Role'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {filteredNavigation.length === 0 ? (
              <div className="text-red-500 text-sm p-2">
                No navigation items available for role: {user?.role || 'undefined'}
              </div>
            ) : (
              filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </button>
                );
              })
            )}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;