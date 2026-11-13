import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, setCurrentUser, clearCurrentUser, findUserByEmail, addUser } from '../services/storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = getCurrentUser();
    if (stored) {
      setUser(stored);
    }
  }, []);

  const login = (email, password) => {
    setLoading(true);
    const existing = findUserByEmail(email);

    if (!existing) {
      setLoading(false);
      return { success: false, message: 'No account registered with this email address.' };
    }

    if (existing.password !== password) {
      setLoading(false);
      return { success: false, message: 'Incorrect password. Check your credentials.' };
    }

    // Success
    setCurrentUser(existing);
    setUser(existing);
    setLoading(false);
    return { success: true, user: existing };
  };

  const registerStudent = (studentData) => {
    setLoading(true);
    const existing = findUserByEmail(studentData.email);
    if (existing) {
      setLoading(false);
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser = addUser({
      ...studentData,
      role: 'Student',
    });

    setCurrentUser(newUser);
    setUser(newUser);
    setLoading(false);
    return { success: true, user: newUser };
  };

  const logout = () => {
    clearCurrentUser();
    setUser(null);
  };

  const getDashboardPath = (role = user?.role) => {
    switch (role) {
      case 'Admin':
        return '/admin';
      case 'Faculty':
        return '/faculty';
      case 'Maintenance Staff':
        return '/staff';
      case 'Student':
      default:
        return '/student';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        registerStudent,
        logout,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
