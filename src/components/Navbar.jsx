import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { 
  Wrench, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  PlusCircle, 
  LayoutDashboard, 
  ShieldCheck, 
  ListOrdered, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleDemoSwitch = async (role) => {
    try {
      const newUser = await loginAsDemo(role);
      setDemoDropdownOpen(false);
      setMobileMenuOpen(false);
      success(`Switched role to ${newUser.name} (${newUser.role.toUpperCase()})`);
      if (newUser.role === 'admin') navigate('/admin');
      else if (newUser.role === 'staff') navigate('/staff');
      else navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    success('You have been logged out.');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur-md border-b border-navy-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Mark */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyanAccent-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-200">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                  Smart Campus Fix
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI-V2
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-1 hidden md:block">University Issue Management</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/') ? 'text-white bg-white/10 font-semibold' : 'hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'student' && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/dashboard') ? 'text-white bg-white/10 font-semibold' : 'hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 text-brand-400" />
                      Dashboard
                    </Link>
                    <Link
                      to="/my-complaints"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/my-complaints') ? 'text-white bg-white/10 font-semibold' : 'hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ListOrdered className="w-4 h-4 text-cyan-400" />
                      My Complaints
                    </Link>
                  </>
                )}

                {user?.role === 'admin' && (
                  <>
                    <Link
                      to="/admin"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/admin') ? 'text-white bg-white/10 font-semibold' : 'hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      Admin Overview
                    </Link>
                    <Link
                      to="/admin/complaints"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/admin/complaints') ? 'text-white bg-white/10 font-semibold' : 'hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ListOrdered className="w-4 h-4 text-cyan-400" />
                      Review & Assign
                    </Link>
                  </>
                )}

                {user?.role === 'staff' && (
                  <Link
                    to="/staff"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      isActive('/staff') ? 'text-white bg-white/10 font-semibold' : 'hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-amber-400" />
                    Staff Tasks
                  </Link>
                )}

                {/* Report Issue Action Button */}
                <Link
                  to="/report"
                  className="ml-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-semibold shadow-sm transition-all hover:shadow-glow"
                >
                  <PlusCircle className="w-4 h-4" />
                  Report Issue
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="ml-2 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-sm transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Right Controls: Demo Role Quick Switcher, Notification, User Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Quick Demo Switcher Button for Evaluation */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors shadow-sm"
                title="Quick demo role switcher for university evaluation"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
                <span className="hidden md:inline">Role:</span>
                <span className="font-bold text-white capitalize text-[11px] sm:text-xs truncate max-w-[80px] sm:max-w-none">
                  {user ? user.role : 'Demo'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {demoDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setDemoDropdownOpen(false)}
                >
                  <div className="px-2 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Role Switcher (Evaluation)
                  </div>
                  <div className="mt-1 space-y-1">
                    {DEMO_CREDENTIALS.map((demo) => (
                      <button
                        key={demo.role + demo.email}
                        onClick={() => handleDemoSwitch(demo.email)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          user?.email === demo.email 
                            ? 'bg-brand-600 text-white font-bold' 
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{demo.title}</div>
                          <div className="text-[10px] text-slate-400">{demo.label}</div>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          demo.role === 'admin' ? 'bg-purple-900 text-purple-200' :
                          demo.role === 'staff' ? 'bg-amber-900 text-amber-200' :
                          'bg-blue-900 text-blue-200'
                        }`}>
                          {demo.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <>
                {/* Notification Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {user?.unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-navy-900 animate-pulse">
                      {user.unreadNotifications}
                    </span>
                  )}
                </Link>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="User profile menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-600 border border-brand-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden lg:block text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                  </button>

                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-slate-800">
                        <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        <span className="mt-1 inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-900/80 text-brand-300 border border-brand-700">
                          {user?.role?.toUpperCase()}
                        </span>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Account Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-navy-800 bg-navy-950 px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'student' && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/my-complaints"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
                  >
                    My Complaints
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
                  >
                    Admin Overview
                  </Link>
                  <Link
                    to="/admin/complaints"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
                  >
                    Review & Assign Workspace
                  </Link>
                </>
              )}

              {user?.role === 'staff' && (
                <Link
                  to="/staff"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
                >
                  Staff Assigned Workspace
                </Link>
              )}

              <Link
                to="/report"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-bold bg-brand-600 text-white text-center"
              >
                + Report New Issue
              </Link>

              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
              >
                <span>Notifications</span>
                {user?.unreadNotifications > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-xs font-bold text-white">
                    {user.unreadNotifications}
                  </span>
                )}
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/5"
              >
                Account Settings ({user?.name})
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-400 hover:bg-rose-950/30"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-center rounded-lg text-sm font-medium text-slate-200 border border-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-center rounded-lg text-sm font-bold bg-brand-600 text-white"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
