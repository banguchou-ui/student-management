import { createContext, useContext } from 'react';

export type Lang = 'ja' | 'zh';

const LANG_KEY = 'sms_lang';

export const getLang = (): Lang => {
  const stored = localStorage.getItem(LANG_KEY);
  return stored === 'zh' ? 'zh' : 'ja';
};

export const setLang = (lang: Lang) => {
  localStorage.setItem(LANG_KEY, lang);
};

// ── Context ─────────────────────────────────────────────────────
export const LangContext = createContext<Lang>('ja');
export const useLang = () => useContext(LangContext);

// ── Translation function ─────────────────────────────────────────
export const t = (key: keyof typeof ja, lang: Lang): string =>
  (lang === 'zh' ? zh[key] : ja[key]) ?? key;

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
  langToggle: '中文',

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

const zh: typeof ja = {
  // Header Nav
  studentManagement: '学生管理',
  attendanceManagement: '出勤管理',
  notices: '公告栏',

  // Buttons
  addStudent: '新建学生',
  importCSV: '导入CSV',
  exportExcel: '导出Excel',
  userManagement: '用户管理',
  schoolSettings: '学校设置',
  logout: '退出登录',
  save: '保存',
  cancel: '取消',
  delete: '删除',
  close: '关闭',
  print: '打印',
  langToggle: '日本語',

  // Dashboard
  totalStudents: '在籍学生数',
  lowAttendance: '出勤率80%以下',
  unpaidTuition: '学费未缴',
  visaExpiring: '签证90天内到期',
  overworked: '超时劳动',
  jobHunting: '求职中',
  jobOffer: '已获内定',
  hasWarning: '有指导记录',
  noPhoto: '无照片',

  // Table Headers
  colStudentInfo: '学生信息',
  colAcademic: '学业・出勤',
  colFinanceVisa: '学费・签证',
  colStatus: '状态・警报',
  colActions: '操作',

  // Filters
  searchPlaceholder: '按姓名或学籍编号搜索...',
  allNationalities: '全部国籍',
  allJLPT: '全部JLPT',
  allTuition: '全部学费状态',
  classPlaceholder: '班级',

  // Safety mode
  safetyModeLabel: '安全确认',
  scannerLabel: '扫码',

  // Common
  noData: '暂无数据',
  loading: '加载中...',
  selected: ' 名已选',
  longVacation: '长假模式',
};

export { ja, zh };
export type TranslationKey = keyof typeof ja;
