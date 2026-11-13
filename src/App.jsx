import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintProvider, useComplaints } from './context/ComplaintContext';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';
import Toast from './components/common/Toast';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Role Dashboards
import StudentDashboard from './pages/student/StudentDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminQRPage from './pages/admin/AdminQRPage';

// Public / QR Scan Target
import QuickReportPage from './pages/public/QuickReportPage';

function RootRedirect() {
  const { user, getDashboardPath } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getDashboardPath(user.role)} replace />;
}

function GlobalToastContainer() {
  const { toast } = useComplaints();
  return <Toast toast={toast} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ComplaintProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/quick-report" element={<QuickReportPage />} />

            {/* Student Dashboard */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Faculty Dashboard */}
            <Route
              path="/faculty"
              element={
                <ProtectedRoute allowedRoles={['Faculty', 'Admin']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />

            {/* Maintenance Staff Dashboard */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['Maintenance Staff', 'Admin']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Pages */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/qr"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Faculty']}>
                  <AdminQRPage />
                </ProtectedRoute>
              }
            />

            {/* Root & Catch-all */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Floating Toast */}
          <GlobalToastContainer />
        </ComplaintProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
