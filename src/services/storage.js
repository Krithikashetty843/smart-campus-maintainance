import { INITIAL_USERS, INITIAL_COMPLAINTS, BUILDINGS } from './mockData';

const USERS_KEY = 'smart_campus_users';
const COMPLAINTS_KEY = 'smart_campus_complaints';
const CURRENT_USER_KEY = 'smart_campus_current_user';
const QR_CODES_KEY = 'smart_campus_qr_codes';

// Helper to safely load data
export function getFromStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

export function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// Initialize seed data if not present
export function initializeStorage() {
  if (!localStorage.getItem(USERS_KEY)) {
    setToStorage(USERS_KEY, INITIAL_USERS);
  }
  if (!localStorage.getItem(COMPLAINTS_KEY)) {
    setToStorage(COMPLAINTS_KEY, INITIAL_COMPLAINTS);
  }
  if (!localStorage.getItem(QR_CODES_KEY)) {
    // Generate starter QR codes for key campus locations
    const starterQRs = [];
    BUILDINGS.forEach((bldg, bIdx) => {
      bldg.rooms.slice(0, 2).forEach((room, rIdx) => {
        starterQRs.push({
          id: `QR-LOC-${bIdx + 1}${rIdx + 1}`,
          department: bldg.departments[0] || 'Central Administration',
          building: bldg.name,
          floor: bldg.floors[0] || 'Ground Floor',
          room: room,
          qrData: JSON.stringify({
            dept: bldg.departments[0] || 'Central Administration',
            bldg: bldg.name,
            floor: bldg.floors[0] || 'Ground Floor',
            room: room,
          }),
          createdAt: new Date(Date.now() - (bIdx * 86400000)).toISOString(),
          generatedBy: 'System Administrator',
        });
      });
    });
    setToStorage(QR_CODES_KEY, starterQRs);
  }
}

// User methods
export function getUsers() {
  initializeStorage();
  return getFromStorage(USERS_KEY, INITIAL_USERS);
}

export function saveUsers(users) {
  setToStorage(USERS_KEY, users);
}

export function addUser(user) {
  const users = getUsers();
  const newUser = {
    id: `USR-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    ...user,
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function findUserByEmail(email) {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function getCurrentUser() {
  return getFromStorage(CURRENT_USER_KEY, null);
}

export function setCurrentUser(user) {
  setToStorage(CURRENT_USER_KEY, user);
}

export function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Complaint methods
export function getComplaints() {
  initializeStorage();
  return getFromStorage(COMPLAINTS_KEY, INITIAL_COMPLAINTS);
}

export function saveComplaints(complaints) {
  setToStorage(COMPLAINTS_KEY, complaints);
}

export function generateComplaintId() {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CMP-2026-${randomSuffix}`;
}

export function addComplaint(complaintData) {
  const complaints = getComplaints();
  const id = generateComplaintId();
  const now = new Date().toISOString();

  const newComplaint = {
    id,
    createdAt: now,
    updatedAt: now,
    status: 'Pending',
    assignedTo: null,
    remarks: '',
    completionPhoto: null,
    feedback: null,
    timeline: [
      {
        status: 'Submitted',
        title: 'Complaint Logged',
        note: `Initial ticket opened by ${complaintData.submittedBy?.name || 'User'}.`,
        timestamp: now,
        updatedBy: complaintData.submittedBy?.name || 'User',
      },
    ],
    ...complaintData,
  };

  const updated = [newComplaint, ...complaints];
  saveComplaints(updated);
  return newComplaint;
}

export function updateComplaint(id, updates) {
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id === id);
  if (index === -1) return null;

  const current = complaints[index];
  const updatedTimeline = [...(current.timeline || [])];

  // If status changed, record timeline step
  if (updates.status && updates.status !== current.status) {
    updatedTimeline.push({
      status: updates.status,
      title: `Status changed to ${updates.status}`,
      note: updates.statusNote || updates.remarks || `Ticket status updated to ${updates.status}.`,
      timestamp: new Date().toISOString(),
      updatedBy: updates.updatedByName || 'Maintenance System',
    });
  }

  // If assignedTo changed
  if (updates.assignedTo && updates.assignedTo.id !== current.assignedTo?.id) {
    updatedTimeline.push({
      status: 'Assigned',
      title: 'Work Order Assigned',
      note: `Assigned to ${updates.assignedTo.name} (${updates.assignedTo.specialization || 'Technician'}).`,
      timestamp: new Date().toISOString(),
      updatedBy: updates.updatedByName || 'Admin Dispatcher',
    });
  }

  const updatedComplaint = {
    ...current,
    ...updates,
    timeline: updatedTimeline,
    updatedAt: new Date().toISOString(),
  };

  complaints[index] = updatedComplaint;
  saveComplaints(complaints);
  return updatedComplaint;
}

// QR Code methods
export function getQRCodes() {
  initializeStorage();
  return getFromStorage(QR_CODES_KEY, []);
}

export function saveQRCode(qrData) {
  const qrs = getQRCodes();
  const newQR = {
    id: `QR-LOC-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    ...qrData,
  };
  const updated = [newQR, ...qrs];
  setToStorage(QR_CODES_KEY, updated);
  return newQR;
}

export function deleteQRCode(id) {
  const qrs = getQRCodes();
  const filtered = qrs.filter(q => q.id !== id);
  setToStorage(QR_CODES_KEY, filtered);
  return filtered;
}

// Reset data to defaults
export function resetToMockData() {
  setToStorage(USERS_KEY, INITIAL_USERS);
  setToStorage(COMPLAINTS_KEY, INITIAL_COMPLAINTS);
  localStorage.removeItem(QR_CODES_KEY);
  initializeStorage();
}
