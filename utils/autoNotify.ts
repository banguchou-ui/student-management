import { Student, TuitionStatus } from '../types';

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  pinned: boolean;
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
}

const BOT_PREFIX = '🤖';
const BOT_AUTHOR = 'システム自動通知';

export function generateAutoNotices(students: Student[]): Notice[] {
  const notices: Notice[] = [];
  const now = new Date();

  for (const s of students) {
    // A. ビザ期限90日以内
    if (s.visaExpiry) {
      const expiry = new Date(s.visaExpiry);
      if (!isNaN(expiry.getTime())) {
        const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / 86400000);
        if (daysLeft >= 0 && daysLeft <= 90) {
          notices.push({
            id: `auto_visa_${s.id}`,
            title: `${BOT_PREFIX}【ビザ期限注意】${s.name}さんのビザが${daysLeft}日後に期限切れです`,
            content: `在留期限: ${s.visaExpiry}　在留カード番号: ${s.zairyuCardNumber || '未登録'}`,
            type: daysLeft <= 30 ? 'urgent' : 'warning',
            pinned: false,
            createdAt: new Date().toISOString(),
            createdBy: BOT_AUTHOR,
          });
        }
      }
    }

    // B. 学費未納
    if (s.tuitionStatus === TuitionStatus.UNPAID || s.tuitionStatus === TuitionStatus.PARTIAL) {
      const isOverdue = s.nextTuitionDeadline
        ? new Date(s.nextTuitionDeadline) < now
        : false;
      notices.push({
        id: `auto_tuition_${s.id}`,
        title: `${BOT_PREFIX}【学費未納】${s.name}さんの学費が未納です`,
        content: `状況: ${s.tuitionStatus}　残金: ¥${(s.tuitionBalance ?? 0).toLocaleString()}${s.nextTuitionDeadline ? `　次回期限: ${s.nextTuitionDeadline}` : ''}`,
        type: isOverdue ? 'urgent' : 'warning',
        pinned: false,
        createdAt: new Date().toISOString(),
        createdBy: BOT_AUTHOR,
      });
    }

    // C. 出席率80%以下
    if (s.attendanceRate <= 80) {
      notices.push({
        id: `auto_attend_${s.id}`,
        title: `${BOT_PREFIX}【出席率低下】${s.name}さんの出席率が${s.attendanceRate}%です`,
        content: `クラス: ${s.className}　先月出席率: ${s.attendanceLastMonth ?? s.attendanceRate}%`,
        type: 'warning',
        pinned: false,
        createdAt: new Date().toISOString(),
        createdBy: BOT_AUTHOR,
      });
    }
  }

  return notices;
}
