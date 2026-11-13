import React, { useState } from 'react';
import {
  GraduationCap,
  PlusCircle,
  QrCode,
  Search,
  Filter,
  Clock,
  Wrench,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Building,
  Users,
  Eye,
  Sparkles,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatCard from '../../components/analytics/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import CategoryIcon from '../../components/common/CategoryIcon';
import ComplaintFormModal from '../../components/complaints/ComplaintFormModal';
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal';
import QRScannerModal from '../../components/qr/QRScannerModal';
import QRGeneratorModal from '../../components/qr/QRGeneratorModal';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { complaints } = useComplaints();

  // Modals
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [isScanQROpen, setIsScanQROpen] = useState(false);
  const [isQRGeneratorOpen, setIsQRGeneratorOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [qrScannedLocation, setQrScannedLocation] = useState(null);

  // Tabs: 'my' (complaints filed by this faculty) vs 'department' (all complaints in their department)
  const [activeTab, setActiveTab] = useState('department');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const myComplaints = complaints.filter(
    (c) =>
      c.submittedBy?.id === user?.id ||
      c.submittedBy?.email?.toLowerCase() === user?.email?.toLowerCase()
  );

  const deptComplaints = complaints.filter(
    (c) => c.department === user?.department
  );

  const displayedComplaints = (activeTab === 'my' ? myComplaints : deptComplaints).filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const deptPending = deptComplaints.filter((c) => c.status === 'Pending').length;
  const deptInProgress = deptComplaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length;
  const deptResolved = deptComplaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        onOpenNewComplaint={() => {
          setQrScannedLocation(null);
          setIsNewComplaintOpen(true);
        }}
        onOpenScanQR={() => setIsScanQROpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200 text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5 text-sky-300" />
                Faculty & Academic Operations
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user?.name || 'Faculty Member'}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl">
                Oversight of laboratory and classroom facilities for <strong>{user?.department}</strong>. Generate location QR codes for lecture rooms and escalate critical equipment faults.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setIsQRGeneratorOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur transition shadow-sm"
              >
                <QrCode className="w-4 h-4 text-amber-300" />
                Generate Room QR
              </button>
              <button
                onClick={() => {
                  setQrScannedLocation(null);
                  setIsNewComplaintOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-lg shadow-blue-500/30"
              >
                <PlusCircle className="w-4 h-4" />
                Log Faculty Complaint
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Department Issues"
            value={deptComplaints.length}
            subtitle={`In ${user?.department}`}
            icon={Building}
            color="blue"
          />
          <StatCard
            title="Department Pending"
            value={deptPending}
            subtitle="Needs admin/technician attention"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Under Active Repair"
            value={deptInProgress}
            subtitle="Technicians dispatched"
            icon={Wrench}
            color="indigo"
          />
          <StatCard
            title="Resolved in Dept"
            value={deptResolved}
            subtitle="Successfully verified"
            icon={CheckCircle2}
            color="emerald"
          />
        </div>

        {/* Complaints Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Header & Tabs */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('department')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'department'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Department Facilities ({deptComplaints.length})
              </button>
              <button
                onClick={() => setActiveTab('my')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                  activeTab === 'my'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Reported by Me ({myComplaints.length})
              </button>
            </div>

            {/* Search & Status Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search complaints..."
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
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {displayedComplaints.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No complaints in this view</p>
              <p className="text-xs text-slate-400">Everything in this category is currently clear.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Issue Title</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Reported By</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Technician</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {displayedComplaints.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-blue-50/30 transition cursor-pointer"
                      onClick={() => setSelectedComplaint(c)}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-blue-700">
                        {c.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 max-w-[200px] truncate">
                        {c.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold text-slate-800">{c.room}</span>
                        <div className="text-[10px] text-slate-400">{c.floor}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-medium">{c.submittedBy?.name}</span>
                        <div className="text-[10px] text-slate-400">{c.submittedBy?.role}</div>
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {c.assignedTo ? (
                          <span className="font-semibold text-slate-800">{c.assignedTo.name}</span>
                        ) : (
                          <span className="text-amber-600 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComplaint(c);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 font-semibold text-xs transition"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <ComplaintFormModal
        isOpen={isNewComplaintOpen}
        onClose={() => {
          setIsNewComplaintOpen(false);
          setQrScannedLocation(null);
        }}
        initialLocation={qrScannedLocation}
      />

      <QRScannerModal
        isOpen={isScanQROpen}
        onClose={() => setIsScanQROpen(false)}
        onScanSuccess={(loc) => {
          setQrScannedLocation(loc);
          setIsNewComplaintOpen(true);
        }}
      />

      <QRGeneratorModal
        isOpen={isQRGeneratorOpen}
        onClose={() => setIsQRGeneratorOpen(false)}
      />

      <ComplaintDetailModal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        complaint={selectedComplaint}
      />
    </div>
  );
}
