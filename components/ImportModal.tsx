import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { Student } from '../types';
import { INITIAL_STUDENT_STATE } from '../constants';
import { JLPTLevel, Gender, VisaStatus } from '../types';

interface ImportModalProps {
  onClose: () => void;
  onImport: (students: Student[]) => void;
  existingStudents: Student[];
}

const COLUMN_MAP: { key: keyof Student | string; label: string }[] = [
  { key: 'name', label: '氏名' },
  { key: 'nameRomaji', label: 'ローマ字氏名' },
  { key: 'studentId', label: '学籍番号' },
  { key: 'gender', label: '性別' },
  { key: 'age', label: '年齢' },
  { key: 'birthDate', label: '生年月日' },
  { key: 'nationality', label: '国籍' },
  { key: 'motherTongue', label: '母語' },
  { key: 'className', label: 'クラス' },
  { key: 'grade', label: '年次' },
  { key: 'enrollmentDate', label: '入学日' },
  { key: 'jlptLevel', label: 'JLPT' },
  { key: 'zairyuCardNumber', label: '在留カード番号' },
  { key: 'visaExpiry', label: 'ビザ期限' },
];

type Step = 'upload' | 'preview' | 'result';

interface ParsedRow {
  raw: Record<string, string>;
  mapped: Partial<Student>;
  isOverwrite: boolean;
  error?: string;
}

function normalizeJlpt(val: string): JLPTLevel {
  const v = val.toUpperCase().trim();
  if (v === 'N1') return JLPTLevel.N1;
  if (v === 'N2') return JLPTLevel.N2;
  if (v === 'N3') return JLPTLevel.N3;
  if (v === 'N4') return JLPTLevel.N4;
  if (v === 'N5') return JLPTLevel.N5;
  return JLPTLevel.NONE;
}

function normalizeGender(val: string): Gender {
  if (['男', '男性', 'M', 'male', 'Male'].includes(val.trim())) return Gender.MALE;
  if (['女', '女性', 'F', 'female', 'Female'].includes(val.trim())) return Gender.FEMALE;
  return Gender.OTHER;
}

function parseRows(rows: string[][]): ParsedRow[] | null {
  if (rows.length < 2) return null;

  // Auto-detect header row
  const headerRow = rows[0].map(h => h?.toString().trim() ?? '');
  const colIndexMap: Record<string, number> = {};
  COLUMN_MAP.forEach(col => {
    const idx = headerRow.findIndex(h => h === col.label);
    if (idx !== -1) colIndexMap[col.key as string] = idx;
  });

  const dataRows = rows.slice(1).filter(r => r.some(c => c != null && c !== ''));
  return dataRows.map(row => {
    const raw: Record<string, string> = {};
    COLUMN_MAP.forEach(col => {
      const idx = colIndexMap[col.key as string];
      raw[col.label] = idx !== undefined ? (row[idx]?.toString() ?? '') : '';
    });

    const mapped: Partial<Student> = {
      ...INITIAL_STUDENT_STATE,
      id: crypto.randomUUID(),
      name: raw['氏名'] || '',
      nameRomaji: raw['ローマ字氏名'] || '',
      studentId: raw['学籍番号'] || '',
      gender: normalizeGender(raw['性別'] || ''),
      age: parseInt(raw['年齢']) || 18,
      birthDate: raw['生年月日'] || '',
      nationality: raw['国籍'] || '',
      motherTongue: raw['母語'] || '',
      className: raw['クラス'] || '',
      grade: raw['年次'] || '',
      enrollmentDate: raw['入学日'] || '',
      jlptLevel: normalizeJlpt(raw['JLPT'] || ''),
      zairyuCardNumber: raw['在留カード番号'] || '',
      visaExpiry: raw['ビザ期限'] || '',
      visaStatus: VisaStatus.ACTIVE,
    };

    return { raw, mapped, isOverwrite: false, error: !mapped.name ? '氏名が空です' : undefined };
  });
}

