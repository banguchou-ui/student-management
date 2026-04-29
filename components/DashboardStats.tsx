import React, { useMemo } from 'react';
import { Student, TuitionStatus, VisaStatus, JobHuntingStatus, SafetyStatus } from '../types';
import { Users, AlertTriangle, TrendingDown, Briefcase, CreditCard, ShieldAlert, GraduationCap, Clock, Camera } from 'lucide-react';
import { useTr } from '../i18n/translations';

interface DashboardStatsProps {
  students: Student[];
  onPhotoFilter?: () => void;
  photoFilterActive?: boolean;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ students, onPhotoFilter, photoFilterActive }) => {
  const { tr } = useTr();

  const stats = useMemo(() => {
    const total = students.length;
    const lowAttendance = students.filter(s => s.attendanceRate < 80).length;
    const unpaidTuition = students.filter(s => s.tuitionStatus === TuitionStatus.UNPAID).length;
    const visaExpiringSoon = students.filter(s => {
      if (!s.visaExpiry) return false;
      const days = Math.ceil((new Date(s.visaExpiry).getTime() - Date.now()) / 86400000);
      return days < 90 && days > 0;
    }).length;
    const visaExpired = students.filter(s => s.visaStatus === VisaStatus.EXPIRED).length;
    const jobHunting = students.filter(s => s.jobHuntingStatus === JobHuntingStatus.ACTIVE).length;
    const naitei = students.filter(s => s.jobHuntingStatus === JobHuntingStatus.NAITEI).length;
    const overworked = students.filter(s => {
      const limit = s.workInfo.isLongVacation ? 40 : 28;
      return s.workInfo.hoursPerWeek > limit;
    }).length;
    const safetyUnknown = students.filter(s => s.safetyStatus === SafetyStatus.UNKNOWN).length;
    const warningStudents = students.filter(s => s.warningHistory && s.warningHistory.length > 0).length;
    const noPhoto = students.filter(s => !s.photoBase64).length;

    return {
      total, lowAttendance, unpaidTuition, visaExpiringSoon,
      visaExpired, jobHunting, naitei, overworked, safetyUnknown, warningStudents, noPhoto
    };
  }, [students]);

  const cards = [
    {
      labelKey: 'totalStudents' as const,
      value: stats.total,
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      iconColor: 'text-indigo-500',
      onClick: undefined as (() => void) | undefined,
      active: false,
    },
    {
      labelKey: 'lowAttendance' as const,
      value: stats.lowAttendance,
      icon: TrendingDown,
      color: stats.lowAttendance > 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200',
      iconColor: stats.lowAttendance > 0 ? 'text-red-500' : 'text-gray-400',
      onClick: undefined,
      active: false,
    },
    {
      labelKey: 'unpaidTuition' as const,
      value: stats.unpaidTuition,
      icon: CreditCard,
      color: stats.unpaidTuition > 0 ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-gray-50 text-gray-500 border-gray-200',
      iconColor: stats.unpaidTuition > 0 ? 'text-orange-500' : 'text-gray-400',
      onClick: undefined,
      active: false,
    },
    {
      labelKey: 'visaExpiring' as const,
      value: stats.visaExpiringSoon,
      icon: ShieldAlert,
      color: stats.visaExpiringSoon > 0 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-500 border-gray-200',
      iconColor: stats.visaExpiringSoon > 0 ? 'text-yellow-500' : 'text-gray-400',
      onClick: undefined,
      active: false,
    },
    {
      labelKey: 'overworked' as const,
      value: stats.overworked,
      icon: Clock,
      color: stats.overworked > 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-500 border-gray-200',
      iconColor: stats.overworked > 0 ? 'text-red-500' : 'text-gray-400',
      onClick: undefined,
      active: false,
    },
    {
      labelKey: 'jobHunting' as const,
      value: stats.jobHunting,
      icon: Briefcase,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      iconColor: 'text-blue-500',
      onClick: undefined,
      active: false,
    },
    {
      labelKey: 'jobOffer' as const,
      value: stats.naitei,
      icon: GraduationCap,
      color: 'bg-green-50 text-green-600 border-green-200',
      iconColor: 'text-green-500',
      onClick: undefined,
      active: false,
    },
    {
      labelKey: 'hasWarning' as const,
      value: stats.warningStudents,
      icon: AlertTriangle,
      color: stats.warningStudents > 0 ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-gray-50 text-gray-500 border-gray-200',
      iconColor: stats.warningStudents > 0 ? 'text-purple-500' : 'text-gray-400',
      onClick: undefined,
      active: false,
    },
    {
      labelKey: 'noPhoto' as const,
      value: stats.noPhoto,
      icon: Camera,
      color: photoFilterActive
        ? 'bg-pink-100 text-pink-700 border-pink-400 ring-2 ring-pink-400'
        : stats.noPhoto > 0 ? 'bg-pink-50 text-pink-600 border-pink-200 cursor-pointer hover:bg-pink-100' : 'bg-gray-50 text-gray-500 border-gray-200',
      iconColor: stats.noPhoto > 0 ? 'text-pink-500' : 'text-gray-400',
      onClick: onPhotoFilter,
      active: photoFilterActive ?? false,
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="grid grid-cols-4 md:grid-cols-9 gap-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.labelKey}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border ${card.color} transition-all ${card.onClick ? 'cursor-pointer' : ''}`}
              onClick={card.onClick}
              title={card.onClick ? '写真なし学生でフィルター' : undefined}
            >
              <Icon size={16} className={`mb-1 ${card.iconColor}`} />
              <span className="text-xl font-bold leading-none">{card.value}</span>
              <span className="text-xs mt-1 text-center leading-tight opacity-80">{tr(card.labelKey)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardStats;
