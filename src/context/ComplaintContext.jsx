import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getComplaints,
  addComplaint as storageAddComplaint,
  addComplaintReport as storageAddComplaintReport,
  updateComplaint as storageUpdateComplaint,
  getQRCodes,
  saveQRCode,
  deleteQRCode as storageDeleteQRCode,
  resetToMockData,
} from '../services/storage';
import { calculatePriority } from '../services/priorityCalculator';

const ComplaintContext = createContext();

export function ComplaintProvider({ children }) {
  const [complaints, setComplaints] = useState([]);
  const [qrCodes, setQrCodes] = useState([]);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const refreshData = useCallback(() => {
    setComplaints(getComplaints());
    setQrCodes(getQRCodes());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Submit new complaint
  const submitComplaint = (data, currentUser, { allowSeparate = false } = {}) => {
    try {
      const priority = calculatePriority({
        category: data.category,
        room: data.room,
        description: data.description,
        title: data.title,
        role: currentUser?.role || 'Student',
      });

      const result = storageAddComplaint({
        ...data,
        priority,
        submittedBy: {
          id: currentUser?.id || 'ANONYMOUS',
          name: currentUser?.name || 'Campus Student',
          email: currentUser?.email || 'student@campus.edu',
          role: currentUser?.role || 'Student',
          department: currentUser?.department || data.department,
        },
      }, { allowSeparate });

      if (result.duplicateCandidates.length > 0) {
        return { success: false, duplicateCandidates: result.duplicateCandidates };
      }

      refreshData();
      showToast(`Complaint ${result.complaint.id} submitted successfully! Priority: ${priority}`, 'success');
      return { success: true, complaint: result.complaint };
    } catch (error) {
      console.error('Error submitting complaint:', error);
      showToast('Failed to submit complaint. Please try again.', 'error');
      return { success: false, error };
    }
  };

  const addComplaintReport = (complaintId, data, currentUser) => {
    try {
      const result = storageAddComplaintReport(complaintId, {
        ...data,
        submittedBy: {
          id: currentUser?.id || 'ANONYMOUS',
          name: currentUser?.name || 'Campus Student',
          email: currentUser?.email || 'student@campus.edu',
          role: currentUser?.role || 'Student',
          department: currentUser?.department || data.department,
        },
      });

      if (result.error) {
        showToast(result.error, 'error');
        return { success: false, error: result.error };
      }

      refreshData();
      if (result.alreadyReported) {
        showToast(`You have already reported complaint ${complaintId}.`, 'info');
      } else {
        showToast(`Your report was added to complaint ${complaintId}.`, 'success');
      }
      return { success: true, complaint: result.complaint, alreadyReported: result.alreadyReported };
    } catch (error) {
      console.error('Error adding complaint report:', error);
      showToast('Failed to add your report. Please try again.', 'error');
      return { success: false, error };
    }
  };

  // Update complaint
  const updateComplaint = (id, updates, currentUser) => {
    try {
      const updated = storageUpdateComplaint(id, {
        ...updates,
        updatedByName: currentUser?.name || 'Administrator',
      });

      if (!updated) {
        showToast('Complaint not found', 'error');
        return { success: false };
      }

      refreshData();
      showToast(`Complaint ${id} updated successfully.`, 'success');
      return { success: true, complaint: updated };
    } catch (error) {
      console.error('Error updating complaint:', error);
      showToast('Failed to update complaint.', 'error');
      return { success: false, error };
    }
  };

  // Assign staff
  const assignStaffToComplaint = (complaintId, staffMember, currentUser) => {
    return updateComplaint(
      complaintId,
      {
        assignedTo: staffMember,
        status: 'Assigned',
        statusNote: `Assigned to ${staffMember.name} (${staffMember.specialization || 'Technician'}).`,
      },
      currentUser
    );
  };

  // Submit feedback
  const submitFeedback = (complaintId, rating, comment) => {
    try {
      const updated = storageUpdateComplaint(complaintId, {
        feedback: {
          rating,
          comment,
          submittedAt: new Date().toISOString(),
        },
      });
      refreshData();
      showToast('Thank you! Your feedback has been submitted.', 'success');
      return { success: true, complaint: updated };
    } catch (error) {
      showToast('Failed to submit feedback.', 'error');
      return { success: false };
    }
  };

  // QR Code operations
  const createNewQRCode = (qrData, currentUser) => {
    try {
      const newQR = saveQRCode({
        ...qrData,
        generatedBy: currentUser?.name || 'Administrator',
      });
      refreshData();
      showToast(`QR Code generated for ${qrData.room}!`, 'success');
      return { success: true, qr: newQR };
    } catch (error) {
      showToast('Failed to generate QR code.', 'error');
      return { success: false };
    }
  };

  const removeQRCode = (id) => {
    try {
      storageDeleteQRCode(id);
      refreshData();
      showToast('QR Code deleted.', 'info');
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const handleResetData = () => {
    resetToMockData();
    refreshData();
    showToast('Demo data reset to original factory state.', 'info');
  };

  // Aggregated Stats
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    assigned: complaints.filter(c => c.status === 'Assigned').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    critical: complaints.filter(c => c.priority === 'Critical' && c.status !== 'Resolved').length,
    resolutionRate: complaints.length > 0
      ? Math.round((complaints.filter(c => c.status === 'Resolved').length / complaints.length) * 100)
      : 0,
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        qrCodes,
        stats,
        toast,
        showToast,
        submitComplaint,
        addComplaintReport,
        updateComplaint,
        assignStaffToComplaint,
        submitFeedback,
        createNewQRCode,
        removeQRCode,
        refreshData,
        handleResetData,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
}
