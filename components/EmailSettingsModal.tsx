import React, { useState, useEffect } from 'react';
import { X, Mail, Eye, EyeOff, ExternalLink, CheckCircle } from 'lucide-react';
import { loadEmailSettings, saveEmailSettings, EmailSettings } from '../utils/sendEmail';

interface EmailSettingsModalProps {
  onClose: () => void;
}

const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<EmailSettings>({ serviceId: '', templateId: '', publicKey: '' });
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadEmailSettings());
  }, []);

  const handleSave = () => {
    saveEmailSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isConfigured = !!(settings.serviceId && settings.templateId && settings.publicKey);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-blue-600" />
            <h2 className="font-bold text-gray-800">メール送信設定（EmailJS）</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status indicator */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isConfigured ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
            {isConfigured
              ? <><CheckCircle size={15} /> 設定済み — 催促メール送信が使用できます</>
              : <>⚠️ 未設定 — EmailJS の認証情報を入力してください</>}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 space-y-1">
            <p className="font-bold">設定手順:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-700">
              <li><a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">emailjs.com <ExternalLink size={10} /></a> で無料アカウント作成</li>
              <li>Email Service を追加して Service ID を取得</li>
              <li>Email Template を作成して Template ID を取得</li>
              <li>Account → Public Key をコピー</li>
            </ol>
            <p className="mt-1 text-blue-600">テンプレート変数: {'{{student_name}}'}, {'{{unpaid_amount}}'}, {'{{deadline}}'}, {'{{school_name}}'}</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Service ID</label>
              <input
                value={settings.serviceId}
                onChange={e => setSettings(p => ({ ...p, serviceId: e.target.value }))}
                placeholder="service_xxxxxxx"
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Template ID</label>
              <input
                value={settings.templateId}
                onChange={e => setSettings(p => ({ ...p, templateId: e.target.value }))}
                placeholder="template_xxxxxxx"
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Public Key</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={settings.publicKey}
                  onChange={e => setSettings(p => ({ ...p, publicKey: e.target.value }))}
                  placeholder="XXXXXXXXXXXXXXXXXXXX"
                  className="w-full border rounded px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-400 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t px-5 py-3 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded border">キャンセル</button>
          <button
            onClick={handleSave}
            className={`px-5 py-2 text-sm rounded font-bold transition ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            {saved ? '✓ 保存しました' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSettingsModal;
