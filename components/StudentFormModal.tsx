import React, { useState, useEffect, useRef } from 'react';
import { Student, UserPermissions, TuitionStatus, WarningLevel, ExamRecord, Gender, WorkShift } from '../types';
import { NATIONALITIES, MOTHER_TONGUES, WEEK_DAYS, JLPT_LEVELS, WORK_SHIFTS, TUITION_STATUSES, VISA_STATUSES, JOB_HUNTING_STATUSES, COMMUTE_METHODS, HOUSING_TYPES, PAYMENT_STATUSES, WARNING_LEVELS, INITIAL_STUDENT_STATE, GENDERS } from '../constants';
import { Save, X, Upload, Lock, Plus, Trash2, Home, FileCheck, Briefcase, GraduationCap, Building, AlertTriangle, User, Clock, Wallet, Shield, Users, MapPin, Activity, FileImage, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ZoomIn } from 'lucide-react';
import { useTr } from '../i18n/translations';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  onDelete?: (studentId: string) => void; // New prop
  editingStudent: Student | null;
  permissions: UserPermissions;
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({ isOpen, onClose, onSave, onDelete, editingStudent, permissions }) => {
  const { tr } = useTr();
  const [formData, setFormData] = useState<Student>({ ...INITIAL_STUDENT_STATE, id: crypto.randomUUID() });
  const [customNat, setCustomNat] = useState('');
  const [customLang, setCustomLang] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'academic' | 'career' | 'compliance'>('basic');
  
  // Refs for file uploads
  const photoRef = useRef<HTMLInputElement>(null);
  const myNumberRef = useRef<HTMLInputElement>(null);
  const zairyuFrontRef = useRef<HTMLInputElement>(null);
  const zairyuBackRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingStudent) {
        setFormData(JSON.parse(JSON.stringify(editingStudent)));
        if (!NATIONALITIES.includes(editingStudent.nationality) && editingStudent.nationality) setCustomNat(editingStudent.nationality);
        if (!MOTHER_TONGUES.includes(editingStudent.motherTongue) && editingStudent.motherTongue) setCustomLang(editingStudent.motherTongue);
      } else {
        setFormData({ ...INITIAL_STUDENT_STATE, id: crypto.randomUUID() });
        setCustomNat('');
        setCustomLang('');
      }
      setActiveTab('basic');
    }
  }, [isOpen, editingStudent]);

  const calculateWorkHours = (start: string, end: string, daysCount: number) => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let duration = (endH + endM / 60) - (startH + startM / 60);
    if (duration < 0) duration += 24;
    return parseFloat((duration * daysCount).toFixed(1));
  };

  const handleChange = (field: keyof Student, value: any) => {
    setFormData(prev => {
        const newData = { ...prev, [field]: value };
        
        // Auto-calculate tuition balance
        if (field === 'tuitionTotal' || field === 'tuitionPaid') {
            const total = field === 'tuitionTotal' ? value : newData.tuitionTotal;
            const paid = field === 'tuitionPaid' ? value : newData.tuitionPaid;
            newData.tuitionBalance = total - paid;
        }
        
        return newData;
    });
  };

  const handleDeepChange = (parent: keyof Student, child: string, value: any) => {
      setFormData(prev => ({
          ...prev,
          [parent]: { ...prev[parent as any], [child]: value }
      }));
  };

  const handleWorkChange = (field: string, value: any) => {
      setFormData(prev => {
          const newWorkInfo = { ...prev.workInfo, [field]: value };
          
          // Auto-calculate hours
          if (['startTime', 'endTime', 'days'].includes(field)) {
              const daysCount = field === 'days' ? value.length : newWorkInfo.days.length;
              const start = field === 'startTime' ? value : newWorkInfo.startTime;
              const end = field === 'endTime' ? value : newWorkInfo.endTime;
              newWorkInfo.hoursPerWeek = calculateWorkHours(start, end, daysCount);
          }
          
          return { ...prev, workInfo: newWorkInfo };
      });
  };
  
  const handlePhotoTransform = (axis: 'x' | 'y' | 'scale', delta: number) => {
      setFormData(prev => ({
          ...prev,
          photoTransform: {
              ...prev.photoTransform,
              [axis]: axis === 'scale' ? delta : (prev.photoTransform[axis] + delta)
          }
      }));
  };

  const handleDayToggle = (day: string) => {
    const currentDays = formData.workInfo.days;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    handleWorkChange('days', newDays);
  };

  const handleFileRead = (file: File, callback: (res: string) => void) => {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('氏名を入力してください');
      return;
    }
    if (!formData.studentId?.trim()) {
      alert('学籍番号を入力してください');
      return;
    }
    const finalData = { ...formData };
    if (formData.nationality === 'その他 (手入力)') finalData.nationality = customNat;
    if (formData.motherTongue === 'その他 (手入力)') finalData.motherTongue = customLang;
    onSave(finalData);
  };

  // --- Helpers ---
  const addWarning = () => setFormData(prev => ({ ...prev, warningHistory: [...prev.warningHistory, { id: crypto.randomUUID(), date: '', level: WarningLevel.ORAL, reason: '', signed: false }] }));
  const updateWarning = (id: string, field: string, value: any) => setFormData(prev => ({ ...prev, warningHistory: prev.warningHistory.map(w => w.id === id ? { ...w, [field]: value } : w) }));
  
  const addExam = () => setFormData(prev => ({ ...prev, additionalExams: [...prev.additionalExams, { id: crypto.randomUUID(), name: '', result: '' }] }));
  const updateExam = (id: string, field: string, value: any) => setFormData(prev => ({ ...prev, additionalExams: prev.additionalExams.map(e => e.id === id ? { ...e, [field]: value } : e) }));

  if (!isOpen) return null;

  const TabButton = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
      <button 
        type="button"
        onClick={() => setActiveTab(id)} 
        className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === id ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
      >
          <Icon size={18}/> {label}
      </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shrink-0">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <User size={24}/>
                {editingStudent ? tr('editLabel') : tr('addStudent')}
            </h2>
            <button onClick={onClose} className="hover:bg-indigo-500 p-1 rounded"><X size={24} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-white shrink-0 overflow-x-auto">
            <TabButton id="basic" icon={User} label={tr('tabBasic')} />
            <TabButton id="academic" icon={GraduationCap} label={tr('tabAcademic')} />
            <TabButton id="career" icon={Briefcase} label={tr('tabVisa')} />
            <TabButton id="compliance" icon={AlertTriangle} label={tr('tabLife')} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
                
                {/* --- TAB 1: BASIC & WORK --- */}
                {activeTab === 'basic' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* 1. Identity */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">基本個人情報</h3>
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Photo Area with Pan Controls */}
                                <div className="w-40 flex flex-col items-center gap-2 shrink-0">
                                    <div className="w-32 h-40 bg-gray-100 border-2 border-dashed border-gray-300 rounded overflow-hidden relative group">
                                        {formData.photoBase64 ? (
                                            <img src={formData.photoBase64} className="w-full h-full object-cover transition-transform origin-center" style={{transform: `scale(${formData.photoTransform.scale}) translate(${formData.photoTransform.x}px, ${formData.photoTransform.y}px)`}}/>
                                        ) : (
                                            <span className="text-xs text-gray-400 m-auto block text-center pt-16">写真なし</span>
                                        )}
                                        {permissions.canEditBasicInfo && <div onClick={() => photoRef.current?.click()} className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center cursor-pointer"><Upload className="text-white"/></div>}
                                    </div>
                                    
                                    {permissions.canEditBasicInfo && (
                                        <div className="flex flex-col items-center gap-2 w-full">
                                            <div className="flex gap-1">
                                                <button type="button" onClick={() => handlePhotoTransform('y', 5)} className="p-1 bg-gray-200 rounded hover:bg-gray-300"><ArrowUp size={12}/></button>
                                            </div>
                                            <div className="flex gap-1">
                                                <button type="button" onClick={() => handlePhotoTransform('x', 5)} className="p-1 bg-gray-200 rounded hover:bg-gray-300"><ArrowLeft size={12}/></button>
                                                <button type="button" onClick={() => handlePhotoTransform('y', -5)} className="p-1 bg-gray-200 rounded hover:bg-gray-300"><ArrowDown size={12}/></button>
                                                <button type="button" onClick={() => handlePhotoTransform('x', -5)} className="p-1 bg-gray-200 rounded hover:bg-gray-300"><ArrowRight size={12}/></button>
                                            </div>
                                            <div className="flex items-center gap-2 w-full mt-1">
                                                <ZoomIn size={12}/>
                                                <input type="range" min="1" max="3" step="0.1" value={formData.photoTransform.scale} onChange={e => handlePhotoTransform('scale', parseFloat(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                            </div>
                                        </div>
                                    )}
                                    <input type="file" ref={photoRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFileRead(e.target.files[0], res => handleChange('photoBase64', res))}/>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold text-gray-500">{tr('nameLabel')} *</label><input required placeholder="例: 王 小明" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full border p-2 rounded"/></div>
                                    <div><label className="text-xs font-bold text-gray-500">{tr('studentIdLabel')} *</label><input required placeholder="例: 2301001" value={formData.studentId} onChange={e => handleChange('studentId', e.target.value)} className="w-full border p-2 rounded"/></div>
                                    <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">{tr('romajiLabel')}</label><input placeholder="例: YAMADA TARO" value={formData.nameRomaji || ''} onChange={e => handleChange('nameRomaji', e.target.value)} className="w-full border p-2 rounded"/></div>

                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-500">{tr('genderLabel')}</label>
                                            <select value={formData.gender} onChange={e => handleChange('gender', e.target.value)} className="w-full border p-2 rounded">
                                                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex-1"><label className="text-xs font-bold text-gray-500">{tr('ageLabel')}</label><input type="number" value={formData.age} onChange={e => handleChange('age', parseInt(e.target.value))} className="w-full border p-2 rounded"/></div>
                                    </div>
                                    <div><label className="text-xs font-bold text-gray-500">{tr('birthDateLabel')}</label><input type="date" value={formData.birthDate || ''} onChange={e => handleChange('birthDate', e.target.value)} className="w-full border p-2 rounded"/></div>

                                    <div className="flex gap-2">
                                        <div className="flex-1"><label className="text-xs font-bold text-gray-500">{tr('classLabel')}</label><input value={formData.className} onChange={e => handleChange('className', e.target.value)} className="w-full border p-2 rounded" placeholder="例: A1"/></div>
                                        <div className="flex-1"><label className="text-xs font-bold text-gray-500">{tr('gradeLabel')}</label><input value={formData.grade} onChange={e => handleChange('grade', e.target.value)} className="w-full border p-2 rounded" placeholder="例: 1年生"/></div>
                                    </div>
                                    <div><label className="text-xs font-bold text-gray-500">{tr('enrollmentDateLabel')}</label><input type="date" value={formData.enrollmentDate} onChange={e => handleChange('enrollmentDate', e.target.value)} className="w-full border p-2 rounded"/></div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500">{tr('nationalityLabel')}</label>
                                        <select value={NATIONALITIES.includes(formData.nationality) ? formData.nationality : 'その他 (手入力)'} onChange={e => handleChange('nationality', e.target.value)} className="w-full border p-2 rounded mb-1">
                                            {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                        {(formData.nationality === 'その他 (手入力)' || !NATIONALITIES.includes(formData.nationality)) && (
                                            <input type="text" placeholder="国籍を手入力" value={customNat} onChange={e => setCustomNat(e.target.value)} className="w-full border p-2 rounded bg-yellow-50" />
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">{tr('motherTongueLabel')}</label>
                                        <select value={MOTHER_TONGUES.includes(formData.motherTongue) ? formData.motherTongue : 'その他 (手入力)'} onChange={e => handleChange('motherTongue', e.target.value)} className="w-full border p-2 rounded mb-1">
                                            {MOTHER_TONGUES.map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                        {(formData.motherTongue === 'その他 (手入力)' || !MOTHER_TONGUES.includes(formData.motherTongue)) && (
                                            <input type="text" placeholder="母語を手入力" value={customLang} onChange={e => setCustomLang(e.target.value)} className="w-full border p-2 rounded bg-yellow-50" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Emergency Contact */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
                            <h3 className="text-lg font-bold text-orange-700 mb-4 border-b border-orange-100 pb-2 flex items-center gap-2"><Users size={20}/> {tr('emergencyContactLabel')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">{tr('nameLabel')}</label><input value={formData.emergencyContact.name} onChange={e => handleDeepChange('emergencyContact', 'name', e.target.value)} className="w-full border p-2 rounded" placeholder="例: 王 建国"/></div>
                                <div><label className="text-xs font-bold text-gray-500">{tr('relationshipLabel')}</label><input value={formData.emergencyContact.relationship} onChange={e => handleDeepChange('emergencyContact', 'relationship', e.target.value)} className="w-full border p-2 rounded" placeholder="例: 父、母、兄"/></div>
                                <div><label className="text-xs font-bold text-gray-500">{tr('phoneLabel')}</label><input value={formData.emergencyContact.phone} onChange={e => handleDeepChange('emergencyContact', 'phone', e.target.value)} className="w-full border p-2 rounded" placeholder="国番号付き推奨"/></div>
                                <div><label className="text-xs font-bold text-gray-500">{tr('emailLabel')}</label><input type="email" value={formData.emergencyContact.email} onChange={e => handleDeepChange('emergencyContact', 'email', e.target.value)} className="w-full border p-2 rounded" placeholder="任意"/></div>
                            </div>
                        </div>

                        {/* 3. Work Info */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100 relative">
                            {!permissions.canEditWorkInfo && <div className="absolute inset-0 bg-gray-50/50 z-10 cursor-not-allowed"/>}
                            <h3 className="text-lg font-bold text-indigo-800 mb-4 border-b border-indigo-100 pb-2 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Clock size={20}/> アルバイト管理 (資格外活動)</span>
                                <label className="flex items-center gap-2 text-xs text-gray-600 font-normal bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                                    <input type="checkbox" checked={formData.workInfo.isLongVacation} onChange={e => handleWorkChange('isLongVacation', e.target.checked)} />
                                    {tr('longVacCheck')}
                                </label>
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">{tr('workplaceLabel')}</label><input value={formData.workInfo.location} onChange={e => handleWorkChange('location', e.target.value)} className="w-full border p-2 rounded" placeholder="なしの場合は空欄"/></div>
                                <div><label className="text-xs font-bold text-gray-500">{tr('jobTypeLabel')}</label><input value={formData.workInfo.jobTitle} onChange={e => handleWorkChange('jobTitle', e.target.value)} className="w-full border p-2 rounded" placeholder="例: ホール、レジ"/></div>

                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">{tr('workDaysLabel')}</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {WEEK_DAYS.map(day => (
                                            <button key={day.key} type="button" onClick={() => handleDayToggle(day.value)}
                                                className={`px-3 py-1 rounded text-sm border transition ${formData.workInfo.days.includes(day.value) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                                                {day.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div><label className="text-xs font-bold text-gray-500">{tr('weeklyHoursLabel')} (h)</label><input type="number" step="0.5" value={formData.workInfo.hoursPerWeek} onChange={e => handleWorkChange('hoursPerWeek', parseFloat(e.target.value))} className={`w-full border p-2 rounded ${formData.workInfo.hoursPerWeek > (formData.workInfo.isLongVacation ? 40 : 28) ? 'bg-red-50 border-red-300 text-red-600 font-bold' : ''}`}/></div>
                                    <div><label className="text-xs font-bold text-gray-500">{tr('hourlyWageLabel')}</label><input type="number" value={formData.workInfo.hourlyWage} onChange={e => handleWorkChange('hourlyWage', parseInt(e.target.value))} className="w-full border p-2 rounded"/></div>
                                    <div><label className="text-xs font-bold text-gray-500">勤務先電話番号</label><input value={formData.workInfo.phone} onChange={e => handleWorkChange('phone', e.target.value)} className="w-full border p-2 rounded" placeholder="緊急連絡用"/></div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">時間帯 (シフト)</label>
                                        <select value={formData.workInfo.shift} onChange={e => handleWorkChange('shift', e.target.value)} className="w-full border p-2 rounded">
                                            {WORK_SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    {/* Work Time (Restored) */}
                                    <div><label className="text-xs font-bold text-gray-500">開始時間</label><input type="time" value={formData.workInfo.startTime} onChange={e => handleWorkChange('startTime', e.target.value)} className="w-full border p-2 rounded"/></div>
                                    <div><label className="text-xs font-bold text-gray-500">終了時間</label><input type="time" value={formData.workInfo.endTime} onChange={e => handleWorkChange('endTime', e.target.value)} className="w-full border p-2 rounded"/></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 2: ACADEMIC & TUITION --- */}
                {activeTab === 'academic' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2"><GraduationCap size={20}/> {tr('academicLabel')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">{tr('jlptLabel')}</label>
                                    <select value={formData.jlptLevel} onChange={e => handleChange('jlptLevel', e.target.value)} className="w-full border p-2 rounded">
                                        {JLPT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div><label className="text-xs font-bold text-gray-500">{tr('attendanceRateLabel')} (%)</label><input type="number" value={formData.attendanceRate} onChange={e => handleChange('attendanceRate', parseFloat(e.target.value))} className="w-full border p-2 rounded font-bold"/></div>
                                <div><label className="text-xs font-bold text-gray-500">{tr('lastMonthLabel')} (%)</label><input type="number" value={formData.attendanceLastMonth} onChange={e => handleChange('attendanceLastMonth', parseFloat(e.target.value))} className="w-full border p-2 rounded"/></div>

                                <div><label className="text-xs font-bold text-gray-500">{tr('gpaLabel')} (0-4.0)</label><input type="number" step="0.1" value={formData.academicInfo.gpa} onChange={e => handleDeepChange('academicInfo', 'gpa', parseFloat(e.target.value))} className="w-full border p-2 rounded"/></div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                                        <input type="checkbox" checked={formData.academicInfo.creditsEarned} onChange={e => handleDeepChange('academicInfo', 'creditsEarned', e.target.checked)} className="w-5 h-5 text-indigo-600"/>
                                        {tr('creditEarned')}
                                    </label>
                                </div>
                            </div>

                            {/* Additional Exams (Restored) */}
                            <div className="mt-4 pt-4 border-t">
                                <label className="text-xs font-bold text-gray-500 mb-2 block">外部試験・資格 (EJU, TOEIC, NAT-TEST等)</label>
                                {formData.additionalExams.map(ex => (
                                    <div key={ex.id} className="flex gap-2 mb-2">
                                        <input placeholder="試験名 (例: EJU日本語)" value={ex.name} onChange={e => updateExam(ex.id, 'name', e.target.value)} className="border p-2 rounded text-sm flex-1"/>
                                        <input placeholder="点数/結果" value={ex.result} onChange={e => updateExam(ex.id, 'result', e.target.value)} className="border p-2 rounded text-sm w-32"/>
                                        <button type="button" onClick={() => setFormData(prev => ({...prev, additionalExams: prev.additionalExams.filter(x => x.id !== ex.id)}))} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addExam} className="text-xs text-indigo-600 font-bold hover:underline">+ 資格を追加</button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2"><Wallet size={20}/> {tr('financeLabel')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">{tr('tuitionStatusLabel')}</label>
                                    <select value={formData.tuitionStatus} onChange={e => handleChange('tuitionStatus', e.target.value)} className="w-full border p-2 rounded">
                                        {TUITION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div><label className="text-xs font-bold text-gray-500">次回納入期限</label><input type="date" value={formData.nextTuitionDeadline} onChange={e => handleChange('nextTuitionDeadline', e.target.value)} className="w-full border p-2 rounded"/></div>
                                <div><label className="text-xs font-bold text-gray-500">学費総額</label><input type="number" value={formData.tuitionTotal} onChange={e => handleChange('tuitionTotal', parseInt(e.target.value))} className="w-full border p-2 rounded"/></div>
                                <div><label className="text-xs font-bold text-gray-500">既納入額</label><input type="number" value={formData.tuitionPaid} onChange={e => handleChange('tuitionPaid', parseInt(e.target.value))} className="w-full border p-2 rounded"/></div>
                                <div className="md:col-span-2 bg-gray-50 p-2 rounded flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-bold">残額（未納分）:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">¥</span>
                                        <input
                                            type="number"
                                            value={formData.tuitionBalance ?? (formData.tuitionTotal - formData.tuitionPaid)}
                                            onChange={e => handleChange('tuitionBalance', parseInt(e.target.value))}
                                            className={`font-bold text-lg bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none w-32 text-right ${(formData.tuitionBalance ?? (formData.tuitionTotal - formData.tuitionPaid)) > 0 ? 'text-red-600' : 'text-green-600'}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 納付履歴 */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-bold text-gray-600">{tr('tuitionHistoryLabel')}</h4>
                                    <button
                                        type="button"
                                        onClick={() => handleChange('tuitionHistory', [...(formData.tuitionHistory || []), { date: '', amount: 0, note: '' }])}
                                        className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 font-bold"
                                    >
                                        <Plus size={12} /> {tr('addLabel')}
                                    </button>
                                </div>
                                {(formData.tuitionHistory || []).length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-2">{tr('noHistoryLabel')}</p>
                                )}
                                <div className="space-y-2">
                                    {(formData.tuitionHistory || []).map((entry, idx) => (
                                        <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded border">
                                            <input
                                                type="date"
                                                value={entry.date}
                                                onChange={e => {
                                                    const h = [...formData.tuitionHistory];
                                                    h[idx] = { ...h[idx], date: e.target.value };
                                                    handleChange('tuitionHistory', h);
                                                }}
                                                className="border rounded p-1 text-xs w-32"
                                            />
                                            <input
                                                type="number"
                                                placeholder="金額"
                                                value={entry.amount || ''}
                                                onChange={e => {
                                                    const h = [...formData.tuitionHistory];
                                                    h[idx] = { ...h[idx], amount: parseInt(e.target.value) || 0 };
                                                    handleChange('tuitionHistory', h);
                                                }}
                                                className="border rounded p-1 text-xs w-24"
                                            />
                                            <input
                                                type="text"
                                                placeholder="備考"
                                                value={entry.note}
                                                onChange={e => {
                                                    const h = [...formData.tuitionHistory];
                                                    h[idx] = { ...h[idx], note: e.target.value };
                                                    handleChange('tuitionHistory', h);
                                                }}
                                                className="border rounded p-1 text-xs flex-1"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleChange('tuitionHistory', formData.tuitionHistory.filter((_, i) => i !== idx))}
                                                className="text-red-400 hover:text-red-600 p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 3: CAREER & ADMIN --- */}
                {activeTab === 'career' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Visa & Identity */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2"><FileCheck size={20}/> ビザ・在留カード</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div><label className="text-xs font-bold text-gray-500">{tr('residenceCardLabel')}</label><input value={formData.zairyuCardNumber} onChange={e => handleChange('zairyuCardNumber', e.target.value)} className="w-full border p-2 rounded" placeholder="AB12345678CD"/></div>
                                <div>
                                    <label className="text-xs font-bold text-red-600">{tr('visaExpiryLabel')}</label>
                                    <input type="date" value={formData.visaExpiry} onChange={e => handleChange('visaExpiry', e.target.value)} className="w-full border border-red-200 bg-red-50 p-2 rounded"/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">{tr('visaStatusLabel')}</label>
                                    <select value={formData.visaStatus} onChange={e => handleChange('visaStatus', e.target.value)} className="w-full border p-2 rounded">
                                        {VISA_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Zairyu Card Images (Restored) */}
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded p-4 flex flex-col items-center justify-center text-center group cursor-pointer" onClick={() => zairyuFrontRef.current?.click()}>
                                    {formData.zairyuCardFront ? <img src={formData.zairyuCardFront} className="h-24 object-contain mb-2"/> : <FileImage className="text-gray-400 mb-2" size={32}/>}
                                    <span className="text-xs text-gray-500 font-bold">在留カード(表)</span>
                                    <input type="file" ref={zairyuFrontRef} className="hidden" onChange={e => e.target.files?.[0] && handleFileRead(e.target.files[0], res => handleChange('zairyuCardFront', res))}/>
                                </div>
                                <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded p-4 flex flex-col items-center justify-center text-center group cursor-pointer" onClick={() => zairyuBackRef.current?.click()}>
                                    {formData.zairyuCardBack ? <img src={formData.zairyuCardBack} className="h-24 object-contain mb-2"/> : <FileImage className="text-gray-400 mb-2" size={32}/>}
                                    <span className="text-xs text-gray-500 font-bold">在留カード(裏)</span>
                                     <input type="file" ref={zairyuBackRef} className="hidden" onChange={e => e.target.files?.[0] && handleFileRead(e.target.files[0], res => handleChange('zairyuCardBack', res))}/>
                                </div>
                            </div>

                            <h4 className="text-sm font-bold text-gray-600 mb-2">更新・変更書類チェックリスト</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.keys(formData.visaChecklist).map(key => (
                                    <label key={key} className="flex items-center gap-2 bg-gray-50 px-3 py-3 rounded border cursor-pointer hover:bg-gray-100 transition">
                                        <input type="checkbox" checked={(formData.visaChecklist as any)[key]} onChange={e => handleDeepChange('visaChecklist', key, e.target.checked)} className="w-5 h-5 text-indigo-600"/>
                                        <span className="text-sm font-medium">
                                            {key === 'graduationCert' && tr('visaGradCert')}
                                            {key === 'transcript' && tr('visaTranscript')}
                                            {key === 'attendanceCert' && tr('visaAttendCert')}
                                            {key === 'recommendation' && tr('visaRecommend')}
                                            {key === 'jobHuntingStatement' && tr('visaJobStatement')}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Career & Exit */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2"><Briefcase size={20}/> 進路・就職</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">{tr('jobHuntingLabel')}</label>
                                    <select value={formData.jobHuntingStatus} onChange={e => handleChange('jobHuntingStatus', e.target.value)} className="w-full border p-2 rounded">
                                        {JOB_HUNTING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div><label className="text-xs font-bold text-gray-500">{tr('jobOfferLabel')}</label><input value={formData.targetCompany} onChange={e => handleChange('targetCompany', e.target.value)} className="w-full border p-2 rounded"/></div>
                            </div>
                            <div className="flex flex-wrap gap-4 bg-blue-50 p-4 rounded border border-blue-100 mb-4">
                                <label className="flex items-center gap-2 font-bold text-sm text-blue-800"><input type="checkbox" checked={formData.careerMilestones.resumeComplete} onChange={e => handleDeepChange('careerMilestones', 'resumeComplete', e.target.checked)}/> {tr('careerResume')}</label>
                                <label className="flex items-center gap-2 font-bold text-sm text-blue-800"><input type="checkbox" checked={formData.careerMilestones.interviewTraining} onChange={e => handleDeepChange('careerMilestones', 'interviewTraining', e.target.checked)}/> {tr('careerInterview')}</label>
                                <label className="flex items-center gap-2 font-bold text-sm text-blue-800"><input type="checkbox" checked={formData.careerMilestones.jobOffer} onChange={e => handleDeepChange('careerMilestones', 'jobOffer', e.target.checked)}/> {tr('careerOffer')}</label>
                                <label className="flex items-center gap-2 font-bold text-sm text-blue-800"><input type="checkbox" checked={formData.careerMilestones.visaChangeApplied} onChange={e => handleDeepChange('careerMilestones', 'visaChangeApplied', e.target.checked)}/> {tr('careerVisaChange')}</label>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <label className="text-xs font-bold text-gray-500">離籍後の住所（帰国/就職後）</label>
                                <input value={formData.exitInfo.addressAfterLeaving} onChange={e => handleDeepChange('exitInfo', 'addressAfterLeaving', e.target.value)} className="w-full border p-2 rounded" placeholder="郵便番号・住所"/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-dashed border-gray-200">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">{tr('withdrawalDateLabel')}</label>
                                    <input type="date" value={formData.withdrawalDate || ''} onChange={e => handleChange('withdrawalDate', e.target.value)} className="w-full border p-2 rounded"/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">{tr('withdrawalReasonLabel')}</label>
                                    <input value={formData.withdrawalReason || ''} onChange={e => handleChange('withdrawalReason', e.target.value)} className="w-full border p-2 rounded" placeholder="退学・転校・帰国等"/>
                                </div>
                            </div>
                        </div>

                        {/* Admin Info */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2"><Building size={20}/> 行政・銀行口座</h3>
                            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded border mb-4">
                                <span className="text-sm font-bold text-gray-600">My Number Card:</span>
                                {formData.myNumberPhoto ? <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded">登録済み</span> : <span className="text-xs text-gray-400">未登録</span>}
                                <button type="button" onClick={() => myNumberRef.current?.click()} className="ml-auto text-xs border bg-white px-2 py-1 rounded hover:bg-gray-100">画像アップロード</button>
                                <input type="file" ref={myNumberRef} className="hidden" onChange={e => e.target.files?.[0] && handleFileRead(e.target.files[0], res => handleChange('myNumberPhoto', res))} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">銀行名</label><input value={formData.bankInfo.bankName} onChange={e => handleDeepChange('bankInfo', 'bankName', e.target.value)} className="w-full border p-2 rounded" placeholder="例: ゆうちょ銀行"/></div>
                                <div><label className="text-xs font-bold text-gray-500">支店名/記号</label><input value={formData.bankInfo.branchName} onChange={e => handleDeepChange('bankInfo', 'branchName', e.target.value)} className="w-full border p-2 rounded"/></div>
                                <div><label className="text-xs font-bold text-gray-500">口座番号</label><input value={formData.bankInfo.accountNumber} onChange={e => handleDeepChange('bankInfo', 'accountNumber', e.target.value)} className="w-full border p-2 rounded"/></div>
                                <div><label className="text-xs font-bold text-gray-500">名義人(カナ)</label><input value={formData.bankInfo.accountHolder} onChange={e => handleDeepChange('bankInfo', 'accountHolder', e.target.value)} className="w-full border p-2 rounded"/></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 4: COMPLIANCE & SAFETY --- */}
                {activeTab === 'compliance' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
                            <h3 className="text-lg font-bold text-red-700 mb-4 border-b pb-2 flex items-center gap-2"><AlertTriangle size={20}/> {tr('warningHistoryLabel')}</h3>
                            {formData.warningHistory.length === 0 && <p className="text-gray-400 text-sm py-4 text-center">指導記録はありません</p>}
                            {formData.warningHistory.map(w => (
                                <div key={w.id} className="flex gap-2 mb-3 items-start bg-red-50 p-2 rounded border border-red-100">
                                    <input type="date" value={w.date} onChange={e => updateWarning(w.id, 'date', e.target.value)} className="border p-1 rounded text-sm"/>
                                    <select value={w.level} onChange={e => updateWarning(w.id, 'level', e.target.value)} className="border p-1 rounded text-sm w-32">{WARNING_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
                                    <input value={w.reason} onChange={e => updateWarning(w.id, 'reason', e.target.value)} className="border p-1 rounded text-sm flex-1" placeholder="指導内容・事由"/>
                                    <div className="flex flex-col items-center gap-1">
                                        <label className="flex items-center gap-1 text-xs whitespace-nowrap"><input type="checkbox" checked={w.signed} onChange={e => updateWarning(w.id, 'signed', e.target.checked)} /> 本人署名</label>
                                        <button type="button" onClick={() => setFormData(prev => ({...prev, warningHistory: prev.warningHistory.filter(x => x.id !== w.id)}))} className="text-red-500 text-xs hover:bg-red-200 px-2 py-1 rounded">削除</button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addWarning} className="w-full text-sm bg-white text-red-600 px-3 py-2 rounded border border-dashed border-red-300 mt-2 hover:bg-red-50">+ 指導記録を追加</button>
                        </div>

                         <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2"><Shield size={20}/> 生活安全・住居・通勤</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">{tr('housingLabel')}</label>
                                    <select value={formData.housingType} onChange={e => handleChange('housingType', e.target.value)} className="w-full border p-2 rounded">
                                        {HOUSING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                {/* Commute Method (Restored) */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500">{tr('commuteLabel')}</label>
                                    <select value={formData.commuteMethod} onChange={e => handleChange('commuteMethod', e.target.value)} className="w-full border p-2 rounded">
                                        {COMMUTE_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">{tr('addressLabel')}</label><input value={formData.workInfo.address} onChange={e => handleWorkChange('address', e.target.value)} className="w-full border p-2 rounded" placeholder="現住所"/></div>

                                <div><label className="text-xs font-bold text-gray-500">{tr('rentLabel')}</label>
                                     <select value={formData.rentStatus} onChange={e => handleChange('rentStatus', e.target.value)} className="w-full border p-2 rounded">
                                        {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div><label className="text-xs font-bold text-gray-500">{tr('healthInsuranceLabel')}</label>
                                     <select value={formData.nationalHealthInsurance} onChange={e => handleChange('nationalHealthInsurance', e.target.value)} className="w-full border p-2 rounded">
                                        {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Guarantor Info */}
                            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">{tr('guarantorLabel')}</label><input value={formData.guarantorName} onChange={e => handleChange('guarantorName', e.target.value)} className="w-full border p-2 rounded" placeholder="本国または日本の保証人"/></div>
                                <div><label className="text-xs font-bold text-gray-500">{tr('guarantorLabel')} (TEL)</label><input value={formData.guarantorPhone} onChange={e => handleChange('guarantorPhone', e.target.value)} className="w-full border p-2 rounded" placeholder="国番号付き推奨"/></div>
                            </div>
                        </div>
                    </div>
                )}

            </form>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 border-t flex justify-between items-center shrink-0">
            {editingStudent && onDelete && (
                <button 
                    onClick={() => {
                        if (confirm(`【警告】\n学生名: ${editingStudent.name}\n本当に削除しますか？`)) {
                            onDelete(editingStudent.id);
                            onClose();
                        }
                    }} 
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded font-bold border border-red-200 flex items-center gap-2"
                >
                    <Trash2 size={18}/> {tr('deleteLabel')}
                </button>
            )}
            <div className="flex gap-3 ml-auto">
                <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 font-medium text-gray-700">{tr('cancelLabel')}</button>
                <button onClick={handleSubmit} className="px-8 py-2 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 font-bold flex items-center gap-2">
                    <Save size={18}/> {tr('saveLabel')}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFormModal;
