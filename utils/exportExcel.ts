import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { Student } from '../types';
import { SchoolSettings } from '../components/SchoolSettingsModal';

// ── 共通ユーティリティ ────────────────────────────────────────────

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateJa(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function addDeadline(dateStr: string | undefined, days = 14): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  return formatDate(d.toISOString().slice(0, 10));
}

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF000080' },
};
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
const TITLE_FONT: Partial<ExcelJS.Font> = { bold: true, size: 11 };

function styleHeaderRow(row: ExcelJS.Row, colCount: number) {
  row.height = 20;
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c);
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
    };
  }
}

// ── 1. 一般学生一覧 ───────────────────────────────────────────────

export function exportStudentsToExcel(students: Student[]): void {
  const wb = XLSX.utils.book_new();

  const sheet1Headers = [
    '氏名', '学籍番号', '国籍', 'クラス', '年次',
    '出席率', 'JLPT', '学費状況', '残金', 'ビザ期限',
    'アルバイト先', '週時間', '就活状況'
  ];
  const sheet1Rows = students.map(s => [
    s.name, s.studentId, s.nationality, s.className, s.grade,
    `${s.attendanceRate}%`, s.jlptLevel, s.tuitionStatus,
    s.tuitionBalance !== undefined ? s.tuitionBalance : s.tuitionTotal - s.tuitionPaid,
    s.visaExpiry, s.workInfo?.location || '', s.workInfo?.hoursPerWeek || 0, s.jobHuntingStatus,
  ]);
  const ws1 = XLSX.utils.aoa_to_sheet([sheet1Headers, ...sheet1Rows]);
  XLSX.utils.book_append_sheet(wb, ws1, '学生一覧');

  const sheet2Headers = ['氏名', '学籍番号', '緊急連絡先氏名', '続柄', '電話番号', 'メール'];
  const sheet2Rows = students.map(s => [
    s.name, s.studentId,
    s.emergencyContact?.name || '', s.emergencyContact?.relationship || '',
    s.emergencyContact?.phone || '', s.emergencyContact?.email || '',
  ]);
  const ws2 = XLSX.utils.aoa_to_sheet([sheet2Headers, ...sheet2Rows]);
  XLSX.utils.book_append_sheet(wb, ws2, '緊急連絡先');

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `students_${date}.xlsx`);
}

// ── 2. 在籍者名簿（入管局定期届出用） ────────────────────────────

export async function exportImmigrationReport(
  students: Student[],
  settings: SchoolSettings
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = settings.schoolName;
  const ws = wb.addWorksheet('在籍者名簿');

  const today = new Date();
  const todayStr = formatDateJa(today.toISOString().slice(0, 10));
  const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  const colCount = COLS.length;

  // ── 列幅設定 ──
  ws.columns = [
    { width: 6 },   // A: 番号
    { width: 20 },  // B: 氏名（ローマ字）
    { width: 16 },  // C: 氏名
    { width: 14 },  // D: 生年月日
    { width: 6 },   // E: 性別
    { width: 14 },  // F: 国籍
    { width: 28 },  // G: 住居地
    { width: 18 },  // H: 在留カード番号
    { width: 12 },  // I: 在留期限
    { width: 8 },   // J: 出席率
    { width: 10 },  // K: クラス
    { width: 12 },  // L: 入学日
    { width: 24 },  // M: 備考
  ];

  // ── タイトル行（1行目） ──
  ws.mergeCells(`A1:${COLS[colCount - 1]}1`);
  const titleCell = ws.getCell('A1');
  titleCell.value = `留学生受入れ状況届出（在籍者名簿）　基準日：${todayStr}　学校名：${settings.schoolName}`;
  titleCell.font = TITLE_FONT;
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EEFF' } };
  ws.getRow(1).height = 22;

  // ── ヘッダー行（2行目） ──
  const headers = [
    '番号', '氏名（ローマ字）', '氏名', '生年月日', '性別',
    '国籍・地域', '住居地', '在留カード番号', '在留期限',
    '出席率', 'クラス', '入学日', '備考'
  ];
  const headerRow = ws.addRow(headers);
  styleHeaderRow(headerRow, colCount);

  // ── データ行（3行目以降） ──
  students.forEach((s, i) => {
    const residence = s.workInfo?.address || settings.defaultResidence || '';
    const row = ws.addRow([
      i + 1,
      s.nameRomaji || '',
      s.name,
      formatDate(s.birthDate),
      s.gender === '男性' ? '男' : s.gender === '女性' ? '女' : s.gender,
      s.nationality,
      residence,
      s.zairyuCardNumber || '',
      formatDate(s.visaExpiry),
      s.attendanceRate ? `${s.attendanceRate}%` : '',
      s.className,
      formatDate(s.enrollmentDate),
      '',
    ]);
    row.height = 18;
    // 偶数行に薄い背景
    if (i % 2 === 1) {
      for (let c = 1; c <= colCount; c++) {
        row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5FF' } };
      }
    }
    // 全セルに枠線
    for (let c = 1; c <= colCount; c++) {
      row.getCell(c).border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      };
      row.getCell(c).alignment = { vertical: 'middle', wrapText: false };
    }
  });

  // ── フッター ──
  ws.addRow([]);
  const footerRow = ws.addRow([
    '', '', `総在籍者数: ${students.length}名`, '', '', '', '', '', '', '', '', '',
    `届出先: 地方出入国在留管理局`
  ]);
  footerRow.getCell(3).font = { bold: true };
  footerRow.getCell(colCount).font = { italic: true, color: { argb: 'FF666666' } };

  ws.addRow(['', '', '', '', '', '', '', '', '', '', '', '',
    `提出期限: 5月末・11月末（定期届出）`]);
  ws.lastRow!.getCell(colCount).font = { italic: true, color: { argb: 'FF666666' } };

  // ── 出力 ──
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `在籍者名簿_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}.xlsx`;
  a.click();
}

