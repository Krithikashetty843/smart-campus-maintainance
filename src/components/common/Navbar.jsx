import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Wrench,
  LogOut,
  RotateCcw,
  User,
  Shield,
  QrCode,
  FileText,
  Users,
  Menu,
  X,
  PlusCircle,
  ExternalLink,
  Zap,
  GraduationCap,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';

export default function Navbar({ onOpenNewComplaint, onOpenScanQR }) {
  const { user, login, logout, getDashboardPath } = useAuth();
  const { handleResetData, showToast } = useComplaints();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const switchPersonas = [
    { label: 'Admin (Arthur Vance)', email: 'admin@campus.edu', pass: 'Admin@123', role: 'Admin', icon: Shield, color: 'text-purple-600' },
    { label: 'Faculty (Dr. Robert Chen)', email: 'faculty.cs@campus.edu', pass: 'Faculty@123', role: 'Faculty', icon: GraduationCap, color: 'text-sky-600' },
    { label: 'Staff: Electrician (Marcus)', email: 'electrician@campus.edu', pass: 'Staff@123', role: 'Maintenance Staff', icon: Wrench, color: 'text-amber-600' },
    { label: 'Staff: Plumber (David)', email: 'plumber@campus.edu', pass: 'Staff@123', role: 'Maintenance Staff', icon: Wrench, color: 'text-blue-600' },
    { label: 'Student (Alex Morgan)', email: 'student@campus.edu', pass: 'Student@123', role: 'Student', icon: BookOpen, color: 'text-emerald-600' },
  ];

  const handleQuickSwitchRole = (p) => {
    setRoleSwitcherOpen(false);
    setMobileMenuOpen(false);
    const res = login(p.email, p.pass);
    if (res.success) {
      showToast(`Switched active persona to ${p.role} (${res.user.name})`, 'success');
      navigate(getDashboardPath(p.role));
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Faculty':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Maintenance Staff':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="relative">
                <Building2 className="w-5 h-5 text-white" />
                <Wrench className="w-3.5 h-3.5 text-amber-300 absolute -bottom-1 -right-1 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-blue-700 transition">
                  EduFix
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Campus
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Smart Campus Maintenance System
              </p>
            </div>
          </Link>

          {/* Center Navigation Links based on role */}
          <nav className="hidden md:flex items-center gap-1">
            {user?.role === 'Admin' && (
              <>
                <Link
                  to="/admin"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition"
                >
                  Overview & Analytics
                </Link>
                <Link
                  to="/admin/complaints"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition"
                >
                  Complaints Management
                </Link>
                <Link
                  to="/admin/users"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition"
                >
                  User Accounts
                </Link>
                <Link
                  to="/admin/qr"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition"
                >
                  QR Placards
                </Link>
              </>
            )}

            {user?.role === 'Faculty' && (
              <>
                <Link
                  to="/faculty"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition"
                >
                  Department Portal
                </Link>
                <Link
                  to="/admin/qr"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition"
                >
                  Classroom QR Codes
                </Link>
              </>
            )}

            {user?.role === 'Maintenance Staff' && (
              <Link
                to="/staff"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition"
              >
                My Work Orders
              </Link>
            )}

            {user?.role === 'Student' && (
              <Link
                to="/student"
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition"
              >
                Student Dashboard
              </Link>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Quick action buttons for students/faculty */}
            {(user?.role === 'Student' || user?.role === 'Faculty') && (
              <>
                {onOpenScanQR && (
                  <button
                    onClick={onOpenScanQR}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                    title="Scan Room QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>Scan QR</span>
                  </button>
                )}
                {onOpenNewComplaint && (
                  <button
                    onClick={onOpenNewComplaint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>New Ticket</span>
                  </button>
                )}
              </>
            )}

            {/* Quick Role Switcher Button for Testing */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs transition"
                title="Switch active role for testing"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Switch Role</span>
                <ChevronDown className="w-3 h-3 text-amber-600" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Test Persona:
                  </div>
                  {switchPersonas.map((p) => {
                    const Icon = p.icon;
                    const isCurrent = user?.email?.toLowerCase() === p.email.toLowerCase();
                    return (
                      <button
                        key={p.email}
                        onClick={() => handleQuickSwitchRole(p)}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-50 transition ${
                          isCurrent ? 'bg-blue-50/70 font-bold text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${p.color}`} />
                          <span className="truncate">{p.label}</span>
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-blue-600">Active</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Prototype Reset Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all campus complaints and user data to default demonstration state?')) {
                  handleResetData();
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
              />
              <div className="text-left hidden lg:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 leading-none">
                    {user?.name || 'User'}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${getRoleBadgeColor()}`}>
                    {user?.role}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 truncate block max-w-[120px]">
                  {user?.department || user?.specialization || user?.email}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-sm text-slate-900">{user?.name}</div>
              <div className="text-xs text-slate-500">{user?.email}</div>
              <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${getRoleBadgeColor()}`}>
                {user?.role}
              </span>
            </div>
          </div>

          <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Quick Role Switcher:
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              {switchPersonas.map((p) => (
                <button
                  key={p.email}
                  onClick={() => handleQuickSwitchRole(p)}
                  className="px-2 py-1 bg-white hover:bg-amber-100 rounded text-left border border-slate-200 text-slate-800 font-semibold truncate"
                >
                  {p.role.split(' ')[0]}: {p.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {user?.role === 'Admin' && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Admin Overview
                </Link>
                <Link
                  to="/admin/complaints"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Complaints Management
                </Link>
                <Link
                  to="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  User Accounts
                </Link>
                <Link
                  to="/admin/qr"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  QR Code System
                </Link>
              </>
            )}

            {user?.role === 'Faculty' && (
              <>
                <Link
                  to="/faculty"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Faculty Dashboard
                </Link>
                <Link
                  to="/admin/qr"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Generate QR Codes
                </Link>
              </>
            )}

            {user?.role === 'Student' && (
              <Link
                to="/student"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Student Dashboard
              </Link>
            )}

            {user?.role === 'Maintenance Staff' && (
              <Link
                to="/staff"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Staff Work Orders
              </Link>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-rose-600 hover:bg-rose-50 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
