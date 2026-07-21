import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginStudent, loginTeacher, logout as logoutSession, initDefaultData } from '../lib/sessionStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDefaultData();
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleStudentLogin = (roomCode, username) => {
    const session = loginStudent(roomCode, username);
    setUser(session);
    return session;
  };

  const handleTeacherLogin = (roomCode, pin) => {
    const session = loginTeacher(roomCode, pin);
    setUser(session);
    return session;
  };

  const handleLogout = () => {
    logoutSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginStudent: handleStudentLogin, loginTeacher: handleTeacherLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
