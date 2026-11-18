import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle } from 'lucide-react';

export const EmergencyModal: React.FC = () => {
  const { activeEmergency, dismissEmergency, acknowledge } = useApp();

  if (!activeEmergency) return null;

  const handleUnderstand = async () => {
    try {
      await acknowledge(activeEmergency.id);
    } catch (e) {
      console.error(e);
    } finally {
      dismissEmergency();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      {/* Frame 102 (135:689) in Figma - exact 370px width, red border, soft red bg */}
      <div className="bg-[#f8c4c4] border-2 border-[#c94c4c] flex flex-col p-5 rounded-[20px] w-full max-w-[370px] shadow-2xl relative">
        {/* Frame 133: Warning Triangle Icon + Title & Subtitle */}
        <div className="flex gap-3 items-center justify-center mb-3">
          <div className="w-10 h-10 flex items-center justify-center text-[#c94c4c] shrink-0">
            <AlertTriangle className="w-9 h-9 text-[#c94c4c]" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[#c94c4c] text-[20px] font-extrabold leading-tight tracking-tight uppercase">
              SCHOOL CLOSED
            </h2>
            <span className="text-[#c94c4c] text-[13px] font-semibold">
              Snow Day Alert
            </span>
          </div>
        </div>

        {/* Frame 63: Notice Text from Figma */}
        <div className="text-[13.5px] text-[#191c1b] leading-relaxed mb-5">
          <p>
            Due to inclement weather and unsafe road conditions, school will be CLOSED today. Please stay safe and warm. Thank you for your understanding!
          </p>
        </div>

        {/* Action Button: "I Understand" */}
        <button
          onClick={handleUnderstand}
          className="w-full bg-[#c94c4c] hover:bg-[#b03d3d] active:scale-[0.98] text-white py-3 px-4 rounded-xl font-bold text-[14px] shadow-md transition-all flex items-center justify-center tracking-wide"
        >
          <span>I Understand</span>
        </button>
      </div>
    </div>
  );
};
