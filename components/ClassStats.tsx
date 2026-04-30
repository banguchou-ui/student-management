import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Student, TuitionStatus } from '../types';
import { BarChart2, PieChart as PieIcon, Wallet, Activity } from 'lucide-react';
import { useTr } from '../i18n/translations';

interface ClassStatsProps {
  students: Student[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6'];

const ClassStats: React.FC<ClassStatsProps> = ({ students }) => {
  const { tr } = useTr();
  // A. クラス別平均出席率
  const classAttendance = useMemo(() => {
    const map: Record<string, number[]> = {};
    students.forEach(s => {
      const cls = s.className || '未設定';
      if (!map[cls]) map[cls] = [];
      map[cls].push(s.attendanceRate);
    });
    return Object.entries(map)
      .map(([name, rates]) => ({
        name,
        avg: Math.round(rates.reduce((a, b) => a + b, 0) / rates.length),
        count: rates.length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  // B. 国籍別学生数
  const nationalityData = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach(s => {
      const nat = s.nationality || '未設定';
      map[nat] = (map[nat] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [students]);

  // C. 学費状況サマリー
  const tuitionSummary = useMemo(() => ({
    paid: students.filter(s => s.tuitionStatus === TuitionStatus.PAID).length,
    unpaid: students.filter(s => s.tuitionStatus === TuitionStatus.UNPAID).length,
    partial: students.filter(s => s.tuitionStatus === TuitionStatus.PARTIAL).length,
  }), [students]);

  // D. 出席率分布
  const attendanceDistribution = useMemo(() => {
    const buckets = [
      { name: '90〜100%', min: 90, max: 101, fill: '#10b981' },
      { name: '80〜89%', min: 80, max: 90, fill: '#6366f1' },
      { name: '70〜79%', min: 70, max: 80, fill: '#f59e0b' },
      { name: '70%未満', min: 0, max: 70, fill: '#ef4444' },
    ];
    return buckets.map(b => ({
      name: b.name,
      count: students.filter(s => s.attendanceRate >= b.min && s.attendanceRate < b.max).length,
      fill: b.fill,
    }));
  }, [students]);

  if (students.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <BarChart2 size={48} className="mx-auto mb-4 opacity-30" />
          <p>学生データがありません</p>
        </div>
      </div>
    );
  }

  const CustomTooltipBar = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-gray-200 rounded shadow-lg px-3 py-2 text-sm">
          <p className="font-bold text-gray-700">{label}</p>
          <p className="text-indigo-600">平均出席率: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipPie = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-gray-200 rounded shadow-lg px-3 py-2 text-sm">
          <p className="font-bold">{payload[0].name}</p>
          <p>{payload[0].value}名</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 overflow-y-auto h-full bg-gray-50">
      <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
        <BarChart2 size={20} className="text-indigo-600" /> {tr('statsTitle')}
        <span className="text-sm font-normal text-gray-400 ml-2">全 {students.length} 名</span>
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* A: クラス別出席率 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm">
            <Activity size={16} className="text-indigo-500" /> クラス別平均出席率
          </h3>
          {classAttendance.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">データなし</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classAttendance} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltipBar />} />
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '80%', position: 'right', fontSize: 10, fill: '#ef4444' }} />
                <Bar dataKey="avg" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  {classAttendance.map((entry, i) => (
                    <Cell key={i} fill={entry.avg < 80 ? '#ef4444' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* B: 国籍別円グラフ */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm">
            <PieIcon size={16} className="text-emerald-500" /> 国籍別学生数
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={nationalityData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}`}
                labelLine={false}
              >
                {nationalityData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipPie />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* C: 学費状況サマリー */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm">
            <Wallet size={16} className="text-amber-500" /> 学費状況サマリー
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-3xl font-bold text-green-600">{tuitionSummary.paid}</p>
              <p className="text-sm text-green-700 font-medium mt-1">納入済み</p>
              <p className="text-xs text-green-500">{students.length > 0 ? Math.round(tuitionSummary.paid / students.length * 100) : 0}%</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-3xl font-bold text-red-600">{tuitionSummary.unpaid}</p>
              <p className="text-sm text-red-700 font-medium mt-1">未納</p>
              <p className="text-xs text-red-500">{students.length > 0 ? Math.round(tuitionSummary.unpaid / students.length * 100) : 0}%</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-3xl font-bold text-amber-600">{tuitionSummary.partial}</p>
              <p className="text-sm text-amber-700 font-medium mt-1">一部納入</p>
              <p className="text-xs text-amber-500">{students.length > 0 ? Math.round(tuitionSummary.partial / students.length * 100) : 0}%</p>
            </div>
          </div>
          {/* Bar visualization */}
          <div className="mt-4 h-3 rounded-full overflow-hidden flex">
            {tuitionSummary.paid > 0 && (
              <div className="bg-green-400 transition-all" style={{ width: `${tuitionSummary.paid / students.length * 100}%` }} />
            )}
            {tuitionSummary.partial > 0 && (
              <div className="bg-amber-400 transition-all" style={{ width: `${tuitionSummary.partial / students.length * 100}%` }} />
            )}
            {tuitionSummary.unpaid > 0 && (
              <div className="bg-red-400 transition-all" style={{ width: `${tuitionSummary.unpaid / students.length * 100}%` }} />
            )}
          </div>
        </div>

        {/* D: 出席率分布 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm">
            <BarChart2 size={16} className="text-purple-500" /> 出席率分布
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={attendanceDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} unit="名" />
              <Tooltip formatter={(v: any) => [`${v}名`, '人数']} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {attendanceDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {attendanceDistribution.map(b => (
              <div key={b.name} className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: b.fill }} />
                {b.name}: {b.count}名
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClassStats;
