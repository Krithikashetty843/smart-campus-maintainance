import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Phone,
  Search,
  Check,
  Play,
  FileCheck,
  Eye,
  Sparkles,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatCard from '../../components/analytics/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import CategoryIcon from '../../components/common/CategoryIcon';
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { getComplaintReportCount } from '../../services/storage';

export default function StaffDashboard() {
  const { user } = useAuth();
  const { complaints, updateComplaint } = useComplaints();

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Maintenance staff work orders: complaints assigned to them, or unassigned complaints matching their specialization!
  const myWorkOrders = complaints.filter(
    (c) =>
      c.assignedTo?.id === user?.id ||
      c.assignedTo?.email?.toLowerCase() === user?.email?.toLowerCase() ||
      (!c.assignedTo && c.category === user?.specialization)
  );

  const assignedCount = myWorkOrders.filter((c) => c.status === 'Assigned' || c.status === 'Pending').length;
  const inProgressCount = myWorkOrders.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = myWorkOrders.filter((c) => c.status === 'Resolved').length;

  const filteredOrders = myWorkOrders.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.room.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleQuickStatusChange = (complaint, newStatus, e) => {
    e.stopPropagation();

    const updates = {
      status: newStatus,
      statusNote: `Technician ${user?.name} marked work as ${newStatus}.`,
    };

    if (!complaint.assignedTo) {
      updates.assignedTo = {
        id: user.id,
        name: user.name,
        email: user.email,
        specialization: user.specialization,
        phone: user.phone,
      };
    }

    updateComplaint(complaint.id, updates, user);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-semibold">
                <Wrench className="w-3.5 h-3.5 text-amber-300" />
                Technician Field Operations Console
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user?.name || 'Maintenance Specialist'}
              </h1>
              <p className="text-sm text-slate-300 max-w-xl">
                Trade Specialty: <strong className="text-amber-300">{user?.specialization || 'General Campus Maintenance'}</strong>. Check and manage active work orders, record parts used, and upload completion photos.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/10 text-center shrink-0">
              <span className="text-xs text-slate-300 uppercase tracking-wider font-bold">Today's Active Load</span>
              <div className="text-3xl font-extrabold text-amber-300 mt-0.5">
                {assignedCount + inProgressCount}
              </div>
              <span className="text-[11px] text-slate-400">Tickets in queue</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Pending Dispatch / Assigned"
            value={assignedCount}
            subtitle="Requires on-site inspection"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Work In Progress"
            value={inProgressCount}
            subtitle="Currently under active repair"
            icon={Wrench}
            color="indigo"
          />
          <StatCard
            title="Completed Work Orders"
            value={resolvedCount}
            subtitle="Resolved and certified"
            icon={CheckCircle2}
            color="emerald"
          />
        </div>

        {/* Work Orders List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Header & Controls */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                Assigned Work Orders
              </h3>
              <p className="text-xs text-slate-500">
                Click on any work order to view details, update repair notes, or upload proof photos.
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search work orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 p-2 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Work Orders</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No active work orders</p>
              <p className="text-xs text-slate-400">All tasks in your queue have been completed or none are currently assigned.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedComplaint(order)}
                  className="p-5 hover:bg-slate-50/80 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {order.id}
                      </span>
                      <PriorityBadge priority={order.priority} />
                      <StatusBadge status={order.status} />
                      <span className="text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition">
                      {order.title}
                    </h4>
                    {getComplaintReportCount(order) > 1 && (
                      <div className="text-[10px] font-semibold text-indigo-600">
                        Reported by {getComplaintReportCount(order)} students
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {order.room}, {order.building}
                      </span>
                      <span>Floor: {order.floor}</span>
                      <span>Category: {order.category}</span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">
                      {order.description}
                    </p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    {order.status !== 'In Progress' && order.status !== 'Resolved' && (
                      <button
                        onClick={(e) => handleQuickStatusChange(order, 'In Progress', e)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold text-xs border border-indigo-200 transition"
                      >
                        <Play className="w-3.5 h-3.5" /> Start Work
                      </button>
                    )}

                    {order.status === 'In Progress' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComplaint(order);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-sm transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Resolved
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComplaint(order);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail & Work Log Modal */}
      <ComplaintDetailModal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        complaint={selectedComplaint}
      />
    </div>
  );
}
