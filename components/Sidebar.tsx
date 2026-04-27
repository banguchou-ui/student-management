import React, { useState, useEffect, useRef } from 'react';
import { Student, WorkShift, JLPTLevel, TuitionStatus, UserPermissions } from '../types';
import { NATIONALITIES, MOTHER_TONGUES, WEEK_DAYS, JLPT_LEVELS, TUITION_STATUSES, WORK_SHIFTS, INITIAL_STUDENT_STATE } from '../constants';
import { Save, X, Upload, AlertTriangle, Lock } from 'lucide-react';

interface SidebarProps {
  onSave: (student: Student) => void;
  onCancelEdit: () => void;
  editingStudent: Student | null;
  permissions: UserPermissions;
}

const Sidebar: React.FC<SidebarProps> = ({ onSave, onCancelEdit, editingStudent, permissions }) => {
  const [formData, setFormData] = useState<Student>({
    ...INITIAL_STUDENT_STATE,
    id: crypto.randomUUID(),
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingStudent) {
      setFormData(editingStudent);
    } else {
      setFormData({
        ...INITIAL_STUDENT_STATE,
        id: crypto.randomUUID(),
      });
    }
  }, [editingStudent]);

  const handleChange = (field: keyof Student, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkChange = (field: keyof typeof INITIAL_STUDENT_STATE.workInfo, value: any) => {
    setFormData(prev => ({
      ...prev,
      workInfo: {
        ...prev.workInfo,
        [field]: value
      }
    }));
  };

  const handleDayToggle = (day: string) => {
    if (!permissions.canEditWorkInfo) return;
    const currentDays = formData.workInfo.days;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    handleWorkChange('days', newDays);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!permissions.canEditBasicInfo) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('photoBase64', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    if (!editingStudent) {
        setFormData({
            ...INITIAL_STUDENT_STATE,
            id: crypto.randomUUID(),
        });
    }
  };

  const isOverWorkLimit = formData.workInfo.hoursPerWeek > 28;
  const canSave = permissions.canEditBasicInfo || permissions.canEditAcademicInfo || permissions.canEditWorkInfo;

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 shadow-xl overflow-y-auto w-full md:w-[400px]">
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-lg font-bold flex items-center gap-2">
          {editingStudent ? '学生情報の編集' : '新規学生登録'}
        </h2>
        {editingStudent && (
          <button onClick={onCancelEdit} className="p-1 hover:bg-indigo-500 rounded-full">
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6 pb-20">
        {/* Photo Section */}
        <div className="flex flex-col items-center gap-3">
          <div className={`w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group ${permissions.canEditBasicInfo ? 'cursor-pointer' : ''}`}>
            {formData.photoBase64 ? (
              <img src={formData.photoBase64} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-xs text-center px-2">写真なし</span>
            )}
            
            {permissions.canEditBasicInfo && (
                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center" onClick={() => fileInputRef.current?.click()}>
                <Upload size={20} className="text-white" />
                </div>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload}
            disabled={!permissions.canEditBasicInfo} 
          />
          {permissions.canEditBasicInfo && (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-indigo-600 text-sm font-medium">
                証明写真をアップロード
              </button>
          )}
        </div>

        {/* Basic Info */}
        <div className="space-y-4 border-b border-gray-100 pb-4 relative">
          {!permissions.canEditBasicInfo && <div className="absolute inset-0 z-10 bg-white/10 cursor-not-allowed" title="編集権限がありません"></div>}
          <div className="flex justify-between items-center">
             <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">基本情報</h3>
             {!permissions.canEditBasicInfo && <Lock size={12} className="text-gray-400" />}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">氏名</label>
              <input required disabled={!permissions.canEditBasicInfo} type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500" placeholder="氏名を入力" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">学籍番号</label>
              <input required disabled={!permissions.canEditBasicInfo} type="text" value={formData.studentId} onChange={e => handleChange('studentId', e.target.value)} className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 disabled:text-gray-500" placeholder="例: 2023001" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">国籍 (入力可)</label>
              <input 
                list="nationality-list"
                disabled={!permissions.canEditBasicInfo} 
                value={formData.nationality} 
                onChange={e => handleChange('nationality', e.target.value)} 
                className="w-full border rounded-md p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="選択または入力"
              />
              <datalist id="nationality-list">
                {NATIONALITIES.map(n => <option key={n} value={n} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">母語 (入力可)</label>
              <input 
                list="language-list"
                disabled={!permissions.canEditBasicInfo} 
                value={formData.motherTongue} 
                onChange={e => handleChange('motherTongue', e.target.value)} 
                className="w-full border rounded-md p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="選択または入力"
              />
               <datalist id="language-list">
                {MOTHER_TONGUES.map(l => <option key={l} value={l} />)}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">年齢</label>
              <input disabled={!permissions.canEditBasicInfo} type="number" min="15" max="60" value={formData.age} onChange={e => handleChange('age', parseInt(e.target.value))} className="w-full border rounded-md p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">クラス</label>
              <input disabled={!permissions.canEditBasicInfo} type="text" value={formData.className} onChange={e => handleChange('className', e.target.value)} className="w-full border rounded-md p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500" />
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className="space-y-4 border-b border-gray-100 pb-4 relative">
          {!permissions.canEditAcademicInfo && <div className="absolute inset-0 z-10 bg-white/10 cursor-not-allowed" title="編集権限がありません"></div>}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">教務情報</h3>
            {!permissions.canEditAcademicInfo && <Lock size={12} className="text-gray-400" />}
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">JLPT レベル</label>
              <select disabled={!permissions.canEditAcademicInfo} value={formData.jlptLevel} onChange={e => handleChange('jlptLevel', e.target.value)} className="w-full border rounded-md p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500">
                {JLPT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">出席率 (%)</label>
              <input disabled={!permissions.canEditAcademicInfo} type="number" min="0" max="100" value={formData.attendanceRate} onChange={e => handleChange('attendanceRate', parseFloat(e.target.value))} className="w-full border rounded-md p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">学費状況</label>
              <select disabled={!permissions.canEditAcademicInfo} value={formData.tuitionStatus} onChange={e => handleChange('tuitionStatus', e.target.value)} className="w-full border rounded-md p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500">
                {TUITION_STATUSES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">在留期限</label>
            <input disabled={!permissions.canEditAcademicInfo} type="date" value={formData.visaExpiry} onChange={e => handleChange('visaExpiry', e.target.value)} className="w-full border rounded-md p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500" />
          </div>
        </div>

        {/* Work Info */}
        <div className="space-y-4 relative">
          {!permissions.canEditWorkInfo && <div className="absolute inset-0 z-10 bg-white/10 cursor-not-allowed" title="編集権限がありません"></div>}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                アルバイト管理
                {isOverWorkLimit && (
                <span className="flex items-center gap-1 text-red-600 text-[10px] font-bold bg-red-100 px-2 py-1 rounded-full animate-pulse">
                    <AlertTriangle size={12} /> 超過警告 (>28h)
                </span>
                )}
            </h3>
            {!permissions.canEditWorkInfo && <Lock size={12} className="text-gray-400" />}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">勤務先 (店名/会社名)</label>
            <input disabled={!permissions.canEditWorkInfo} type="text" value={formData.workInfo.location} onChange={e => handleWorkChange('location', e.target.value)} className="w-full border rounded-md p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500" placeholder="なしの場合は空欄" />
          </div>

          {formData.workInfo.location && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">勤務日 (複数選択)</label>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map(day => (
                    <button
                      key={day.key}
                      type="button"
                      disabled={!permissions.canEditWorkInfo}
                      onClick={() => handleDayToggle(day.value)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        formData.workInfo.days.includes(day.value)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      } ${!permissions.canEditWorkInfo ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {day.value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">週労働時間 (時間)</label>
                  <input 
                    disabled={!permissions.canEditWorkInfo}
                    type="number" 
                    min="0" 
                    step="0.5"
                    value={formData.workInfo.hoursPerWeek} 
                    onChange={e => handleWorkChange('hoursPerWeek', parseFloat(e.target.value))} 
                    className={`w-full border rounded-md p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 ${isOverWorkLimit ? 'border-red-500 bg-red-50 text-red-700 font-bold' : ''}`} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">シフト</label>
                  <select disabled={!permissions.canEditWorkInfo} value={formData.workInfo.shift} onChange={e => handleWorkChange('shift', e.target.value)} className="w-full border rounded-md p-2 text-sm disabled:bg-gray-100 disabled:text-gray-500">
                    {WORK_SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        {canSave && (
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 font-medium transition-colors">
            <Save size={18} />
            {editingStudent ? '変更を保存' : '登録する'}
          </button>
        )}
        
        {!canSave && (
             <div className="text-center text-xs text-gray-400 p-2 bg-gray-50 rounded">
                 閲覧権限のみです
             </div>
        )}
      </form>
    </div>
  );
};

export default Sidebar;