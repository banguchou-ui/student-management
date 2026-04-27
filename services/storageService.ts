import { Student, User, UserRole } from '../types';

const STUDENT_STORAGE_KEY = 'sms_data_students_v1';
const USER_STORAGE_KEY = 'sms_data_users_v1';

// --- Student Management ---

export const getStoredStudents = (): Student[] => {
  try {
    const data = localStorage.getItem(STUDENT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load students', error);
    return [];
  }
};

export const saveStoredStudents = (students: Student[]) => {
  try {
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(students));
  } catch (error) {
    console.error('Failed to save students', error);
  }
};

// --- User Management ---

const DEFAULT_PERMISSIONS = {
  canEditBasicInfo: false,
  canEditAcademicInfo: false,
  canEditWorkInfo: false,
  canExportData: false,
  canManageUsers: false,
};

const ADMIN_PERMISSIONS = {
  canEditBasicInfo: true,
  canEditAcademicInfo: true,
  canEditWorkInfo: true,
  canExportData: true,
  canManageUsers: true,
};

const TEACHER_PERMISSIONS = {
  canEditBasicInfo: true,
  canEditAcademicInfo: true,
  canEditWorkInfo: true,
  canExportData: false,
  canManageUsers: false,
};

export const initUsers = (): User[] => {
  const existingUsers = localStorage.getItem(USER_STORAGE_KEY);
  if (existingUsers) {
    // Migration: Ensure existing users have new fields
    const users: User[] = JSON.parse(existingUsers);
    const updatedUsers = users.map(u => ({
        ...u,
        position: u.position || 'その他',
        department: u.department || '教職員',
    }));
    return updatedUsers;
  }

  // Seed default users if none exist
  const seedUsers: User[] = [
    { 
      username: 'xiaozhang', 
      password: '8888', 
      name: '校長先生', 
      position: '校長 (Principal)',
      department: '校長室',
      role: UserRole.PRINCIPAL, 
      permissions: ADMIN_PERMISSIONS 
    },
    { 
      username: 'admin', 
      password: '5986', 
      name: 'システム管理者', 
      position: '事務局 (Administration)',
      department: 'IT管理部',
      role: UserRole.PRINCIPAL, 
      permissions: ADMIN_PERMISSIONS 
    },
    { 
      username: 'teacher', 
      password: 'password', 
      name: '田中 先生', 
      position: '担任 (Class Teacher)',
      department: '教務課',
      role: UserRole.TEACHER, 
      permissions: TEACHER_PERMISSIONS 
    }
  ];

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(seedUsers));
  return seedUsers;
};

export const getStoredUsers = (): User[] => {
  const users = localStorage.getItem(USER_STORAGE_KEY);
  return users ? JSON.parse(users) : initUsers();
};

export const saveStoredUsers = (users: User[]) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
};
