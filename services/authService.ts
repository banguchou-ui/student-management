import { User, UserRole, UserPermissions } from '../types';
import { getStoredUsers, saveStoredUsers, initUsers } from './storageService';

const SESSION_KEY = 'sms_session_user';

// Ensure users are initialized on load
initUsers();

export const login = (username: string, password: string): User | null => {
  const users = getStoredUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Return user without password for session
    const { password, ...sessionUser } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return user; // Return full user (with permissions) to app
  }
  return null;
};

export const register = (username: string, password: string, name: string): boolean => {
  const users = getStoredUsers();
  
  if (users.find(u => u.username === username)) {
    return false; // Username exists
  }

  const newUser: User = {
    username,
    password,
    name,
    position: 'その他',
    department: '未設定',
    role: UserRole.VIEWER, // Default to Viewer
    permissions: {
      canEditBasicInfo: false,
      canEditAcademicInfo: false,
      canEditWorkInfo: false,
      canExportData: false,
      canManageUsers: false,
    }
  };

  users.push(newUser);
  saveStoredUsers(users);
  return true;
};

export const changePassword = (username: string, newPassword: string): boolean => {
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.username === username);
  
  if (userIndex === -1) return false;
  
  users[userIndex].password = newPassword;
  saveStoredUsers(users);
  return true;
};

export const updateUserPermissions = (targetUsername: string, newPermissions: UserPermissions, newRole?: UserRole) => {
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.username === targetUsername);
    
    if (userIndex !== -1) {
        users[userIndex].permissions = newPermissions;
        if (newRole) users[userIndex].role = newRole;
        saveStoredUsers(users);
        return true;
    }
    return false;
}

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const storedSession = localStorage.getItem(SESSION_KEY);
  if (storedSession) {
    try {
      const sessionUser = JSON.parse(storedSession);
      // Re-fetch from DB to get latest permissions/role in case they changed while logged in
      const dbUsers = getStoredUsers();
      const freshUser = dbUsers.find(u => u.username === sessionUser.username);
      return freshUser || null;
    } catch (e) {
      return null;
    }
  }
  return null;
};
