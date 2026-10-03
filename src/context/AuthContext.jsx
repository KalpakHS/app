import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockUserRoles } from '../data/mockData';
import { api } from '../services/api';

const AuthContext = createContext();

export const DEMO_PASSWORDS = {
  "alex.mercer@patient.smartneb.io": "SmartNeb123!",
  "dr.vance@clinic.smartneb.io": "SmartNeb123!",
  "care.elena@family.smartneb.io": "SmartNeb123!",
  "admin@ops.smartneb.io": "SmartNeb123!",
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('smartneb_role');
    const match = mockUserRoles.find(r => r.role === saved);
    return match || mockUserRoles[0]; // Patient by default
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('smartneb_auth') === 'true';
  });

  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Validate session on mount or page refresh
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const token = localStorage.getItem('smartneb_token');
      if (token) {
        const res = await api.getMe();
        if (res.success && res.data) {
          if (isMounted) {
            setIsBackendConnected(true);
            setIsAuthenticated(true);
            const roleMatch = mockUserRoles.find(r => r.role === res.data.role);
            if (roleMatch) {
              setCurrentUser({
                ...roleMatch,
                name: res.data.full_name,
                email: res.data.email,
                id: res.data.id,
              });
            }
          }
        } else if (res.isNetworkError) {
          if (isMounted) setIsBackendConnected(false);
        } else if (res.status === 401) {
          // Token invalid/expired; try refresh
          const refreshRes = await api.refreshToken();
          if (refreshRes.success) {
            const retryRes = await api.getMe();
            if (retryRes.success && isMounted) {
              setIsBackendConnected(true);
              setIsAuthenticated(true);
            }
          } else {
            if (isMounted) {
              setIsAuthenticated(false);
              localStorage.removeItem('smartneb_auth');
              localStorage.removeItem('smartneb_token');
              localStorage.removeItem('smartneb_refresh');
            }
          }
        }
      } else {
        // Quick health ping to test backend connectivity
        api.getPatients({ limit: 1 }).then((res) => {
          if (isMounted) setIsBackendConnected(!res.isNetworkError);
        }).catch(() => {
          if (isMounted) setIsBackendConnected(false);
        });
      }

      if (isMounted) setAuthLoading(false);
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const setRole = (roleKey) => {
    const user = mockUserRoles.find(r => r.role === roleKey) || mockUserRoles[0];
    setCurrentUser(user);
    localStorage.setItem('smartneb_role', user.role);
    localStorage.setItem('smartneb_auth', 'true');
    setIsAuthenticated(true);

    const demoPass = DEMO_PASSWORDS[user.email] || 'SmartNeb123!';
    api.login(user.email, demoPass).then((res) => {
      if (res.success) setIsBackendConnected(true);
    }).catch(() => {});

    return user;
  };

  const login = async (roleKey, email = null, password = null) => {
    let user = mockUserRoles.find(r => r.role === roleKey);
    if (!user && email) {
      user = mockUserRoles.find(r => r.email.toLowerCase() === email.toLowerCase());
    }
    if (!user) {
      user = mockUserRoles[0];
    }

    const targetEmail = email || user.email;
    const targetPass = password || DEMO_PASSWORDS[targetEmail] || 'SmartNeb123!';

    const res = await api.login(targetEmail, targetPass);
    if (res.success && res.data) {
      setIsBackendConnected(true);
      setIsAuthenticated(true);
      const apiUser = res.data.user;
      const roleMatch = mockUserRoles.find(r => r.role === apiUser.role) || user;
      const combinedUser = {
        ...roleMatch,
        name: apiUser.full_name,
        email: apiUser.email,
        id: apiUser.id,
      };
      setCurrentUser(combinedUser);
      localStorage.setItem('smartneb_role', apiUser.role);
      localStorage.setItem('smartneb_auth', 'true');
      return { success: true, user: combinedUser };
    }

    // Backend error or offline
    if (res.isNetworkError) {
      setIsBackendConnected(false);
      // Allow local simulated login for offline preview
      setCurrentUser(user);
      localStorage.setItem('smartneb_role', user.role);
      localStorage.setItem('smartneb_auth', 'true');
      setIsAuthenticated(true);
      return { success: true, user, isOffline: true };
    }

    return { success: false, error: res.error };
  };

  const registerUser = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.data) {
      setIsBackendConnected(true);
      setIsAuthenticated(true);
      const apiUser = res.data.user;
      const roleMatch = mockUserRoles.find(r => r.role === apiUser.role) || mockUserRoles[0];
      const combinedUser = {
        ...roleMatch,
        name: apiUser.full_name,
        email: apiUser.email,
        id: apiUser.id,
      };
      setCurrentUser(combinedUser);
      localStorage.setItem('smartneb_role', apiUser.role);
      localStorage.setItem('smartneb_auth', 'true');
      return { success: true, user: combinedUser };
    }

    return { success: false, error: res.error };
  };

  const logout = async () => {
    await api.logout();
    localStorage.removeItem('smartneb_auth');
    localStorage.removeItem('smartneb_token');
    localStorage.removeItem('smartneb_refresh');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        authLoading,
        isBackendConnected,
        setRole,
        login,
        registerUser,
        logout,
        allRoles: mockUserRoles,
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
