import React, { useState } from 'react';
import { Student, CounselingRecord, TuitionStatus } from '../types';
import { X, FileText, CheckCircle, XCircle, AlertTriangle, Printer, Mail } from 'lucide-react';
import CertificateModal, { CertType } from './CertificateModal';
import { loadSchoolSettings } from './SchoolSettingsModal';
import { sendTuitionReminder } from '../utils/sendEmail';
import { useTr } from '../i18n/translations';

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

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex gap-2 py-1.5 border-b border-gray-100 text-sm">
    <span className="w-36 shrink-0 text-gray-500 font-medium">{label}</span>
    <span className="text-gray-800 flex-1">{value ?? <span className="text-gray-300">—</span>}</span>
  </div>
);

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student, onClose, onUpdateStudent }) => {
  const { tr } = useTr();

  const TABS: { id: TabId; label: string }[] = [
    { id: 'basic', label: tr('tabBasic') },
    { id: 'academic', label: tr('tabAcademic') },
    { id: 'visa', label: tr('tabVisa') },
    { id: 'life', label: tr('tabLife') },
  ];

  const [reportMode, setReportMode] = useState(false);
  const [certType, setCertType] = useState<CertType | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [newLogSummary, setNewLogSummary] = useState('');
  const [newLogTeacher, setNewLogTeacher] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ ok: boolean; msg: string } | null>(null);

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
    const settings = loadSchoolSettings();
    const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <div className="fixed inset-0 bg-gray-800 z-[60] overflow-auto">
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { margin: 0; }
          }
          @page { size: A4 portrait; margin: 15mm; }
        `}</style>

        {/* Toolbar */}
        <div className="no-print sticky top-0 z-10 bg-gray-900 text-white px-6 py-3 flex items-center gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold">
            <Printer size={15} /> {tr('printLabel')}
          </button>
          <button onClick={() => setReportMode(false)} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm">
            {tr('closeLabel')}
          </button>
          <span className="text-gray-400 text-xs ml-2">入管局提出用 — 留学生管理台帳</span>
        </div>

        {/* A4 Document */}
        <div className="flex justify-center py-8 px-4">
          <div className="w-[210mm] bg-white text-black shadow-2xl" style={{ minHeight: '297mm', padding: '15mm 18mm', boxSizing: 'border-box', fontFamily: 'serif' }}>

            {/* Document Header */}
            <div className="text-center border-b-4 border-double border-gray-800 pb-5 mb-6">
              {settings.logoBase64 && (
                <img src={settings.logoBase64} className="h-12 mx-auto mb-2 object-contain" alt="logo" />
              )}
              <h1 className="text-2xl font-bold tracking-widest">留 学 生 管 理 台 帳</h1>
              <p className="text-sm text-gray-500 mt-1">入国管理局 提出用書類</p>
            </div>

            {/* School Info */}
            <div className="mb-5 text-sm border border-gray-300 rounded p-3 bg-gray-50">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <div><span className="text-gray-500 w-20 inline-block">学校名:</span> <strong>{settings.schoolName}</strong></div>
                <div><span className="text-gray-500 w-20 inline-block">電話番号:</span> {settings.phone || '—'}</div>
                <div><span className="text-gray-500 w-20 inline-block">住所:</span> {settings.schoolAddress}</div>
                <div><span className="text-gray-500 w-20 inline-block">校長名:</span> {settings.principalName || '—'}</div>
                <div><span className="text-gray-500 w-20 inline-block">作成日:</span> {today}</div>
              </div>
            </div>

            {/* Photo + Basic Info */}
            <div className="flex gap-6 mb-6">
              <div className="w-28 h-36 border-2 border-gray-400 flex items-center justify-center overflow-hidden shrink-0 bg-gray-100 text-xs text-gray-400">
                {student.photoBase64
                  ? <img src={student.photoBase64} className="w-full h-full object-cover" style={{ transform: `scale(${student.photoTransform?.scale ?? 1}) translate(${student.photoTransform?.x ?? 0}px, ${student.photoTransform?.y ?? 0}px)` }} />
                  : '写真'}
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold border-b border-gray-400 pb-1 mb-3">■ 学生基本情報</h2>
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-gray-500 font-medium py-1 w-32">氏名</th>
                      <td className="py-1 font-bold text-base">{student.name}</td>
                      <th className="text-left text-gray-500 font-medium py-1 w-28">学籍番号</th>
                      <td className="py-1">{student.studentId}</td>
                    </tr>
                    {student.nameRomaji && (
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-gray-500 font-medium py-1">ローマ字氏名</th>
                      <td className="py-1" colSpan={3}>{student.nameRomaji}</td>
                    </tr>
                    )}
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-gray-500 font-medium py-1">国籍</th>
                      <td className="py-1">{student.nationality}</td>
                      <th className="text-left text-gray-500 font-medium py-1">性別</th>
                      <td className="py-1">{student.gender}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-gray-500 font-medium py-1">生年月日</th>
                      <td className="py-1">{student.birthDate || `${student.age}歳`}</td>
                      <th className="text-left text-gray-500 font-medium py-1">年齢</th>
                      <td className="py-1">{student.age} 歳</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-gray-500 font-medium py-1">在留カード番号</th>
                      <td className="py-1">{student.zairyuCardNumber || '—'}</td>
                      <th className="text-left text-gray-500 font-medium py-1">在留期限</th>
                      <td className="py-1">{student.visaExpiry || '—'}</td>
                    </tr>
                    <tr>
                      <th className="text-left text-gray-500 font-medium py-1">ビザ状況</th>
                      <td className="py-1" colSpan={3}>{student.visaStatus}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Academic Info */}
            <div className="mb-5">
              <h2 className="text-base font-bold border-b border-gray-400 pb-1 mb-3">■ 学業情報</h2>
              <table className="w-full text-sm border-collapse border border-gray-300">
                <tbody>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-gray-100 text-left w-1/4">クラス / 年次</th>
                    <td className="border border-gray-300 p-2">{student.className} / {student.grade}</td>
                    <th className="border border-gray-300 p-2 bg-gray-100 text-left w-1/4">入学日</th>
                    <td className="border border-gray-300 p-2">{student.enrollmentDate || '—'}</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-gray-100 text-left">出席率（当月）</th>
                    <td className="border border-gray-300 p-2">{student.attendanceRate}%</td>
                    <th className="border border-gray-300 p-2 bg-gray-100 text-left">出席率（前月）</th>
                    <td className="border border-gray-300 p-2">{student.attendanceLastMonth}%</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-gray-100 text-left">GPA</th>
                    <td className="border border-gray-300 p-2">{student.academicInfo.gpa} / 4.0</td>
                    <th className="border border-gray-300 p-2 bg-gray-100 text-left">JLPT</th>
                    <td className="border border-gray-300 p-2">{student.jlptLevel}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Life Info */}
            <div className="mb-5">
              <h2 className="text-base font-bold border-b border-gray-400 pb-1 mb-3">■ 生活情報</h2>
              <table className="w-full text-sm border-collapse border border-gray-300">
                <tbody>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-gray-100 text-left w-1/4">居住形態</th>
                    <td className="border border-gray-300 p-2">{student.housingType}</td>
                    <th className="border border-gray-300 p-2 bg-gray-100 text-left w-1/4">通学方法</th>
                    <td className="border border-gray-300 p-2">{student.commuteMethod}</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-gray-100 text-left">アルバイト先</th>
                    <td className="border border-gray-300 p-2">{student.workInfo.location || 'なし'}</td>
                    <th className="border border-gray-300 p-2 bg-gray-100 text-left">週労働時間</th>
                    <td className="border border-gray-300 p-2">{student.workInfo.hoursPerWeek ? `${student.workInfo.hoursPerWeek} 時間` : '—'}</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 p-2 bg-gray-100 text-left">就活状況</th>
                    <td className="border border-gray-300 p-2" colSpan={3}>
                      {student.jobHuntingStatus} {student.targetCompany && `(${student.targetCompany})`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Guidance & Counseling */}
            <div className="mb-5">
              <h2 className="text-base font-bold border-b border-gray-400 pb-1 mb-3">■ 指導歴・面談記録</h2>
              {student.warningHistory.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-bold text-gray-700 mb-1">違反・指導履歴:</p>
                  <table className="w-full text-xs border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-1.5 text-left">日付</th>
                        <th className="border border-gray-300 p-1.5 text-left">レベル</th>
                        <th className="border border-gray-300 p-1.5 text-left">内容</th>
                        <th className="border border-gray-300 p-1.5 text-left">署名</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.warningHistory.map(w => (
                        <tr key={w.id}>
                          <td className="border border-gray-300 p-1.5">{w.date}</td>
                          <td className="border border-gray-300 p-1.5">{w.level}</td>
                          <td className="border border-gray-300 p-1.5">{w.reason}</td>
                          <td className="border border-gray-300 p-1.5">{w.signed ? '済' : '未'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-sm font-bold text-gray-700 mb-1">面談記録:</p>
              {student.counselingRecords.length > 0 ? (
                <table className="w-full text-xs border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-1.5 text-left">日付</th>
                      <th className="border border-gray-300 p-1.5 text-left">担当</th>
                      <th className="border border-gray-300 p-1.5 text-left">内容</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.counselingRecords.map(r => (
                      <tr key={r.id}>
                        <td className="border border-gray-300 p-1.5 whitespace-nowrap">{r.date}</td>
                        <td className="border border-gray-300 p-1.5 whitespace-nowrap">{r.teacherName}</td>
                        <td className="border border-gray-300 p-1.5">{r.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-400 border border-gray-200 p-3 rounded">記録なし</p>
              )}
            </div>

            {/* Zairyu Card Images */}
            {(student.zairyuCardFront || student.zairyuCardBack) && (
              <div className="mb-5">
                <h2 className="text-base font-bold border-b border-gray-400 pb-1 mb-3">■ 在留カード</h2>
                <div className="flex gap-4">
                  <div className="flex-1 border border-gray-400 h-24 flex items-center justify-center relative overflow-hidden text-xs text-gray-400">
                    {student.zairyuCardFront
                      ? <img src={student.zairyuCardFront} className="w-full h-full object-contain" />
                      : '在留カード（表）未登録'}
                  </div>
                  <div className="flex-1 border border-gray-400 h-24 flex items-center justify-center relative overflow-hidden text-xs text-gray-400">
                    {student.zairyuCardBack
                      ? <img src={student.zairyuCardBack} className="w-full h-full object-contain" />
                      : '在留カード（裏）未登録'}
                  </div>
                </div>
              </div>
            )}

            {/* Signature */}
            <div className="mt-10 pt-6 border-t-2 border-gray-400">
              <div className="flex justify-between items-end">
                <div className="text-sm space-y-2">
                  <p>報告日: {today}</p>
                  <p>学校名: {settings.schoolName}</p>
                  <p>校　長: {settings.principalName || '____________________'}　（印）</p>
                  <p>担当者: ____________________　（印）</p>
                </div>
                <div className="w-20 h-20 border-2 border-gray-600 flex items-center justify-center text-xs text-gray-400">
                  学校印
                </div>
              </div>
            </div>
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
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded hover:bg-emerald-800 transition text-xs">
              <Printer size={14} /> {tr('printCardLabel')}
            </button>
            <button onClick={() => setReportMode(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded hover:bg-black transition text-xs">
              <FileText size={14} /> {tr('immigReportLabel')}
            </button>
            <button onClick={() => setCertType('enrollment')} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-xs">
              {tr('enrollCertLabel')}
            </button>
            <button onClick={() => setCertType('attendance')} className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded hover:bg-teal-700 transition text-xs">
              {tr('attendCertLabel')}
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
                    : tr('noPhotoLabel')}
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
              <Row label={tr('nameLabel')} value={student.name} />
              {student.nameRomaji && <Row label={tr('romajiLabel')} value={student.nameRomaji} />}
              <Row label={tr('studentIdLabel')} value={student.studentId} />
              <Row label={tr('genderLabel')} value={student.gender} />
              <Row label={tr('ageLabel')} value={`${student.age}`} />
              <Row label={tr('birthDateLabel')} value={student.birthDate || undefined} />
              <Row label={tr('nationalityLabel')} value={student.nationality} />
              <Row label={tr('motherTongueLabel')} value={student.motherTongue} />
              <Row label={tr('enrollmentDateLabel')} value={student.enrollmentDate} />
              <Row label={tr('classLabel')} value={student.className} />
              <Row label={tr('gradeLabel')} value={student.grade} />

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-1">{tr('emergencyContactLabel')}</p>
              <Row label={tr('nameLabel')} value={student.emergencyContact?.name} />
              <Row label={tr('relationshipLabel')} value={student.emergencyContact?.relationship} />
              <Row label={tr('phoneLabel')} value={student.emergencyContact?.phone} />
              <Row label={tr('emailLabel')} value={student.emergencyContact?.email} />
            </div>
          )}

          {/* === 学籍・財務 === */}
          {activeTab === 'academic' && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{tr('academicLabel')}</p>
              <Row label={tr('attendanceRateLabel')} value={
                <span className={student.attendanceRate < 80 ? 'text-red-600 font-bold' : 'text-green-700 font-bold'}>
                  {student.attendanceRate}%
                </span>
              } />
              <Row label={tr('lastMonthLabel')} value={`${student.attendanceLastMonth}%`} />
              <Row label={tr('jlptLabel')} value={student.jlptLevel} />
              <Row label={tr('gpaLabel')} value={`${student.academicInfo.gpa} / 4.0`} />

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-2">{tr('financeLabel')}</p>
              <Row label={tr('tuitionStatusLabel')} value={student.tuitionStatus} />
              <Row label={tr('balanceLabel')} value={student.tuitionBalance !== undefined ? `¥${student.tuitionBalance.toLocaleString()}` : undefined} />
              <Row label={tr('deadlineLabel')} value={student.nextTuitionDeadline} />

              {(student.tuitionStatus === TuitionStatus.UNPAID || student.tuitionStatus === TuitionStatus.PARTIAL) && (
                <div className="mt-3">
                  <button
                    onClick={async () => {
                      setEmailSending(true);
                      setEmailResult(null);
                      try {
                        const settings = loadSchoolSettings();
                        await sendTuitionReminder(student, settings);
                        setEmailResult({ ok: true, msg: `${student.emergencyContact?.email ?? ''} に送信しました` });
                      } catch (e: any) {
                        setEmailResult({ ok: false, msg: e.message });
                      } finally {
                        setEmailSending(false);
                      }
                    }}
                    disabled={emailSending}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 transition font-bold"
                  >
                    <Mail size={13} /> {emailSending ? tr('sendingLabel') : tr('sendEmailLabel')}
                  </button>
                  {emailResult && (
                    <p className={`text-xs mt-1.5 ${emailResult.ok ? 'text-green-600' : 'text-red-600'}`}>
                      {emailResult.ok ? '✓ ' : '✗ '}{emailResult.msg}
                    </p>
                  )}
                </div>
              )}

              {(student.tuitionHistory?.length ?? 0) > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{tr('tuitionHistoryLabel')}</p>
                  <div className="space-y-1">
                    {student.tuitionHistory.map((entry, i) => (
                      <div key={i} className="flex justify-between text-xs bg-gray-50 px-3 py-1.5 rounded">
                        <span className="text-gray-500">{entry.date}</span>
                        <span className="font-bold text-green-700">¥{entry.amount.toLocaleString()}</span>
                        <span className="text-gray-500">{entry.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-2">銀行情報</p>
              <Row label={tr('bankNameLabel')} value={student.bankInfo.bankName || undefined} />
              <Row label={tr('branchNameLabel')} value={student.bankInfo.branchName} />
              <Row label={tr('accountNumberLabel')} value={student.bankInfo.accountNumber} />
              <Row label={tr('accountHolderLabel')} value={student.bankInfo.accountHolder} />
            </div>
          )}

          {/* === 签証・進路 === */}
          {activeTab === 'visa' && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{tr('tabVisa')}</p>
              <Row label={tr('visaExpiryLabel')} value={student.visaExpiry} />
              <Row label={tr('visaStatusLabel')} value={student.visaStatus} />
              <Row label={tr('residenceCardLabel')} value={student.zairyuCardNumber} />

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-2">{tr('jobHuntingLabel')}</p>
              <Row label={tr('jobHuntingLabel')} value={student.jobHuntingStatus} />
              <Row label={tr('jobOfferLabel')} value={student.targetCompany || '—'} />

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-2">{tr('visaChecklistLabel')}</p>
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

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-2">{tr('careerMilestonesLabel')}</p>
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

              {(student.withdrawalDate || student.withdrawalReason) && (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-2">{tr('withdrawalDateLabel')}</p>
                  <Row label={tr('withdrawalDateLabel')} value={student.withdrawalDate} />
                  <Row label={tr('withdrawalReasonLabel')} value={student.withdrawalReason} />
                </>
              )}
            </div>
          )}

          {/* === 生活・指導 === */}
          {activeTab === 'life' && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{tr('lifestyleLabel')}</p>
              <div className="space-y-1 mb-4">
                <Row label={tr('commuteLabel')} value={student.commuteMethod} />
                <Row label={tr('housingLabel')} value={student.housingType} />
                <Row label={tr('rentLabel')} value={student.rentStatus} />
                <Row label={tr('guarantorLabel')} value={student.guarantorName ? `${student.guarantorName}　${student.guarantorPhone}` : undefined} />
                <Row label={tr('healthInsuranceLabel')} value={student.nationalHealthInsurance} />
              </div>

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{tr('partTimeLabel')}</p>
              <div className="space-y-1 mb-4">
                <Row label={tr('workplaceLabel')} value={student.workInfo.location} />
                <Row label={tr('jobTypeLabel')} value={student.workInfo.jobTitle} />
                <Row label={tr('workDaysLabel')} value={student.workInfo.days?.join('・')} />
                <Row label={tr('workHoursLabel')} value={student.workInfo.startTime && student.workInfo.endTime ? `${student.workInfo.startTime} 〜 ${student.workInfo.endTime}` : undefined} />
                <Row label={tr('weeklyHoursLabel')} value={student.workInfo.hoursPerWeek ? `${student.workInfo.hoursPerWeek}h` : undefined} />
                <Row label={tr('hourlyWageLabel')} value={student.workInfo.hourlyWage ? `¥${student.workInfo.hourlyWage.toLocaleString()}` : undefined} />
              </div>

              {/* Warning History */}
              {student.warningHistory.length > 0 && (
                <div className="mb-4 border border-red-200 bg-red-50 p-3 rounded">
                  <h4 className="font-bold text-red-700 mb-2 flex items-center gap-1.5 text-sm"><AlertTriangle size={15} /> {tr('warningHistoryLabel')}</h4>
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
                <h4 className="font-bold text-yellow-800 mb-2 text-sm">{tr('counselingLabel')}</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-2">
                  {student.counselingRecords.length > 0
                    ? student.counselingRecords.map(r => (
                      <div key={r.id} className="bg-white p-2 rounded text-sm shadow-sm">
                        <div className="text-xs text-gray-400 flex justify-between mb-0.5"><span>{r.date}</span><span>{r.teacherName}</span></div>
                        <div>{r.summary}</div>
                      </div>
                    ))
                    : <p className="text-xs text-gray-400">{tr('noRecordLabel')}</p>}
                </div>
                {onUpdateStudent && (
                  <div className="flex gap-2 mt-2">
                    <input value={newLogTeacher} onChange={e => setNewLogTeacher(e.target.value)} placeholder="担当者" className="border rounded p-1.5 text-xs w-24" />
                    <input value={newLogSummary} onChange={e => setNewLogSummary(e.target.value)} placeholder="記録内容" className="border rounded p-1.5 text-xs flex-1" />
                    <button onClick={handleAddLog} className="bg-yellow-500 text-white text-xs px-3 rounded">{tr('addLabel')}</button>
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
