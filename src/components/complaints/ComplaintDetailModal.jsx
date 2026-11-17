import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  User,
  Wrench,
  Clock,
  Star,
  CheckCircle2,
  AlertTriangle,
  Upload,
  MessageSquare,
  FileCheck,
  Phone,
  Layers,
} from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';
import CategoryIcon from '../common/CategoryIcon';
import ComplaintTimeline from './ComplaintTimeline';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { getUsers, getComplaintReportCount, getComplaintReporters } from '../../services/storage';

export default function ComplaintDetailModal({
  isOpen,
  onClose,
  complaint,
  onOpenFeedback,
}) {
  const { user } = useAuth();
  const { updateComplaint, assignStaffToComplaint } = useComplaints();

  // Admin / Staff action states
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusRemark, setStatusRemark] = useState('');
  const [completionPhotoPreview, setCompletionPhotoPreview] = useState(null);
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  // Admin assign state
  const [selectedStaffId, setSelectedStaffId] = useState('');

  if (!complaint) return null;

  const allUsers = getUsers();
  const staffMembers = allUsers.filter(u => u.role === 'Maintenance Staff');
  const reportCount = getComplaintReportCount(complaint);
  const reporters = getComplaintReporters(complaint);
  const reportHistory = complaint.reports || [{
    submittedBy: complaint.submittedBy,
    reportedAt: complaint.createdAt,
  }];

  // Can this user modify status?
  const canModifyStatus =
    user?.role === 'Admin' ||
    (user?.role === 'Maintenance Staff' &&
      (!complaint.assignedTo || complaint.assignedTo.id === user.id || complaint.assignedTo.email === user.email));

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    if (!newStatus) return;

    const updates = {
      status: newStatus,
      statusNote: statusRemark.trim() || `Status updated to ${newStatus}.`,
      remarks: statusRemark.trim() ? `${complaint.remarks ? complaint.remarks + ' | ' : ''}${statusRemark.trim()}` : complaint.remarks,
    };

    if (newStatus === 'Resolved') {
      if (completionPhotoPreview) {
        updates.completionPhoto = completionPhotoPreview;
      }
      if (materialsUsed) {
        updates.materialsUsed = materialsUsed;
      }
      if (estimatedTime) {
        updates.estimatedTime = estimatedTime;
      }
    }

    updateComplaint(complaint.id, updates, user);
    setIsUpdatingStatus(false);
    setNewStatus('');
    setStatusRemark('');
    setCompletionPhotoPreview(null);
  };

  const handleAssignStaff = (e) => {
    e.preventDefault();
    const staff = staffMembers.find(s => s.id === selectedStaffId);
    if (!staff) return;

    assignStaffToComplaint(
      complaint.id,
      {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        specialization: staff.specialization,
        phone: staff.phone,
      },
      user
    );
    setSelectedStaffId('');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCompletionPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Complaint Ticket: ${complaint.id}`} maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Header Summary Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CategoryIcon category={complaint.category} className="w-5 h-5" />
              <h4 className="text-base font-bold text-slate-900">{complaint.title}</h4>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {complaint.room}, {complaint.building}
              </span>
              <span>Floor: {complaint.floor}</span>
              <span>Dept: {complaint.department}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <PriorityBadge priority={complaint.priority} size="md" />
            <StatusBadge status={complaint.status} size="md" />
          </div>
        </div>

        {/* Two-Column Grid: Details & Media */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Description & Symptoms
              </h5>
              <p className="text-sm text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* Submitter & Assigned Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="text-slate-400 font-medium flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Reported By
                </div>
                <div className="font-bold text-slate-800">{complaint.submittedBy?.name || 'Anonymous Student'}</div>
                <div className="text-slate-500">{complaint.submittedBy?.email}</div>
                <div className="text-[10px] text-slate-400">
                  {new Date(complaint.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="text-slate-400 font-medium flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5" /> Assigned Technician
                </div>
                {complaint.assignedTo ? (
                  <>
                    <div className="font-bold text-slate-800">{complaint.assignedTo.name}</div>
                    <div className="text-blue-600 font-medium">{complaint.assignedTo.specialization || 'General Maintenance'}</div>
                    {complaint.assignedTo.phone && (
                      <div className="text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {complaint.assignedTo.phone}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-amber-600 font-medium italic py-1">
                    Pending assignment by Admin
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-2">
              <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Reported by {reportCount} {reportCount === 1 ? 'student' : 'students'}
              </div>
              <div className="space-y-1.5">
                {reporters.map((reporter) => {
                  const report = reportHistory.find(
                    (entry) => entry.submittedBy?.id === reporter.id ||
                      entry.submittedBy?.email?.toLowerCase() === reporter.email?.toLowerCase()
                  );
                  return (
                    <div key={reporter.id || reporter.email} className="flex items-center justify-between gap-2 text-slate-700">
                      <span className="font-medium">{reporter.name || reporter.email}</span>
                      {report?.reportedAt && (
                        <time className="text-[10px] text-slate-500">
                          {new Date(report.reportedAt).toLocaleString()}
                        </time>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Technician Remarks & Work Summary */}
            {(complaint.remarks || complaint.materialsUsed || complaint.estimatedTime) && (
              <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl text-xs space-y-2">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  Technician Work Summary & Resolution Details
                </div>
                {complaint.remarks && (
                  <div>
                    <span className="font-semibold text-slate-700">Notes:</span> {complaint.remarks}
                  </div>
                )}
                {complaint.materialsUsed && (
                  <div>
                    <span className="font-semibold text-slate-700">Parts / Materials:</span> {complaint.materialsUsed}
                  </div>
                )}
                {complaint.estimatedTime && (
                  <div>
                    <span className="font-semibold text-slate-700">Time Taken:</span> {complaint.estimatedTime}
                  </div>
                )}
              </div>
            )}

            {/* Student Feedback & Star Rating */}
            {complaint.feedback ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Student Feedback & Verification
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= complaint.feedback.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-700 italic">"{complaint.feedback.comment}"</p>
                <div className="text-[10px] text-slate-400">
                  Submitted {new Date(complaint.feedback.submittedAt).toLocaleDateString()}
                </div>
              </div>
            ) : (
              complaint.status === 'Resolved' && user?.role === 'Student' && onOpenFeedback && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div className="text-xs text-amber-900">
                    <span className="font-bold">This issue is resolved!</span> How was the repair quality?
                  </div>
                  <button
                    onClick={() => onOpenFeedback(complaint)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold text-xs shadow-sm hover:bg-amber-700 transition"
                  >
                    <Star className="w-3.5 h-3.5" /> Rate Resolution
                  </button>
                </div>
              )
            )}
          </div>

          {/* Right Column: Photos & Verification */}
          <div className="space-y-4">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Reported Photo Evidence
              </h5>
              {complaint.image ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm max-h-48 flex items-center justify-center">
                  <img
                    src={complaint.image}
                    alt="Fault evidence"
                    className="max-h-48 w-full object-cover cursor-pointer hover:scale-105 transition"
                    onClick={() => window.open(complaint.image, '_blank')}
                    title="Click to view full photo"
                  />
                </div>
              ) : (
                <div className="h-28 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                  No initial photo attached
                </div>
              )}
            </div>

            {/* Completion Photo */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Work Completion Photo
              </h5>
              {complaint.completionPhoto ? (
                <div className="rounded-xl overflow-hidden border border-emerald-300 bg-slate-900 shadow-sm max-h-48 flex items-center justify-center">
                  <img
                    src={complaint.completionPhoto}
                    alt="Completion evidence"
                    className="max-h-48 w-full object-cover cursor-pointer hover:scale-105 transition"
                    onClick={() => window.open(complaint.completionPhoto, '_blank')}
                    title="Click to inspect repair proof"
                  />
                </div>
              ) : (
                <div className="h-24 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                  {complaint.status === 'Resolved' ? 'No repair photo uploaded' : 'Will be uploaded upon completion'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visual Lifecycle Stepper & Audit Log */}
        <div className="pt-4 border-t border-slate-200">
          <ComplaintTimeline timeline={complaint.timeline} currentStatus={complaint.status} />
        </div>

        {/* Admin Assignment Section */}
        {user?.role === 'Admin' && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-blue-600" /> Dispatch Maintenance Staff
            </h5>
            <form onSubmit={handleAssignStaff} className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                required
                className="flex-1 text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Technician (Specialization)...</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} — {staff.specialization || 'General'} ({staff.department})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!selectedStaffId}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition shrink-0"
              >
                Assign Work Order
              </button>
            </form>
          </div>
        )}

        {/* Staff / Admin Status Update Section */}
        {canModifyStatus && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-indigo-600" /> Technician Work Order Action
              </h5>
              <button
                onClick={() => setIsUpdatingStatus(!isUpdatingStatus)}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                {isUpdatingStatus ? 'Cancel' : 'Update Status / Log Work'}
              </button>
            </div>

            {isUpdatingStatus && (
              <form onSubmit={handleStatusSubmit} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      New Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      required
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose Status...</option>
                      <option value="In Progress">In Progress (Work Begun)</option>
                      <option value="Resolved">Resolved (Completed & Verified)</option>
                      <option value="Rejected">Rejected (Not Applicable / Duplicate)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estimated Repair Time (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1.5 Hours"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Technician Remarks / Work Done
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Details of repair, tests performed, breaker replaced..."
                    value={statusRemark}
                    onChange={(e) => setStatusRemark(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-900"
                  />
                </div>

                {newStatus === 'Resolved' && (
                  <div className="space-y-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1">
                        Materials / Parts Replaced
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 15m 4K HDMI Cable, 2x Brass Ball Valves"
                        value={materialsUsed}
                        onChange={(e) => setMaterialsUsed(e.target.value)}
                        className="w-full text-xs rounded-lg border border-emerald-300 p-2 bg-white text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1">
                        Upload Work Completion Proof Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="text-xs text-slate-600"
                      />
                      {completionPhotoPreview && (
                        <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-emerald-300">
                          <img
                            src={completionPhotoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUpdatingStatus(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                  >
                    Save Status Update
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
