import React, { useState, useEffect } from 'react';
import {
  Upload,
  AlertTriangle,
  Image as ImageIcon,
  X,
  Send,
  Building,
  Layers,
  DoorClosed,
  Sparkles,
} from 'lucide-react';
import Modal from '../common/Modal';
import PriorityBadge from '../common/PriorityBadge';
import { CATEGORIES, DEPARTMENTS, BUILDINGS } from '../../services/mockData';
import { calculatePriority } from '../../services/priorityCalculator';
import { useComplaints } from '../../context/ComplaintContext';
import { useAuth } from '../../context/AuthContext';

export default function ComplaintFormModal({ isOpen, onClose, initialLocation = null, onSuccess }) {
  const { user } = useAuth();
  const { submitComplaint } = useComplaints();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [department, setDepartment] = useState(
    initialLocation?.dept || user?.department || DEPARTMENTS[0]
  );
  const [building, setBuilding] = useState(
    initialLocation?.bldg || BUILDINGS[0].name
  );
  const [floor, setFloor] = useState(initialLocation?.floor || 'Ground Floor');
  const [room, setRoom] = useState(initialLocation?.room || 'Room 101');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [fileError, setFileError] = useState('');
  const [calculatedPriority, setCalculatedPriority] = useState('Medium');

  // Update whenever initialLocation changes (e.g. from QR scan)
  useEffect(() => {
    if (initialLocation) {
      if (initialLocation.dept) setDepartment(initialLocation.dept);
      if (initialLocation.bldg) setBuilding(initialLocation.bldg);
      if (initialLocation.floor) setFloor(initialLocation.floor);
      if (initialLocation.room) setRoom(initialLocation.room);
    }
  }, [initialLocation]);

  // Recalculate priority preview in real time
  useEffect(() => {
    const p = calculatePriority({
      category,
      room,
      description,
      title,
      role: user?.role || 'Student',
    });
    setCalculatedPriority(p);
  }, [category, room, description, title, user]);

  const currentBuildingObj = BUILDINGS.find(b => b.name === building) || BUILDINGS[0];

  const handleBuildingChange = (newBldg) => {
    setBuilding(newBldg);
    const b = BUILDINGS.find(item => item.name === newBldg);
    if (b) {
      setFloor(b.floors[0]);
      setRoom(b.rooms[0]);
    }
  };

  const handleImageChange = (e) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid format. Only JPG, JPEG and PNG images are accepted.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds 5MB limit. Please select a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Please fill in both the title and detailed description.');
      return;
    }

    const result = submitComplaint(
      {
        title: title.trim(),
        category,
        department,
        building,
        floor,
        room,
        description: description.trim(),
        image: imagePreview,
      },
      user
    );

    if (result.success) {
      // Reset form
      setTitle('');
      setDescription('');
      setImagePreview(null);
      setFileError('');
      if (onSuccess) onSuccess(result.complaint);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Campus Maintenance Complaint" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {initialLocation && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
            <DoorClosed className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold">QR Code Verified:</span> Location auto-filled from classroom scan (
              <strong>{initialLocation.room}</strong>, {initialLocation.bldg}).
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Complaint Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Broken laboratory faucet or Short circuit in switchboard"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category & Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Issue Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Building / Block <span className="text-rose-500">*</span>
            </label>
            <select
              value={building}
              onChange={(e) => handleBuildingChange(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              {BUILDINGS.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Floor <span className="text-rose-500">*</span>
            </label>
            <select
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              {currentBuildingObj.floors.map((fl) => (
                <option key={fl} value={fl}>
                  {fl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Room / Lab Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Room 201"
              className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Describe the issue, exact equipment affected, whether it creates a safety hazard, or blocks student classes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Image Upload & Preview */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Attach Evidence Photo (JPG, PNG, JPEG, max 5MB)
          </label>

          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-900 max-h-48 flex items-center justify-center group">
              <img
                src={imagePreview}
                alt="Complaint Preview"
                className="max-h-48 object-contain"
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow transition"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition text-center">
              <ImageIcon className="w-7 h-7 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-700">Click to upload photo</span>
              <span className="text-[11px] text-slate-400">or drag and drop here</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}

          {fileError && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {fileError}
            </p>
          )}
        </div>

        {/* Auto-calculated Priority Indicator */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <div>
              <span className="text-xs font-bold text-slate-800">Automated Smart Priority:</span>
              <p className="text-[10px] text-slate-500">
                Calculated dynamically from hazard keywords, category, and location criticality.
              </p>
            </div>
          </div>
          <PriorityBadge priority={calculatedPriority} size="md" />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Complaint
          </button>
        </div>
      </form>
    </Modal>
  );
}
