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
  safetyEmergencyMode: '🚨 安否確認・災害モード',
  scanTitle: '登校スキャンモード',
  scanInstruction: '学生証をスキャンしてください (Enter待機中)',
  scanHistory: 'スキャン履歴',
  noScanHistory: '履歴なし',

  // Tools menu
  tools: 'ツール',
  exportLabel: 'エクスポート',
  importLabel: 'インポート',
  backupLabel: 'バックアップ',
  exportStudents: '学生一覧 Excel',
  exportResidents: '在籍者名簿',
  exportAdmission: '入退学届出一覧',
  bulkImport: '一括インポート',
  backupSave: 'バックアップ保存',
  backupRestore: 'バックアップから復元',
  emailSettings: 'メール設定',
  dataReset: 'データ初期化',

  // Immigration menu
  immigration: '入管届出',
  rosterReport: '在籍者名簿',
  rosterReportSub: '5月/11月 定期届出用',
  admissionReport: '入退学届出一覧',
  admissionReportSub: '入退学から14日以内',

  // Avatar menu
  passwordChange: 'パスワード変更',

  // Statistics tab
  statistics: '統計',

  // Notices
  noticeBoard: 'お知らせ・掲示板',
  autoNotifyUpdate: '自動通知を更新',
  autoNotifyUpdated: '更新しました ✓',
  newPost: '新規投稿',
  noNotices: 'お知らせはありません',
  autoGenerate: '自動通知を生成する',
  postTitle: 'タイトル',
  postContent: '内容（任意）',
  postExpiry: '掲載期限',
  post: '投稿',

  // Student table row
  attendanceRateLabel: '出席率',
  noPartTime: 'バイトなし',
  balanceLabel: '残金',
  deadlineLabel: '期限',

  // Stats
  statsTitle: 'クラス別統計ダッシュボード',

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
  safetyEmergencyMode: '🚨 Safety Check / Emergency',
  scanTitle: 'Attendance Scan Mode',
  scanInstruction: 'Scan student ID card (awaiting Enter)',
  scanHistory: 'Scan History',
  noScanHistory: 'No history',

  // Tools menu
  tools: 'Tools',
  exportLabel: 'Export',
  importLabel: 'Import',
  backupLabel: 'Backup',
  exportStudents: 'Student List (Excel)',
  exportResidents: 'Resident Roster',
  exportAdmission: 'Enrollment Report',
  bulkImport: 'Bulk Import',
  backupSave: 'Save Backup',
  backupRestore: 'Restore Backup',
  emailSettings: 'Email Settings',
  dataReset: 'Reset Data',

  // Immigration menu
  immigration: 'Immigration',
  rosterReport: 'Resident Roster',
  rosterReportSub: 'May/Nov periodic report',
  admissionReport: 'Enrollment Report',
  admissionReportSub: 'Within 14 days of enrollment',

  // Avatar menu
  passwordChange: 'Change Password',

  // Statistics tab
  statistics: 'Stats',

  // Notices
  noticeBoard: 'Notices & Board',
  autoNotifyUpdate: 'Update Auto Notices',
  autoNotifyUpdated: 'Updated ✓',
  newPost: 'New Post',
  noNotices: 'No notices',
  autoGenerate: 'Generate auto notices',
  postTitle: 'Title',
  postContent: 'Content (optional)',
  postExpiry: 'Expires',
  post: 'Post',

  // Student table row
  attendanceRateLabel: 'Attendance',
  noPartTime: 'No part-time',
  balanceLabel: 'Balance',
  deadlineLabel: 'Expires',

  // Stats
  statsTitle: 'Class Statistics Dashboard',

  // Common
  noData: 'No data',
  loading: 'Loading...',
  selected: ' selected',
  longVacation: 'Long Vacation',
};

export { ja, en };
export type TranslationKey = keyof typeof ja;
