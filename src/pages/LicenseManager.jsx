import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, RefreshCw, Clock, Key, AlertCircle, Copy, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

const LicenseManager = () => {
  const { activeLicense, generateLicense } = useAuth();
  const [validDays, setValidDays] = useState(30);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generateLicense(validDays);
      setIsGenerating(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeLicense?.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Helmet>
        <title>License Manager | Sri Basaveshwara</title>
      </Helmet>

      <div>
        <h1 className="text-xl font-bold text-stone-900">Platform License Management</h1>
        <p className="text-xs text-stone-500">Generate and monitor organization-wide activation keys.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Active License Info */}
        <div className="card border-primary-100 bg-primary-50/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-800 text-sm">Active System License</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Current Key</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-1">
                <code className="flex-1 p-3 bg-white border border-primary-200 rounded-xl font-mono text-base md:text-lg font-bold text-primary-700 tracking-widest break-all">
                  {activeLicense?.key || 'N/A'}
                </code>
                <button 
                  onClick={copyToClipboard}
                  className="p-3 bg-white border border-primary-200 rounded-xl hover:bg-primary-50 text-primary-600 transition-all active:scale-95 flex items-center justify-center"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                  <span className="sm:hidden ml-2 text-xs font-bold">Copy Key</span>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-primary-100">
              <div className="flex items-center gap-2 text-stone-600">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Valid Until</span>
              </div>
              <span className="text-sm font-bold text-stone-900">
                {activeLicense?.expiry ? new Date(activeLicense.expiry).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                Warning: Updating or changing the system license will automatically log out all active Admins and Field Users. They will be required to re-authenticate with the new key.
              </p>
            </div>
          </div>
        </div>

        {/* Generate New License */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-stone-100 text-stone-600 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-800 text-sm">Generate New Key</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-stone-500 uppercase">License Duration (Days)</label>
              <div className="grid grid-cols-4 gap-2">
                {[30, 90, 180, 365].map((days) => (
                  <button
                    key={days}
                    onClick={() => setValidDays(days)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      validDays === days 
                        ? 'bg-primary-600 text-white shadow-md' 
                        : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <input 
                  type="range" 
                  min="1" 
                  max="730" 
                  value={validDays} 
                  onChange={(e) => setValidDays(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-stone-400 font-bold">1 Day</span>
                  <span className="text-[10px] text-stone-900 font-bold">{validDays} Days</span>
                  <span className="text-[10px] text-stone-400 font-bold">2 Years</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-stone-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Deploying New Security Protocol...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Generate & Broadcast New License</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-stone-50 border-stone-200">
        <h4 className="text-xs font-bold text-stone-700 mb-4 uppercase tracking-tight">Security Audit Log: License Changes</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div>
                <p className="text-xs font-bold text-stone-800">License Generated</p>
                <p className="text-[10px] text-stone-400">By Super Admin (Shashankrp2)</p>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 font-medium">Just now</p>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-stone-100 opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-stone-300"></div>
              <div>
                <p className="text-xs font-bold text-stone-800">License Refresh</p>
                <p className="text-[10px] text-stone-400">By Admin System Auto-Task</p>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 font-medium">30 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseManager;
