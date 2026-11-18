import React from 'react';
import { useApp } from '../context/AppContext';
import { LogOut } from 'lucide-react';

export const MoreScreen: React.FC = () => {
  const { logout, currentParent } = useApp();

  return (
    <div className="flex flex-col max-w-[402px] mx-auto w-full px-4 pt-6 pb-28 space-y-6 select-none">
      {/* 2 Rows of 2 Placeholders (4 Placeholders total as requested) */}
      <div className="space-y-4">
        {[0, 1].map((rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-2 gap-4">
            {/* Box 1 */}
            <div className="flex flex-col space-y-2 cursor-default">
              <div className="w-full h-[100px] bg-white rounded-2xl shadow-[0px_2px_8px_rgba(5,53,77,0.06)] border border-neutral-200/70" />
              <div className="w-full h-[22px] flex items-center justify-center text-[12px] font-bold text-[#72787d] tracking-wider uppercase">
                loading
              </div>
            </div>

            {/* Box 2 */}
            <div className="flex flex-col space-y-2 cursor-default">
              <div className="w-full h-[100px] bg-white rounded-2xl shadow-[0px_2px_8px_rgba(5,53,77,0.06)] border border-neutral-200/70" />
              <div className="w-full h-[22px] flex items-center justify-center text-[12px] font-bold text-[#72787d] tracking-wider uppercase">
                loading
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Logout Button (Figma: Frame 137 / 140:1592 with 'LOGOUT') */}
      <div className="pt-6 flex flex-col items-center">
        <button
          onClick={logout}
          className="w-[150px] h-[48px] rounded-2xl bg-[#05354d] text-white text-[14px] font-bold tracking-wider hover:bg-[#042a3a] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#05354d]/25 uppercase"
        >
          <LogOut className="w-4 h-4" />
          <span>LOGOUT</span>
        </button>
        {currentParent && (
          <p className="text-[12px] text-[#72787d] mt-2">
            Signed in as <span className="font-semibold text-[#05354d]">{currentParent.full_name}</span> ({currentParent.role_label})
          </p>
        )}
      </div>
    </div>
  );
};
