import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Key, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const License = () => {
  const [license, setLicense] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { validateLicense, isSuperAdmin, isLicenseValid } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isSuperAdmin || isLicenseValid) {
      navigate('/dashboard');
    }
  }, [isSuperAdmin, isLicenseValid, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate validation delay
    setTimeout(() => {
      if (validateLicense(license)) {
        navigate('/dashboard');
      } else {
        setError('Invalid or expired license key. Please contact support.');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 border border-white rounded-full"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 border border-white rounded-full"></div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-2xl p-10 w-full max-w-lg relative z-10 border border-stone-100">
        <div className="text-center mb-10">
          <div className="inline-flex p-5 rounded-3xl bg-primary-100 text-primary-600 mb-6">
            <Key className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">License Activation</h2>
          <p className="text-gray-500 mt-3 text-lg">Enter your organization's license key to continue accessing the Sri Basaveshwara platform.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Key Format: XXXX-XXXX-XXX</label>
            <input
              type="text"
              required
              placeholder="AGRO-XXXX-XXXX"
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-lg font-mono focus:border-primary-500 focus:bg-white transition-all outline-none uppercase tracking-widest"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || license.length < 8}
            className="w-full bg-primary-600 text-white font-bold py-4 px-4 rounded-2xl hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-primary-200" />
                <span>Validating Key...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span>Activate Platform</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm">
            Need a key? <button className="text-primary-600 font-bold hover:underline">Contact Sales</button> or visit our <button className="text-primary-600 font-bold hover:underline">Support Portal</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default License;
