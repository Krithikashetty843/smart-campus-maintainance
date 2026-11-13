import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Wrench,
  AlertTriangle,
  MapPin,
  Calendar,
  CheckCircle2,
  X,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import CategoryIcon from '../../components/common/CategoryIcon';
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal';
import { CATEGORIES, BUILDINGS, PRIORITIES } from '../../services/mockData';
import { useComplaints } from '../../context/ComplaintContext';

export default function AdminComplaintsPage() {
  const { complaints } = useComplaints();
  const [searchParams] = useSearchParams();

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [buildingFilter, setBuildingFilter] = useState('ALL');

  useEffect(() => {
    if (searchParams.get('filter') === 'urgent') {
      setPriorityFilter('Critical');
      setStatusFilter('ALL');
    }
  }, [searchParams]);

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.submittedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesPriority =
      priorityFilter === 'ALL' ||
      (priorityFilter === 'Critical' ? (c.priority === 'Critical' || c.priority === 'High') : c.priority === priorityFilter);
    const matchesBuilding = buildingFilter === 'ALL' || c.building === buildingFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesBuilding;
  });

  const exportToCSV = () => {
    const headers = ['Ticket ID', 'Title', 'Category', 'Priority', 'Status', 'Building', 'Floor', 'Room', 'Reported By', 'Assigned To', 'Date'];
    const rows = filteredComplaints.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.status,
      `"${c.building}"`,
      c.floor,
      `"${c.room}"`,
      `"${c.submittedBy?.name || 'N/A'}"`,
      `"${c.assignedTo?.name || 'Unassigned'}"`,
      new Date(c.createdAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_maintenance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setPriorityFilter('ALL');
    setBuildingFilter('ALL');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Campus Complaints Management
            </h1>
            <p className="text-xs text-slate-500">
              Manage {complaints.length} tickets across campus buildings, labs and classrooms
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-sm transition"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Export to CSV
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by ticket ID, room, issue title, or student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quick dropdown filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="Critical">Critical & High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Buildings</option>
                {BUILDINGS.map((b) => (
                  <option key={b.name} value={b.name}>{b.name.split('(')[0]}</option>
                ))}
              </select>

              {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL' || buildingFilter !== 'ALL') && (
                <button
                  onClick={handleResetFilters}
                  className="p-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1"
                  title="Clear all filters"
                >
                  <X className="w-4 h-4" /> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Showing {filteredComplaints.length} of {complaints.length} complaints</span>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No matching complaints found</p>
              <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Issue Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reporter</th>
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
                      <td className="py-3 px-4 font-medium text-slate-800 max-w-[200px] truncate">
                        {c.title}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <CategoryIcon category={c.category} className="w-3.5 h-3.5" />
                          <span>{c.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold text-slate-800">{c.room}</span>
                        <div className="text-[10px] text-slate-400">{c.building.split('(')[0]}</div>
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span>{c.submittedBy?.name || 'Anonymous'}</span>
                        <div className="text-[10px] text-slate-400">{c.submittedBy?.role}</div>
                      </td>
                      <td className="py-3 px-4">
                        {c.assignedTo ? (
                          <div>
                            <span className="font-semibold text-slate-800">{c.assignedTo.name}</span>
                            <div className="text-[10px] text-blue-600">{c.assignedTo.specialization}</div>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComplaint(c);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold text-xs transition"
                        >
                          Manage
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

      <ComplaintDetailModal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        complaint={selectedComplaint}
      />
    </div>
  );
}