const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport, existingStudents }) => {
  const [step, setStep] = useState<Step>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [resultMsg, setResultMsg] = useState({ success: 0, overwrite: 0, error: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array', codepage: 932 });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as string[][];
        const parsed = parseRows(rows);
        if (!parsed || parsed.length === 0) {
          alert('データが見つかりません。ヘッダー行を確認してください。');
          return;
        }
        // Mark overwrites
        const withOverwrite = parsed.map(p => ({
          ...p,
          isOverwrite: p.mapped.studentId
            ? existingStudents.some(s => s.studentId === p.mapped.studentId)
            : false,
        }));
        setParsedRows(withOverwrite);
        setStep('preview');
      } catch (err) {
        alert('ファイルの読み込みに失敗しました。形式を確認してください。');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [existingStudents]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    const overwriteRows = parsedRows.filter(r => r.isOverwrite && !r.error);
    const hasOverwrites = overwriteRows.length > 0;

    if (hasOverwrites) {
      if (!window.confirm(`${overwriteRows.length}件の学籍番号が既に存在します。上書きしますか？`)) return;
    }

    const toImport: Student[] = [];
    let success = 0, overwrite = 0, error = 0;

    for (const row of parsedRows) {
      if (row.error) { error++; continue; }
      const student = row.mapped as Student;
      if (row.isOverwrite) {
        const existing = existingStudents.find(s => s.studentId === student.studentId);
        if (existing) {
          toImport.push({ ...existing, ...student, id: existing.id });
          overwrite++;
        }
      } else {
        toImport.push(student);
        success++;
      }
    }

    onImport(toImport);
    setResultMsg({ success, overwrite, error });
    setStep('result');
  };

  const previewRows = parsedRows.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-green-600" />
            <h2 className="font-bold text-gray-800">学生一括インポート</h2>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            {(['upload', 'preview', 'result'] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <span className={step === s ? 'text-indigo-600 font-bold' : ''}>
                  {i + 1}. {s === 'upload' ? 'ファイル選択' : s === 'preview' ? 'プレビュー' : '完了'}
                </span>
                {i < 2 && <ChevronRight size={14} />}
              </React.Fragment>
            ))}
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
              >
                <Upload size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-600 mb-1">ファイルをドラッグ＆ドロップ</p>
                <p className="text-sm text-gray-400 mb-4">または クリックしてファイルを選択</p>
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500">.xlsx / .xls / .csv 対応</span>
                <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileInput} />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-bold mb-2">対応フォーマット（ヘッダー行必須）</p>
                <div className="flex flex-wrap gap-1">
                  {COLUMN_MAP.map(c => (
                    <span key={c.key as string} className="bg-white border border-blue-200 px-2 py-0.5 rounded text-xs">{c.label}</span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-blue-600">※ 列の順番は問いません。ヘッダー名が一致する列を自動検出します。</p>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{fileName}</p>
                  <p className="text-sm text-gray-500">全 {parsedRows.length} 件を検出</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="text-green-700 font-medium">{parsedRows.filter(r => !r.error && !r.isOverwrite).length} 件新規</span>
                  <span className="text-amber-600 font-medium">{parsedRows.filter(r => r.isOverwrite).length} 件上書き</span>
                  {parsedRows.filter(r => r.error).length > 0 && (
                    <span className="text-red-600 font-medium">{parsedRows.filter(r => r.error).length} 件エラー</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-400">最初の5件プレビュー:</p>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left font-medium text-gray-600">状態</th>
                      <th className="p-2 text-left font-medium text-gray-600">氏名</th>
                      <th className="p-2 text-left font-medium text-gray-600">学籍番号</th>
                      <th className="p-2 text-left font-medium text-gray-600">国籍</th>
                      <th className="p-2 text-left font-medium text-gray-600">クラス</th>
                      <th className="p-2 text-left font-medium text-gray-600">JLPT</th>
                      <th className="p-2 text-left font-medium text-gray-600">ビザ期限</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i} className={`border-t ${row.error ? 'bg-red-50' : row.isOverwrite ? 'bg-amber-50' : ''}`}>
                        <td className="p-2">
                          {row.error
                            ? <span className="text-red-600 flex items-center gap-1"><AlertCircle size={12} /> エラー</span>
                            : row.isOverwrite
                              ? <span className="text-amber-600">上書き</span>
                              : <span className="text-green-600">新規</span>}
                        </td>
                        <td className="p-2 font-medium">{row.mapped.name || <span className="text-red-400">(空)</span>}</td>
                        <td className="p-2">{row.mapped.studentId}</td>
                        <td className="p-2">{row.mapped.nationality}</td>
                        <td className="p-2">{row.mapped.className}</td>
                        <td className="p-2">{row.mapped.jlptLevel}</td>
                        <td className="p-2">{row.mapped.visaExpiry}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedRows.length > 5 && (
                  <p className="text-xs text-gray-400 text-center py-2">...他 {parsedRows.length - 5} 件</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Result */}
          {step === 'result' && (
            <div className="text-center py-12 space-y-4">
              <CheckCircle size={64} className="mx-auto text-green-500" />
              <h3 className="text-xl font-bold text-gray-800">インポート完了</h3>
              <div className="flex justify-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{resultMsg.success}</p>
                  <p className="text-gray-500">新規追加</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-500">{resultMsg.overwrite}</p>
                  <p className="text-gray-500">上書き更新</p>
                </div>
                {resultMsg.error > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{resultMsg.error}</p>
                    <p className="text-gray-500">エラー（スキップ）</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-3 flex justify-end gap-3 bg-gray-50">
          {step === 'upload' && (
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">キャンセル</button>
          )}
          {step === 'preview' && (
            <>
              <button onClick={() => setStep('upload')} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded border">戻る</button>
              <button
                onClick={handleConfirmImport}
                className="px-5 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 font-bold"
              >
                {parsedRows.filter(r => !r.error).length}件をインポート
              </button>
            </>
          )}
          {step === 'result' && (
            <button onClick={onClose} className="px-5 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">閉じる</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
