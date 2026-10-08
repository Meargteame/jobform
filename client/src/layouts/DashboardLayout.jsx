import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BetterFormLogo from '../components/BetterFormLogo';
import {
  LayoutDashboard,
  Plus,
  LogOut,
  Building,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navigation = [
    {
      name: 'Overview',
      to: '/dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: 'Create Job',
      to: '/dashboard/jobs/new',
      icon: Plus,
      end: false,
    },
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row font-sans text-ink antialiased">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-line px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/dashboard" className="flex items-center">
          <BetterFormLogo size={28} />
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-muted hover:text-ink hover:bg-paper-2 rounded-[8px] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 stroke-[1.5]" /> : <Menu className="w-5 h-5 stroke-[1.5]" />}
        </button>
      </div>

      {/* Mobile Slide-down Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* FIXED PERMANENT LEFT SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-white border-r border-line flex flex-col justify-between transition-transform duration-200 ease-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand & Workspace */}
        <div>
          <div className="p-6 border-b border-line">
            <Link to="/dashboard" className="inline-block">
              <BetterFormLogo size={32} />
            </Link>

            {/* Current Workspace Pill */}
            <div className="mt-5 p-3 bg-paper border border-line rounded-[8px] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-[6px] bg-paper-2 text-ink flex items-center justify-center shrink-0">
                  <Building className="w-3.5 h-3.5 stroke-[1.5]" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-ink truncate leading-tight">
                    {user?.companyName || 'My Workspace'}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mt-0.5">
                    Hiring Team
                  </p>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-signal shrink-0" title="Workspace Active" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <div className="px-3 pb-2 pt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Workspace
            </div>

            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-[14px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-ink text-paper'
                      : 'text-muted hover:text-ink hover:bg-paper-2'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4 stroke-[1.5]" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 stroke-[1.5]" />
              </NavLink>
            ))}

            {/* Quick Action Button */}
            <div className="pt-4">
              <Link
                to="/dashboard/jobs/new"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 h-[44px] px-4 bg-ink hover:bg-[#202022] text-paper rounded-[8px] text-[14px] font-semibold transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[1.5]" />
                <span>Create Job</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom: User Card & Sign Out */}
        <div className="p-4 border-t border-line bg-paper-2/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-[6px] bg-ink text-paper font-semibold text-xs flex items-center justify-center shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink truncate">
                  {user?.name || 'Recruiter'}
                </p>
                <p className="text-[11px] text-muted truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-muted hover:text-ink hover:bg-paper-2 rounded-[6px] transition-colors ml-1"
            >
              <LogOut className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
