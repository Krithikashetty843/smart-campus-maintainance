import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  QrCode,
  Flame,
  ArrowRight,
  TrendingUp,
  Percent,
  Sparkles,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import StatCard from '../../components/analytics/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import {
  CategoryBarChart,
  StatusDonutChart,
  BuildingBarChart,
} from '../../components/analytics/AnalyticsCharts';
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { complaints, stats } = useComplaints();
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Critical unassigned tickets requiring immediate dispatcher attention
  const urgentTickets = complaints.filter(
    (c) =>
      (c.priority === 'Critical' || c.priority === 'High') &&
      c.status !== 'Resolved' &&
      !c.assignedTo
  );

  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Admin Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5 text-purple-300" />
                Campus Administration Operations Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Campus Maintenance Overview
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl">
                Real-time incident response, technician dispatching, campus infrastructure analytics, and QR location management.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/admin/complaints"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur transition"
              >
                <FileText className="w-4 h-4 text-blue-300" />
                Manage Tickets
              </Link>
              <Link
                to="/admin/qr"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
              >
                <QrCode className="w-4 h-4" />
                Room QR System
              </Link>
            </div>
          </div>
        </div>

        {/* Critical Alerts Banner (If any high priority unassigned) */}
        {urgentTickets.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                <Flame className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900">
                  {urgentTickets.length} Critical / High Severity Issue{urgentTickets.length > 1 ? 's' : ''} Awaiting Dispatch!
                </h4>
                <p className="text-xs text-rose-700">
                  Campus hazards reported without assigned maintenance technician.
                </p>
              </div>
            </div>
            <Link
              to="/admin/complaints?filter=urgent"
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-sm transition shrink-0"
            >
              Dispatch Now →
            </Link>
          </div>
        )}

        {/* Top KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Complaints"
            value={stats.total}
            subtitle="Campus wide logged"
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            subtitle="Require technician assignment"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="In Active Repair"
            value={stats.inProgress + stats.assigned}
            subtitle="Assigned or work begun"
            icon={Wrench}
            color="indigo"
          />
          <StatCard
            title="Resolution Rate"
            value={`${stats.resolutionRate}%`}
            subtitle={`${stats.resolved} of ${stats.total} resolved`}
            icon={Percent}
            color="emerald"
          />
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CategoryBarChart complaints={complaints} />
          </div>
          <div>
            <StatusDonutChart complaints={complaints} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <BuildingBarChart complaints={complaints} />
          </div>

          {/* Recent Complaints Feed */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Recent Campus Incidents</h4>
                <p className="text-xs text-slate-500">Live feed of newest reported maintenance issues</p>
              </div>
              <Link
                to="/admin/complaints"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
              >
                View All ({complaints.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/80 rounded-lg px-2 -mx-2 transition cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700">{c.id}</span>
                      <PriorityBadge priority={c.priority} />
                      <span className="text-[11px] text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800">{c.title}</div>
                    <div className="text-[11px] text-slate-500">
                      {c.room} • {c.building}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={c.status} />
                    <span className="text-xs text-blue-600 font-semibold hover:underline hidden sm:inline">
                      Inspect
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
