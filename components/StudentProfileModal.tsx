import React, { useState } from 'react';
import { Student, CounselingRecord } from '../types';
import { X, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import CertificateModal, { CertType } from './CertificateModal';

interface StudentProfileModalProps {
  student: Student | null;
  onClose: () => void;
  onUpdateStudent?: (student: Student) => void;
}

const VISA_CHECKLIST_LABELS: Record<string, string> = {
  graduationCert: '卒業証明書',
  transcript: '成績証明書',
  attendanceCert: '出席証明書',
  recommendation: '推薦状',
  jobHuntingStatement: '就活理由書',
};

const CAREER_MILESTONE_LABELS: Record<string, string> = {
  resumeComplete: '履歴書完成',
  interviewTraining: '面接練習',
  jobOffer: '内定取得',
  visaChangeApplied: 'ビザ変更申請',
};

type TabId = 'basic' | 'academic' | 'visa' | 'life';

const TABS: { id: TabId; label: string }[] = [
  { id: 'basic', label: '基本・本人' },
  { id: 'academic', label: '学籍・財務' },
  { id: 'visa', label: '签証・進路' },
  { id: 'life', label: '生活・指導' },
];

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex gap-2 py-1.5 border-b border-gray-100 text-sm">
    <span className="w-36 shrink-0 text-gray-500 font-medium">{label}</span>
    <span className="text-gray-800 flex-1">{value ?? <span className="text-gray-300">—</span>}</span>
  </div>
);

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student, onClose, onUpdateStudent }) => {
  const [reportMode, setReportMode] = useState(false);
  const [certType, setCertType] = useState<CertType | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [newLogSummary, setNewLogSummary] = useState('');
  const [newLogTeacher, setNewLogTeacher] = useState('');

  if (!student) return null;

  const handlePrint = () => window.print();

  const handleAddLog = () => {
    if (!newLogSummary || !newLogTeacher || !onUpdateStudent) return;
    const newRecord: CounselingRecord = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      teacherName: newLogTeacher,
      summary: newLogSummary,
    };
    onUpdateStudent({ ...student, counselingRecords: [newRecord, ...student.counselingRecords] });
    setNewLogSummary('');
    setNewLogTeacher('');
  };

  // --- Immigration Report View (A4) ---
  if (reportMode) {
    return (
      <div className="fixed inset-0 bg-white z-[60] overflow-auto flex justify-center">
        <div className="w-[210mm] min-h-[297mm] p-12 bg-white shadow-none print:shadow-none relative text-black">
          <div className="absolute top-4 right-4 no-print flex gap-2">
            <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded">印刷 (Print)</button>
            <button onClick={() => setReportMode(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded">閉じる</button>
          </div>
          <h1 className="text-2xl font-serif text-center mb-8 border-b-2 border-black pb-4">留学生管理台帳 (入管提出用)</h1>
          <div className="flex gap-6 mb-8">
            <div className="w-32 h-40 border border-black flex items-center justify-center overflow-hidden">
              {student.photoBase64
                ? <img src={student.photoBase64} className="w-full h-full object-cover" style={{ transform: `scale(${student.photoTransform?.scale}) translate(${student.photoTransform?.x}px, ${student.photoTransform?.y}px)` }} />
                : '写真'}
            </div>
            <div className="flex-1 space-y-3 font-serif">
              <div className="flex justify-between border-b border-gray-300 pb-1">
                <span className="w-1/2">氏名: <strong>{student.name}</strong></span>
                <span className="w-1/2">学籍番号: {student.studentId}</span>
              </div>
              <div className="flex justify-between border-b border-gray-300 pb-1">
                <span className="w-1/2">国籍: {student.nationality}</span>
                <span className="w-1/4">性別: {student.gender}</span>
                <span className="w-1/4">年齢: {student.age}</span>
              </div>
              <div className="flex justify-between border-b border-gray-300 pb-1">
                <span className="w-1/2">在留カード番号: {student.zairyuCardNumber}</span>
                <span className="w-1/2">在留期限: {student.visaExpiry}</span>
              </div>
              <div className="border-b border-gray-300 pb-1">
                <span>住所: {student.workInfo.address || '学校寮'}</span>
              </div>
              <div className="border-b border-gray-300 pb-1">
                <span>通学方法: {student.commuteMethod} (自転車登録: {student.bikeRegNumber})</span>
              </div>
            </div>
          </div>
          <table className="w-full border-collapse border border-black mb-8 font-serif text-sm">
            <tbody>
              <tr>
                <th className="border border-black p-2 bg-gray-100 w-1/4">出席率</th>
                <td className="border border-black p-2">{student.attendanceRate}% (先月: {student.attendanceLastMonth}%)</td>
                <th className="border border-black p-2 bg-gray-100 w-1/4">クラス/年次</th>
                <td className="border border-black p-2">{student.className} / {student.grade}</td>
              </tr>
              <tr>
                <th className="border border-black p-2 bg-gray-100">成績 (GPA)</th>
                <td className="border border-black p-2">{student.academicInfo.gpa} (単位修得: {student.academicInfo.creditsEarned ? '済' : '未'})</td>
                <th className="border border-black p-2 bg-gray-100">JLPT</th>
                <td className="border border-black p-2">{student.jlptLevel}</td>
              </tr>
              <tr>
                <th className="border border-black p-2 bg-gray-100">アルバイト</th>
                <td className="border border-black p-2" colSpan={3}>
                  {student.workInfo.location
                    ? `${student.workInfo.location} (${student.workInfo.jobTitle}) - 週${student.workInfo.hoursPerWeek}時間`
                    : 'なし'}
                </td>
              </tr>
              <tr>
                <th className="border border-black p-2 bg-gray-100">進路希望</th>
                <td className="border border-black p-2" colSpan={3}>
                  {student.jobHuntingStatus} {student.targetCompany && `(${student.targetCompany})`}
                </td>
              </tr>
            </tbody>
          </table>
          <h3 className="font-bold mb-2 font-serif">指導・面談履歴</h3>
          <div className="border border-black min-h-[200px] p-4 text-sm font-serif mb-4">
            {student.warningHistory.length > 0 && (
              <div className="mb-4">
                <p className="font-bold underline">違反・指導:</p>
                <ul className="list-disc pl-5">
                  {student.warningHistory.map(w => <li key={w.id}>{w.date} [{w.level}] {w.reason}</li>)}
                </ul>
              </div>
            )}
            <p className="font-bold underline">面談記録:</p>
            {student.counselingRecords.length > 0
              ? <ul className="list-disc pl-5">{student.counselingRecords.map(r => <li key={r.id}>{r.date} ({r.teacherName}): {r.summary}</li>)}</ul>
              : <span className="text-gray-400">記録なし</span>}
          </div>
          <div className="flex gap-4 h-32 mt-4">
            <div className="flex-1 border border-black p-2 text-xs text-gray-500 relative">
              在留カード(表)
              {student.zairyuCardFront && <img src={student.zairyuCardFront} className="absolute inset-0 w-full h-full object-contain p-2" />}
            </div>
            <div className="flex-1 border border-black p-2 text-xs text-gray-500 relative">
              在留カード(裏)
              {student.zairyuCardBack && <img src={student.zairyuCardBack} className="absolute inset-0 w-full h-full object-contain p-2" />}
            </div>
          </div>
          <div className="mt-8 text-right font-serif text-sm">
            <p>作成日: {new Date().toLocaleDateString()}</p>
            <p>作成者: ______________________ (印)</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Certificate Preview ---
  if (certType) {
    return <CertificateModal student={student} type={certType} onClose={() => setCertType(null)} />;
  }

  // --- Normal View ---
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-11 bg-gray-200 rounded overflow-hidden border shrink-0">
              {student.photoBase64
                ? <img src={student.photoBase64} className="w-full h-full object-cover" style={{ transform: `scale(${student.photoTransform?.scale}) translate(${student.photoTransform?.x}px, ${student.photoTransform?.y}px)` }} />
                : null}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800 leading-tight">{student.name}</h2>
              <p className="text-xs text-gray-400">{student.studentId}</p>
            </div>
          </div>
          <div className="flex gap-1.5 items-center">
            <button onClick={() => setReportMode(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded hover:bg-black transition text-xs">
              <FileText size={14} /> 入管報告書
            </button>
            <button onClick={() => setCertType('enrollment')} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-xs">
              在籍証明書
            </button>
            <button onClick={() => setCertType('attendance')} className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded hover:bg-teal-700 transition text-xs">
              出席証明書
            </button>
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg"><X size={18} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* === 基本・本人 === */}
          {activeTab === 'basic' && (
            <div className="space-y-1">
              <div className="flex gap-5 mb-4">
                <div className="w-28 h-36 bg-gray-100 rounded border overflow-hidden shrink-0 flex items-center justify-center text-gray-300 text-xs">
                  {student.photoBase64
                    ? <img src={student.photoBase64} className="w-full h-full object-cover" style={{ transform: `scale(${student.photoTransform?.scale}) translate(${student.photoTransform?.x}px, ${student.photoTransform?.y}px)` }} />
                    : '写真なし'}
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold text-gray-900 mb-0.5">{student.name}</p>
                  <p className="text-sm text-gray-400 mb-3">{student.studentId}</p>
                  <div className="flex gap-2 flex-wrap">
                    {student.careerMilestones.jobOffer && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded border border-green-200 font-bold">内定取得</span>}
                    {student.academicInfo.creditsEarned && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded border border-blue-200 font-bold">単位満了</span>}
                    {student.safetyStatus === '無事' && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded border border-green-200">安否OK</span>}
                  </div>
                </div>
              </div>
              <Row label="氏名" value={student.name} />
              <Row label="学籍番号" value={student.studentId} />
              <Row label="性別" value={student.gender} />
              <Row label="年齢" value={`${student.age} 歳`} />
              <Row label="国籍" value={student.nationality} />
              <Row label="母語" value={student.motherTongue} />
              <Row label="入学日" value={student.enrollmentDate} />
              <Row label="クラス" value={student.className} />
              <Row label="年次" value={student.grade} />

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-1">緊急連絡先</p>
              <Row label="氏名" value={student.emergencyContact?.name} />
              <Row label="続柄" value={student.emergencyContact?.relationship} />
              <Row label="電話番号" value={student.emergencyContact?.phone} />
              <Row label="メール" value={student.emergencyContact?.email} />
            </div>
          )}

          {/* === 学籍・財務 === */}
          {activeTab === 'academic' && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">学籍</p>
              <Row label="出席率" value={
                <span className={student.attendanceRate < 80 ? 'text-red-600 font-bold' : 'text-green-700 font-bold'}>
                  {student.attendanceRate}%
                </span>
              } />
              <Row label="先月出席率" value={`${student.attendanceLastMonth}%`} />
              <Row label="JLPT" value={student.jlptLevel} />
              <Row label="GPA" value={`${student.academicInfo.gpa} / 4.0`} />
              <Row label="単位修得" value={student.academicInfo.creditsEarned ? '済み' : '未修得'} />

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-2">財務</p>
              <Row label="学費状況" value={student.tuitionStatus} />
              <Row label="残金" value={student.tuitionBalance !== undefined ? `¥${student.tuitionBalance.toLocaleString()}` : undefined} />
              <Row label="次回納付期限" value={student.nextTuitionDeadline} />

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-2">銀行情報</p>
              <Row label="銀行名" value={student.bankInfo.bankName || '未登録'} />
              <Row label="支店名" value={student.bankInfo.branchName} />
              <Row label="口座番号" value={student.bankInfo.accountNumber} />
              <Row label="口座名義" value={student.bankInfo.accountHolder} />
            </div>
          )}

          {/* === 签証・進路 === */}
          {activeTab === 'visa' && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">ビザ・在留</p>
              <Row label="ビザ期限" value={student.visaExpiry} />
              <Row label="ビザ状態" value={student.visaStatus} />
              <Row label="在留カード番号" value={student.zairyuCardNumber} />

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-2">進路・就活</p>
              <Row label="就活状況" value={student.jobHuntingStatus} />
              <Row label="内定先" value={student.targetCompany || '—'} />

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-2">ビザ書類チェックリスト</p>
              <div className="grid grid-cols-2 gap-2 mt-1 mb-3">
                {Object.entries(student.visaChecklist).map(([k, v]) => (
                  <div key={k} className={`flex items-center gap-2 text-sm ${v ? 'text-green-700' : 'text-gray-400'}`}>
                    {v
                      ? <CheckCircle size={15} className="shrink-0 text-green-500" />
                      : <XCircle size={15} className="shrink-0 text-gray-300" />}
                    {VISA_CHECKLIST_LABELS[k] ?? k}
                  </div>
                ))}
              </div>

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-2">就活マイルストーン</p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {Object.entries(student.careerMilestones).map(([k, v]) => (
                  <div key={k} className={`flex items-center gap-2 text-sm ${v ? 'text-green-700' : 'text-gray-400'}`}>
                    {v
                      ? <CheckCircle size={15} className="shrink-0 text-green-500" />
                      : <XCircle size={15} className="shrink-0 text-gray-300" />}
                    {CAREER_MILESTONE_LABELS[k] ?? k}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === 生活・指導 === */}
          {activeTab === 'life' && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">生活</p>
              <div className="space-y-1 mb-4">
                <Row label="通学方法" value={student.commuteMethod} />
                <Row label="自転車登録番号" value={student.bikeRegNumber} />
                <Row label="住居" value={student.housingType} />
                <Row label="家賃状況" value={student.rentStatus} />
                <Row label="保証人" value={student.guarantorName ? `${student.guarantorName}　${student.guarantorPhone}` : undefined} />
                <Row label="健康保険" value={student.nationalHealthInsurance} />
              </div>

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">アルバイト情報</p>
              <div className="space-y-1 mb-4">
                <Row label="勤務先" value={student.workInfo.location} />
                <Row label="職種" value={student.workInfo.jobTitle} />
                <Row label="曜日" value={student.workInfo.days?.join('・')} />
                <Row label="勤務時間" value={student.workInfo.startTime && student.workInfo.endTime ? `${student.workInfo.startTime} 〜 ${student.workInfo.endTime}` : undefined} />
                <Row label="週時間" value={student.workInfo.hoursPerWeek ? `${student.workInfo.hoursPerWeek} 時間` : undefined} />
                <Row label="時給" value={student.workInfo.hourlyWage ? `¥${student.workInfo.hourlyWage.toLocaleString()}` : undefined} />
              </div>

              {/* Warning History */}
              {student.warningHistory.length > 0 && (
                <div className="mb-4 border border-red-200 bg-red-50 p-3 rounded">
                  <h4 className="font-bold text-red-700 mb-2 flex items-center gap-1.5 text-sm"><AlertTriangle size={15} /> 指導・違反履歴</h4>
                  <ul className="space-y-1">
                    {student.warningHistory.map(w => (
                      <li key={w.id} className="flex gap-2 text-sm">
                        <span className="font-mono text-gray-500 shrink-0">{w.date}</span>
                        <span className="border px-1 bg-white rounded text-xs font-bold shrink-0">{w.level}</span>
                        <span>{w.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Counseling Records */}
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <h4 className="font-bold text-yellow-800 mb-2 text-sm">面談記録</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-2">
                  {student.counselingRecords.length > 0
                    ? student.counselingRecords.map(r => (
                      <div key={r.id} className="bg-white p-2 rounded text-sm shadow-sm">
                        <div className="text-xs text-gray-400 flex justify-between mb-0.5"><span>{r.date}</span><span>{r.teacherName}</span></div>
                        <div>{r.summary}</div>
                      </div>
                    ))
                    : <p className="text-xs text-gray-400">記録なし</p>}
                </div>
                {onUpdateStudent && (
                  <div className="flex gap-2 mt-2">
                    <input value={newLogTeacher} onChange={e => setNewLogTeacher(e.target.value)} placeholder="担当者" className="border rounded p-1.5 text-xs w-24" />
                    <input value={newLogSummary} onChange={e => setNewLogSummary(e.target.value)} placeholder="記録内容" className="border rounded p-1.5 text-xs flex-1" />
                    <button onClick={handleAddLog} className="bg-yellow-500 text-white text-xs px-3 rounded">追加</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;
