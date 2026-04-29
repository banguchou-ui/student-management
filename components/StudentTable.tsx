import React from 'react';
import { useTr } from '../i18n/translations';
import { Student, FilterState, UserPermissions, UserRole, TuitionStatus, SafetyStatus } from '../types';
import { NATIONALITIES, JLPT_LEVELS, TUITION_STATUSES } from '../constants';
import { Edit2, Eye, AlertCircle, Briefcase, Search, Trash2, TrendingDown, Star, Siren, GraduationCap, AlertTriangle, Camera } from 'lucide-react';

interface StudentTableProps {
  students: Student[];
  filters: FilterState;
  searchTerm: string;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onSearchChange: (value: string) => void;
  onEdit: (student: Student) => void;
  onView: (student: Student) => void;
  onDelete: (studentId: string) => void;
  permissions: UserPermissions;
  currentUserRole: UserRole;
  safetyMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSafety: (id: string) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students, filters, searchTerm, onFilterChange, onSearchChange,
  onEdit, onView, onDelete, permissions, currentUserRole,
  safetyMode, selectedIds, onToggleSelect, onToggleSafety
}) => {

  const { tr } = useTr();

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.studentId.includes(searchTerm);
    const matchesNationality = filters.nationality ? student.nationality === filters.nationality : true;
    const matchesJLPT = filters.jlptLevel ? student.jlptLevel === filters.jlptLevel : true;
    const matchesTuition = filters.tuitionStatus ? student.tuitionStatus === filters.tuitionStatus : true;
    const matchesClass = filters.className ? student.className.includes(filters.className) : true;
    const matchesPhoto = filters.noPhoto ? !student.photoBase64 : true;
    let matchesJob = true;
    if (filters.hasJob === 'yes') matchesJob = !!student.workInfo.location;
    if (filters.hasJob === 'no') matchesJob = !student.workInfo.location;
    return matchesSearch && matchesNationality && matchesJLPT && matchesTuition && matchesJob && matchesClass && matchesPhoto;
  });
  
  const isPrincipal = currentUserRole === UserRole.PRINCIPAL;

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${safetyMode ? 'bg-red-50' : 'bg-gray-50'}`}>
      {/* Filters (Hidden in Safety Mode) */}
      {!safetyMode && (
        <div className="bg-white p-4 shadow-sm border-b border-gray-200 z-10">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" {...{placeholder: tr('searchPlaceholder')}} value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4">
            <select value={filters.nationality} onChange={(e) => onFilterChange('nationality', e.target.value)} className="border rounded px-3 py-1.5 text-sm bg-gray-50 focus:bg-white"><option value="">{tr('allNationalities')}</option>{NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}</select>
            <select value={filters.jlptLevel} onChange={(e) => onFilterChange('jlptLevel', e.target.value)} className="border rounded px-3 py-1.5 text-sm bg-gray-50 focus:bg-white"><option value="">{tr('allJLPT')}</option>{JLPT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
            <select value={filters.tuitionStatus} onChange={(e) => onFilterChange('tuitionStatus', e.target.value)} className="border rounded px-3 py-1.5 text-sm bg-gray-50 focus:bg-white"><option value="">{tr('allTuition')}</option>{TUITION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <input {...{placeholder: tr('classPlaceholder')}} value={filters.className} onChange={(e) => onFilterChange('className', e.target.value)} className="border rounded px-3 py-1.5 text-sm bg-gray-50 focus:bg-white w-24" />
            <button
              onClick={() => onFilterChange('noPhoto', filters.noPhoto ? '' : 'true')}
              className={`flex items-center gap-1.5 border rounded px-3 py-1.5 text-sm transition ${filters.noPhoto ? 'bg-pink-100 text-pink-700 border-pink-300 font-bold' : 'bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200'}`}
            >
              <Camera size={13} /> 写真なし
            </button>
            </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <div className={`rounded-lg shadow border overflow-hidden ${safetyMode ? 'border-red-300 bg-red-100' : 'border-gray-200 bg-white'}`}>
          <table className="w-full text-left border-collapse">
            <thead className={`${safetyMode ? 'bg-red-200 text-red-800' : 'bg-gray-100 text-gray-600'} text-xs uppercase sticky top-0 z-10`}>
              <tr>
                <th className="p-4 w-10"></th>
                <th className="p-4 font-semibold w-[25%]">{tr('colStudentInfo')}</th>
                {!safetyMode && <th className="p-4 font-semibold w-[15%]">{tr('colAcademic')}</th>}
                {!safetyMode && <th className="p-4 font-semibold w-[20%]">{tr('colFinanceVisa')}</th>}
                <th className="p-4 font-semibold w-[30%]">{tr('colStatus')}</th>
                <th className="p-4 font-semibold w-[10%] text-right">{tr('colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map(student => {
                  const isSelected = selectedIds.has(student.id);
                  const attendanceDrop = (student.attendanceLastMonth - student.attendanceRate) >= 10;
                  const isHighAchiever = student.academicInfo.gpa >= 3.0;
                  const isLowAttendance = student.attendanceRate < 80;
                  const workLimit = student.workInfo.isLongVacation ? 40 : 28;
                  const isOverworked = student.workInfo.hoursPerWeek > workLimit;
                  
                  // Visa alert (simple check, assuming YYYY-MM-DD)
                  const daysUntilVisaExpiry = student.visaExpiry ? Math.ceil((new Date(student.visaExpiry).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 999;
                  const isVisaDanger = daysUntilVisaExpiry < 90;

                  const isAlertRow = !safetyMode && (isLowAttendance || isOverworked || isVisaDanger);
                  
                  return (
                    <tr key={student.id} className={`transition-colors ${isSelected ? 'bg-indigo-50' : isAlertRow ? 'bg-red-50' : safetyMode ? 'hover:bg-red-50' : 'hover:bg-gray-50'}`}>
                      <td className="p-4 align-top">
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => onToggleSelect(student.id)} 
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border border-gray-300 relative">
                             {student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full object-cover" style={{transform: `scale(${student.photoTransform?.scale || 1}) translate(${student.photoTransform?.x || 0}px, ${student.photoTransform?.y || 0}px)`}} /> : null}
                          </div>
                          <div>
                             <div className="font-bold text-gray-900 text-base flex items-center gap-1">
                                {student.name || '名前未設定'}
                                {attendanceDrop && <TrendingDown size={16} className="text-red-500 animate-bounce" title="出席率急落警告" />}
                                {isHighAchiever && <Star size={14} className="text-yellow-500 fill-yellow-500" title="成績優秀" />}
                                {!student.photoBase64 && <Camera size={13} className="text-pink-400" title="写真未登録" />}
                             </div>
                             <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                 <span className="bg-gray-100 px-1 rounded">{student.studentId}</span> 
                                 <span>{student.className}</span>
                                 <span>{student.nationality}</span>
                             </div>
                          </div>
                        </div>
                      </td>
                      
                      {!safetyMode && (
                          <>
                            <td className="p-4 align-top">
                                <div className="text-xs space-y-1">
                                    <div className={`font-bold ${isLowAttendance ? 'text-red-600' : 'text-gray-700'}`}>
                                        出席率: {student.attendanceRate}% 
                                        {isLowAttendance && <AlertTriangle size={12} className="inline ml-1"/>}
                                    </div>
                                    <div className="text-gray-400">JLPT: {student.jlptLevel}</div>
                                    <div className="text-gray-400">GPA: {student.academicInfo.gpa}</div>
                                </div>
                            </td>
                            <td className="p-4 align-top">
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between"><span className="text-gray-500">残金</span><span className={student.tuitionStatus !== TuitionStatus.PAID ? 'text-red-600 font-bold' : 'text-green-600'}>¥{(student.tuitionBalance ?? (student.tuitionTotal - student.tuitionPaid)).toLocaleString()}</span></div>
                                    <div className={`font-bold ${isVisaDanger ? 'text-red-600 animate-pulse' : 'text-gray-500'}`}>
                                        期限: {student.visaExpiry} {isVisaDanger && '!'}
                                    </div>
                                </div>
                            </td>
                          </>
                      )}

                      <td className="p-4 align-top">
                          {safetyMode ? (
                              <button 
                                onClick={(e) => {e.stopPropagation(); onToggleSafety(student.id)}}
                                className={`w-full py-2 rounded font-bold text-sm shadow-sm transition ${student.safetyStatus === SafetyStatus.SAFE ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600 hover:bg-red-200'}`}
                              >
                                {student.safetyStatus === SafetyStatus.SAFE ? '✅ 無事確認' : '❓ 未確認'}
                              </button>
                          ) : (
                              <div className="text-xs text-gray-500 space-y-1">
                                  {student.workInfo.location ? (
                                      <div className={`flex items-center gap-1 ${isOverworked ? 'text-red-600 font-bold' : ''}`}>
                                          <Briefcase size={12}/> {student.workInfo.location} ({student.workInfo.hoursPerWeek}h)
                                          {isOverworked && <AlertCircle size={12}/>}
                                      </div>
                                  ) : <span className="text-gray-300">バイトなし</span>}
                                  
                                  {student.jobHuntingStatus === '内定' && <div className="text-purple-600 font-bold">🎉 内定: {student.targetCompany}</div>}
                              </div>
                          )}
                      </td>

                      <td className="p-4 text-right align-top">
                        <div className="flex flex-col items-end gap-2">
                            <button type="button" onClick={(e) => { e.stopPropagation(); onView(student); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>
                            {!safetyMode && permissions.canEditBasicInfo && <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(student); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 size={18} /></button>}
                            {!safetyMode && isPrincipal && <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>}
                        </div>
                      </td>
                    </tr>
                  )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
