import React, { useState, useEffect } from 'react';
import { X, Save, School } from 'lucide-react';

export interface SchoolSettings {
  schoolName: string;
  schoolAddress: string;
  principalName: string;
  phone: string;
  email: string;
}

const STORAGE_KEY = 'sms_school_settings';

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: '〇〇日本語学校',
  schoolAddress: '〇〇都〇〇区〇〇 1-2-3',
  principalName: '',
  phone: '',
  email: '',
};

export const loadSchoolSettings = (): SchoolSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SCHOOL_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SCHOOL_SETTINGS };
};

const saveSchoolSettings = (s: SchoolSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
};

interface Props {
  onClose: () => void;
}

const SchoolSettingsModal: React.FC<Props> = ({ onClose }) => {
  const [form, setForm] = useState<SchoolSettings>(loadSchoolSettings);

  const handleChange = (field: keyof SchoolSettings, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    saveSchoolSettings(form);
    alert('学校設定を保存しました。');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="flex justify-between items-center px-5 py-3 bg-indigo-600 text-white shrink-0">
          <h2 className="font-bold flex items-center gap-2"><School size={18} /> 学校設定</h2>
          <button onClick={onClose} className="hover:bg-indigo-500 p-1 rounded"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">学校名 *</label>
            <input
              value={form.schoolName}
              onChange={e => handleChange('schoolName', e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="例: 東京日本語学校"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">住所</label>
            <input
              value={form.schoolAddress}
              onChange={e => handleChange('schoolAddress', e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="例: 東京都新宿区〇〇 1-2-3"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">校長名</label>
            <input
              value={form.principalName}
              onChange={e => handleChange('principalName', e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="例: 山田 太郎"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">電話番号</label>
            <input
              value={form.phone}
              onChange={e => handleChange('phone', e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="例: 03-1234-5678"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">メールアドレス</label>
            <input
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="例: info@school.jp"
            />
          </div>

          <p className="text-xs text-gray-400">※ ここで設定した情報は証明書の発行に使用されます。</p>
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t flex justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100">キャンセル</button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
            <Save size={15} /> 保存する
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolSettingsModal;
