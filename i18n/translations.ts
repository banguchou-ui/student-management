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

  // Tab labels
  tabBasic: '基本・本人',
  tabAcademic: '学籍・財務',
  tabVisa: '查証・進路',
  tabLife: '生活・指導',

  // Student detail labels
  nameLabel: '氏名',
  studentIdLabel: '学籍番号',
  genderLabel: '性別',
  ageLabel: '年齢',
  birthDateLabel: '生年月日',
  nationalityLabel: '国籍',
  motherTongueLabel: '母語',
  enrollmentDateLabel: '入学日',
  classLabel: 'クラス',
  gradeLabel: '年次',
  emergencyContactLabel: '緊急連絡先',
  relationshipLabel: '続柄',
  phoneLabel: '電話番号',
  emailLabel: 'メール',
  romajiLabel: 'ローマ字氏名',

  // Academic / finance labels
  academicLabel: '学籍・成績情報',
  financeLabel: '財務管理',
  lastMonthLabel: '先月出席率',
  jlptLabel: 'JLPT',
  gpaLabel: 'GPA',
  tuitionStatusLabel: '学費納入状況',
  tuitionHistoryLabel: '納付履歴',
  addLabel: '追加',
  noHistoryLabel: '履歴はありません',
  saveLabel: '保存する',
  cancelLabel: 'キャンセル',
  deleteLabel: '削除',
  editLabel: '編集',

  // Visa / career labels
  visaStatusLabel: 'ビザ状態',
  visaExpiryLabel: 'ビザ期限',
  residenceCardLabel: '在留カード番号',
  jobHuntingLabel: '就活状況',
  jobOfferLabel: '内定先',
  visaChecklistLabel: 'ビザ書類チェックリスト',
  careerMilestonesLabel: '就活マイルストーン',
  withdrawalDateLabel: '退学日',
  withdrawalReasonLabel: '退学理由',

  // Lifestyle / guidance labels
  lifestyleLabel: '生活',
  commuteLabel: '通学方法',
  housingLabel: '住居',
  rentLabel: '家賃状況',
  guarantorLabel: '保証人',
  healthInsuranceLabel: '健康保険',
  partTimeLabel: 'アルバイト情報',
  workplaceLabel: '勤務先',
  jobTypeLabel: '職種',
  workDaysLabel: '曜日',
  workHoursLabel: '勤務時間',
  weeklyHoursLabel: '週時間',
  hourlyWageLabel: '時給',
  warningHistoryLabel: '指導歴',
  counselingLabel: '面談記録',

  // School settings labels
  schoolSettingsTitle: '学校設定',
  schoolLogoLabel: '学校ロゴ',
  schoolNameLabel: '学校名',
  addressLabel: '住所',
  principalLabel: '校長名',
  uploadLogoLabel: 'ロゴをアップロード',
  defaultResidenceLabel: '住居地デフォルト（入管届出用）',
  settingsNoteLabel: 'ここで設定した情報は証明書の発行に使用されます。',

  // Attendance labels
  allClassesLabel: '全クラス',
  csvExportLabel: 'CSV出力',
  presentLabel: '出',
  absentLabel: '欠',
  lateLabel: '遅',
  excusedLabel: '公',
  presentFull: '出席',
  absentFull: '欠席',
  lateFull: '遅刻',
  excusedFull: '公欠',

  // Bank info
  bankNameLabel: '銀行名',
  branchNameLabel: '支店名',
  accountNumberLabel: '口座番号',
  accountHolderLabel: '口座名義',

  // Profile modal buttons
  printCardLabel: '個票印刷',
  immigReportLabel: '入管報告書',
  enrollCertLabel: '在籍証明書',
  attendCertLabel: '出席証明書',
  printLabel: '印刷',
  closeLabel: '閉じる',
  sendEmailLabel: '催促メール送信',
  sendingLabel: '送信中...',
  noPhotoLabel: '写真なし',
  noRecordLabel: '記録なし',

  // Form misc
  longVacCheck: '長期休暇中 (上限40h)',
  creditEarned: '卒業必要単位 修得済み',
  settingSavedLabel: '学校設定を保存しました。',
  deleteLogoLabel: '削除',
  rightClickClear: '右クリック = クリア',
  studentColLabel: '学生',

  // Visa checklist labels
  visaGradCert: '卒業証明書',
  visaTranscript: '成績証明書',
  visaAttendCert: '出席証明書',
  visaRecommend: '推薦状',
  visaJobStatement: '就活理由書',

  // Career milestone labels
  careerResume: '履歴書完成',
  careerInterview: '面接練習',
  careerOffer: '内定取得',
  careerVisaChange: 'ビザ変更申請',

  // StudentFormModal section headers
  basicInfoTitle: '基本個人情報',
  partTimeTitle: 'アルバイト管理 (資格外活動)',
  workPhoneLabel: '勤務先電話番号',
  workShiftLabel: '時間帯 (シフト)',
  workStartLabel: '開始時間',
  workEndLabel: '終了時間',
  examsTitle: '外部試験・資格 (EJU, TOEIC, NAT-TEST等)',
  addExamLabel: '+ 資格を追加',
  nextTuitionLabel: '次回納入期限',
  tuitionTotalLabel: '学費総額',
  tuitionPaidLabel: '既納入額',
  tuitionBalanceLabel: '残額（未納分）:',
  visaCardTitle: 'ビザ・在留カード',
  zairyuFrontLabel: '在留カード（表）',
  zairyuBackLabel: '在留カード（裏）',
  visaDocsTitle: '更新・変更書類チェックリスト',
  careerTitle: '進路・就職',
  exitAddressLabel: '離籍後の住所（帰国/就職後）',
  adminBankTitle: '行政・銀行口座',
  myNumberRegistered: '登録済み',
  myNumberUnregistered: '未登録',
  myNumberUpload: '画像アップロード',
  branchCodeLabel: '支店名/記号',
  accountHolderKana: '名義人（カナ）',
  noWarningsLabel: '指導記録はありません',
  signedLabel: '本人署名',
  addWarningLabel: '+ 指導記録を追加',
  lifeSafetyTitle: '生活安全・住居・通勤',
  nameRequiredAlert: '氏名を入力してください',
  idRequiredAlert: '学籍番号を入力してください',

  // StudentProfileModal
  bankInfoTitle: '銀行情報',
  creditsFullLabel: '単位満了',
  safetyOkLabel: '安否OK',

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

  // Tab labels
  tabBasic: 'Basic / Personal',
  tabAcademic: 'Academic / Finance',
  tabVisa: 'Visa / Career',
  tabLife: 'Life / Guidance',

  // Student detail labels
  nameLabel: 'Full Name',
  studentIdLabel: 'Student ID',
  genderLabel: 'Gender',
  ageLabel: 'Age',
  birthDateLabel: 'Date of Birth',
  nationalityLabel: 'Nationality',
  motherTongueLabel: 'Mother Tongue',
  enrollmentDateLabel: 'Enrollment Date',
  classLabel: 'Class',
  gradeLabel: 'Grade',
  emergencyContactLabel: 'Emergency Contact',
  relationshipLabel: 'Relationship',
  phoneLabel: 'Phone',
  emailLabel: 'Email',
  romajiLabel: 'Name (Romaji)',

  // Academic / finance labels
  academicLabel: 'Academic Info',
  financeLabel: 'Finance',
  lastMonthLabel: 'Last Month',
  jlptLabel: 'JLPT',
  gpaLabel: 'GPA',
  tuitionStatusLabel: 'Tuition Status',
  tuitionHistoryLabel: 'Payment History',
  addLabel: 'Add',
  noHistoryLabel: 'No history',
  saveLabel: 'Save',
  cancelLabel: 'Cancel',
  deleteLabel: 'Delete',
  editLabel: 'Edit',

  // Visa / career labels
  visaStatusLabel: 'Visa Status',
  visaExpiryLabel: 'Visa Expiry',
  residenceCardLabel: 'Residence Card No.',
  jobHuntingLabel: 'Job Hunting',
  jobOfferLabel: 'Job Offer',
  visaChecklistLabel: 'Visa Checklist',
  careerMilestonesLabel: 'Career Milestones',
  withdrawalDateLabel: 'Withdrawal Date',
  withdrawalReasonLabel: 'Withdrawal Reason',

  // Lifestyle / guidance labels
  lifestyleLabel: 'Lifestyle',
  commuteLabel: 'Commute',
  housingLabel: 'Housing',
  rentLabel: 'Rent Status',
  guarantorLabel: 'Guarantor',
  healthInsuranceLabel: 'Health Insurance',
  partTimeLabel: 'Part-time Job',
  workplaceLabel: 'Workplace',
  jobTypeLabel: 'Job Type',
  workDaysLabel: 'Days',
  workHoursLabel: 'Work Hours',
  weeklyHoursLabel: 'Weekly Hours',
  hourlyWageLabel: 'Hourly Wage',
  warningHistoryLabel: 'Warning History',
  counselingLabel: 'Counseling Records',

  // School settings labels
  schoolSettingsTitle: 'School Settings',
  schoolLogoLabel: 'School Logo',
  schoolNameLabel: 'School Name',
  addressLabel: 'Address',
  principalLabel: 'Principal',
  uploadLogoLabel: 'Upload Logo',
  defaultResidenceLabel: 'Default Residence (Immigration)',
  settingsNoteLabel: 'This information will be used for certificate generation.',

  // Attendance labels
  allClassesLabel: 'All Classes',
  csvExportLabel: 'Export CSV',
  presentLabel: 'P',
  absentLabel: 'A',
  lateLabel: 'L',
  excusedLabel: 'E',
  presentFull: 'Present',
  absentFull: 'Absent',
  lateFull: 'Late',
  excusedFull: 'Excused',

  // Bank info
  bankNameLabel: 'Bank Name',
  branchNameLabel: 'Branch',
  accountNumberLabel: 'Account No.',
  accountHolderLabel: 'Account Holder',

  // Profile modal buttons
  printCardLabel: 'Print Card',
  immigReportLabel: 'Immigration Report',
  enrollCertLabel: 'Enrollment Cert.',
  attendCertLabel: 'Attendance Cert.',
  printLabel: 'Print',
  closeLabel: 'Close',
  sendEmailLabel: 'Send Reminder',
  sendingLabel: 'Sending...',
  noPhotoLabel: 'No Photo',
  noRecordLabel: 'No records',

  // Form misc
  longVacCheck: 'Long Vacation (max 40h)',
  creditEarned: 'Required credits earned',
  settingSavedLabel: 'School settings saved.',
  deleteLogoLabel: 'Remove',
  rightClickClear: 'right-click = clear',
  studentColLabel: 'Student',

  // Visa checklist labels
  visaGradCert: 'Graduation Cert.',
  visaTranscript: 'Transcript',
  visaAttendCert: 'Attendance Cert.',
  visaRecommend: 'Recommendation',
  visaJobStatement: 'Job Hunting Statement',

  // Career milestone labels
  careerResume: 'Resume Complete',
  careerInterview: 'Interview Practice',
  careerOffer: 'Job Offer',
  careerVisaChange: 'Visa Change Applied',

  // StudentFormModal section headers
  basicInfoTitle: 'Personal Info',
  partTimeTitle: 'Part-time Work (Permitted Activity)',
  workPhoneLabel: 'Work Phone',
  workShiftLabel: 'Shift',
  workStartLabel: 'Start Time',
  workEndLabel: 'End Time',
  examsTitle: 'External Exams (EJU, TOEIC, etc.)',
  addExamLabel: '+ Add Exam',
  nextTuitionLabel: 'Next Due Date',
  tuitionTotalLabel: 'Total Tuition',
  tuitionPaidLabel: 'Amount Paid',
  tuitionBalanceLabel: 'Balance (Unpaid):',
  visaCardTitle: 'Visa & Residence Card',
  zairyuFrontLabel: 'Residence Card (Front)',
  zairyuBackLabel: 'Residence Card (Back)',
  visaDocsTitle: 'Visa Document Checklist',
  careerTitle: 'Career & Employment',
  exitAddressLabel: 'Address After Departure',
  adminBankTitle: 'Admin & Bank Account',
  myNumberRegistered: 'Registered',
  myNumberUnregistered: 'Not Registered',
  myNumberUpload: 'Upload Image',
  branchCodeLabel: 'Branch / Code',
  accountHolderKana: 'Account Holder (Kana)',
  noWarningsLabel: 'No warnings on record',
  signedLabel: 'Signed',
  addWarningLabel: '+ Add Warning Record',
  lifeSafetyTitle: 'Safety, Housing & Commute',
  nameRequiredAlert: 'Please enter student name',
  idRequiredAlert: 'Please enter student ID',

  // StudentProfileModal
  bankInfoTitle: 'Bank Info',
  creditsFullLabel: 'Credits Completed',
  safetyOkLabel: 'Safety OK',

  // Common
  noData: 'No data',
  loading: 'Loading...',
  selected: ' selected',
  longVacation: 'Long Vacation',
};

export { ja, en };
export type TranslationKey = keyof typeof ja;
