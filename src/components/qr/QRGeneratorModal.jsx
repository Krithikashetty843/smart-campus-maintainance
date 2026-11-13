import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  QrCode,
  Download,
  Printer,
  CheckCircle2,
  Building,
  Layers,
  DoorClosed,
  Copy,
  ExternalLink,
} from 'lucide-react';
import Modal from '../common/Modal';
import { BUILDINGS, DEPARTMENTS } from '../../services/mockData';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';

export default function QRGeneratorModal({ isOpen, onClose, onGenerated }) {
  const { user } = useAuth();
  const { createNewQRCode } = useComplaints();

  // If faculty, default to their department
  const initialDept = user?.role === 'Faculty' ? user.department : DEPARTMENTS[0];
  const [selectedDept, setSelectedDept] = useState(initialDept);

  // Available buildings
  const [selectedBuilding, setSelectedBuilding] = useState(BUILDINGS[0].name);

  // Current building object
  const currentBuildingObj = BUILDINGS.find(b => b.name === selectedBuilding) || BUILDINGS[0];

  const [selectedFloor, setSelectedFloor] = useState(currentBuildingObj.floors[0] || 'Ground Floor');
  const [selectedRoom, setSelectedRoom] = useState(currentBuildingObj.rooms[0] || 'Room 101');
  const [customRoom, setCustomRoom] = useState('');
  const [isCustomRoom, setIsCustomRoom] = useState(false);

  const [generatedPayload, setGeneratedPayload] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const qrRef = useRef(null);

  const activeRoom = isCustomRoom ? (customRoom.trim() || 'Custom Room') : selectedRoom;

  // Change building updates floors and rooms
  const handleBuildingChange = (bldgName) => {
    setSelectedBuilding(bldgName);
    const b = BUILDINGS.find(item => item.name === bldgName);
    if (b) {
      setSelectedFloor(b.floors[0]);
      setSelectedRoom(b.rooms[0]);
      setIsCustomRoom(false);
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();

    const payload = {
      dept: selectedDept,
      bldg: selectedBuilding,
      floor: selectedFloor,
      room: activeRoom,
    };

    const qrDataString = JSON.stringify(payload);

    const newQR = createNewQRCode(
      {
        department: selectedDept,
        building: selectedBuilding,
        floor: selectedFloor,
        room: activeRoom,
        qrData: qrDataString,
      },
      user
    );

    setGeneratedPayload({
      ...payload,
      qrDataString,
      id: newQR.qr?.id || `QR-${Date.now()}`,
    });

    if (onGenerated) onGenerated(newQR.qr);
  };

  // Download QR as PNG
  const handleDownload = () => {
    const canvas = document.getElementById('qr-canvas-element');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QR_${selectedBuilding.replace(/\s+/g, '_')}_${activeRoom.replace(/\s+/g, '_')}.png`;
    link.href = url;
    link.click();
  };

  // Print QR badge
  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Campus Location QR Code" maxWidth="max-w-2xl">
      {!generatedPayload ? (
        <form onSubmit={handleGenerate} className="space-y-4">
          <p className="text-xs text-slate-500">
            Generate printable location QR codes. Affix these placards on classroom doors and laboratory walls so students and faculty can instantly report maintenance faults.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                disabled={user?.role === 'Faculty'}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {user?.role === 'Faculty' && (
                <p className="text-[11px] text-slate-400 mt-1">Locked to your designated department.</p>
              )}
            </div>

            {/* Building */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Building / Block
              </label>
              <select
                value={selectedBuilding}
                onChange={(e) => handleBuildingChange(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {BUILDINGS.map((bldg) => (
                  <option key={bldg.name} value={bldg.name}>
                    {bldg.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Floor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Floor Level
              </label>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {currentBuildingObj.floors.map((floor) => (
                  <option key={floor} value={floor}>
                    {floor}
                  </option>
                ))}
              </select>
            </div>

            {/* Room / Classroom */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Room / Facility Name
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomRoom(!isCustomRoom)}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  {isCustomRoom ? 'Pick from List' : '+ Custom Room'}
                </button>
              </div>

              {!isCustomRoom ? (
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  {currentBuildingObj.rooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Lab 404 - High Voltage Test Bench"
                  value={customRoom}
                  onChange={(e) => setCustomRoom(e.target.value)}
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition"
            >
              <QrCode className="w-4 h-4" />
              Generate QR Placard
            </button>
          </div>
        </form>
      ) : (
        /* Generated Result Card */
        <div className="space-y-6">
          <div className="printable-area bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl border-2 border-slate-700 shadow-xl flex flex-col md:flex-row items-center gap-6">
            {/* QR Canvas */}
            <div className="bg-white p-3 rounded-xl shadow-lg shrink-0">
              <QRCodeCanvas
                id="qr-canvas-element"
                value={generatedPayload.qrDataString}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Placard Information */}
            <div className="space-y-2 text-center md:text-left flex-1">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold tracking-wider uppercase">
                Official Campus QR Placard
              </div>
              <h4 className="text-xl font-extrabold text-white tracking-tight">
                {generatedPayload.room}
              </h4>
              <p className="text-xs text-slate-300">
                {generatedPayload.bldg} • {generatedPayload.floor}
              </p>
              <p className="text-[11px] text-slate-400">
                Dept: {generatedPayload.dept}
              </p>
              <div className="pt-2 text-[11px] text-emerald-400 font-medium flex items-center justify-center md:justify-start gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Scan using camera to report maintenance faults immediately
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={() => setGeneratedPayload(null)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              ← Generate Another
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition"
              >
                <Download className="w-4 h-4 text-blue-600" />
                Download PNG
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow transition"
              >
                <Printer className="w-4 h-4" />
                Print Placard
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
