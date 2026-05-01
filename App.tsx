import React, { useState, useEffect, useRef } from 'react';
import { Student, FilterState, UserRole, User, SafetyStatus } from './types';
import { getStoredStudents, saveStoredStudents } from './services/storageService';
import { fetchStudents, saveStudent, deleteStudent, saveAllStudents } from './services/firebaseService';
import { getCurrentUser, logout as performLogout } from './services/authService';
import StudentTable from './components/StudentTable';
import StudentProfileModal from './components/StudentProfileModal';
import StudentFormModal from './components/StudentFormModal';
import LoginPage from './components/LoginPage';
import UserManagementModal from './components/UserManagementModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import SchoolSettingsModal from './components/SchoolSettingsModal';
import DashboardStats from './components/DashboardStats';
import AttendanceManager from './components/AttendanceManager';
import NoticeManager from './components/NoticeManager';
import ImportModal from './components/ImportModal';
import ClassStats from './components/ClassStats';
import EmailSettingsModal from './components/EmailSettingsModal';
import { ShieldAlert, Download, Users, Briefcase, LogOut, Key, Settings, Plus, Upload, Database, Siren, CheckSquare, Trash2, Sun, FileDown, FileUp, ScanBarcode, XCircle, LayoutDashboard, CalendarDays, Bell, GraduationCap, UserCog, School, FileSpreadsheet, ClipboardList, ChevronDown, BarChart2, Mail } from 'lucide-react';
import { exportStudentsToExcel, exportImmigrationReport, exportAdmissionReport } from './utils/exportExcel';
import { loadSchoolSettings } from './components/SchoolSettingsModal';
import { getLang, setLang, Lang, LangContext, useTr } from './i18n/translations';

