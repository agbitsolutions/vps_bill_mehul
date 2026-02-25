import { useAuth } from '../contexts/AuthContext';

export interface RolePermissions {
  canViewDashboard: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canCreateBills: boolean;
  canEditBills: boolean;
  canDeleteBills: boolean;
  canViewReports: boolean;
  canManageCustomers: boolean;
  canManageProducts: boolean;
  canViewAdminPanel: boolean;
  canAccessBulkOperations: boolean;
}

export const useRoleBasedAccess = (): RolePermissions => {
  const { user } = useAuth();
  const role = user?.role || 'viewer';

  const rolePermissions: Record<string, RolePermissions> = {
    admin: {
      canViewDashboard: true,
      canManageUsers: true,
      canManageSettings: true,
      canCreateBills: true,
      canEditBills: true,
      canDeleteBills: true,
      canViewReports: true,
      canManageCustomers: true,
      canManageProducts: true,
      canViewAdminPanel: true,
      canAccessBulkOperations: true,
    },
    manager: {
      canViewDashboard: true,
      canManageUsers: false,
      canManageSettings: false,
      canCreateBills: true,
      canEditBills: true,
      canDeleteBills: true,
      canViewReports: true,
      canManageCustomers: true,
      canManageProducts: true,
      canViewAdminPanel: false,
      canAccessBulkOperations: true,
    },
    staff: {
      canViewDashboard: true,
      canManageUsers: false,
      canManageSettings: false,
      canCreateBills: true,
      canEditBills: true,
      canDeleteBills: false,
      canViewReports: false,
      canManageCustomers: true,
      canManageProducts: false,
      canViewAdminPanel: false,
      canAccessBulkOperations: false,
    },
    viewer: {
      canViewDashboard: true,
      canManageUsers: false,
      canManageSettings: false,
      canCreateBills: false,
      canEditBills: false,
      canDeleteBills: false,
      canViewReports: true,
      canManageCustomers: false,
      canManageProducts: false,
      canViewAdminPanel: false,
      canAccessBulkOperations: false,
    },
  };

  return rolePermissions[role] || rolePermissions.viewer;
};

export default useRoleBasedAccess;
