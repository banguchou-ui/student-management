import { JLPTLevel, TuitionStatus, WorkShift, VisaStatus, JobHuntingStatus, CommuteMethod, HousingType, PaymentStatus, Student, SafetyStatus, WarningLevel, Gender, EmergencyContact } from './types';

export const SCHOOL_NAME = "〇〇日本語学校";
export const SCHOOL_ADDRESS = "〇〇都〇〇区〇〇 1-2-3";

export const NATIONALITIES = [
  '中国', 'ベトナム', 'ネパール', 'スリランカ', 'ミャンマー', 'インドネシア', '韓国', 'モンゴル', 'フィリピン', 'その他 (手入力)'
];

export const MOTHER_TONGUES = [
  '中国語', 'ベトナム語', 'ネパール語', 'スリランカ語', 'ミャンマー語', 'インドネシア語', '日本語', '英語', 'モンゴル語', 'その他 (手入力)'
];

export const SCHOOL_POSITIONS = [
  '校長 (Principal)',
  '教務主任 (Academic Dean)',
  '担任 (Class Teacher)',
  '事務局 (Administration)',
  '進路指導 (Career Advisor)',
  'その他 (カスタム)'
];

export const JLPT_LEVELS = Object.values(JLPTLevel);
export const GENDERS = Object.values(Gender);
export const TUITION_STATUSES = Object.values(TuitionStatus);
export const WORK_SHIFTS = Object.values(WorkShift);
export const VISA_STATUSES = Object.values(VisaStatus);
export const JOB_HUNTING_STATUSES = Object.values(JobHuntingStatus);
export const COMMUTE_METHODS = Object.values(CommuteMethod);
export const HOUSING_TYPES = Object.values(HousingType);
export const PAYMENT_STATUSES = Object.values(PaymentStatus);
export const WARNING_LEVELS = Object.values(WarningLevel);

export const WEEK_DAYS = [
  { key: 'Mon', value: '月' },
  { key: 'Tue', value: '火' },
  { key: 'Wed', value: '水' },
  { key: 'Thu', value: '木' },
  { key: 'Fri', value: '金' },
  { key: 'Sat', value: '土' },
  { key: 'Sun', value: '日' },
];

export const INITIAL_STUDENT_STATE: Student = {
  id: '',
  studentId: '',
  name: '',
  gender: Gender.MALE,
  nationality: '',
  motherTongue: '',
  age: 18,
  enrollmentDate: '',
  className: '',
  grade: '',
  emergencyContact: { name: '', relationship: '', phone: '', email: '' } as EmergencyContact,
  
  jlptLevel: JLPTLevel.NONE,
  additionalExams: [],
  attendanceRate: 100,
  attendanceLastMonth: 100, // New
  
  academicInfo: { gpa: 0, creditsEarned: false }, // New

  zairyuCardNumber: '',
  visaExpiry: '',
  visaStatus: VisaStatus.ACTIVE,
  zairyuCardFront: null,
  zairyuCardBack: null,
  myNumberPhoto: null, // New
  hasMyNumber: false,
  visaChecklist: { graduationCert: false, transcript: false, attendanceCert: false, recommendation: false, jobHuntingStatement: false }, // New

  tuitionStatus: TuitionStatus.UNPAID,
  tuitionTotal: 0,
  tuitionPaid: 0,
  tuitionBalance: 0,
  nextTuitionDeadline: '',
  bankInfo: { bankName: '', branchName: '', accountNumber: '', accountHolder: '' }, // New

  jobHuntingStatus: JobHuntingStatus.NOT_STARTED,
  targetCompany: '',
  careerMilestones: { resumeComplete: false, interviewTraining: false, jobOffer: false, visaChangeApplied: false }, // New
  exitInfo: { companyName: '', addressAfterLeaving: '', visaChangeType: '' }, // New

  commuteMethod: CommuteMethod.WALK,
  bikeRegNumber: '',
  housingType: HousingType.PRIVATE,
  rentStatus: PaymentStatus.PAID,
  guarantorName: '',
  guarantorPhone: '',
  
  nationalHealthInsurance: PaymentStatus.PAID,
  healthCheckStatus: false,
  safetyStatus: SafetyStatus.UNKNOWN, // New

  counselingRecords: [],
  warningHistory: [], // New

  photoBase64: null,
  photoTransform: { scale: 1, x: 0, y: 0 },
  workInfo: {
    location: '',
    address: '',
    phone: '',
    jobTitle: '',
    hourlyWage: 0,
    startTime: '',
    endTime: '',
    days: [],
    hoursPerWeek: 0,
    shift: WorkShift.DAY,
    isLongVacation: false,
  },
};
