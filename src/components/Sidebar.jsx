import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Sprout, 
  ClipboardList, 
  FileText, 
  Users, 
  History, 
  UserCircle,
  LogOut,
  ShieldCheck,
  X,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    { name: 'Billing', icon: Receipt, path: '/billing', roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    { name: 'Fertilizers', icon: Sprout, path: '/fertilizers', roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    { name: 'Stocks', icon: ClipboardList, path: '/stocks', roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    { name: 'Reports', icon: FileText, path: '/reports', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'User Management', icon: Users, path: '/users', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'License Manager', icon: ShieldCheck, path: '/license-manager', roles: ['SUPER_ADMIN'] },
    { name: 'Audit Logs', icon: History, path: '/audit-logs', roles: ['SUPER_ADMIN'] },
    { name: 'Profile', icon: UserCircle, path: '/profile', roles: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className={cn(
      "h-screen w-64 bg-primary-900 text-white flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 transform lg:translate-x-0 outline-none",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-500 p-2 rounded-lg">
            <Sprout className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">Sri Basaveshwara</span>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-primary-800 rounded-lg text-primary-300"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
              isActive 
                ? "bg-primary-500 text-white shadow-lg shadow-primary-900/20" 
                : "text-primary-100 hover:bg-primary-800 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5", "group-hover:scale-110 transition-transform")} />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-800 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center text-primary-900 font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-primary-300 truncate">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-primary-100 hover:bg-red-900/50 hover:text-red-200 rounded-lg transition-colors group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
