import React, { useState, useEffect } from 'react';
import { User, UserRole, UserPermissions } from '../types';
import { getStoredUsers, saveStoredUsers } from '../services/storageService';
import { updateUserPermissions, register } from '../services/authService';
import { X, Save, Shield, Trash2, UserPlus, Search, Briefcase, Building, Key } from 'lucide-react';
import { SCHOOL_POSITIONS } from '../constants';

interface UserManagementModalProps {
  onClose: () => void;
  currentUsername: string;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ onClose, currentUsername }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Edit State
  const [editPermissions, setEditPermissions] = useState<UserPermissions | null>(null);
  const [editRole, setEditRole] = useState<UserRole | null>(null);
  const [editPosition, setEditPosition] = useState('');
  const [editCustomPosition, setEditCustomPosition] = useState('');
  const [editDepartment, setEditDepartment] = useState('');

  // Add User State
  const [newUser, setNewUser] = useState({
      username: '',
      password: '',
      name: '',
      department: '',
      positionSelect: SCHOOL_POSITIONS[2], // Default to Class Teacher
      customPosition: '',
      role: UserRole.TEACHER
  });

  useEffect(() => {
    setUsers(getStoredUsers());
  }, []);

  // --- Add User Logic ---
  const handleAddSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newUser.username || !newUser.password || !newUser.name) return;

      const finalPosition = newUser.positionSelect === 'その他 (カスタム)' ? newUser.customPosition : newUser.positionSelect;
      
      const newUserData: User = {
          username: newUser.username,
          password: newUser.password,
          name: newUser.name,
          department: newUser.department,
          position: finalPosition,
          role: newUser.role,
          permissions: newUser.role === UserRole.PRINCIPAL 
            ? { canEditBasicInfo: true, canEditAcademicInfo: true, canEditWorkInfo: true, canExportData: true, canManageUsers: true }
            : { canEditBasicInfo: true, canEditAcademicInfo: true, canEditWorkInfo: true, canExportData: false, canManageUsers: false }
      };

      const currentUsers = getStoredUsers();
      if (currentUsers.find(u => u.username === newUserData.username)) {
          alert('このユーザーIDは既に使用されています');
          return;
      }

      const updatedUsers = [...currentUsers, newUserData];
      saveStoredUsers(updatedUsers);
      setUsers(updatedUsers);
      setIsAddingUser(false);
      setNewUser({
          username: '', password: '', name: '', department: '', positionSelect: SCHOOL_POSITIONS[2], customPosition: '', role: UserRole.TEACHER
      });
  };

  // --- Edit Logic ---
  const handleEditClick = (user: User) => {
    setEditingUser(user.username);
    setEditPermissions({ ...user.permissions });
    setEditRole(user.role);
    setEditDepartment(user.department || '');
    
    // Determine position state
    if (SCHOOL_POSITIONS.includes(user.position)) {
        setEditPosition(user.position);
        setEditCustomPosition('');
    } else {
        setEditPosition('その他 (カスタム)');
        setEditCustomPosition(user.position || '');
    }
  };

  const handleSave = () => {
    if (editingUser && editPermissions) {
      const finalPosition = editPosition === 'その他 (カスタム)' ? editCustomPosition : editPosition;
      
      const updatedUsers = users.map(u => {
          if (u.username === editingUser) {
              return {
                  ...u,
                  role: editRole || u.role,
                  permissions: editPermissions,
                  position: finalPosition,
                  department: editDepartment
              };
          }
          return u;
      });
      
      saveStoredUsers(updatedUsers);
      setUsers(updatedUsers);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (username: string) => {
      if (username === currentUsername) {
          alert("自分自身を削除することはできません。");
          return;
      }

      if(window.confirm(`【警告】\n本当にユーザー ${username} を削除しますか？\nこの操作は取り消せません。`)) {
          // Always fetch latest from storage to ensure sync
          const currentUsers = getStoredUsers();
          const newUsers = currentUsers.filter(u => u.username !== username);
          saveStoredUsers(newUsers);
          setUsers(newUsers); 
      }
  };

  const handlePermissionChange = (key: keyof UserPermissions) => {
    if (editPermissions) {
      setEditPermissions({ ...editPermissions, [key]: !editPermissions[key] });
    }
  };

  // Filter
  const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b bg-indigo-600 text-white flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
             <Shield size={24} /> 教職員・ユーザー管理
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-indigo-500 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-4 justify-between items-center shrink-0">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="名前、ID、部署で検索..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                />
            </div>
            <button 
                onClick={() => setIsAddingUser(!isAddingUser)} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition shadow-sm ${isAddingUser ? 'bg-gray-200 text-gray-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
                {isAddingUser ? <X size={18}/> : <UserPlus size={18}/>} 
                {isAddingUser ? '閉じる' : '新規教職員登録'}
            </button>
        </div>

        {/* Add User Form */}
        {isAddingUser && (
            <div className="p-6 bg-blue-50 border-b animate-fade-in shrink-0">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><UserPlus size={20} className="text-blue-600"/> 新規教職員情報の入力</h3>
                <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">氏名 *</label>
                        <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="例: 山田 太郎" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">職員ID (ユーザー名) *</label>
                        <input required type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="例: t-yamada" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">パスワード *</label>
                        <input required type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="初期パスワード" />
                    </div>
                    
                    {/* Position Selection */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">役職 (役割)</label>
                        <div className="flex gap-2">
                            <select 
                                value={newUser.positionSelect} 
                                onChange={e => setNewUser({...newUser, positionSelect: e.target.value})} 
                                className="border p-2 rounded text-sm flex-1"
                            >
                                {SCHOOL_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            {newUser.positionSelect === 'その他 (カスタム)' && (
                                <input 
                                    type="text" 
                                    value={newUser.customPosition} 
                                    onChange={e => setNewUser({...newUser, customPosition: e.target.value})} 
                                    className="border p-2 rounded text-sm flex-1" 
                                    placeholder="役職名を入力" 
                                    autoFocus
                                />
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">所属部署</label>
                        <input type="text" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="例: 教務課" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">システム権限</label>
                        <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full border p-2 rounded text-sm">
                            <option value={UserRole.TEACHER}>一般教員 (標準)</option>
                            <option value={UserRole.PRINCIPAL}>管理者 (全権限)</option>
                            <option value={UserRole.VIEWER}>閲覧のみ</option>
                        </select>
                    </div>

                    <div className="md:col-span-3 flex justify-end mt-2">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow-sm flex items-center gap-2">
                            <Save size={18}/> 登録する
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* Table Area */}
        <div className="overflow-auto flex-1 p-4 bg-gray-100">
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                <tr>
                    <th className="p-4 w-48">教職員情報</th>
                    <th className="p-4 w-48">所属・役職</th>
                    <th className="p-4 w-32">システム権限</th>
                    <th className="p-4 text-center">権限詳細</th>
                    <th className="p-4 text-right">操作</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.map(user => {
                    const isEditing = editingUser === user.username;
                    const isSelf = user.username === currentUsername;

                    return (
                    <tr key={user.username} className={`hover:bg-gray-50 transition ${isEditing ? 'bg-blue-50/50' : ''}`}>
                        <td className="p-4 align-top">
                            <div className="font-bold text-gray-900 text-base">{user.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Key size={10}/> ID: {user.username}</div>
                        </td>
                        
                        <td className="p-4 align-top">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <input 
                                        type="text" 
                                        value={editDepartment} 
                                        onChange={e => setEditDepartment(e.target.value)} 
                                        className="w-full border p-1 rounded text-xs" 
                                        placeholder="部署"
                                    />
                                    <div className="flex gap-1">
                                        <select 
                                            value={editPosition} 
                                            onChange={e => setEditPosition(e.target.value)} 
                                            className="w-full border p-1 rounded text-xs"
                                        >
                                            {SCHOOL_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    {editPosition === 'その他 (カスタム)' && (
                                        <input 
                                            type="text" 
                                            value={editCustomPosition} 
                                            onChange={e => setEditCustomPosition(e.target.value)} 
                                            className="w-full border p-1 rounded text-xs bg-white" 
                                            placeholder="役職名"
                                        />
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <div className="font-medium text-gray-800 flex items-center gap-1"><Briefcase size={12} className="text-gray-400"/> {user.position}</div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Building size={12} className="text-gray-400"/> {user.department || '所属なし'}</div>
                                </div>
                            )}
                        </td>

                        <td className="p-4 align-top">
                            {isEditing && !isSelf ? (
                                <select 
                                    value={editRole || user.role} 
                                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                                    className="border rounded p-1 text-xs w-full"
                                >
                                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            ) : (
                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${user.role === UserRole.PRINCIPAL ? 'bg-purple-100 text-purple-700 border-purple-200' : user.role === UserRole.TEACHER ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                {user.role}
                                </span>
                            )}
                        </td>
                        
                        <td className="p-4 align-top">
                            <div className="flex flex-wrap gap-2 justify-center">
                                {[
                                    {k: 'canEditBasicInfo', l: '基本'},
                                    {k: 'canEditAcademicInfo', l: '教務'},
                                    {k: 'canEditWorkInfo', l: 'バイト'},
                                    {k: 'canExportData', l: '出力'},
                                    {k: 'canManageUsers', l: '管理'}
                                ].map((item) => {
                                    const key = item.k as keyof UserPermissions;
                                    const checked = isEditing ? editPermissions?.[key] : user.permissions[key];
                                    const isActive = checked;
                                    
                                    return (
                                        <div key={key} className={`flex flex-col items-center p-1 rounded border ${isActive ? 'bg-white border-green-300 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                            <span className="text-[10px] text-gray-500 mb-1">{item.l}</span>
                                            <input 
                                                type="checkbox" 
                                                checked={checked || false} 
                                                disabled={!isEditing || (isSelf && key === 'canManageUsers')} 
                                                onChange={() => handlePermissionChange(key)}
                                                className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-0 cursor-pointer"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </td>

                        <td className="p-4 text-right align-top">
                        <div className="flex flex-col gap-2 items-end">
                            {isEditing ? (
                                <>
                                    <button onClick={handleSave} className="w-20 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold shadow-sm">
                                        保存
                                    </button>
                                    <button onClick={() => setEditingUser(null)} className="w-20 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded border bg-white">
                                        キャンセル
                                    </button>
                                </>
                            ) : (
                                <>
                                <button 
                                    onClick={() => handleEditClick(user)} 
                                    className="text-indigo-600 hover:text-indigo-800 text-xs font-bold border border-indigo-200 hover:bg-indigo-50 px-3 py-1 rounded"
                                >
                                    編集
                                </button>
                                {!isSelf && (
                                    <button 
                                        type="button"
                                        onClick={() => handleDeleteUser(user.username)}
                                        className="text-red-600 hover:text-red-800 text-xs font-bold border border-red-200 hover:bg-red-50 px-3 py-1 rounded flex items-center gap-1"
                                    >
                                        <Trash2 size={12} /> 削除
                                    </button>
                                )}
                                </>
                            )}
                        </div>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;
