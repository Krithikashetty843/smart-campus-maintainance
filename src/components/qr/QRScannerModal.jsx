import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  Upload,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Zap,
  Building,
  Layers,
  DoorClosed,
  Send,
  Image as ImageIcon,
  X,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Modal from '../common/Modal';
import PriorityBadge from '../common/PriorityBadge';
import StatusBadge from '../common/StatusBadge';
import { BUILDINGS, CATEGORIES, DEPARTMENTS } from '../../services/mockData';
import { calculatePriority } from '../../services/priorityCalculator';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const { user } = useAuth();
  const { complaints, submitComplaint } = useComplaints();

  const [scanMethod, setScanMethod] = useState('camera'); // 'camera' | 'upload' | 'simulate'
  const [errorMessage, setErrorMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const readerElementId = 'qr-reader-region-modal';

  // Default detected location (starter location or last scanned)
  const [detectedLocation, setDetectedLocation] = useState({
    dept: 'Computer Science & Engineering',
    bldg: 'Academic Block A (Turing Hall)',
    floor: '1st Floor',
    room: 'Room 101 - Lecture Hall A1',
    scannedAt: null,
    isVerified: true,
  });

  // Complaint Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [fileError, setFileError] = useState('');
  const [calculatedPriority, setCalculatedPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick preset rooms for hackathon simulation
  const simulationPresets = [
    {
      dept: 'Computer Science & Engineering',
      bldg: 'Academic Block A (Turing Hall)',
      floor: '1st Floor',
      room: 'Room 101 - Lecture Hall A1',
    },
    {
      dept: 'Electronics & Communication',
      bldg: 'Science Tower Block B',
      floor: 'Ground Floor',
      room: 'Room B-01 - VLSI Design Center',
    },
    {
      dept: 'Mechanical Engineering',
      bldg: 'Mechanical & Civil Workshop Block C',
      floor: 'Ground Floor',
      room: 'Room C-01 - CNC & Robotics Workshop',
    },
    {
      dept: 'Central Administration & Library',
      bldg: 'Central Library & Admin Complex',
      floor: '1st Floor',
      room: 'Room L-101 - Reference Section',
    },
  ];

  // Open complaints already existing in this specific room
  const openComplaintsInRoom = complaints.filter(
    (c) =>
      c.room?.toLowerCase() === detectedLocation.room?.toLowerCase() &&
      c.status !== 'Resolved' &&
      c.status !== 'Rejected'
  );

  // Real-time Priority Calculation
  useEffect(() => {
    const p = calculatePriority({
      category,
      room: detectedLocation.room,
      description,
      title,
      role: user?.role || 'Student',
    });
    setCalculatedPriority(p);
  }, [category, detectedLocation.room, description, title, user]);

  const handleScanPayload = (decodedText) => {
    try {
      let parsed = null;
      if (typeof decodedText === 'string' && decodedText.startsWith('{') && decodedText.endsWith('}')) {
        parsed = JSON.parse(decodedText);
      } else if (typeof decodedText === 'string' && decodedText.includes('room=')) {
        const url = new URL(decodedText.startsWith('http') ? decodedText : `https://campus.edu${decodedText}`);
        parsed = {
          dept: url.searchParams.get('dept') || 'Computer Science & Engineering',
          bldg: url.searchParams.get('bldg') || 'Academic Block A (Turing Hall)',
          floor: url.searchParams.get('floor') || '1st Floor',
          room: url.searchParams.get('room') || 'Room 101',
        };
      } else if (typeof decodedText === 'object') {
        parsed = decodedText;
      } else {
        parsed = {
          dept: 'Campus Facility',
          bldg: 'Main Campus',
          floor: '1st Floor',
          room: decodedText || 'Scanned Location',
        };
      }

      setDetectedLocation({
        dept: parsed.dept || 'Computer Science & Engineering',
        bldg: parsed.bldg || 'Academic Block A (Turing Hall)',
        floor: parsed.floor || '1st Floor',
        room: parsed.room || 'Room 101',
        scannedAt: new Date().toLocaleTimeString(),
        isVerified: true,
      });

      setErrorMessage('');
      if (onScanSuccess) {
        onScanSuccess(parsed);
      }
    } catch (e) {
      setErrorMessage(`Scanned payload: "${decodedText}" is not recognized.`);
    }
  };

  const startCamera = async () => {
    setErrorMessage('');
    setIsScanning(true);
    try {
      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          handleScanPayload(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.warn('Camera failed to start:', err);
      setErrorMessage('Camera access was blocked or is unavailable. Use "Simulate Scan" or "Upload Image".');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        // Ignore stop error
      }
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (isOpen && scanMethod === 'camera') {
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, scanMethod]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-region-modal-file');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScanPayload(decodedText);
    } catch (err) {
      setErrorMessage('No valid QR code was detected in the uploaded image.');
    }
  };

  const handleImageChange = (e) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid format. Only JPG, JPEG and PNG images are accepted.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Please fill in both the issue title and description.');
      return;
    }

    setIsSubmitting(true);
    const result = submitComplaint(
      {
        title: title.trim(),
        category,
        department: detectedLocation.dept,
        building: detectedLocation.bldg,
        floor: detectedLocation.floor,
        room: detectedLocation.room,
        description: description.trim(),
        image: imagePreview,
      },
      user
    );
    setIsSubmitting(false);

    if (result.success) {
      stopScanner();
      // Reset
      setTitle('');
      setDescription('');
      setImagePreview(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopScanner();
        onClose();
      }}
      title="Campus Room QR Scanner & Incident Reporter"
      maxWidth="max-w-5xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: SCANNER & DETECTED LOCATION INFO */}
        <div className="lg:col-span-5 space-y-4">
          {/* Scanner Header & Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setScanMethod('camera')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                scanMethod === 'camera'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Live Camera
            </button>
            <button
              type="button"
              onClick={() => {
                stopScanner();
                setScanMethod('upload');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                scanMethod === 'upload'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload QR
            </button>
            <button
              type="button"
              onClick={() => {
                stopScanner();
                setScanMethod('simulate');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                scanMethod === 'simulate'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Simulate
            </button>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Camera Viewfinder */}
          {scanMethod === 'camera' && (
            <div className="text-center space-y-2">
              <div className="relative mx-auto rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 aspect-square max-w-[260px] flex items-center justify-center shadow-inner">
                <div id={readerElementId} className="w-full h-full" />
                {!isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4">
                    <Camera className="w-8 h-8 mb-2 animate-pulse text-blue-400" />
                    <p className="text-xs">Initializing camera feed...</p>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Align campus room QR placard within frame. It will auto-detect instantly.
              </p>
            </div>
          )}

          {/* Upload File View */}
          {scanMethod === 'upload' && (
            <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl space-y-3 bg-slate-50">
              <div id="qr-reader-region-modal-file" className="hidden" />
              <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Upload Room QR Code Photo</p>
                <p className="text-[11px] text-slate-500">PNG, JPG or photograph of classroom door placard</p>
              </div>
              <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs cursor-pointer hover:bg-blue-700 transition">
                <span>Select QR File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Simulate Preset Locations */}
          {scanMethod === 'simulate' && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1-Click Room Simulator:
              </div>
              <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {simulationPresets.map((preset, idx) => {
                  const isCurrent = detectedLocation.room === preset.room;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleScanPayload(preset)}
                      className={`flex items-center justify-between p-2.5 text-left rounded-xl border transition ${
                        isCurrent
                          ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <MapPin className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-800 truncate">{preset.room}</div>
                          <div className="text-[10px] text-slate-400 truncate">{preset.bldg} • {preset.floor}</div>
                        </div>
                      </div>
                      {isCurrent ? (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
                          Selected
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                          Scan
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DETECTED LOCATION INFO CARD */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white shadow-lg space-y-2 border border-blue-800">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Verified QR Location
              </span>
              {detectedLocation.scannedAt && (
                <span className="text-[10px] text-blue-200 font-mono">
                  Scanned {detectedLocation.scannedAt}
                </span>
              )}
            </div>

            <div>
              <h4 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <DoorClosed className="w-4 h-4 text-amber-300" />
                {detectedLocation.room}
              </h4>
              <p className="text-xs text-blue-200 mt-0.5 flex items-center gap-1">
                <Building className="w-3 h-3" />
                {detectedLocation.bldg} • {detectedLocation.floor}
              </p>
              <p className="text-[11px] text-blue-300 mt-0.5">
                Department: {detectedLocation.dept}
              </p>
            </div>
          </div>

          {/* OPEN COMPLAINTS IN THIS ROOM */}
          {openComplaintsInRoom.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Existing Open Ticket in this Room ({openComplaintsInRoom.length})</span>
              </div>
              <p className="text-[11px] text-amber-800">
                An issue has already been reported in this location. Check below before submitting a duplicate:
              </p>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {openComplaintsInRoom.map((t) => (
                  <div key={t.id} className="p-2 bg-white rounded-lg border border-amber-200 text-[11px]">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>{t.title}</span>
                      <StatusBadge status={t.status} size="sm" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{t.id} • {t.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INTEGRATED COMPLAINT SUBMISSION FORM */}
        <div className="lg:col-span-7 bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                File Complaint for this Location
              </h4>
              <p className="text-xs text-slate-500">
                Report a maintenance fault directly for <strong>{detectedLocation.room}</strong>
              </p>
            </div>
            <PriorityBadge priority={calculatedPriority} size="md" />
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Complaint Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Projector HDMI not working or Air Conditioner leaking"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Issue Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Locked Verified Room */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Location (Auto-Locked)
                </label>
                <div className="text-xs p-2.5 bg-slate-100 rounded-xl border border-slate-200 font-semibold text-slate-800 flex items-center justify-between">
                  <span className="truncate">{detectedLocation.room}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description of the Fault <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe what is broken, symptoms, whether it affects classes or creates a safety hazard..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Photo Evidence Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Attach Photo Evidence (JPG, PNG, max 5MB)
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-900 max-h-36 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-36 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition text-center">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">Attach fault photo</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}

              {fileError && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{fileError}</p>
              )}
            </div>

            {/* Smart Priority Info */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 border border-blue-200 text-[11px] text-blue-900">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  Dynamic Priority: <strong>{calculatedPriority}</strong> (Evaluated from hazard triggers & room type)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  stopScanner();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Submitting Ticket...' : `Submit Ticket for ${detectedLocation.room}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
