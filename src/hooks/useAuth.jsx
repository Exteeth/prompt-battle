import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getCurrentUser, 
  loginStudent as apiLoginStudent, 
  loginTeacher as apiLoginTeacher, 
  logout as apiLogout 
} from '../lib/sessionStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getCurrentUser();
    setUser(session);
    setLoading(false);
  }, []);

  const loginStudent = (roomCode, studentId, username) => {
    const session = apiLoginStudent(roomCode, studentId, username);
    setUser(session);
    return session;
  };

  const loginTeacher = (roomCode, pin) => {
    const session = apiLoginTeacher(roomCode, pin);
    setUser(session);
    return session;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginStudent, loginTeacher, logout }}>
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
