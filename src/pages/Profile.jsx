import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { User, Mail, Shield, Camera, Save, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, isSuperAdmin, activeLicense, updateProfile, changePassword } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const getDaysRemaining = () => {
    if (!activeLicense?.expiry) return 0;
    const expiryDate = new Date(activeLicense.expiry);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    
    setIsUpdatingProfile(true);
    setMessage({ type: '', text: '' });
    
    try {
      await updateProfile(user.id, { name: formData.name });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'All password fields are required' });
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setIsUpdatingSecurity(true);
    setMessage({ type: '', text: '' });

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to change password' });
    } finally {
      setIsUpdatingSecurity(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <Helmet>
        <title>My Profile | AgroGrow</title>
      </Helmet>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Personal Account</h1>
          <p className="text-xs text-stone-500">Manage your identity and security settings.</p>
        </div>
        {message.text && (
          <div className={`px-4 py-2 rounded-lg text-xs font-bold animate-in fade-in slide-in-from-top-1 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary-600"></div>
            <div className="relative inline-block mt-4">
              <div className="w-24 h-24 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 border border-stone-200">
                <User className="w-10 h-10" />
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl border border-stone-200 shadow-sm text-stone-600 hover:text-primary-600 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-6 pb-2">
              <h3 className="font-bold text-stone-900">{user?.name}</h3>
              <p className="text-[10px] uppercase font-bold tracking-widest text-primary-600 mt-1">{user?.role?.replace('_', ' ')}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-50 flex items-center justify-center gap-4 text-[10px] text-stone-400 font-bold uppercase tracking-tighter">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" />
                Verified
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Active
              </div>
            </div>
          </div>
          
          {!isSuperAdmin && (
            <div className="card bg-stone-900 text-white">
              <h4 className="text-sm font-bold mb-2">License Information</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-stone-400 uppercase font-bold">
                    {daysRemaining < 0 ? 'License Status' : 'Expires in'}
                  </p>
                  <p className={`text-xl font-bold ${daysRemaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {daysRemaining < 0 ? 'EXPIRED' : `${daysRemaining} Days`}
                  </p>
                  {activeLicense?.expiry && (
                    <p className="text-[9px] text-stone-500 mt-1 font-bold italic">Until: {new Date(activeLicense.expiry).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="pt-2">
                  <Link 
                    to="/renew-subscription"
                    className="w-full bg-emerald-600 text-white py-2 rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition-colors block text-center"
                  >
                    Renew Subscription
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <form className="card" onSubmit={handleProfileSubmit}>
            <h4 className="text-sm font-bold border-b border-stone-50 pb-3 mb-6">Profile Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    type="text" 
                    className="input-field pl-10" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    type="email" 
                    className="input-field pl-10 bg-stone-50 text-stone-400" 
                    value={formData.email}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                type="submit" 
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          <form className="card border-rose-100" onSubmit={handlePasswordSubmit}>
            <h4 className="text-sm font-bold border-b border-stone-50 pb-3 mb-6 text-rose-900">Security & Password</h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase text-xs">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="input-field pl-10" 
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase text-xs">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="input-field" 
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 uppercase text-xs">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="input-field" 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                type="submit"
                className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition-all font-bold text-xs shadow-sm flex items-center gap-2 disabled:opacity-50"
                disabled={isUpdatingSecurity}
              >
                {isUpdatingSecurity ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Shield className="w-3.5 h-3.5" />
                )}
                {isUpdatingSecurity ? 'Updating...' : 'Update Security'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
