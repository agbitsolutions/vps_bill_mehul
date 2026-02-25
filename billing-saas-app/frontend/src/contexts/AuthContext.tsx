import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { rbacService } from '../services/rbacService';
import { Role, UISettings, UserRoleType } from '../types/rbac';
import { API_URL } from '../config/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: string;
  role: UserRoleType;
  permissions: string[];
  uiSettings?: UISettings;
}


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  switchRole: (role: UserRoleType) => void;
  availableRoles: Role[];
  currentRoleSettings: UISettings | null;
  updateRoleSettings: (settings: Partial<UISettings>) => void;
  hasPermission: (resource: string, action: string) => boolean;
  canAccessNavigation: (nav: keyof UISettings['navigation']) => boolean;
  canUseFeature: (feature: keyof UISettings['features']) => boolean;
  getFieldAccess: (module: string, field: string) => { visible: boolean; editable: boolean };
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // First declaration, keep this one
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);

  // Get available roles from RBAC service
  const availableRoles = rbacService.getRoles();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.user) {
            // Map backend user to frontend User interface
            const backendUser = response.data.user;
            setUser({
              id: backendUser.id,
              name: backendUser.email.split('@')[0], // Fallback name
              email: backendUser.email,
              plan: 'Basic', // Default/fallback
              role: 'admin', // Default to admin for now, or fetch from backend if available
              permissions: ['all'],
              uiSettings: rbacService.getRole('admin')?.uiSettings,
              // ... map other fields
            });
          }
        } catch (err) {
          console.error('Failed to fetch profile', err);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // ... (keep activity tracking)

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });

      const { token, user } = response.data;

      localStorage.setItem('authToken', token);

      // Update user state
      setUser({
        id: user.id,
        name: user.email.split('@')[0],
        email: user.email,
        plan: 'Basic',
        role: 'admin',
        permissions: ['all'],
        uiSettings: rbacService.getRole('admin')?.uiSettings,
      });

    } catch (error: any) {
      const message = error.response?.data?.error || 'Invalid credentials';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setLastActivity(Date.now());
    // Redirect to login page
    window.location.href = '/login';
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  // Switch between different roles for testing different user perspectives
  const switchRole = (newRole: UserRoleType) => {
    if (!user) return;

    const roleSettings = rbacService.getRole(newRole)?.uiSettings;

    setUser({
      ...user,
      role: newRole,
      uiSettings: roleSettings
    });
  };

  // Update role settings
  const updateRoleSettings = (settings: Partial<UISettings>) => {
    if (!user) return;

    rbacService.updateRoleSettings(user.role, settings);
    const updatedSettings = rbacService.getRole(user.role)?.uiSettings;

    setUser({
      ...user,
      uiSettings: updatedSettings
    });
  };

  // Permission checking methods
  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    return rbacService.hasPermission(user.role, resource, action);
  };

  const canAccessNavigation = (nav: keyof UISettings['navigation']): boolean => {
    if (!user) return false;
    return rbacService.canAccessNavigation(user.role, nav);
  };

  const canUseFeature = (feature: keyof UISettings['features']): boolean => {
    if (!user) return false;
    return rbacService.canUseFeature(user.role, feature);
  };

  const getFieldAccess = (module: string, field: string) => {
    if (!user) return { visible: false, editable: false };
    return rbacService.getFieldAccess(user.role, module, field);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateProfile,
    switchRole,
    availableRoles,
    currentRoleSettings: user?.uiSettings || null,
    updateRoleSettings,
    hasPermission,
    canAccessNavigation,
    canUseFeature,
    getFieldAccess,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
