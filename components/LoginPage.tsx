import React, { useState } from 'react';
import { User } from '../types';
import { login, register } from '../services/authService';
import { Lock, User as UserIcon, LogIn, UserPlus, FileText, GraduationCap } from 'lucide-react';
import { loadSchoolSettings } from './SchoolSettingsModal';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const settings = loadSchoolSettings();

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setName('');
    setError('');
    setSuccess('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = login(username, password);
    if (user) {
      onLogin(user);
    } else {
      setError('ユーザー名またはパスワードが間違っています');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username || !password || !name) {
      setError('全ての項目を入力してください');
      return;
    }
    const created = register(username, password, name);
    if (created) {
      setSuccess('登録が完了しました。新しいアカウントでログインしてください（デフォルトは閲覧のみ）。');
      setTimeout(() => { setIsRegistering(false); resetForm(); }, 1500);
    } else {
      setError('そのユーザー名は既に使用されています');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 50%, #1a4d80 100%)' }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,.05) 20px, rgba(255,255,255,.05) 40px)'
      }} />

      <div className="relative w-full max-w-md">
        {/* School Logo & Name */}
        <div className="text-center mb-8">
          {settings.logoBase64 ? (
            <img src={settings.logoBase64} className="h-16 mx-auto mb-4 object-contain" alt="logo" />
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur mb-4">
              <GraduationCap size={34} className="text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {settings.schoolName !== '〇〇日本語学校' ? settings.schoolName : '留学生管理システム'}
          </h1>
          <p className="text-blue-200 text-sm mt-1">Student Life Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-5 text-center">
            <p className="text-white font-semibold text-sm tracking-widest uppercase">
              {isRegistering ? '新規アカウント登録' : '教職員ログイン'}
            </p>
          </div>

          {/* Card Body */}
          <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} className="px-8 py-7 space-y-5">
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">氏名</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <FileText size={16} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-gray-50"
                    placeholder="氏名を入力"
                    required={isRegistering}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">ユーザー名</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <UserIcon size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-gray-50"
                  placeholder="ユーザー名を入力"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">パスワード</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-gray-50"
                  placeholder="パスワードを入力"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-100 text-green-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md transition-all"
            >
              {isRegistering ? <><UserPlus size={16} /> 登録する</> : <><LogIn size={16} /> ログイン</>}
            </button>

            {!isRegistering && (
              <>
                {/* Default accounts hint */}
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 space-y-1">
                  <p className="font-bold text-amber-700 mb-1">デフォルトアカウント</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    <span>校長: xiaozhang</span><span>/ 8888</span>
                    <span>管理者: admin</span><span>/ 5986</span>
                    <span>教員: teacher</span><span>/ password</span>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setIsRegistering(true); resetForm(); }}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                  >
                    アカウントをお持ちでない方はこちら
                  </button>
                </div>
              </>
            )}

            {isRegistering && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); resetForm(); }}
                  className="text-gray-500 hover:text-gray-700 text-xs font-medium"
                >
                  ログインに戻る
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Copyright */}
        <p className="text-center text-blue-300/60 text-xs mt-6">
          © {new Date().getFullYear()} {settings.schoolName}. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
