import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FeedUpdate } from '../types';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DetailExpiredScreenProps {
  update: FeedUpdate;
}

export const DetailExpiredScreen: React.FC<DetailExpiredScreenProps> = ({ update }) => {
  const { currentParent, acknowledge } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAcknowledgeOverdue = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await acknowledge(update.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to acknowledge overdue status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col max-w-[402px] mx-auto w-full px-4 pt-2 pb-32 space-y-4">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Content Card (Figma 90:386) */}
      <div className="bg-white rounded-[16px] p-4 shadow-[1px_1px_3px_rgba(0,0,0,0.08)] border border-gray-100 space-y-4">
        {/* Author / Principal Row */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-[#d9d9d9] overflow-hidden flex items-center justify-center text-[#05354d] font-bold text-sm shrink-0">
            {update.author_name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-semibold text-[#05354d] leading-snug">
              {update.author_name}
            </span>
            <span className="text-[12px] text-[#72787d]">{update.author_role}</span>
          </div>
        </div>

        {/* Description Body */}
        <div className="text-[14px] text-[#05354d] leading-relaxed font-normal space-y-2 whitespace-pre-wrap">
          {update.description}
        </div>

        {/* Location & Time Pills */}
        <div className="flex flex-wrap gap-2 text-[12px] font-semibold text-[#72787d]">
          <div className="bg-[#f3f4f2] flex items-center gap-1.5 px-2.5 py-1 rounded-md">
            <Calendar className="w-3.5 h-3.5" />
            <span>November 18</span>
          </div>
          <div className="bg-[#f3f4f2] flex items-center gap-1.5 px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5" />
            <span>9:00 AM – 2:00 PM</span>
          </div>
          <div className="bg-[#f3f4f2] flex items-center gap-1.5 px-2.5 py-1 rounded-md">
            <MapPin className="w-3.5 h-3.5" />
            <span>School Sports Ground</span>
          </div>
        </div>

        {/* Missed Deadline Banner (Figma 90:414) */}
        <div className="bg-red-50/80 rounded-xl p-3 border border-red-200/80 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#c94c4c]/10 flex items-center justify-center text-[#c94c4c]">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[#c94c4c]">
                Missed Deadline
              </span>
              <span className="text-[12px] text-[#72787d]">
                Due: November 10, 2026
              </span>
            </div>
          </div>
          <span className="bg-[#c94c4c] text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Closed
          </span>
        </div>
      </div>

      {/* Acknowledge Overdue Notice Action */}
      <div className="flex flex-col items-center space-y-2">
        {!update.my_ack ? (
          <button
            onClick={handleAcknowledgeOverdue}
            disabled={isSubmitting}
            className="w-[200px] bg-[#05354d] hover:bg-[#074766] active:scale-95 text-white py-3 px-4 rounded-lg font-semibold text-[15px] shadow-[2px_2px_4px_rgba(5,53,77,0.35)] transition-all flex items-center justify-center gap-2"
          >
            <span>Acknowledge</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center justify-center gap-1.5 text-[#27845b] text-[13px] font-medium bg-[#27845b]/10 py-2 px-4 rounded-xl border border-[#27845b]/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>Overdue status acknowledged by {currentParent?.full_name}</span>
          </div>
        )}
      </div>

      {/* Non-completable Notice */}
      <div className="text-center text-[13px] text-[#72787d] px-4 py-2">
        This task has expired and can no longer be submitted or completed.
      </div>

      {/* Progress Tracker Card at Bottom (Figma 86:229) */}
      <div className="bg-white rounded-[16px] p-4 shadow-[1px_1px_3px_rgba(0,0,0,0.08)] border border-gray-100">
        <div className="flex items-center justify-center px-8 text-[12px]">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full mb-1.5 bg-[#c94c4c]"></div>
            <span className="text-[#c94c4c] font-semibold">Expired</span>
          </div>

          <div className="flex-1 h-0.5 mx-4 bg-gray-200">
            <div
              className={`h-full ${
                update.my_ack ? 'bg-[#27845b]' : 'bg-transparent'
              }`}
            ></div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-2.5 h-2.5 rounded-full mb-1.5 ${
                update.my_ack ? 'bg-[#27845b]' : 'bg-[#72787d]'
              }`}
            ></div>
            <span
              className={
                update.my_ack
                  ? 'text-[#27845b] font-semibold'
                  : 'text-[#72787d]'
              }
            >
              Acknowledge
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

