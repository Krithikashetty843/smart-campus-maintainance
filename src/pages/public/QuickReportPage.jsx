import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Building2, Wrench, QrCode, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ComplaintFormModal from '../../components/complaints/ComplaintFormModal';

export default function QuickReportPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const dept = searchParams.get('dept') || 'Computer Science & Engineering';
  const bldg = searchParams.get('bldg') || 'Academic Block A (Turing Hall)';
  const floor = searchParams.get('floor') || '1st Floor';
  const room = searchParams.get('room') || 'Room 101';

  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setIsFormOpen(true);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl mb-3">
          <QrCode className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">QR Code Location Detected</h2>
        <p className="mt-1 text-xs text-slate-300">
          Smart Campus Instant Fault Reporter
        </p>

        <div className="mt-6 bg-white p-6 rounded-2xl shadow-xl text-left space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Target Facility
            </span>
            <h3 className="text-base font-bold text-slate-900">{room}</h3>
            <p className="text-xs text-slate-600">{bldg} • {floor}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{dept}</p>
          </div>

          {user ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                You are logged in as <strong>{user.name}</strong> ({user.role}).
              </p>
              <button
                onClick={() => setIsFormOpen(true)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Proceed to Submit Complaint for {room}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Sign in with your campus student or faculty account to log this incident.
              </p>
              <Link
                to={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Sign In to File Complaint <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <ComplaintFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          if (user) {
            navigate(user.role === 'Admin' ? '/admin' : user.role === 'Faculty' ? '/faculty' : user.role === 'Maintenance Staff' ? '/staff' : '/student');
          }
        }}
        initialLocation={{ dept, bldg, floor, room }}
      />
    </div>
  );
}