// ── 3. 入退学届出一覧 ─────────────────────────────────────────────

export async function exportAdmissionReport(
  students: Student[],
  settings: SchoolSettings
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = settings.schoolName;
  const ws = wb.addWorksheet('入退学届出一覧');

  const today = new Date();
  const todayStr = formatDateJa(today.toISOString().slice(0, 10));
  const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  const colCount = COLS.length;

  // ── 列幅設定 ──
  ws.columns = [
    { width: 6 },   // A: 番号
    { width: 16 },  // B: 氏名
    { width: 14 },  // C: 生年月日
    { width: 6 },   // D: 性別
    { width: 14 },  // E: 国籍
    { width: 18 },  // F: 在留カード番号
    { width: 12 },  // G: 入学日
    { width: 14 },  // H: 届出種別
    { width: 14 },  // I: 届出期限
    { width: 10 },  // J: 届出済み
    { width: 24 },  // K: 備考
  ];

  // ── タイトル行 ──
  ws.mergeCells(`A1:${COLS[colCount - 1]}1`);
  const titleCell = ws.getCell('A1');
  titleCell.value = `入退学届出一覧　作成日：${todayStr}　学校名：${settings.schoolName}`;
  titleCell.font = TITLE_FONT;
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0E0' } };
  ws.getRow(1).height = 22;

  // ── ヘッダー行 ──
  const headers = [
    '番号', '氏名', '生年月日', '性別', '国籍・地域',
    '在留カード番号', '入学日', '届出種別', '届出期限（14日以内）',
    '届出済み', '備考'
  ];
  const headerRow = ws.addRow(headers);
  styleHeaderRow(headerRow, colCount);

  // ── データ行 ──
  students.forEach((s, i) => {
    const isWithdrawal = !!s.withdrawalDate;
    const eventDate = isWithdrawal ? s.withdrawalDate : s.enrollmentDate;
    const admissionDeadline = addDeadline(eventDate, 14);
    const row = ws.addRow([
      i + 1,
      s.name,
      formatDate(s.birthDate),
      s.gender === '男性' ? '男' : s.gender === '女性' ? '女' : s.gender,
      s.nationality,
      s.zairyuCardNumber || '',
      formatDate(eventDate),
      isWithdrawal ? '退学' : '入学',
      admissionDeadline,
      '□',
      isWithdrawal && s.withdrawalReason ? s.withdrawalReason : '',
    ]);
    row.height = 18;
    if (i % 2 === 1) {
      for (let c = 1; c <= colCount; c++) {
        row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8F0' } };
      }
    }
    for (let c = 1; c <= colCount; c++) {
      row.getCell(c).border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      };
      row.getCell(c).alignment = { vertical: 'middle' };
    }
    // 届出期限が近い場合は赤字
    if (admissionDeadline) {
      const deadline = new Date(admissionDeadline.replace(/\//g, '-'));
      const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / 86400000);
      if (daysLeft >= 0 && daysLeft <= 14) {
        row.getCell(9).font = { color: { argb: 'FFCC0000' }, bold: true };
      }
    }
  });

  // ── 注記 ──
  ws.addRow([]);
  ws.addRow(['【注記】', '', '届出種別は「入学」「退学」「卒業」から選択してください。届出は入退学から14日以内。']);
  ws.lastRow!.getCell(1).font = { bold: true };
  ws.addRow(['', '', `届出先: 地方出入国在留管理局（${settings.schoolAddress || '住所未設定'}）`]);
  ws.lastRow!.getCell(3).font = { italic: true, color: { argb: 'FF666666' } };

  // ── 出力 ──
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `入退学届出一覧_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}.xlsx`;
  a.click();
}
