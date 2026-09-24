import React, { useState } from 'react';
import {
  X,
  Shield,
  Key,
  Mail,
  User as UserIcon,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/adminApi';

interface AdminProfileSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminProfileSecurityModal: React.FC<AdminProfileSecurityModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || 'AR Super Admin');
  const [email, setEmail] = useState(user?.email || 'admin@armarket.com');
  const [phone, setPhone] = useState(user?.phone || '+880 1711-000001');
  const [avatar, setAvatar] = useState(
    user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );
  const [bio, setBio] = useState(user?.bio || 'Super Administrator & Chief Marketplace Security Officer for AR Market BD.');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await adminApi.updateProfile({
        name,
        email,
        phone,
        avatar,
        bio,
      });

      if (res.success) {
        await refreshUser();
        setSuccessMsg('Profile details successfully updated.');
        onShowToast('Admin profile updated!');
      } else {
        setErrorMsg(res.error || 'Failed to update profile.');
      }
    } catch {
      setErrorMsg('An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password & Security Update
  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword && newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const res = await adminApi.updateSecurity({
        email: email !== user?.email ? email : undefined,
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
      });

      if (res.success) {
        await refreshUser();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMsg('Security credentials updated successfully.');
        onShowToast('Security credentials updated!');
      } else {
        setErrorMsg(res.error || 'Failed to update security credentials.');
      }
    } catch {
      setErrorMsg('An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#004D40] to-[#008080] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-200 border border-white/20">
              <Shield className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Admin Profile & Security Settings</h2>
              <p className="text-xs text-teal-100">Manage super administrator identity and access credentials</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-[#008080] text-[#008080]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Edit Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('security');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-[#008080] text-[#008080]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            Password & Security
          </button>
        </div>

        {/* Feedback Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Profile Form */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                  placeholder="Super Administrator"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                    placeholder="admin@armarket.com"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                    placeholder="+880 1711-000001"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bio / Operations Role
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                placeholder="Marketplace Operations & Security Administrator"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold bg-[#008080] hover:bg-[#006666] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security & Password Form */}
        {activeTab === 'security' && (
          <form onSubmit={handleSaveSecurity} className="p-6 space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Default Super Admin Credentials Note</p>
                <p className="mt-0.5 text-slate-600">
                  Default login credentials are <span className="font-mono font-bold text-amber-900">admin@armarket.com</span> with password <span className="font-mono font-bold text-amber-900">Admin@2026#Secure</span>. You can update both here at any time.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Email Address (Can be changed anytime)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                placeholder="admin@armarket.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pr-10 pl-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                  placeholder="Enter current password (e.g. Admin@2026#Secure)"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pr-10 pl-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#008080] focus:ring-1 focus:ring-[#008080]"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold bg-[#008080] hover:bg-[#006666] text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {loading ? 'Updating...' : 'Update Password & Email'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
