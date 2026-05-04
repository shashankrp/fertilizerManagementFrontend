import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { QrCode, ShieldCheck, CreditCard, ArrowLeft, CheckCircle, Info, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const RenewSubscription = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 py-6 md:py-10">
      <Helmet>
        <title>Renew Subscription | Sri Basaveshwara</title>
      </Helmet>

      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-primary-600 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="card border-none shadow-2xl overflow-hidden">
        <div className="bg-primary-900 p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
            <ShieldCheck className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">Secure License Renewal</h2>
            <p className="text-primary-300 text-sm mt-2 opacity-90">Extend your platform access and unlock premium features.</p>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          {/* Progress Stepper */}
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-100 -translate-y-1/2"></div>
            {[1, 2].map((s) => (
              <div 
                key={s} 
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step >= s ? 'bg-primary-600 text-white shadow-lg' : 'bg-stone-100 text-stone-400'
                }`}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
            ))}
          </div>

          {step === 1 ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-primary-50 rounded-2xl border border-primary-100 shadow-inner">
                  {/* Mock QR Code - In a real app this would be a dynamic payment QR */}
                  <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-stone-100">
                    <QrCode className="w-40 h-40 text-stone-900" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">Scan to Pay via UPI / Bank</h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">Use any secure payment app (GPay, PhonePe, etc.) to scan the code above.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Amount Payable</span>
                  </div>
                  <p className="text-xl font-black text-stone-900">$299.00 <span className="text-xs font-medium text-stone-400">/ Year</span></p>
                </div>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Smartphone className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase">Merchant VPA</span>
                  </div>
                  <p className="text-sm font-bold text-stone-900 truncate">Sri Basaveshwara.pay@business</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-900">Instruction for Verification</p>
                  <p className="text-[11px] text-blue-800 leading-relaxed mt-1">
                    Once payment is completed, keep a screenshot of the transaction ID. Our system will automatically verify the payment and extend your license within 30 minutes.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all shadow-xl active:scale-95"
              >
                I've Completed the Payment
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-stone-900">Payment Processing</h3>
                <p className="text-sm text-stone-500 max-w-sm mx-auto">We're verifying your transaction with the bank. Your license status will be updated shortly.</p>
              </div>
              <div className="pt-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3 bg-stone-100 text-stone-900 font-bold rounded-xl hover:bg-stone-200 transition-all border border-stone-200"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Powered by Stripe Connect & SecureBank &copy; 2026</p>
      </div>
    </div>
  );
};

export default RenewSubscription;
