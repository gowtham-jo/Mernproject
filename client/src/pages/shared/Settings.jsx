import React, { useState } from 'react';
import { Bell, Shield, Moon, Globe, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';

export const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [courseUpdates, setCourseUpdates] = useState(true);
  const [chatAlerts, setChatAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleSave = () => {
    toast.success('Preferences saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your communication preferences and security configurations
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle divide-y divide-slate-100">
        {/* Notification Settings */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notifications & Alerts</h3>
              <p className="text-xs text-slate-500">Configure how LearnHub delivers updates</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">Email Notifications</p>
                <p className="text-[11px] text-slate-500">Receive email alerts when courses are updated</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">Course Announcements</p>
                <p className="text-[11px] text-slate-500">Get notified when teachers publish announcements</p>
              </div>
              <input
                type="checkbox"
                checked={courseUpdates}
                onChange={(e) => setCourseUpdates(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">Real-time Message Popups</p>
                <p className="text-[11px] text-slate-500">Display instant toast popups when new messages arrive</p>
              </div>
              <input
                type="checkbox"
                checked={chatAlerts}
                onChange={(e) => setChatAlerts(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>
          </div>
        </div>

        {/* Security & Sessions */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security & Session</h3>
              <p className="text-xs text-slate-500">JWT Token and authenticated status</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-800">Active Web Session</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Signed in via secure JWT token</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg">
              Active & Protected
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="md">
          <Check className="w-4 h-4 mr-1.5" />
          <span>Save Preferences</span>
        </Button>
      </div>
    </div>
  );
};

export default Settings;
