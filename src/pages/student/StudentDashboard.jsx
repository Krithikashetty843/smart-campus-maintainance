import React, { useState } from 'react';
import {
  PlusCircle,
  QrCode,
  Search,
  Filter,
  Clock,
  Wrench,
  CheckCircle2,
  FileText,
  AlertCircle,
  Eye,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Star,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatCard from '../../components/analytics/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import CategoryIcon from '../../components/common/CategoryIcon';
import ComplaintFormModal from '../../components/complaints/ComplaintFormModal';
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal';
import FeedbackModal from '../../components/complaints/FeedbackModal';
import QRScannerModal from '../../components/qr/QRScannerModal';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { complaints } = useComplaints();

  // Modals
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [isScanQROpen, setIsScanQROpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [feedbackComplaint, setFeedbackComplaint] = useState(null);
  const [qrScannedLocation, setQrScannedLocation] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Filter complaints submitted by this student (or related demo student)
  const myComplaints = complaints.filter(
    (c) =>
      c.submittedBy?.id === user?.id ||
      c.submittedBy?.email?.toLowerCase() === user?.email?.toLowerCase()
  );

  // Metrics
  const totalMyComplaints = myComplaints.length;
  const pendingCount = myComplaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = myComplaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'Assigned'
  ).length;
  const resolvedCount = myComplaints.filter((c) => c.status === 'Resolved').length;

  // Filtered list
  const filteredComplaints = myComplaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleQRScanSuccess = (locationData) => {
    setQrScannedLocation(locationData);
    setIsNewComplaintOpen(true);
  };

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
        {/* Welcome Banner & Student Profile */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                Student Facility Support Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name || 'Student'}!
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl">
                Notice a fault in your lecture hall, lab, or hostel? Report it instantly using quick QR codes or the complaint form to notify maintenance technicians.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-blue-200">
                <span><strong>Roll No:</strong> {user?.studentId || 'STU-2024-8841'}</span>
                <span>•</span>
                <span><strong>Dept:</strong> {user?.department}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setIsScanQROpen(true)}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur transition shadow-sm"
              >
                <QrCode className="w-4 h-4 text-amber-300" />
                Scan Room QR
              </button>
              <button
                onClick={() => {
                  setQrScannedLocation(null);
                  setIsNewComplaintOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs transition shadow-lg shadow-blue-500/30"
              >
                <PlusCircle className="w-4 h-4" />
                Submit New Complaint
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Complaints"
            value={totalMyComplaints}
            subtitle="Tickets submitted by you"
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Pending Review"
            value={pendingCount}
            subtitle="Awaiting technician assignment"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="In Progress / Assigned"
            value={inProgressCount}
            subtitle="Technician dispatched on site"
            icon={Wrench}
            color="indigo"
          />
          <StatCard
            title="Resolved Issues"
            value={resolvedCount}
            subtitle="Completed & verified fixes"
            icon={CheckCircle2}
            color="emerald"
          />
        </div>

        {/* Complaints History Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Header & Controls */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                My Maintenance Complaints History
              </h3>
              <p className="text-xs text-slate-500">
                Track real-time status, technician assignments, remarks and resolution proofs
              </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by ticket ID, room, or title..."
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

          {/* Table / List View */}
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No complaints found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {myComplaints.length === 0
                  ? "You haven't filed any maintenance requests yet. Use 'Submit New Complaint' or 'Scan QR' to report an issue."
                  : 'No tickets matched your filter criteria. Try resetting your search.'}
              </p>
              {myComplaints.length === 0 && (
                <button
                  onClick={() => setIsNewComplaintOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Submit Your First Complaint
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Issue Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Tech</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredComplaints.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-blue-50/30 transition cursor-pointer"
                      onClick={() => setSelectedComplaint(c)}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-blue-700">
                        {c.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 max-w-[220px] truncate">
                        {c.title}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <CategoryIcon category={c.category} className="w-3.5 h-3.5" />
                          <span>{c.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                        <span className="font-semibold text-slate-800">{c.room}</span>
                        <div className="text-[10px] text-slate-400">{c.building}</div>
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {c.assignedTo ? (
                          <div>
                            <span className="font-semibold text-slate-800">{c.assignedTo.name}</span>
                            <div className="text-[10px] text-blue-600">{c.assignedTo.specialization}</div>
                          </div>
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 font-semibold text-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
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
        onScanSuccess={handleQRScanSuccess}
      />

      <ComplaintDetailModal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        complaint={selectedComplaint}
        onOpenFeedback={(comp) => {
          setSelectedComplaint(null);
          setFeedbackComplaint(comp);
        }}
      />

      <FeedbackModal
        isOpen={!!feedbackComplaint}
        onClose={() => setFeedbackComplaint(null)}
        complaint={feedbackComplaint}
      />
    </div>
  );
}
