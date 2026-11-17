import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Wrench,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  GraduationCap,
  Users,
  BookOpen,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';

export default function LoginPage() {
  const { login, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTarget = new URLSearchParams(location.search).get('redirect');

  const getSafeRedirectPath = (role) => {
    if (redirectTarget && redirectTarget.startsWith('/')) {
      return redirectTarget;
    }
    return getDashboardPath(role);
  };

  const [selectedRoleTab, setSelectedRoleTab] = useState('Admin');
  const [email, setEmail] = useState('admin@campus.edu');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);

  const roleProfiles = {
    Admin: {
      title: 'Campus Administrator',
      email: 'admin@campus.edu',
      pass: 'Admin@123',
      name: 'Dr. Arthur Vance',
      badge: 'Full Oversight & Dispatch',
      desc: 'Access analytics, dispatch technicians, manage campus QR placards, and provision users.',
      icon: Shield,
      color: 'purple',
    },
    Faculty: {
      title: 'Teaching Faculty',
      email: 'faculty.cs@campus.edu',
      pass: 'Faculty@123',
      name: 'Dr. Robert Chen (CS Dept)',
      badge: 'Lab & Dept Oversight',
      desc: 'Generate classroom QR placards, track departmental lab equipment, and escalate issues.',
      icon: GraduationCap,
      color: 'sky',
    },
    'Maintenance Staff': {
      title: 'Maintenance Technician',
      email: 'electrician@campus.edu',
      pass: 'Staff@123',
      name: 'Marcus Vance (Electrician)',
      badge: 'Work Orders & Field Fixes',
      desc: 'Inspect assigned faults, advance ticket status, record materials, and upload completion photos.',
      icon: Wrench,
      color: 'amber',
    },
    Student: {
      title: 'Campus Student',
      email: 'student@campus.edu',
      pass: 'Student@123',
      name: 'Alex Morgan (STU-2024-8841)',
      badge: 'Fault Reporting & QRs',
      desc: 'Scan classroom QR codes, submit maintenance tickets, view audit logs, and rate repairs.',
      icon: BookOpen,
      color: 'emerald',
    },
  };

  const handleSelectRoleTab = (roleKey) => {
    setSelectedRoleTab(roleKey);
    const profile = roleProfiles[roleKey];
    setEmail(profile.email);
    setPassword(profile.pass);
    setError('');
  };

  const handleQuickLoginRole = (roleKey) => {
    const profile = roleProfiles[roleKey];
    setEmail(profile.email);
    setPassword(profile.pass);
    setError('');

    const res = login(profile.email, profile.pass);
    if (res.success) {
      navigate(getSafeRedirectPath(res.user.role), { replace: true });
    } else {
      setError(res.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = login(email, password);
    setLoading(false);

    if (res.success) {
      navigate(getSafeRedirectPath(res.user.role), { replace: true });
    } else {
      setError(res.message);
    }
  };

  const currentProfile = roleProfiles[selectedRoleTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/25 mb-3 ring-4 ring-white/10">
          <div className="relative">
            <Building2 className="w-8 h-8 text-white" />
            <Wrench className="w-5 h-5 text-amber-300 absolute -bottom-1.5 -right-1.5 stroke-[2.5]" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          EduFix Smart Campus Maintenance
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-300">
          Integrated Portal for Students, Teaching Faculty, Technicians & Administration
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl border border-slate-100 sm:px-10 space-y-6">
          {/* Prominent Role Selector Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Select Portal Access Role:
              </label>
              <span className="text-[11px] text-blue-600 font-semibold">
                Click any role to auto-fill
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.keys(roleProfiles).map((roleKey) => {
                const item = roleProfiles[roleKey];
                const Icon = item.icon;
                const isSelected = selectedRoleTab === roleKey;

                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleSelectRoleTab(roleKey)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold leading-tight">{roleKey}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Role Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{currentProfile.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {currentProfile.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentProfile.desc}
              </p>
              <div className="text-[11px] text-slate-500 pt-1">
                Demo Account: <strong className="text-slate-800 font-mono">{currentProfile.email}</strong> (User: {currentProfile.name})
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleQuickLoginRole(selectedRoleTab)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm hover:shadow transition shrink-0 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              1-Click Login
            </button>
          </div>

          {/* Standard Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 bg-slate-50/50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordModal(true)}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-10 py-2.5 bg-slate-50/50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                {loading ? 'Authenticating...' : `Sign In as ${selectedRoleTab}`}
              </button>
            </div>
          </form>

          {/* Additional Technician Credentials Selector */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 block mb-2">
              Specialized Maintenance Technicians for Testing:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setSelectedRoleTab('Maintenance Staff');
                  setEmail('electrician@campus.edu');
                  setPassword('Staff@123');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition"
              >
                <div className="font-bold text-slate-800">⚡ Electrician</div>
                <div className="text-[10px] text-slate-400 truncate">Marcus Vance</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoleTab('Maintenance Staff');
                  setEmail('plumber@campus.edu');
                  setPassword('Staff@123');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left transition"
              >
                <div className="font-bold text-slate-800">💧 Plumber</div>
                <div className="text-[10px] text-slate-400 truncate">David Gomez</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoleTab('Maintenance Staff');
                  setEmail('network@campus.edu');
                  setPassword('Staff@123');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-left transition"
              >
                <div className="font-bold text-slate-800">🌐 Network Tech</div>
                <div className="text-[10px] text-slate-400 truncate">Aiden Patel</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoleTab('Maintenance Staff');
                  setEmail('facilities@campus.edu');
                  setPassword('Staff@123');
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition"
              >
                <div className="font-bold text-slate-800">🛠️ General/Doors</div>
                <div className="text-[10px] text-slate-400 truncate">Elena Rostova</div>
              </button>
            </div>
          </div>

          {/* Student Registration Link */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need a student account?</span>
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Student Registration Portal →
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotPasswordModal}
        onClose={() => setForgotPasswordModal(false)}
        title="Prototype Password Recovery Guidance"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2 text-blue-900">
            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Prototype Authentication System</p>
              <p className="mt-0.5">
                All accounts are stored in your browser's LocalStorage for instant hackathon demonstration.
              </p>
            </div>
          </div>

          <div>
            <h6 className="font-bold text-slate-800 mb-1">Standard Demo Credentials:</h6>
            <ul className="space-y-1 list-disc pl-4 text-slate-600">
              <li><strong>Admin:</strong> admin@campus.edu / Admin@123</li>
              <li><strong>Faculty:</strong> faculty.cs@campus.edu / Faculty@123</li>
              <li><strong>Staff (Electrical):</strong> electrician@campus.edu / Staff@123</li>
              <li><strong>Staff (Plumbing):</strong> plumber@campus.edu / Staff@123</li>
              <li><strong>Student:</strong> student@campus.edu / Student@123</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setForgotPasswordModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
