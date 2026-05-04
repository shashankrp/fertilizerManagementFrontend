import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, User, AlertTriangle, LogOut, UserCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = ({ onMenuClick }) => {
  const { user, isSuperAdmin, logout, activeLicense } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [timeText, setTimeText] = useState('');

  // Calculate time remaining for license
  useEffect(() => {
    if (!activeLicense?.expiry) return;

    const updateTimer = () => {
      const expiry = new Date(activeLicense.expiry);
      // Set to end of the day
      expiry.setHours(23, 59, 59, 999);
      
      const now = new Date();
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeText('EXPIRED');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days >= 1) {
        setTimeText(`${days} ${days === 1 ? 'day' : 'days'}`);
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const h = String(hours).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');
        
        setTimeText(`${h}:${m}:${s}`);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [activeLicense]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sticky top-0 z-30 bg-white">
      {/* License Notification Banner */}
      {!isSuperAdmin && (
        <div className="bg-amber-50 px-4 md:px-6 py-2 border-b border-amber-100 flex items-center justify-between gap-4 overflow-hidden">
          <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-amber-800 font-bold uppercase tracking-wider truncate">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="truncate">SYSTEM ALERT: License key expires in {timeText}. Update license to avoid service interruption.</span>
          </div>
          <Link to="/renew-subscription" className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-amber-700 hover:underline shrink-0">Renew Subscription</Link>
        </div>
      )}

      <header className="h-16 bg-white border-b border-stone-100 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-stone-100 rounded-lg shrink-0"
          >
            <Menu className="w-6 h-6 text-stone-600" />
          </button>
          
          <div className="hidden lg:flex items-center bg-stone-50 border border-stone-200 rounded-md px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary-100 transition-all max-w-sm w-full">
            <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Search records, users, tools..." 
              className="bg-transparent border-none focus:ring-0 text-xs ml-2 w-full outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-4">
          <button className="hidden sm:flex p-2 text-stone-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-stone-200 mx-1"></div>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-2 group focus:outline-none"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-stone-900 leading-tight group-hover:text-primary-600 transition-colors">{user?.name}</p>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">{user?.role?.toLowerCase().replace('_', ' ')}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 shadow-sm group-hover:border-primary-200 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                <User className="w-5 h-5" />
              </div>
              <ChevronDown className={cn("w-4 h-4 text-stone-400 transition-transform hidden sm:block", isProfileOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-stone-100 py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-stone-50 bg-stone-50/50">
                    <p className="text-xs font-bold text-stone-900">{user?.name}</p>
                    <p className="text-[10px] text-stone-400 truncate">{user?.email}</p>
                  </div>
                  
                  <div className="p-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-stone-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                    >
                      <UserCircle className="w-4 h-4" />
                      View Profile
                    </Link>
                  </div>

                  <div className="px-1 border-t border-stone-50 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    </div>
  );
};

// Simple utility for CN if not imported
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default Navbar;
