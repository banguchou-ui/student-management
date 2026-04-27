import React, { useState } from 'react';
import { User } from '../types';
import { login, register } from '../services/authService';
import { Lock, User as UserIcon, LogIn, UserPlus, FileText } from 'lucide-react';

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

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setName('');
    setError('');
    setSuccess('');
  }

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
        setTimeout(() => {
            setIsRegistering(false);
            resetForm();
        }, 1500);
    } else {
        setError('そのユーザー名は既に使用されています');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden transition-all">
        <div className="bg-indigo-600 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500 mb-4 text-white">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">留学生教務・生活総合管理システム</h1>
          <p className="text-indigo-200 mt-2 text-sm">
            {isRegistering ? '新規アカウント登録 (デフォルト閲覧のみ)' : 'ログインしてください'}
          </p>
        </div>
        
        <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} className="p-8 space-y-6">
          
          {isRegistering && (
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">氏名 (表示名)</label>
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FileText size={18} />
                </div>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition sm:text-sm"
                    placeholder="氏名を入力"
                    required={isRegistering}
                />
                </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ユーザー名</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <UserIcon size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition sm:text-sm"
                placeholder="ユーザー名を入力"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition sm:text-sm"
                placeholder="パスワードを入力"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" /> {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" /> {success}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            {isRegistering ? (
                <> <UserPlus size={18} /> 登録する </>
            ) : (
                <> <LogIn size={18} /> ログイン </>
            )}
          </button>
          
          {!isRegistering && (
             <div className="text-center pt-2">
                 <button 
                    type="button" 
                    onClick={() => { setIsRegistering(true); resetForm(); }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                 >
                    アカウントをお持ちでない方はこちら（新規登録）
                 </button>
             </div>
          )}

           {isRegistering && (
             <div className="text-center pt-2">
                 <button 
                    type="button" 
                    onClick={() => { setIsRegistering(false); resetForm(); }}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                 >
                    ログインに戻る
                 </button>
             </div>
          )}
          
          {!isRegistering && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 text-center">
                <p>校長アカウント: xiaozhang / 8888</p>
                <p>管理者アカウント: admin / 5986</p>
                <p>教員アカウント: teacher / password</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
