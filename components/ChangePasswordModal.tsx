import React, { useState } from 'react';
import { changePassword } from '../services/authService';
import { X, Key } from 'lucide-react';

interface ChangePasswordModalProps {
  onClose: () => void;
  username: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, username }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<{type: 'error' | 'success', text: string} | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
        setMsg({ type: 'error', text: 'パスワードは4文字以上で設定してください' });
        return;
    }
    if (newPassword !== confirmPassword) {
        setMsg({ type: 'error', text: 'パスワードが一致しません' });
        return;
    }

    const success = changePassword(username, newPassword);
    if (success) {
        setMsg({ type: 'success', text: 'パスワードを変更しました' });
        setTimeout(onClose, 1500);
    } else {
        setMsg({ type: 'error', text: '変更に失敗しました' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Key size={18} /> パスワード変更
          </h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">新しいパスワード</label>
                <input 
                    type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full border p-2 rounded outline-none focus:border-indigo-500"
                    placeholder="新しいパスワードを入力"
                    autoFocus
                />
            </div>
             <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">確認用入力</label>
                <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full border p-2 rounded outline-none focus:border-indigo-500"
                    placeholder="もう一度入力"
                />
            </div>

            {msg && (
                <div className={`text-xs p-2 rounded ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {msg.text}
                </div>
            )}

            <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-sm">
                変更を保存
            </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
