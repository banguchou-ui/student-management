import React, { useState, useRef } from 'react';
import { X, Save, School, Upload, Image } from 'lucide-react';
import { useTr } from '../i18n/translations';

export interface SchoolSettings {
  schoolName: string;
  schoolAddress: string;
  principalName: string;
  phone: string;
  email: string;
  logoBase64: string;
  defaultResidence: string;
}

const STORAGE_KEY = 'sms_school_settings';

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: '〇〇日本語学校',
  schoolAddress: '〇〇都〇〇区〇〇 1-2-3',
  principalName: '',
  phone: '',
  email: '',
  logoBase64: '',
  defaultResidence: '',
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
  const { tr } = useTr();
  const [form, setForm] = useState<SchoolSettings>(loadSchoolSettings);
  const logoRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof SchoolSettings, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => handleChange('logoBase64', reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    saveSchoolSettings(form);
    alert(tr('settingSavedLabel'));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="flex justify-between items-center px-5 py-3 bg-indigo-600 text-white shrink-0">
          <h2 className="font-bold flex items-center gap-2"><School size={18} /> {tr('schoolSettingsTitle')}</h2>
          <button onClick={onClose} className="hover:bg-indigo-500 p-1 rounded"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Logo Upload */}
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-2">{tr('schoolLogoLabel')}</label>
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 overflow-hidden"
                onClick={() => logoRef.current?.click()}
              >
                {form.logoBase64
                  ? <img src={form.logoBase64} className="w-full h-full object-contain p-1" />
                  : <Image size={32} className="text-gray-300" />}
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  className="flex items-center gap-2 text-sm border rounded px-3 py-1.5 hover:bg-gray-50"
                >
                  <Upload size={14} /> {tr('uploadLogoLabel')}
                </button>
                {form.logoBase64 && (
                  <button
                    type="button"
                    onClick={() => handleChange('logoBase64', '')}
                    className="mt-2 text-xs text-red-500 hover:text-red-700"
                  >
                    {tr('deleteLogoLabel')}
                  </button>
                )}
                <p className="text-xs text-gray-400 mt-1">PNG / JPG 推奨</p>
              </div>
            </div>
            <input
              type="file"
              ref={logoRef}
              className="hidden"
              accept="image/*"
              onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">{tr('schoolNameLabel')} *</label>
            <input
              value={form.schoolName}
              onChange={e => handleChange('schoolName', e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="例: 東京日本語学校"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">{tr('addressLabel')}</label>
            <input
              value={form.schoolAddress}
              onChange={e => handleChange('schoolAddress', e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="例: 東京都新宿区〇〇 1-2-3"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">{tr('principalLabel')}</label>
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
            <label className="text-xs font-bold text-gray-500 block mb-1">{tr('emailLabel')}</label>
            <input
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="例: info@school.jp"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">{tr('defaultResidenceLabel')}</label>
            <input
              value={form.defaultResidence || ''}
              onChange={e => handleChange('defaultResidence', e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="例: 東京都新宿区〇〇 1-2-3（学生の住居地が未入力の場合に使用）"
            />
          </div>

          <p className="text-xs text-gray-400">※ {tr('settingsNoteLabel')}</p>
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t flex justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100">{tr('cancelLabel')}</button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
            <Save size={15} /> {tr('saveLabel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolSettingsModal;
