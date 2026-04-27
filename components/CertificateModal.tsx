import React from 'react';
import { Student } from '../types';
import { loadSchoolSettings } from './SchoolSettingsModal';
import { X, Printer } from 'lucide-react';

export type CertType = 'enrollment' | 'attendance';

interface CertificateModalProps {
  student: Student;
  type: CertType;
  onClose: () => void;
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

const formatEnrollmentDate = (dateStr: string): string => {
  if (!dateStr) return '________________';
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

// ── Shared A4 layout ──────────────────────────────────────────
const CertPage: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const settings = loadSchoolSettings();

  return (
    <div
      className="w-[210mm] min-h-[297mm] bg-white text-black font-serif flex flex-col"
      style={{ padding: '20mm 18mm', boxSizing: 'border-box' }}
    >
      <div className="flex-1 border-4 border-double border-gray-800 p-8 flex flex-col">

        {/* School header */}
        <div className="text-center mb-6">
          <p className="text-lg font-bold tracking-widest">{settings.schoolName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{settings.schoolAddress}</p>
        </div>

        {/* Title */}
        <h1
          className="text-3xl font-bold text-center border-b-2 border-gray-800 pb-4 mb-8"
          style={{ letterSpacing: '0.35em' }}
        >
          {title}
        </h1>

        {/* Content slot */}
        <div className="flex-1">{children}</div>

        {/* Footer */}
        <div className="mt-10">
          <p className="text-sm text-center mb-6">上記の通り証明いたします。</p>
          <div className="flex justify-between items-end">
            <div className="text-sm space-y-1">
              <p>発行日：{today()}</p>
              <p>学校名：{settings.schoolName}</p>
              <p>校　長：{settings.principalName || '___________________________'}（印）</p>
              {settings.phone && <p>電　話：{settings.phone}</p>}
            </div>
            <div className="w-24 h-24 border-2 border-gray-700 flex items-center justify-center text-xs text-gray-400">
              学校印
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 在籍証明書 ────────────────────────────────────────────────
const EnrollmentCert: React.FC<{ student: Student }> = ({ student }) => {
  const enrollPeriod = student.enrollmentDate
    ? `${formatEnrollmentDate(student.enrollmentDate)} 〜 現在`
    : '________________ 〜 現在';

  const rows: [string, string][] = [
    ['氏　　名', student.name],
    ['学 籍 番 号', student.studentId],
    ['国　　籍', student.nationality],
    ['年　　齢', `${student.age} 歳`],
    ['クラス・年次', `${student.className}　${student.grade}`],
    ['在 籍 期 間', enrollPeriod],
  ];

  return (
    <CertPage title="在　籍　証　明　書">
      <p className="text-sm mb-6 leading-loose">
        下記の者は、本校に在籍していることを証明いたします。
      </p>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-gray-300">
              <th className="py-3 pr-4 text-left font-medium text-gray-600 w-40 whitespace-nowrap">{label}</th>
              <td className="py-3 pl-4 text-gray-900 font-medium border-l border-gray-300">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CertPage>
  );
};

// ── 出席証明書 ────────────────────────────────────────────────
const AttendanceCert: React.FC<{ student: Student }> = ({ student }) => {
  const rate = student.attendanceRate;

  const rows: [string, string][] = [
    ['氏　　名', student.name],
    ['学 籍 番 号', student.studentId],
    ['クラス・年次', `${student.className}　${student.grade}`],
    ['対 象 期 間', '________________ 〜 ________________'],
    ['出 席 率', `${rate}％${rate < 80 ? '　（注意）' : ''}`],
    ['欠 席 日 数', '__________ 日'],
  ];

  return (
    <CertPage title="出　席　証　明　書">
      <p className="text-sm mb-6 leading-loose">
        下記の者の出席状況について、以下の通り証明いたします。
      </p>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-gray-300">
              <th className="py-3 pr-4 text-left font-medium text-gray-600 w-40 whitespace-nowrap">{label}</th>
              <td className="py-3 pl-4 text-gray-900 font-medium border-l border-gray-300">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rate < 80 && (
        <p className="mt-4 text-xs text-red-600 border border-red-300 bg-red-50 p-2 rounded">
          ※ 出席率が80%を下回っています。
        </p>
      )}
    </CertPage>
  );
};

// ── Modal wrapper ─────────────────────────────────────────────
const CertificateModal: React.FC<CertificateModalProps> = ({ student, type, onClose }) => {
  const title = type === 'enrollment' ? '在籍証明書' : '出席証明書';

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-start justify-center overflow-auto py-6">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 flex gap-2 z-[80] no-print">
        <span className="bg-gray-700 text-white text-sm px-4 py-2 rounded-l font-medium">{title}</span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 transition"
        >
          <Printer size={15} /> 印刷 / PDF保存
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-r transition"
        >
          <X size={15} /> 閉じる
        </button>
      </div>

      <div className="mt-14 shadow-2xl">
        {type === 'enrollment'
          ? <EnrollmentCert student={student} />
          : <AttendanceCert student={student} />}
      </div>

      <style>{`
        @media print {
          body > * { display: none !important; }
          .fixed.inset-0 { position: static !important; background: none !important; display: block !important; }
          .no-print { display: none !important; }
          .shadow-2xl { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default CertificateModal;
