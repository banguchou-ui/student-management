import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { Calendar, ChevronLeft, ChevronRight, Check, X, Minus, Download } from 'lucide-react';

interface AttendanceManagerProps {
  students: Student[];
  onUpdateStudent: (student: Student) => void;
}

type AttendanceRecord = Record<string, Record<string, 'present' | 'absent' | 'late' | 'excused'>>;

const ATTENDANCE_KEY = 'sms_attendance_v1';

function loadAttendance(): AttendanceRecord {
  try {
    return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAttendance(data: AttendanceRecord) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data));
}

const STATUS_CONFIG = {
  present: { label: '出', color: 'bg-green-500 text-white', icon: Check },
  absent: { label: '欠', color: 'bg-red-500 text-white', icon: X },
  late: { label: '遅', color: 'bg-yellow-400 text-yellow-900', icon: Minus },
  excused: { label: '公', color: 'bg-blue-400 text-white', icon: Check },
} as const;

type StatusType = keyof typeof STATUS_CONFIG;

const AttendanceManager: React.FC<AttendanceManagerProps> = ({ students, onUpdateStudent }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [attendance, setAttendance] = useState<AttendanceRecord>(loadAttendance);
  const [classFilter, setClassFilter] = useState('');

  const daysInMonth = useMemo(() => {
    const days = [];
    const d = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= d; i++) {
      const date = new Date(year, month, i);
      const dow = date.getDay();
      if (dow !== 0 && dow !== 6) { // Weekdays only
        days.push(i);
      }
    }
    return days;
  }, [year, month]);

  const filteredStudents = useMemo(() =>
    classFilter ? students.filter(s => s.className.includes(classFilter)) : students,
    [students, classFilter]
  );

  const classes = useMemo(() =>
    [...new Set(students.map(s => s.className).filter(Boolean))].sort(),
    [students]
  );

  const dateKey = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const toggleStatus = (studentId: string, day: number) => {
    const key = dateKey(day);
    const current = attendance[studentId]?.[key];
    const order: (StatusType | undefined)[] = [undefined, 'present', 'absent', 'late', 'excused'];
    const next = order[(order.indexOf(current) + 1) % order.length];

    const updated = {
      ...attendance,
      [studentId]: {
        ...attendance[studentId],
        [key]: next as StatusType,
      }
    };
    if (!next) {
      delete updated[studentId][key];
    }
    setAttendance(updated);
    saveAttendance(updated);

    // 当月出席率を再計算して学生データに反映
    const student = students.find(s => s.id === studentId);
    if (student) {
      const records = updated[studentId] || {};
      let presentCount = 0;
      daysInMonth.forEach(d => {
        const s = records[dateKey(d)];
        if (s === 'present' || s === 'excused') presentCount++;
      });
      const total = daysInMonth.length;
      const newRate = total > 0 ? Math.round((presentCount / total) * 100) : 0;
      onUpdateStudent({ ...student, attendanceRate: newRate });
    }
  };

  const getMonthStats = (studentId: string) => {
    const records = attendance[studentId] || {};
    let present = 0, absent = 0, late = 0;
    daysInMonth.forEach(day => {
      const s = records[dateKey(day)];
      if (s === 'present' || s === 'excused') present++;
      else if (s === 'absent') absent++;
      else if (s === 'late') late++;
    });
    const total = daysInMonth.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, late, rate };
  };

  const exportCSV = () => {
    const headers = ['学籍番号', '氏名', 'クラス', ...daysInMonth.map(d => `${month + 1}/${d}`), '出席率'];
    const rows = filteredStudents.map(s => {
      const stats = getMonthStats(s.id);
      return [
        s.studentId, s.name, s.className,
        ...daysInMonth.map(d => {
          const st = attendance[s.id]?.[dateKey(d)];
          return st ? STATUS_CONFIG[st].label : '-';
        }),
        `${stats.rate}%`
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `attendance_${year}_${String(month + 1).padStart(2, '0')}.csv`;
    a.click();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header Controls */}
      <div className="bg-white border-b border-gray-200 p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-indigo-600" />
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} className="p-1 rounded hover:bg-gray-100">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-lg w-28 text-center">{year}年 {month + 1}月</span>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} className="p-1 rounded hover:bg-gray-100">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex gap-3 items-center">
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="border rounded px-3 py-1.5 text-sm">
            <option value="">全クラス</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">
            <Download size={14} /> CSV出力
          </button>
        </div>
        {/* Legend */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <span key={key} className={`px-2 py-0.5 rounded text-xs font-bold ${cfg.color}`}>{cfg.label} = {key === 'present' ? '出席' : key === 'absent' ? '欠席' : key === 'late' ? '遅刻' : '公欠'}</span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse bg-white">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              <th className="border border-gray-200 p-2 text-left min-w-[140px] sticky left-0 bg-gray-100 z-20">学生</th>
              {daysInMonth.map(d => {
                const date = new Date(year, month, d);
                const isToday = date.toDateString() === today.toDateString();
                return (
                  <th key={d} className={`border border-gray-200 p-1 w-8 text-center ${isToday ? 'bg-indigo-100 text-indigo-700' : ''}`}>
                    <div className="font-bold">{d}</div>
                    <div className="text-gray-400 font-normal">{'日月火水木金'[date.getDay()]}</div>
                  </th>
                );
              })}
              <th className="border border-gray-200 p-2 min-w-[80px] text-center sticky right-0 bg-gray-100">出席率</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => {
              const stats = getMonthStats(student.id);
              return (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-2 sticky left-0 bg-white">
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-gray-400">{student.className}</div>
                  </td>
                  {daysInMonth.map(day => {
                    const status = attendance[student.id]?.[dateKey(day)] as StatusType | undefined;
                    const cfg = status ? STATUS_CONFIG[status] : null;
                    return (
                      <td key={day} className="border border-gray-200 p-0 text-center">
                        <button
                          onClick={() => toggleStatus(student.id, day)}
                          className={`w-full h-8 text-xs font-bold transition-colors hover:opacity-80 ${cfg ? cfg.color : 'hover:bg-gray-100'}`}
                        >
                          {cfg ? cfg.label : ''}
                        </button>
                      </td>
                    );
                  })}
                  <td className="border border-gray-200 p-2 text-center sticky right-0 bg-white">
                    <div className={`font-bold text-sm ${stats.rate < 80 ? 'text-red-600' : 'text-green-600'}`}>{stats.rate}%</div>
                    <div className="text-gray-400 text-xs">{stats.absent}欠/{stats.late}遅</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceManager;
