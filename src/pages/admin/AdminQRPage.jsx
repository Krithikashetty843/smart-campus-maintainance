import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  PlusCircle,
  Download,
  Printer,
  Trash2,
  Search,
  Building,
  Layers,
  DoorClosed,
  CheckCircle2,
  ExternalLink,
  Zap,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import QRGeneratorModal from '../../components/qr/QRGeneratorModal';
import Modal from '../../components/common/Modal';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';
import { BUILDINGS } from '../../services/mockData';

export default function AdminQRPage() {
  const { qrCodes, removeQRCode } = useComplaints();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('ALL');

  const filteredQRs = qrCodes.filter((qr) => {
    const matchesSearch =
      qr.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBuilding = buildingFilter === 'ALL' || qr.building === buildingFilter;
    return matchesSearch && matchesBuilding;
  });

  const handleDownloadSingle = (qr) => {
    const canvas = document.getElementById(`qr-code-canvas-${qr.id}`);
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QR_${qr.building.replace(/\s+/g, '_')}_${qr.room.replace(/\s+/g, '_')}.png`;
    link.href = url;
    link.click();
  };

  const handlePrintPlacards = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Campus QR Code Location Placards
            </h1>
            <p className="text-xs text-slate-500">
              Manage physical room placards for quick mobile fault reporting across {qrCodes.length} campus facilities
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPlacards}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-sm transition"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              Print Sticker Sheet
            </button>
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs shadow-md shadow-blue-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Generate New Room QR
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by room name, lab title, or building..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
        </div>

        {/* QR Placards Grid */}
        <div className="printable-area grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQRs.map((qr) => (
            <div
              key={qr.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {qr.id}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                    {qr.room}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {qr.building} • {qr.floor}
                  </p>
                </div>

                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0">
                  <QRCodeCanvas
                    id={`qr-code-canvas-${qr.id}`}
                    value={qr.qrData}
                    size={72}
                    level="M"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 flex items-center justify-between">
                <span>Dept: {qr.department.split('&')[0]}</span>
                <span>{new Date(qr.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Action Buttons */}
              <div className="no-print pt-1 flex items-center justify-between gap-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedQR(qr)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View Large
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownloadSingle(qr)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    title="Download QR PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete QR code for ${qr.room}?`)) {
                        removeQRCode(qr.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete QR"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Large Placard View Modal */}
      <Modal
        isOpen={!!selectedQR}
        onClose={() => setSelectedQR(null)}
        title="Campus Location QR Placard"
        maxWidth="max-w-lg"
      >
        {selectedQR && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-6 rounded-2xl border-2 border-slate-700 text-center space-y-4 shadow-xl">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
                Official Campus Room Placard
              </div>

              <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mx-auto">
                <QRCodeCanvas
                  value={selectedQR.qrData}
                  size={190}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white">{selectedQR.room}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  {selectedQR.building} • {selectedQR.floor}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Department: {selectedQR.department}
                </p>
              </div>

              <div className="text-[11px] text-emerald-400 font-medium">
                Scan with any camera or the EduFix app to report faults in this room.
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setSelectedQR(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadSingle(selectedQR)}
                  className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  Download PNG
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  Print Placard
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <QRGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
      />
    </div>
  );
}
