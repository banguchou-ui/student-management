import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Pin, AlertCircle, Info, CheckCircle, RefreshCw } from 'lucide-react';
import { Student } from '../types';
import { generateAutoNotices, Notice } from '../utils/autoNotify';
import { useTr } from '../i18n/translations';

interface NoticeManagerProps {
  currentUserName: string;
  canEdit: boolean;
  students: Student[];
}

const NOTICE_KEY = 'sms_notices_v1';

const TYPE_CONFIG = {
  info: { label: 'お知らせ', color: 'bg-blue-50 border-blue-300 text-blue-800', icon: Info, iconColor: 'text-blue-500' },
  warning: { label: '注意', color: 'bg-yellow-50 border-yellow-300 text-yellow-800', icon: AlertCircle, iconColor: 'text-yellow-500' },
  success: { label: '完了', color: 'bg-green-50 border-green-300 text-green-800', icon: CheckCircle, iconColor: 'text-green-500' },
  urgent: { label: '緊急', color: 'bg-red-50 border-red-300 text-red-800', icon: AlertCircle, iconColor: 'text-red-500' },
};

const NoticeManager: React.FC<NoticeManagerProps> = ({ currentUserName, canEdit, students }) => {
  const { tr } = useTr();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'info' as Notice['type'], expiresAt: '' });
  const [autoUpdated, setAutoUpdated] = useState(false);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(NOTICE_KEY) || '[]');
      setNotices(data);
    } catch { setNotices([]); }
  }, []);

  const save = (updated: Notice[]) => {
    setNotices(updated);
    localStorage.setItem(NOTICE_KEY, JSON.stringify(updated));
  };

  const handleAutoNotify = () => {
    const autoNotices = generateAutoNotices(students);
    // Keep manual notices (no 🤖 prefix in createdBy), replace auto ones
    const manual = notices.filter(n => n.createdBy !== 'システム自動通知');
    save([...autoNotices, ...manual]);
    setAutoUpdated(true);
    setTimeout(() => setAutoUpdated(false), 3000);
  };

  const addNotice = () => {
    if (!form.title.trim()) return;
    const notice: Notice = {
      id: crypto.randomUUID(),
      title: form.title,
      content: form.content,
      type: form.type,
      pinned: false,
      createdAt: new Date().toISOString(),
      createdBy: currentUserName,
      expiresAt: form.expiresAt || undefined,
    };
    save([notice, ...notices]);
    setForm({ title: '', content: '', type: 'info', expiresAt: '' });
    setShowForm(false);
  };

  const togglePin = (id: string) => {
    save(notices.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const deleteNotice = (id: string) => {
    save(notices.filter(n => n.id !== id));
  };

  const sortedNotices = [...notices]
    .filter(n => !n.expiresAt || new Date(n.expiresAt) > new Date())
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
      if (a.type === 'urgent' && b.type !== 'urgent') return -1;
      if (b.type === 'urgent' && a.type !== 'urgent') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const autoCount = sortedNotices.filter(n => n.createdBy === 'システム自動通知').length;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-indigo-600" />
          <h2 className="font-bold text-gray-800">{tr('noticeBoard')}</h2>
          {sortedNotices.filter(n => n.type === 'urgent').length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              緊急 {sortedNotices.filter(n => n.type === 'urgent').length}件
            </span>
          )}
          {autoCount > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full border border-yellow-300">
              🤖 自動 {autoCount}件
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={handleAutoNotify}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition font-medium border ${autoUpdated ? 'bg-green-50 text-green-700 border-green-300' : 'bg-gray-50 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300 border-gray-200'}`}
            >
              <RefreshCw size={13} className={autoUpdated ? '' : ''} />
              {autoUpdated ? tr('autoNotifyUpdated') : tr('autoNotifyUpdate')}
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
            >
              <Plus size={14} /> {tr('newPost')}
            </button>
          )}
        </div>
      </div>

      {/* New Notice Form */}
      {showForm && (
        <div className="bg-indigo-50 border-b border-indigo-200 p-4">
          <div className="max-w-2xl space-y-3">
            <div className="flex gap-3">
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder={tr('postTitle')}
                className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              />
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as Notice['type'] }))}
                className="border rounded px-3 py-2 text-sm"
              >
                {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <textarea
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              placeholder={tr('postContent')}
              rows={3}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
            />
            <div className="flex gap-3 items-center">
              <label className="text-sm text-gray-600">{tr('postExpiry')}:</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                className="border rounded px-3 py-1.5 text-sm"
              />
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded">
                  {tr('cancel')}
                </button>
                <button onClick={addNotice} className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 font-medium">
                  {tr('post')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notices List */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {sortedNotices.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Bell size={48} className="mx-auto mb-4 opacity-30" />
            <p className="mb-2">{tr('noNotices')}</p>
            {canEdit && (
              <button onClick={handleAutoNotify} className="text-sm text-indigo-500 underline">
                {tr('autoGenerate')}
              </button>
            )}
          </div>
        )}
        {sortedNotices.map(notice => {
          const cfg = TYPE_CONFIG[notice.type];
          const Icon = cfg.icon;
          const isAuto = notice.createdBy === 'システム自動通知';
          return (
            <div key={notice.id} className={`rounded-lg border-2 p-4 ${cfg.color} relative`}>
              {notice.pinned && (
                <span className="absolute top-2 right-12 text-xs bg-gray-700 text-white px-2 py-0.5 rounded-full">📌 固定</span>
              )}
              {isAuto && (
                <span className="absolute top-2 right-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">🤖 自動</span>
              )}
              <div className="flex items-start gap-3">
                <Icon size={20} className={`mt-0.5 shrink-0 ${cfg.iconColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-sm">{notice.title}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${notice.type === 'urgent' ? 'bg-red-500 text-white' : 'bg-white/60'}`}>
                      {cfg.label}
                    </span>
                  </div>
                  {notice.content && <p className="text-sm opacity-90 whitespace-pre-wrap">{notice.content}</p>}
                  <div className="flex gap-3 mt-2 text-xs opacity-60">
                    <span>投稿者: {notice.createdBy}</span>
                    <span>{new Date(notice.createdAt).toLocaleDateString('ja-JP')}</span>
                    {notice.expiresAt && <span>期限: {new Date(notice.expiresAt).toLocaleDateString('ja-JP')}</span>}
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-1 shrink-0 mt-4">
                    {!isAuto && (
                      <button onClick={() => togglePin(notice.id)} className="p-1.5 rounded hover:bg-white/50" title="固定">
                        <Pin size={14} className={notice.pinned ? 'fill-current' : ''} />
                      </button>
                    )}
                    <button onClick={() => deleteNotice(notice.id)} className="p-1.5 rounded hover:bg-white/50 text-red-500" title="削除">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NoticeManager;
