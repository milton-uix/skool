import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentParent, otherParent, switchParent, selectedUpdate, setSelectedUpdate } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm shadow-[0px_2px_5px_rgba(5,53,77,0.06)] border-b border-gray-100">
      {/* Dynamic Island / Status Bar Area */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1 text-black select-none text-[14px]">
        <span className="font-semibold tracking-tight text-[15px]">9:41</span>
        <div className="w-[110px] h-[26px] bg-black rounded-full flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full mr-2"></div>
          <div className="w-2 h-2 bg-neutral-800 rounded-full"></div>
        </div>
        <div className="flex items-center space-x-1.5 text-black">
          {/* Signal bars */}
          <div className="flex items-end space-x-0.5 h-3">
            <span className="w-0.5 h-1 bg-black rounded-sm"></span>
            <span className="w-0.5 h-1.5 bg-black rounded-sm"></span>
            <span className="w-0.5 h-2 bg-black rounded-sm"></span>
            <span className="w-0.5 h-2.5 bg-black rounded-sm"></span>
          </div>
          {/* Wifi */}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
          {/* Battery */}
          <div className="w-5 h-2.5 border border-black rounded-sm p-0.5 flex items-center">
            <div className="w-full h-full bg-black rounded-2xs"></div>
          </div>
        </div>
      </div>

      {/* Main Bar: Back Arrow / Title or Logo / Message Icon */}
      {selectedUpdate ? (
        <div className="flex items-center justify-between px-4 py-2.5 h-[56px]">
          <button
            onClick={() => setSelectedUpdate(null)}
            className="flex items-center text-[#05354d] p-1.5 -ml-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-[#05354d]" />
          </button>
          
          <h2 className="text-[17px] font-bold text-[#05354d] truncate max-w-[280px] text-center">
            {selectedUpdate.title}
          </h2>

          <div className="w-8"></div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-2.5 h-[56px]">
          <div className="w-8"></div>

          {/* Skool Logo */}
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="Skool" className="h-6 object-contain" />
          </div>

          {/* Message Icon matching Figma Frame 102 (click toggles between Mom & Dad for test ease) */}
          <button
            onClick={() => {
              if (otherParent) switchParent(otherParent.id);
            }}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 active:scale-95 text-[#05354d] transition-all"
            title={currentParent ? `Logged in as ${currentParent.full_name} (${currentParent.role_label}). Click to switch to ${otherParent?.full_name}.` : 'Messages'}
          >
            <MessageSquare className="w-5 h-5 text-[#05354d]" />
          </button>
        </div>
      )}
    </header>
  );
};
