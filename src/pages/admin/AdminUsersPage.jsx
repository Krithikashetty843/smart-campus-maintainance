import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  GraduationCap,
  Wrench,
  BookOpen,
  Mail,
  Phone,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Modal from '../../components/common/Modal';
import { getUsers, addUser } from '../../services/storage';
import { DEPARTMENTS, CATEGORIES } from '../../services/mockData';
import { useComplaints } from '../../context/ComplaintContext';

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState(() => getUsers());
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { showToast } = useComplaints();

  // New user form state
  const [userRole, setUserRole] = useState('Faculty'); // 'Faculty' | 'Maintenance Staff'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Campus@123');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [specialization, setSpecialization] = useState(CATEGORIES[0]);
  const [phone, setPhone] = useState('');

  const refreshList = () => {
    setUsersList(getUsers());
  };

  const handleCreateUser = (e) => {
    e.preventDefault();

    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: userRole,
      phone: phone.trim(),
      department: department,
    };

    if (userRole === 'Maintenance Staff') {
      userData.specialization = specialization;
    }

    addUser(userData);
    refreshList();
    showToast(`New ${userRole} account created for ${name}!`, 'success');

    // Reset
    setName('');
    setEmail('');
    setPassword('Campus@123');
    setPhone('');
    setIsAddModalOpen(false);
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.studentId && u.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'Faculty':
        return <GraduationCap className="w-4 h-4 text-sky-600" />;
      case 'Maintenance Staff':
        return <Wrench className="w-4 h-4 text-amber-600" />;
      case 'Student':
      default:
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Campus User Account Management
            </h1>
            <p className="text-xs text-slate-500">
              Provision and manage Faculty, Maintenance Technicians, and Student profiles
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs shadow-md shadow-blue-500/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            Provision Faculty / Staff Account
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, email, roll number, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Roles ({usersList.length})</option>
              <option value="Student">Students ({usersList.filter(u => u.role === 'Student').length})</option>
              <option value="Faculty">Faculty ({usersList.filter(u => u.role === 'Faculty').length})</option>
              <option value="Maintenance Staff">Staff ({usersList.filter(u => u.role === 'Maintenance Staff').length})</option>
              <option value="Admin">Admins ({usersList.filter(u => u.role === 'Admin').length})</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department / Trade</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Account ID</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-xs border ${getRoleBadge(u.role)}`}>
                        {getRoleIcon(u.role)}
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-medium">{u.department || 'Campus Wide'}</span>
                      {u.specialization && (
                        <div className="text-[10px] text-amber-700 font-semibold">
                          Specialty: {u.specialization}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {u.phone || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {u.studentId || u.id}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision Faculty or Staff Account"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <p className="text-xs text-slate-500">
            Administrative provisioning: create institutional accounts for teaching faculty and campus maintenance personnel.
          </p>

          {/* Role selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUserRole('Faculty')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition ${
                  userRole === 'Faculty'
                    ? 'bg-sky-50 text-sky-700 border-sky-400 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Faculty Member
              </button>
              <button
                type="button"
                onClick={() => setUserRole('Maintenance Staff')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition ${
                  userRole === 'Maintenance Staff'
                    ? 'bg-amber-50 text-amber-800 border-amber-400 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Wrench className="w-4 h-4" /> Maintenance Staff
              </button>
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={userRole === 'Faculty' ? 'Dr. Jennifer West' : 'David Kumar'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institutional Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder={userRole === 'Faculty' ? 'jennifer@campus.edu' : 'dkumar@campus.edu'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-900"
              />
            </div>
          </div>

          {/* Department & Specialty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-900"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {userRole === 'Maintenance Staff' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Specialization <span className="text-rose-500">*</span>
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-900"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-900"
                />
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Temporary Initial Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 pr-10 p-2.5 bg-white text-slate-900"
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

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
