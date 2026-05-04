import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-stone-200"
        >
          <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50">
            <h3 className="font-bold text-stone-800 tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-stone-500" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
          {footer && (
            <div className="flex justify-end gap-2 p-4 bg-stone-50 border-t border-stone-100">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
