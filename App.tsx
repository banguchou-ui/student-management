import React, { useState, useEffect, useRef } from 'react';
import { Student, FilterState, UserRole, User, SafetyStatus } from './types';
import { getStoredStudents, saveStoredStudents } from './services/storageService';
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
import { ShieldAlert, Download, Users, Briefcase, LogOut, Key, Settings, Plus, Upload, Database, Siren, CheckSquare, Trash2, Sun, FileDown, FileUp, ScanBarcode, XCircle, LayoutDashboard, CalendarDays, Bell, GraduationCap, UserCog, School } from 'lucide-react';

type TabType = 'students' | 'attendance' | 'notices';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    nationality: '',
    jlptLevel: '',
    tuitionStatus: '',
    hasJob: 'all',
    className: ''
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
          setScanLog(prev => [{ id: cleanId, name: '未登録カード', time, status: 'error' }, ...prev].slice(0, 10));
      }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUser(user);
    
    // Load and Sanitize Data
    const loaded = getStoredStudents();
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
        emergencyContact: s.emergencyContact || { name: '', relationship: '', phone: '', email: '' }
    }));
    
    setStudents(sanitizedStudents);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) saveStoredStudents(students);
  }, [students, isLoaded]);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => { performLogout(); setCurrentUser(null); setShowUserMgmt(false); };
  const openNewStudentForm = () => { setEditingStudent(null); setIsFormOpen(true); }
  const handleEditClick = (student: Student) => { setEditingStudent(student); setIsFormOpen(true); }

  const handleSaveStudent = (studentData: Student) => {
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
    setIsFormOpen(false);
    setEditingStudent(null);
    
    // Backup Reminder
    if (isNew) {
        if(window.confirm("新しい学生が登録されました。\nデータの安全のため、バックアップファイルをダウンロードしますか？")) {
            setTimeout(backupData, 500);
        }
    }
  };
  
  const handleProfileUpdate = (updatedStudent: Student) => {
     setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
     setViewingStudent(updatedStudent);
  }

  // --- Delete Logic ---
  const handleDeleteStudent = (studentId: string) => {
      if (currentUser?.role !== UserRole.PRINCIPAL) { 
          alert("この操作は校長権限（8888）が必要です。"); 
          return; 
      }
      const targetStudent = students.find(s => s.id === studentId);
      if (!targetStudent) return;

      if (window.confirm(`【警告】\n学生名: ${targetStudent.name}\n本当に削除しますか？`)) {
          const newStudents = students.filter(s => s.id !== studentId);
          setStudents(newStudents);
          // Immediately save to storage to ensure persistence
          saveStoredStudents(newStudents);
          
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
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (Array.isArray(json)) {
                  if(confirm(`バックアップファイルから ${json.length} 名の学生データを復元しますか？\n現在のデータは上書きされます。`)) {
                      setStudents(json);
                      saveStoredStudents(json);
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

  const exportCSV = () => {
    if (!currentUser?.permissions.canExportData) return;
    const headers = [
      '氏名', '学籍番号', '性別', '国籍', '在留カード番号', '出席率', '前月出席', 'GPA', '学分修了', '安否',
      '就活:履歴書', '就活:面接', '就活:内定', '就活:VISA申請',
      '銀行名', '口座番号', '名義人',
      '内定先', '離職後住所'
    ];
    const rows = students.map(s => [
      s.name, s.studentId, s.gender, s.nationality, s.zairyuCardNumber, `${s.attendanceRate}%`, `${s.attendanceLastMonth}%`, s.academicInfo.gpa, s.academicInfo.creditsEarned ? 'Yes' : 'No', s.safetyStatus,
      s.careerMilestones.resumeComplete ? '済' : '未', s.careerMilestones.interviewTraining ? '済' : '未', s.careerMilestones.jobOffer ? '済' : '未', s.careerMilestones.visaChangeApplied ? '済' : '未',
      s.bankInfo.bankName, s.bankInfo.accountNumber, s.bankInfo.accountHolder,
      s.exitInfo.companyName, s.exitInfo.addressAfterLeaving
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))].join('\n');
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `students_full_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
  };

  const totalStudents = students.length;
  const unknownSafety = students.filter(s => s.safetyStatus === SafetyStatus.UNKNOWN).length;

  if (!currentUser) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className={`flex h-screen w-full font-sans text-gray-900 overflow-hidden ${safetyMode ? 'bg-red-50' : 'bg-gray-100'}`}>
      <div className="flex-1 flex flex-col h-full w-full">
        {/* Header */}
        <header className={`${safetyMode ? 'bg-red-700' : 'bg-white'} shadow-sm border-b border-gray-200 p-3 flex justify-between items-center z-20 shrink-0 transition-colors duration-300`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <GraduationCap size={22} className={safetyMode ? 'text-white' : 'text-indigo-600'} />
              <h1 className={`text-lg font-bold hidden md:block ${safetyMode ? 'text-white' : 'text-gray-800'}`}>
                {safetyMode ? '🚨 安否確認・災害モード' : '留学生管理システム'}
              </h1>
            </div>

            {/* Tab Navigation */}
            {!safetyMode && (
              <nav className="flex items-center gap-1 ml-4">
                <button
                  onClick={() => setActiveTab('students')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'students' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Users size={15} /> 学生管理
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'attendance' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <CalendarDays size={15} /> 出席管理
                </button>
                <button
                  onClick={() => setActiveTab('notices')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'notices' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Bell size={15} /> お知らせ
                </button>
              </nav>
            )}
            
            {/* Safety Mode Toggle */}
            <button 
                onClick={() => setSafetyMode(!safetyMode)} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold transition shadow-sm text-sm ${safetyMode ? 'bg-white text-red-700 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
                <Siren size={16} /> {safetyMode ? `緊急モード (未確認: ${students.filter(s=>s.safetyStatus===SafetyStatus.UNKNOWN).length}名)` : '安否'}
            </button>

            {/* Scanner Mode Toggle */}
            {!safetyMode && activeTab === 'students' && (
                <button 
                    onClick={() => setScannerActive(true)} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-yellow-900 rounded-full font-bold shadow hover:bg-yellow-300 transition text-sm"
                >
                    <ScanBarcode size={16} /> スキャン
                </button>
            )}

            {!safetyMode && activeTab === 'students' && currentUser.permissions.canEditBasicInfo && (
                <button onClick={openNewStudentForm} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition font-bold text-sm">
                    <Plus size={16} />新規登録
                </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
             {/* Batch Actions Bar */}
             {selectedStudentIds.size > 0 && (
                 <div className="mr-2 bg-indigo-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 shadow text-sm">
                     <span className="font-bold">{selectedStudentIds.size}名 選択中</span>
                     <button onClick={handleBatchVacation} className="text-xs bg-white text-indigo-600 px-2 py-0.5 rounded hover:bg-indigo-50 flex items-center gap-1"><Sun size={12}/> 長期休暇</button>
                     <button onClick={() => setSelectedStudentIds(new Set())} className="p-1 hover:bg-indigo-500 rounded"><XCircle size={14}/></button>
                 </div>
             )}

             {!safetyMode && (
                <>
                    <input type="file" ref={restoreInputRef} className="hidden" accept=".json" onChange={handleRestoreFile} />
                    <button onClick={handleRestoreClick} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" title="バックアップから復元"><FileUp size={16} /></button>
                    <button onClick={backupData} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" title="バックアップ保存"><Database size={16} /></button>
                    {currentUser.role === UserRole.PRINCIPAL && (
                        <button onClick={handleResetData} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full" title="データ初期化"><Trash2 size={16} /></button>
                    )}
                </>
             )}
             
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm text-sm ${currentUser.role === UserRole.PRINCIPAL ? 'bg-purple-600' : 'bg-blue-600'}`}>
                {currentUser.name.charAt(0)}
             </div>
             {currentUser.permissions.canExportData && <button onClick={exportCSV} className="p-2 text-gray-500 hover:text-green-600" title="CSVエクスポート"><FileDown size={18} /></button>}
             {currentUser.permissions.canManageUsers && <button onClick={() => setShowUserMgmt(true)} className="p-2 text-gray-500 hover:text-purple-600" title="ユーザー管理"><UserCog size={18} /></button>}
             <button onClick={() => setShowSchoolSettings(true)} className="p-2 text-gray-500 hover:text-indigo-600" title="学校設定"><Settings size={18} /></button>
             <button onClick={handleLogout} className={`p-2 rounded-full transition ${safetyMode ? 'text-white hover:bg-red-600' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`} title="ログアウト"><LogOut size={16} /></button>
          </div>
        </header>

        {/* Dashboard Stats - always visible in student tab */}
        {!safetyMode && activeTab === 'students' && (
          <DashboardStats students={students} />
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
          <NoticeManager currentUserName={currentUser.name} canEdit={currentUser.permissions.canEditBasicInfo} />
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
                  <h2 className="text-4xl font-bold text-white mb-2">登校スキャンモード</h2>
                  <p className="text-xl text-green-400">学生証をスキャンしてください (Enter待機中)</p>
              </div>

              <div className="w-full max-w-2xl bg-white/10 backdrop-blur rounded-xl border border-white/20 p-6">
                  <h3 className="text-white font-bold mb-4 border-b border-white/20 pb-2">スキャン履歴</h3>
                  <div className="space-y-2">
                      {scanLog.length === 0 && <p className="text-white/30 text-center py-4">履歴なし</p>}
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
  );
};

export default App;
