import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  Building2,
  ExternalLink,
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'R';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900">
      {/* Top Navigation */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo & Main Nav */}
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Job<span className="text-emerald-600">Form</span>
                </span>
              </Link>

              <nav className="hidden md:flex space-x-1">
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/dashboard/jobs/new"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post Vacancy</span>
                </NavLink>
              </nav>
            </div>

            {/* Right Side: Recruiter Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {getInitials(user?.name)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.name || 'Recruiter'}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <Building2 className="w-2.5 h-2.5 text-emerald-600" />
                    <span className="truncate max-w-[130px]">{user?.companyName || 'Company'}</span>
                  </span>
                </div>
              </div>

              <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

              <button
                onClick={handleLogout}
                title="Log out of recruiter account"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
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

      {/* Modern SaaS Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>
            JobForm &copy; {new Date().getFullYear()} &bull; Professional Recruitment & Application Management
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-600 font-medium">B2B SaaS Core</span>
            <span>&bull;</span>
            <span className="font-mono text-[11px] text-slate-400">v1.2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
