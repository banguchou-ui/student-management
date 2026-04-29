export enum UserRole {
  TEACHER = 'TEACHER', 
  PRINCIPAL = 'PRINCIPAL', 
  VIEWER = 'VIEWER', 
}

export interface UserPermissions {
  canEditBasicInfo: boolean;
  canEditAcademicInfo: boolean;
  canEditWorkInfo: boolean;
  canExportData: boolean;
  canManageUsers: boolean;
}

export enum TuitionStatus {
  PAID = '納入済み',
  UNPAID = '未納',
  PARTIAL = '一部納入',
}

export enum JLPTLevel {
  N1 = 'N1',
  N2 = 'N2',
  N3 = 'N3',
  N4 = 'N4',
  N5 = 'N5',
  NONE = 'なし',
}

export enum Gender {
  MALE = '男',
  FEMALE = '女',
  OTHER = 'その他'
}

export enum WorkShift {
  DAY = '日勤',
  NIGHT = '夜勤',
  MID = '準夜勤',
}

export enum VisaStatus {
  ACTIVE = '有効',
  APPLYING = '更新申請中',
  GRANTED = '許可済み',
  EXPIRED = '期限切れ',
}

export enum JobHuntingStatus {
  NOT_STARTED = '未活動',
  ACTIVE = '活動中',
  NAITEI = '内定',
  RETURN_HOME = '帰国予定',
}

export enum CommuteMethod {
  BICYCLE = '自転車',
  TRAIN = '電車',
  BUS = 'バス',
  WALK = '徒歩',
}

export enum HousingType {
  DORM = '学校寮',
  PRIVATE = '一般民家/アパート',
}

export enum PaymentStatus {
  PAID = '支払い済み',
  UNPAID = '未払い',
}

// --- New Deep Features Types ---

export enum SafetyStatus {
  UNKNOWN = '未確認',
  SAFE = '無事',
  DANGER = '要救助',
}

export enum WarningLevel {
  ORAL = '口頭注意',
  WRITTEN = '始末書・警告書',
  EXPULSION = '退学勧告',
}

export interface CareerMilestones {
  resumeComplete: boolean;
  interviewTraining: boolean;
  jobOffer: boolean;
  visaChangeApplied: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface BankInfo {
  bankName: string;
  branchName: string; 
  accountNumber: string;
  accountHolder: string;
}

export interface VisaChecklist {
  graduationCert: boolean;
  transcript: boolean;
  attendanceCert: boolean;
  recommendation: boolean;
  jobHuntingStatement: boolean;
}

export interface AcademicInfo {
  gpa: number; // 0.0 - 4.0
  creditsEarned: boolean;
}

export interface WarningRecord {
  id: string;
  date: string;
  level: WarningLevel;
  reason: string;
  signed: boolean;
}

export interface ExitInfo {
  companyName: string;
  addressAfterLeaving: string;
  visaChangeType: string; // '就労', '特定活動', '帰国'
}

export interface CounselingRecord {
  id: string;
  date: string;
  teacherName: string;
  summary: string;
}

export interface WorkInfo {
  location: string;
  address: string;
  phone: string;
  jobTitle: string;
  hourlyWage: number;
  startTime: string;
  endTime: string;
  days: string[];
  hoursPerWeek: number;
  shift: WorkShift;
  isLongVacation: boolean;
}

export interface PhotoTransform {
  scale: number;
  x: number;
  y: number;
}

export interface ExamRecord {
  id: string;
  name: string;
  result: string;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  nameRomaji: string;
  gender: Gender;
  nationality: string;
  motherTongue: string;
  age: number;
  birthDate: string;
  enrollmentDate: string;
  className: string;
  grade: string;
  emergencyContact: EmergencyContact;
  
  // Academic
  jlptLevel: JLPTLevel;
  additionalExams: ExamRecord[];
  attendanceRate: number;
  attendanceLastMonth: number; // New: For trend warning
  
  academicInfo: AcademicInfo; // New: GPA etc

  // Visa & Identity
  zairyuCardNumber: string; // New
  visaExpiry: string;
  visaStatus: VisaStatus;
  zairyuCardFront: string | null;
  zairyuCardBack: string | null;
  myNumberPhoto: string | null; // New
  hasMyNumber: boolean;
  visaChecklist: VisaChecklist; // New

  // Financial
  tuitionStatus: TuitionStatus;
  tuitionTotal: number;
  tuitionPaid: number;
  tuitionBalance?: number; // New: Manually modifiable balance
  nextTuitionDeadline: string;
  tuitionHistory: { date: string; amount: number; note: string; }[];
  bankInfo: BankInfo; // New

  // Career / Job Hunting
  jobHuntingStatus: JobHuntingStatus;
  targetCompany: string;
  careerMilestones: CareerMilestones; // New
  exitInfo: ExitInfo; // New
  withdrawalDate: string;
  withdrawalReason: string;

  // Life & Housing
  commuteMethod: CommuteMethod;
  bikeRegNumber: string;
  housingType: HousingType;
  rentStatus: PaymentStatus;
  guarantorName: string;
  guarantorPhone: string;
  
  // Health & Safety
  nationalHealthInsurance: PaymentStatus;
  healthCheckStatus: boolean;
  safetyStatus: SafetyStatus; // New

  // Logs
  counselingRecords: CounselingRecord[];
  warningHistory: WarningRecord[]; // New

  // Photo
  photoBase64: string | null;
  photoTransform: PhotoTransform;

  workInfo: WorkInfo;
}

export interface FilterState {
  nationality: string;
  jlptLevel: string;
  tuitionStatus: string;
  hasJob: string;
  className: string;
  noPhoto: string;
}

export interface User {
  username: string;
  password?: string;
  name: string;
  position: string;
  department: string;
  role: UserRole;
  permissions: UserPermissions;
}
