import { createContext, useContext } from 'react';

export type Lang = 'ja' | 'en';

const LANG_KEY = 'sms_lang';

export const getLang = (): Lang => {
  const stored = localStorage.getItem(LANG_KEY);
  return stored === 'en' ? 'en' : 'ja';
};

export const setLang = (lang: Lang) => {
  localStorage.setItem(LANG_KEY, lang);
};

// ── Context ─────────────────────────────────────────────────────
export const LangContext = createContext<Lang>('ja');
export const useLang = () => useContext(LangContext);

// ── Translation function ─────────────────────────────────────────
export const t = (key: keyof typeof ja, lang: Lang): string =>
  (lang === 'en' ? en[key] : ja[key]) ?? key;

// Use this hook inside components: const { tr } = useTr();
export const useTr = () => {
  const lang = useLang();
  return { lang, tr: (key: keyof typeof ja) => t(key, lang) };
};

// ── Dictionaries ─────────────────────────────────────────────────
const ja = {
  // Header Nav
  studentManagement: '学生管理',
  attendanceManagement: '出席管理',
  notices: 'お知らせ',

  // Buttons
  addStudent: '新規登録',
  importCSV: 'CSVインポート',
  exportExcel: 'Excelエクスポート',
  userManagement: 'ユーザー管理',
  schoolSettings: '学校設定',
  logout: 'ログアウト',
  save: '保存',
  cancel: 'キャンセル',
  delete: '削除',
  close: '閉じる',
  print: '印刷',
  langToggle: 'EN',

  // Dashboard
  totalStudents: '在籍学生',
  lowAttendance: '出席率80%以下',
  unpaidTuition: '学費未納',
  visaExpiring: 'ビザ期限90日以内',
  overworked: '超過労働',
  jobHunting: '就活中',
  jobOffer: '内定取得',
  hasWarning: '指導歴あり',
  noPhoto: '写真なし',

  // Table Headers
  colStudentInfo: '学生情報',
  colAcademic: '学業・出席',
  colFinanceVisa: '財務・ビザ',
  colStatus: '状況・アラート',
  colActions: '操作',

  // Filters
  searchPlaceholder: '氏名または学籍番号で検索...',
  allNationalities: '全ての国籍',
  allJLPT: '全てのJLPT',
  allTuition: '全ての学費状況',
  classPlaceholder: 'クラス',

  // Safety mode
  safetyModeLabel: '安否',
  scannerLabel: 'スキャン',

  // Common
  noData: 'データなし',
  loading: '読み込み中...',
  selected: '名 選択中',
  longVacation: '長期休暇',
};

const en: typeof ja = {
  // Header Nav
  studentManagement: 'Students',
  attendanceManagement: 'Attendance',
  notices: 'Notices',

  // Buttons
  addStudent: 'New Student',
  importCSV: 'Import CSV',
  exportExcel: 'Export Excel',
  userManagement: 'User Mgmt',
  schoolSettings: 'School Settings',
  logout: 'Log Out',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  close: 'Close',
  print: 'Print',
  langToggle: '日本語',

  // Dashboard
  totalStudents: 'Students',
  lowAttendance: 'Attendance < 80%',
  unpaidTuition: 'Unpaid Tuition',
  visaExpiring: 'Visa Expiring',
  overworked: 'Overworked',
  jobHunting: 'Job Hunting',
  jobOffer: 'Offer Received',
  hasWarning: 'Has Warning',
  noPhoto: 'No Photo',

  // Table Headers
  colStudentInfo: 'Student Info',
  colAcademic: 'Academic',
  colFinanceVisa: 'Finance / Visa',
  colStatus: 'Status / Alert',
  colActions: 'Actions',

  // Filters
  searchPlaceholder: 'Search by name or ID...',
  allNationalities: 'All Nationalities',
  allJLPT: 'All JLPT',
  allTuition: 'All Tuition Status',
  classPlaceholder: 'Class',

  // Safety mode
  safetyModeLabel: 'Safety',
  scannerLabel: 'Scan',

  // Common
  noData: 'No data',
  loading: 'Loading...',
  selected: ' selected',
  longVacation: 'Long Vacation',
};

export { ja, en };
export type TranslationKey = keyof typeof ja;
