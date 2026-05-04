import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ password: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) return;

    setIsLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setIsLoading(false);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="card max-w-sm w-full text-center p-10">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Password Reset</h2>
          <p className="text-xs text-stone-500 mt-4 leading-relaxed">
            Your security credentials have been updated successfully.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-8 w-full btn-primary"
          >
            Login with New Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-stone-900">Choose New Password</h2>
            <p className="text-xs text-stone-500 mt-1">Ensure your new password contains at least 8 characters.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase text-xs">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                <input 
                  type="password" required className="input-field pl-10" placeholder="••••••••"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-500 uppercase text-xs">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                <input 
                  type="password" required className="input-field pl-10" placeholder="••••••••"
                  value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.password || formData.password !== formData.confirm}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
