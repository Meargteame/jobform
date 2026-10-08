import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  Building2,
  User,
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo & Main Nav */}
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-900">
                  Job<span className="text-emerald-600">Form</span>
                </span>
              </Link>

              <nav className="hidden md:flex space-x-2">
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/dashboard/jobs/new"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Job</span>
                </NavLink>
              </nav>
            </div>

            {/* Right Side: Recruiter Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-medium text-gray-900 flex items-center justify-end space-x-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>{user?.name || 'Recruiter'}</span>
                </span>
                <span className="text-xs text-gray-500 flex items-center justify-end space-x-1">
                  <Building2 className="w-3 h-3 text-emerald-600" />
                  <span>{user?.companyName || 'Company'}</span>
                </span>
              </div>

              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

              <button
                onClick={handleLogout}
                title="Log out"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
          JobForm SaaS &copy; {new Date().getFullYear()} — Built for modern recruiters & hiring teams.
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
