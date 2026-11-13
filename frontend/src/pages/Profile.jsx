import { useState } from 'react';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user, updateUserInContext } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async () => {
    if (!profileForm.name.trim()) return toast.error('Name is required');
    setSavingProfile(true);
    try {
      const res = await userService.update(user._id, { name: profileForm.name, phone: profileForm.phone });
      updateUserInContext({ name: res.data.name, phone: res.data.phone });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('All fields are required');
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setSavingPw(true);
    try {
      await userService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-50">My Profile</h1>

      {/* Avatar / identity */}
      <div className="card flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 text-2xl font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="badge mt-1 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 capitalize">
            {user?.role?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Profile fields */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Personal Information</h2>
        <div>
          <label className="label">Name</label>
          <input className="input" value={profileForm.name}
            onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" value={user?.email} disabled
            title="Email cannot be changed" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={profileForm.phone}
            onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+1 555-0100" />
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" onClick={handleProfileSave} disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-700 dark:text-slate-200">Change Password</h2>
        <div>
          <label className="label">Current Password</label>
          <input type="password" className="input" value={pwForm.currentPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} />
        </div>
        <div>
          <label className="label">New Password</label>
          <input type="password" className="input" value={pwForm.newPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
            placeholder="Min 8 characters" />
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <input type="password" className="input" value={pwForm.confirm}
            onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} />
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" onClick={handlePasswordChange} disabled={savingPw}>
            {savingPw ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
