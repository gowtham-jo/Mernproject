import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Camera, CheckCircle2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import uploadService from '../../services/uploadService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';

export const Profile = () => {
  const { user, updateUserProfile } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await authService.updateProfile(profileData);
      updateUserProfile(res.data.user);
      toast.success('Profile details updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      setChangingPass(true);
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setChangingPass(false);
    }
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImg(true);
      const res = await uploadService.uploadFile(file);
      const newImageUrl = res.data.url;
      setProfileData((prev) => ({ ...prev, profileImage: newImageUrl }));
      const updateRes = await authService.updateProfile({ profileImage: newImageUrl });
      updateUserProfile(updateRes.data.user);
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error(err.message || 'Image upload failed.');
    } finally {
      setUploadingImg(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Profile Hero */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
        <div className="relative group">
          <Avatar
            src={profileData.profileImage || user?.profileImage}
            name={user?.name}
            size="xl"
          />
          <label className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-md transition-colors">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
            <Badge variant="blue" size="sm" className="capitalize">
              {user?.role} Account
            </Badge>
          </div>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <p className="text-xs text-slate-600 mt-2 max-w-xl leading-relaxed">
            {user?.bio || 'No biography added yet.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Profile Info Form */}
        <div className="md:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-subtle space-y-5">
            <h3 className="text-base font-bold text-slate-900">Personal Information</h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                icon={User}
                required
              />

              <Input
                label="Phone Number"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                icon={Phone}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Bio / About Me
                </label>
                <textarea
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Share a short summary about your background and interests..."
                  className="block w-full rounded-xl border border-slate-300 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <Button type="submit" size="md" loading={savingProfile}>
                <span>Save Profile Details</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-5">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-subtle space-y-5">
            <h3 className="text-base font-bold text-slate-900">Change Password</h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, currentPassword: e.target.value })
                }
                placeholder="••••••••"
                icon={Lock}
                required
              />

              <Input
                label="New Password"
                type="password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                placeholder="••••••••"
                icon={Lock}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirmPassword: e.target.value })
                }
                placeholder="••••••••"
                icon={Lock}
                required
              />

              <Button type="submit" variant="secondary" size="md" loading={changingPass}>
                <span>Update Password</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
