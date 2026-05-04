import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const inputs = useRef([]);
  const [debugOtp, setDebugOtp] = useState(null);

  useEffect(() => {
    // Check for dev OTP in storage
    const lastDevOtp = localStorage.getItem('lastDevOtp');
    if (lastDevOtp) {
      setDebugOtp(lastDevOtp);
    }
  }, []);

  useEffect(() => {
    const countdown = timer > 0 && setInterval(() => setTimer(timer - 1), 1000);
    return () => clearInterval(countdown);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return;

    setIsLoading(true);
    setError('');

    try {
      await verifyOTP(otpString);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl shadow-primary-900/10 p-8 w-full max-w-md border border-primary-100">
        <button 
          onClick={() => navigate('/login')}
          className="p-2 -ml-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all flex items-center gap-2 text-sm font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-primary-100 text-primary-600 mb-4">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verify Identity</h2>
          <p className="text-gray-500 mt-2">We've sent a 6-digit code to your email.</p>
          
          {debugOtp && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">Development Tip</p>
              <p className="text-amber-700 text-sm">
                Email failed? Try code: <span className="font-mono font-bold text-base">{debugOtp}</span>
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
              {error}
            </div>
          )}

          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-100 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join('').length < 6}
            className="w-full bg-primary-600 text-white font-bold py-3.5 px-4 rounded-2xl hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm Verification'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">Didn't receive the code?</p>
          <button
            disabled={timer > 0}
            onClick={() => setTimer(30)}
            className="flex items-center gap-2 mx-auto text-sm font-bold text-primary-600 disabled:text-gray-400 hover:text-primary-700 transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", timer > 0 && "animate-spin-once")} />
            {timer > 0 ? `Resend in ${timer}s` : 'Resend Code Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple utility for CN if not imported
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default VerifyOTP;
