import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar as CalendarIcon, Bell, MoreHorizontal } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, selectedUpdate, setSelectedUpdate } = useApp();

  const handleTabClick = (tab: 'calendar' | 'updates' | 'more') => {
    if (selectedUpdate) {
      setSelectedUpdate(null);
    }
    setActiveTab(tab);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none pb-2">
      {/* Floating Pill Nav - Component 2 (123:494) with 800ms Apple-like gentle transition */}
      <div className="pointer-events-auto bg-white flex items-center justify-between px-3 py-2 rounded-full shadow-[0px_4px_20px_rgba(5,53,77,0.14)] border border-gray-100/80 w-[302px] h-[64px] mb-2 transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)]">
        
        {/* Calendar Tab */}
        <button
          onClick={() => handleTabClick('calendar')}
          className={`flex items-center gap-2 rounded-full h-[46px] transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden ${
            activeTab === 'calendar'
              ? 'bg-[#05354d]/10 text-[#05354d] px-4 shadow-sm'
              : 'text-[#72787d] hover:text-[#05354d] px-3'
          }`}
          title="Calendar"
        >
          <CalendarIcon className="w-5 h-5 shrink-0 transition-transform duration-[800ms]" />
          {activeTab === 'calendar' && (
            <span className="font-semibold text-[14px] whitespace-nowrap animate-fade-in">
              Calendar
            </span>
          )}
        </button>

        {/* Updates Tab */}
        <button
          onClick={() => handleTabClick('updates')}
          className={`flex items-center gap-2 rounded-full h-[46px] transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden ${
            activeTab === 'updates'
              ? 'bg-[#05354d]/10 text-[#05354d] px-4 shadow-sm'
              : 'text-[#72787d] hover:text-[#05354d] px-3'
          }`}
          title="Updates"
        >
          <Bell className="w-5 h-5 shrink-0 transition-transform duration-[800ms]" />
          {activeTab === 'updates' && (
            <span className="font-semibold text-[14px] whitespace-nowrap animate-fade-in">
              Updates
            </span>
          )}
        </button>

        {/* More Tab */}
        <button
          onClick={() => handleTabClick('more')}
          className={`flex items-center gap-2 rounded-full h-[46px] transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden ${
            activeTab === 'more'
              ? 'bg-[#05354d]/10 text-[#05354d] px-4 shadow-sm'
              : 'text-[#72787d] hover:text-[#05354d] px-3'
          }`}
          title="More"
        >
          <MoreHorizontal className="w-5 h-5 shrink-0 transition-transform duration-[800ms]" />
          {activeTab === 'more' && (
            <span className="font-semibold text-[14px] whitespace-nowrap animate-fade-in">
              More
            </span>
          )}
        </button>
      </div>

      {/* iOS Home Indicator */}
      <div className="w-[134px] h-[5px] bg-black/80 rounded-full mb-1"></div>
    </div>
  );
};