type TabType = 'students' | 'attendance' | 'notices' | 'stats';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showUserMgmt, setShowUserMgmt] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showSchoolSettings, setShowSchoolSettings] = useState(false);
  
  const [activeTab, setActiveTab] = useState<TabType>('students');

  // Deep Features State
  const [safetyMode, setSafetyMode] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  
  // Scanner Mode State
  const [scannerActive, setScannerActive] = useState(false);
  const [scanLog, setScanLog] = useState<{id: string, name: string, time: string, status: 'success' | 'error'}[]>([]);
  const scanBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [lang, setLangState] = useState<Lang>(getLang);

  const toggleLang = () => {
    const next: Lang = lang === 'ja' ? 'en' : 'ja';
    setLang(next);
    setLangState(next);
  };

  const { tr } = useTr();
  const [showImmigrationMenu, setShowImmigrationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);

  const handleImmigrationReport = async (type: 'roster' | 'admission') => {
    setShowImmigrationMenu(false);
    const settings = loadSchoolSettings();
    if (type === 'roster') {
      await exportImmigrationReport(students, settings);
    } else {
      await exportAdmissionReport(students, settings);
    }
  };


  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    nationality: '',
    jlptLevel: '',
    tuitionStatus: '',
    hasJob: 'all',
    className: '',
    noPhoto: '',
  });

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  // Scanner Listener
  useEffect(() => {
    if (!scannerActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent default actions for scanner input to avoid UI jumping
        if (e.key.length === 1 || e.key === 'Enter') {
            // e.preventDefault(); // Optional: might block normal typing if user wants to type ID manually
        }

        const now = Date.now();
        if (now - lastKeyTimeRef.current > 100) {
            scanBufferRef.current = ''; // Reset buffer if typing is too slow (manual input vs scanner)
        }
        lastKeyTimeRef.current = now;

        if (e.key === 'Enter') {
            processScan(scanBufferRef.current);
            scanBufferRef.current = '';
        } else {
            if (e.key.length === 1) {
                scanBufferRef.current += e.key;
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scannerActive, students]);

  const processScan = (id: string) => {
      if (!id) return;
      const cleanId = id.trim();
      const student = students.find(s => s.studentId === cleanId);
      const time = new Date().toLocaleTimeString();

      if (student) {
          audioRef.current?.play().catch(e => console.error("Audio play failed", e));
          setScanLog(prev => [{ id: cleanId, name: student.name, time, status: 'success' }, ...prev].slice(0, 10));
          // Here you would typically update the backend attendance record
      } else {
          setScanLog(prev => [{ id: cleanId, name: tr('noData'), time, status: 'error' }, ...prev].slice(0, 10));
      }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUser(user);

    // Load and Sanitize Data (Firebase or localStorage via firebaseService)
    const loadData = async () => {
      const loaded = await fetchStudents();
      const sanitizedStudents = loaded.map(s => ({
          ...s,
          id: s.id || crypto.randomUUID(),
          workInfo: s.workInfo || { days: [], hoursPerWeek: 0 },
          additionalExams: s.additionalExams || [],
          counselingRecords: s.counselingRecords || [],
          warningHistory: s.warningHistory || [],
          careerMilestones: s.careerMilestones || { resumeComplete: false, interviewTraining: false, jobOffer: false, visaChangeApplied: false },
          visaChecklist: s.visaChecklist || { graduationCert: false, transcript: false, attendanceCert: false, recommendation: false, jobHuntingStatement: false },
          bankInfo: s.bankInfo || { bankName: '', branchName: '', accountNumber: '', accountHolder: '' },
          tuitionBalance: s.tuitionBalance ?? (s.tuitionTotal - s.tuitionPaid),
          academicInfo: s.academicInfo || { gpa: 0, creditsEarned: false },
          exitInfo: s.exitInfo || { companyName: '', addressAfterLeaving: '', visaChangeType: '' },
          safetyStatus: s.safetyStatus || SafetyStatus.UNKNOWN,
          attendanceLastMonth: s.attendanceLastMonth ?? s.attendanceRate,
          photoTransform: s.photoTransform || { scale: 1, x: 0, y: 0 },
          enrollmentDate: s.enrollmentDate || '',
          birthDate: s.birthDate || '',
          nameRomaji: s.nameRomaji || '',
          withdrawalDate: s.withdrawalDate || '',
          withdrawalReason: s.withdrawalReason || '',
          tuitionHistory: s.tuitionHistory || [],
          emergencyContact: s.emergencyContact || { name: '', relationship: '', phone: '', email: '' }
      }));
      setStudents(sanitizedStudents);
      setIsLoaded(true);
    };
    loadData();
  }, []);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => { performLogout(); setCurrentUser(null); setShowUserMgmt(false); };
  const openNewStudentForm = () => { setEditingStudent(null); setIsFormOpen(true); }
  const handleEditClick = (student: Student) => { setEditingStudent(student); setIsFormOpen(true); }

  const handleSaveStudent = async (studentData: Student) => {
    if (!currentUser?.permissions.canEditBasicInfo) {
       alert("編集権限がありません");
       return;
    }
    const studentWithId = { ...studentData, id: studentData.id || crypto.randomUUID() };

    let isNew = false;
    if (students.find(s => s.id === studentWithId.id)) {
      setStudents(prev => prev.map(s => s.id === studentWithId.id ? studentWithId : s));
    } else {
      setStudents(prev => [...prev, studentWithId]);
      isNew = true;
    }
    try {
      await saveStudent(studentWithId);
    } catch (error: any) {
      alert('保存に失敗しました: ' + (error?.message ?? String(error)));
      return;
    }
    setIsFormOpen(false);
    setEditingStudent(null);

    if (isNew) {
        if(window.confirm("新しい学生が登録されました。\nデータの安全のため、バックアップファイルをダウンロードしますか？")) {
            setTimeout(backupData, 500);
        }
    }
  };
  
  const handleProfileUpdate = async (updatedStudent: Student) => {
     setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
     setViewingStudent(prev => prev?.id === updatedStudent.id ? updatedStudent : prev);
     try {
       await saveStudent(updatedStudent);
     } catch (error: any) {
       console.error('保存に失敗しました:', error);
     }
  }

  // --- Delete Logic ---
  const handleDeleteStudent = async (studentId: string) => {
      if (currentUser?.role !== UserRole.PRINCIPAL) {
          alert("この操作は校長権限（8888）が必要です。");
          return;
      }
      const targetStudent = students.find(s => s.id === studentId);
      if (!targetStudent) return;

      if (window.confirm(`【警告】\n学生名: ${targetStudent.name}\n本当に削除しますか？`)) {
          setStudents(prev => prev.filter(s => s.id !== studentId));
          await deleteStudent(studentId);

          const newSelected = new Set(selectedStudentIds);
          newSelected.delete(studentId);
          setSelectedStudentIds(newSelected);
      }
  };
  
  // --- Batch Operations ---
  const handleToggleSelect = (id: string) => {
      const newSet = new Set(selectedStudentIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedStudentIds(newSet);
  }
  
  const handleBatchVacation = () => {
      if (selectedStudentIds.size === 0) return;
      if (!confirm(`選択した ${selectedStudentIds.size} 名を長期休暇モード（上限40h）に設定しますか？`)) return;
      
      setStudents(prev => prev.map(s => {
          if (selectedStudentIds.has(s.id)) {
              return { ...s, workInfo: { ...s.workInfo, isLongVacation: true } };
          }
          return s;
      }));
      setSelectedStudentIds(new Set());
  }

  const handleResetData = () => {
      if (currentUser?.role !== UserRole.PRINCIPAL) return;
      if (confirm("【危険】すべての学生データを消去します。\n本当によろしいですか？\n(教職員アカウントは保持されます)")) {
          setStudents([]);
          localStorage.removeItem('sms_data_students_v1');
          alert("データをリセットしました");
      }
  }

  // --- Safety Toggle ---
  const handleToggleSafety = (id: string) => {
      setStudents(prev => prev.map(s => {
          if (s.id === id) {
              const newStatus = s.safetyStatus === SafetyStatus.SAFE ? SafetyStatus.UNKNOWN : SafetyStatus.SAFE;
              return { ...s, safetyStatus: newStatus };
          }
          return s;
      }));
  }

  const backupData = () => {
      if (!currentUser?.permissions.canExportData) { alert("権限がありません"); return; }
      const dataStr = JSON.stringify(students, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student_system_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleRestoreClick = () => restoreInputRef.current?.click();
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => { 
      if (!currentUser?.permissions.canManageUsers) { alert("権限がありません"); return; }
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (Array.isArray(json)) {
                  if(confirm(`バックアップファイルから ${json.length} 名の学生データを復元しますか？\n現在のデータは上書きされます。`)) {
                      setStudents(json);
                      await saveAllStudents(json);
                      alert("復元完了しました");
                  }
              } else {
                  alert("無効なJSONフォーマットです");
              }
          } catch (err) {
              alert("ファイル読み込みエラー");
          }
      };
      reader.readAsText(file);
      e.target.value = ''; // Reset input
  };

  const exportExcel = () => {
    if (!currentUser?.permissions.canExportData) return;
    exportStudentsToExcel(students);
  };

  const handleImport = async (imported: Student[]) => {
    const merged = [...students];
    for (const s of imported) {
      const idx = merged.findIndex(e => e.id === s.id);
      if (idx !== -1) merged[idx] = s;
      else merged.push(s);
    }
    setStudents(merged);
    try {
      await saveAllStudents(merged);
    } catch (err: any) {
      console.error('インポート保存エラー:', err);
    }
  };

  const totalStudents = students.length;
  const unknownSafety = students.filter(s => s.safetyStatus === SafetyStatus.UNKNOWN).length;

  if (!currentUser) return <LoginPage onLogin={handleLogin} />;

  return (
    <LangContext.Provider value={lang}>
    <div className={`flex h-screen w-full font-sans text-gray-900 overflow-hidden ${safetyMode ? 'bg-red-50' : 'bg-gray-100'}`}>
      <div className="flex-1 flex flex-col h-full w-full">
        {/* Header */}
        <header className={`${safetyMode ? 'bg-red-700' : 'bg-white'} shadow-sm border-b border-gray-200 p-3 flex justify-between items-center z-20 shrink-0 transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <GraduationCap size={22} className={safetyMode ? 'text-white' : 'text-indigo-600'} />
              <h1 className={`text-lg font-bold hidden md:block ${safetyMode ? 'text-white' : 'text-gray-800'}`}>
                {safetyMode ? tr('safetyEmergencyMode') : tr('systemTitle')}
              </h1>
            </div>

            {/* Tab Navigation */}
            {!safetyMode && (
              <nav className="flex items-center gap-1 ml-4">
                <button
                  onClick={() => setActiveTab('students')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'students' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Users size={15} /> {tr('studentManagement')}
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'attendance' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <CalendarDays size={15} /> {tr('attendanceManagement')}
                </button>
                <button
                  onClick={() => setActiveTab('notices')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'notices' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Bell size={15} /> {tr('notices')}
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <BarChart2 size={15} /> {tr('statistics')}
                </button>
              </nav>
            )}
            
            {/* Safety Mode Toggle */}
            <button 
                onClick={() => setSafetyMode(!safetyMode)} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold transition shadow-sm text-sm ${safetyMode ? 'bg-white text-red-700 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
                <Siren size={16} /> {safetyMode ? `${tr('safetyModeLabel')} (${students.filter(s=>s.safetyStatus===SafetyStatus.UNKNOWN).length})` : tr('safetyModeLabel')}
            </button>

            {/* Scanner Mode Toggle */}
            {!safetyMode && activeTab === 'students' && (
                <button 
                    onClick={() => setScannerActive(true)} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-yellow-900 rounded-full font-bold shadow hover:bg-yellow-300 transition text-sm"
                >
                    <ScanBarcode size={16} /> {tr('scannerLabel')}
                </button>
            )}

            {!safetyMode && activeTab === 'students' && currentUser.permissions.canEditBasicInfo && (
                <button onClick={openNewStudentForm} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition font-bold text-sm">
                    <Plus size={16} />{tr('addStudent')}
                </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
             {/* Batch Actions Bar */}
             {selectedStudentIds.size > 0 && (
                 <div className="mr-2 bg-indigo-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 shadow text-sm">
                     <span className="font-bold">{selectedStudentIds.size}{tr('selected')}</span>
                     <button onClick={handleBatchVacation} className="text-xs bg-white text-indigo-600 px-2 py-0.5 rounded hover:bg-indigo-50 flex items-center gap-1"><Sun size={12}/> {tr('longVacation')}</button>
                     <button onClick={() => setSelectedStudentIds(new Set())} className="p-1 hover:bg-indigo-500 rounded"><XCircle size={14}/></button>
                 </div>
             )}

             {/* ── ツール ▾ Dropdown ── */}
             {!safetyMode && (
               <div className="relative">
                 <input type="file" ref={restoreInputRef} className="hidden" accept=".json" onChange={handleRestoreFile} />
                 <button
                   onClick={() => setShowToolsMenu(v => !v)}
                   className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 rounded transition"
                 >
                   <Settings size={13} /> {tr('tools')} <ChevronDown size={11} />
                 </button>
                 {showToolsMenu && (
                   <>
                     <div className="fixed inset-0 z-30" onClick={() => setShowToolsMenu(false)} />
                     <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-40 overflow-hidden text-sm">
                       {/* Export group */}
                       {currentUser.permissions.canExportData && (
                         <>
                           <div className="px-3 py-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wide bg-gray-50 border-b border-gray-100">{tr('exportLabel')}</div>
                           <button onClick={() => { setShowToolsMenu(false); exportExcel(); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5">
                             <FileSpreadsheet size={14} className="text-green-600" /> {tr('exportStudents')}
                           </button>
                           <button onClick={() => { setShowToolsMenu(false); handleImmigrationReport('roster'); }} className="w-full text-left px-4 py-2 hover:bg-indigo-50 flex items-center gap-2.5">
                             <ClipboardList size={14} className="text-indigo-600" />
                             <span>{tr('exportResidents')} <span className="text-xs text-gray-400">5/11月</span></span>
                           </button>
                           <button onClick={() => { setShowToolsMenu(false); handleImmigrationReport('admission'); }} className="w-full text-left px-4 py-2 hover:bg-orange-50 flex items-center gap-2.5">
                             <ClipboardList size={14} className="text-orange-500" />
                             <span>{tr('exportAdmission')}</span>
                           </button>
                         </>
                       )}
                       {/* Import group */}
                       {currentUser.permissions.canEditBasicInfo && (
                         <>
                           <div className="border-t border-gray-100" />
                           <div className="px-3 py-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wide bg-gray-50 border-b border-gray-100">{tr('importLabel')}</div>
                           <button onClick={() => { setShowToolsMenu(false); setShowImport(true); }} className="w-full text-left px-4 py-2 hover:bg-green-50 flex items-center gap-2.5">
                             <Upload size={14} className="text-green-600" /> {tr('bulkImport')}
                           </button>
                         </>
                       )}
                       {/* Backup group */}
                       <div className="border-t border-gray-100" />
                       <div className="px-3 py-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wide bg-gray-50 border-b border-gray-100">{tr('backupLabel')}</div>
                       <button onClick={() => { setShowToolsMenu(false); backupData(); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5">
                         <Database size={14} className="text-gray-500" /> {tr('backupSave')}
                       </button>
                       <button onClick={() => { setShowToolsMenu(false); handleRestoreClick(); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2.5">
                         <FileUp size={14} className="text-gray-500" /> {tr('backupRestore')}
                       </button>
                       {/* Email / Danger */}
                       <div className="border-t border-gray-100" />
                       <button onClick={() => { setShowToolsMenu(false); setShowEmailSettings(true); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2.5">
                         <Mail size={14} className="text-blue-500" /> {tr('emailSettings')}
                       </button>
                       {currentUser.role === UserRole.PRINCIPAL && (
                         <>
                           <div className="border-t border-gray-100" />
                           <button onClick={() => { setShowToolsMenu(false); handleResetData(); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2.5">
                             <Trash2 size={14} /> {tr('dataReset')}
                           </button>
                         </>
                       )}
                     </div>
                   </>
                 )}
               </div>
             )}

             {/* Immigration report dropdown */}
             {currentUser.permissions.canExportData && (
               <div className="relative">
                 <button
                   onClick={() => setShowImmigrationMenu(v => !v)}
                   className="flex items-center gap-1 px-2 py-1.5 text-xs font-bold text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 border border-gray-200 rounded transition"
                   title={tr('immigration')}
                 >
                   <ClipboardList size={14} /> {tr('immigration')} <ChevronDown size={12} />
                 </button>
                 {showImmigrationMenu && (
                   <>
                     <div className="fixed inset-0 z-30" onClick={() => setShowImmigrationMenu(false)} />
                     <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-40 overflow-hidden">
                       <button onClick={() => handleImmigrationReport('roster')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center gap-2">
                         <FileSpreadsheet size={14} className="text-indigo-600" />
                         <div><div className="font-medium">{tr('rosterReport')}</div><div className="text-xs text-gray-400">{tr('rosterReportSub')}</div></div>
                       </button>
                       <div className="border-t border-gray-100" />
                       <button onClick={() => handleImmigrationReport('admission')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 flex items-center gap-2">
                         <FileSpreadsheet size={14} className="text-orange-500" />
                         <div><div className="font-medium">{tr('admissionReport')}</div><div className="text-xs text-gray-400">{tr('admissionReportSub')}</div></div>
                       </button>
                     </div>
                   </>
                 )}
               </div>
             )}

             {/* Avatar dropdown */}
             <div className="relative">
               <button
                 onClick={() => setShowUserMenu(v => !v)}
                 className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm text-sm ${currentUser.role === UserRole.PRINCIPAL ? 'bg-purple-600' : 'bg-blue-600'}`}
                 title={currentUser.name}
               >
                 {currentUser.name.charAt(0)}
               </button>
               {showUserMenu && (
                 <>
                   <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                   <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-40 overflow-hidden">
                     <div className="px-3 py-2 border-b border-gray-100 text-xs text-gray-500 truncate">{currentUser.name}</div>
                     <button onClick={() => { setShowUserMenu(false); setShowPwdModal(true); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                       <Key size={14} className="text-gray-400" /> {tr('passwordChange')}
                     </button>
                     <button onClick={() => { setShowUserMenu(false); handleLogout(); }} className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                       <LogOut size={14} /> {tr('logout')}
                     </button>
                   </div>
                 </>
               )}
             </div>

             {currentUser.permissions.canManageUsers && <button onClick={() => setShowUserMgmt(true)} className="p-2 text-gray-500 hover:text-purple-600" title="ユーザー管理"><UserCog size={18} /></button>}
             <button onClick={toggleLang} className="p-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 border border-gray-200 rounded" title="言語切替">{tr('langToggle')}</button>
             <button onClick={() => setShowSchoolSettings(true)} className="p-2 text-gray-500 hover:text-indigo-600" title="学校設定"><Settings size={18} /></button>
          </div>
        </header>

        {/* Dashboard Stats - always visible in student tab */}
        {!safetyMode && activeTab === 'students' && (
          <DashboardStats
            students={students}
            onPhotoFilter={() => {
              setFilters(prev => ({ ...prev, noPhoto: prev.noPhoto ? '' : 'true' }));
              setActiveTab('students');
            }}
            photoFilterActive={!!filters.noPhoto}
          />
        )}

        {/* Tab Content */}
        {activeTab === 'students' && (
          <StudentTable 
            students={students}
            filters={filters}
            searchTerm={searchTerm}
            onFilterChange={(k, v) => setFilters(prev => ({...prev, [k]: v}))}
            onSearchChange={setSearchTerm}
            onEdit={handleEditClick}
            onView={setViewingStudent}
            onDelete={handleDeleteStudent}
            permissions={currentUser.permissions}
            currentUserRole={currentUser.role}
            safetyMode={safetyMode}
            selectedIds={selectedStudentIds}
            onToggleSelect={handleToggleSelect}
            onToggleSafety={handleToggleSafety}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceManager students={students} onUpdateStudent={handleProfileUpdate} />
        )}

        {activeTab === 'notices' && (
          <NoticeManager currentUserName={currentUser.name} canEdit={currentUser.permissions.canEditBasicInfo} students={students} />
        )}

        {activeTab === 'stats' && (
          <ClassStats students={students} />
        )}
      </div>

      <StudentFormModal 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSaveStudent} 
          onDelete={currentUser?.role === UserRole.PRINCIPAL ? handleDeleteStudent : undefined}
          editingStudent={editingStudent} 
          permissions={currentUser.permissions} 
      />
      <StudentProfileModal student={viewingStudent} onClose={() => setViewingStudent(null)} onUpdateStudent={handleProfileUpdate} />
      {showUserMgmt && <UserManagementModal onClose={() => setShowUserMgmt(false)} currentUsername={currentUser.username} />}
      {showPwdModal && <ChangePasswordModal username={currentUser.username} onClose={() => setShowPwdModal(false)} />}
      {showSchoolSettings && <SchoolSettingsModal onClose={() => setShowSchoolSettings(false)} />}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={handleImport}
          existingStudents={students}
        />
      )}
      {showEmailSettings && <EmailSettingsModal onClose={() => setShowEmailSettings(false)} />}
      
      {/* Scanner Overlay */}
      {scannerActive && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-8">
              <button 
                  onClick={() => setScannerActive(false)} 
                  className="absolute top-8 right-8 text-white/50 hover:text-white transition"
              >
                  <XCircle size={48} />
              </button>
              
              <div className="text-center mb-12 animate-pulse">
                  <ScanBarcode size={120} className="text-green-400 mx-auto mb-6" />
                  <h2 className="text-4xl font-bold text-white mb-2">{tr('scanTitle')}</h2>
                  <p className="text-xl text-green-400">{tr('scanInstruction')}</p>
              </div>

              <div className="w-full max-w-2xl bg-white/10 backdrop-blur rounded-xl border border-white/20 p-6">
                  <h3 className="text-white font-bold mb-4 border-b border-white/20 pb-2">{tr('scanHistory')}</h3>
                  <div className="space-y-2">
                      {scanLog.length === 0 && <p className="text-white/30 text-center py-4">{tr('noScanHistory')}</p>}
                      {scanLog.map((log, i) => (
                          <div key={i} className={`flex justify-between items-center p-3 rounded ${log.status === 'success' ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
                              <div className="flex items-center gap-4">
                                  <span className="text-white/50 font-mono text-sm">{log.time}</span>
                                  <span className={`font-bold text-lg ${log.status === 'success' ? 'text-white' : 'text-red-300'}`}>
                                      {log.name}
                                  </span>
                                  <span className="text-white/50 text-sm">({log.id})</span>
                              </div>
                              <span className={`font-bold px-2 py-1 rounded text-xs ${log.status === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                  {log.status === 'success' ? 'OK' : 'ERROR'}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
    </LangContext.Provider>
  );
};

export default App;
