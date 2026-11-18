import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Category, FeedUpdate } from '../types';
import { MapPin, Clock, Search } from 'lucide-react';

type FilterType = 
  | 'all'
  | 'payment'
  | 'pending_ack'
  | 'pending_task'
  | 'not_completed'
  | 'missed_deadline';

export const ListViewScreen: React.FC = () => {
  const { updates, setSelectedUpdate } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const TODAY_STR = '2026-11-18';

  const getCategoryColor = (cat: Category): string => {
    switch (cat) {
      case 'SCHOOL':
        return '#1b6775';
      case 'IN-CLASS':
        return '#719b50';
      case 'OCCASION':
        return '#b71aba';
      case 'EMERGENCY':
        return '#c94c4c';
      default:
        return '#72787d';
    }
  };

  // Filter and search updates
  const filteredUpdates = useMemo(() => {
    return updates.filter(u => {
      // Search by title
      if (searchQuery.trim() && !u.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      switch (activeFilter) {
        case 'payment':
          return u.payment_amount != null || u.update_type === 'payment';
        case 'pending_ack':
          return !u.my_ack && u.status !== 'expired';
        case 'pending_task':
          return u.update_type === 'task' && !u.is_completed;
        case 'not_completed':
          return !u.is_completed;
        case 'missed_deadline':
          return u.status === 'expired';
        case 'all':
        default:
          return true;
      }
    });
  }, [updates, activeFilter, searchQuery]);

  // Timeline dates Nov 15 to Nov 30 matching Figma
  const timelineDates = useMemo(() => {
    const list: string[] = [];
    for (let d = 15; d <= 30; d++) {
      list.push(`2026-11-${String(d).padStart(2, '0')}`);
    }
    return list;
  }, []);

  const formatDateHeader = (dateStr: string) => {
    const parts = dateStr.split('-');
    const dt = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${daysArr[dt.getDay()]}, ${monthNames[dt.getMonth()]} ${dt.getDate()}`;
  };

  // Progress calculations & label
  const getProgressInfo = (update: FeedUpdate) => {
    if (update.is_completed) {
      return { pct: 100, label: 'Completed' };
    }
    if (update.status === 'expired') {
      return { pct: 100, label: 'Missed The Deadline' };
    }
    if (!update.my_ack || !update.other_ack) {
      return { pct: 35, label: 'Pending Acknowledgement' };
    }
    if (update.update_type === 'payment' && !update.is_completed) {
      return { pct: 65, label: 'Pending Payment' };
    }
    if (update.update_type === 'task' && !update.is_completed) {
      return { pct: 75, label: 'Pending Task' };
    }
    return { pct: 83, label: 'Pending Completion' };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-[402px] mx-auto w-full relative select-none">
      
      {/* Top Header */}
      <div className="px-4 pt-2 pb-1 shrink-0 bg-[#e5e5e5]">
        <h1 className="text-[20px] font-bold text-[#05354d] tracking-tight">
          All Updates
        </h1>
      </div>

      {/* Search Bar between All Updates and Filters */}
      <div className="px-4 py-2 shrink-0 bg-[#e5e5e5]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#72787d] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search updates by title…"
            className="w-full h-[38px] pl-9 pr-4 rounded-xl bg-white border border-neutral-200/80 text-[13px] text-[#191c1b] placeholder:text-[#72787d] focus:outline-none focus:border-[#05354d] focus:ring-1 focus:ring-[#05354d] shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* Horizontal Filter Chips matching Figma 49:3670 */}
      <div className="px-4 py-1 shrink-0 bg-[#e5e5e5] overflow-x-auto no-scrollbar flex items-center gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-full text-[12px] font-bold shrink-0 transition-all ${
            activeFilter === 'all'
              ? 'bg-[#05354d] text-white shadow-xs'
              : 'bg-white text-[#72787d] border border-neutral-200 hover:border-neutral-300'
          }`}
        >
          All ({updates.length})
        </button>

        <button
          onClick={() => setActiveFilter('payment')}
          className={`px-3 py-1.5 rounded-full text-[12px] font-bold shrink-0 transition-all ${
            activeFilter === 'payment'
              ? 'bg-[#05354d] text-white shadow-xs'
              : 'bg-white text-[#72787d] border border-neutral-200 hover:border-neutral-300'
          }`}
        >
          Includes Payment
        </button>

        <button
          onClick={() => setActiveFilter('pending_ack')}
          className={`px-3 py-1.5 rounded-full text-[12px] font-bold shrink-0 transition-all ${
            activeFilter === 'pending_ack'
              ? 'bg-[#05354d] text-white shadow-xs'
              : 'bg-white text-[#72787d] border border-neutral-200 hover:border-neutral-300'
          }`}
        >
          Pending Acknowledgement
        </button>

        <button
          onClick={() => setActiveFilter('pending_task')}
          className={`px-3 py-1.5 rounded-full text-[12px] font-bold shrink-0 transition-all ${
            activeFilter === 'pending_task'
              ? 'bg-[#05354d] text-white shadow-xs'
              : 'bg-white text-[#72787d] border border-neutral-200 hover:border-neutral-300'
          }`}
        >
          Pending Task
        </button>

        <button
          onClick={() => setActiveFilter('not_completed')}
          className={`px-3 py-1.5 rounded-full text-[12px] font-bold shrink-0 transition-all ${
            activeFilter === 'not_completed'
              ? 'bg-[#05354d] text-white shadow-xs'
              : 'bg-white text-[#72787d] border border-neutral-200 hover:border-neutral-300'
          }`}
        >
          Not Completed
        </button>

        <button
          onClick={() => setActiveFilter('missed_deadline')}
          className={`px-3 py-1.5 rounded-full text-[12px] font-bold shrink-0 transition-all ${
            activeFilter === 'missed_deadline'
              ? 'bg-[#05354d] text-white shadow-xs'
              : 'bg-white text-[#72787d] border border-neutral-200 hover:border-neutral-300'
          }`}
        >
          Missed The Deadline
        </button>
      </div>

      {/* List Content: Grouped by Date (Nov 15-30), Empty Days, Greyed out past events, Exact Progress Chatbubble with Arrow */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-32 space-y-5 no-scrollbar">
        {timelineDates.map((dateStr) => {
          const dayUpdates = filteredUpdates.filter(u => u.event_date === dateStr);
          const isPast = dateStr < TODAY_STR;

          return (
            <div key={dateStr} className={`space-y-3 ${isPast ? 'opacity-65' : ''}`}>
              {/* Date Header */}
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-[#05354d]">
                  {formatDateHeader(dateStr)}
                </span>
                {dateStr === TODAY_STR && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#05354d] text-white">
                    TODAY
                  </span>
                )}
              </div>

              {/* No Events Empty State from Figma (59:258) */}
              {dayUpdates.length === 0 ? (
                <div className="bg-white/80 rounded-2xl py-3.5 px-4 text-center border border-dashed border-neutral-200">
                  <span className="text-[13px] font-semibold text-[#72787d]">No Events</span>
                </div>
              ) : (
                dayUpdates.map((update) => {
                  const categoryColor = getCategoryColor(update.category);
                  const isLocked = update.is_locked;
                  const { pct, label } = getProgressInfo(update);

                  return (
                    <div
                      key={update.id}
                      onClick={() => !isLocked && setSelectedUpdate(update)}
                      className={`bg-white rounded-2xl p-4 shadow-[0px_2px_8px_rgba(5,53,77,0.06)] border transition-all ${
                        isLocked
                          ? 'opacity-65 border-dashed border-gray-300 cursor-not-allowed'
                          : 'border-neutral-200/80 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      {/* Top Row: Title + Category */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-[#191c1b] text-[16px] leading-tight line-clamp-2">
                          {update.title}
                        </h3>
                        <span
                          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 border"
                          style={{
                            borderColor: categoryColor,
                            color: categoryColor,
                            backgroundColor: `${categoryColor}15`
                          }}
                        >
                          {update.category}
                        </span>
                      </div>

                      {/* Payment Required Tag (Frame 18 / 63:176) */}
                      {update.payment_amount && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#05354d]/5 border border-[#05354d]/15 text-[11px] font-bold text-[#05354d] mb-2">
                          <span>$</span>
                          <span>Payment Required</span>
                        </div>
                      )}

                      {/* Info Row: Time, Location, Deadline straight aligned at bottom */}
                      <div className="flex items-center justify-between text-[12px] text-[#72787d] pt-1 pb-3">
                        <div className="flex items-center gap-3">
                          {update.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate max-w-[130px]">{update.location}</span>
                            </div>
                          )}
                          {update.event_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span>{update.event_time}</span>
                            </div>
                          )}
                        </div>

                        {update.deadline_date && (
                          <div className="text-[11px] font-medium text-[#c94c4c]">
                            Deadline: {new Date(update.deadline_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="border-t border-neutral-100 pt-3">
                        {/* Progress Bar with Chat Bubble & Downward Arrow (Polygon 1) */}
                        <div className="relative mb-2">
                          {/* Chat Bubble pointing to current progress */}
                          <div
                            className="absolute -top-7 transform -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-300"
                            style={{ left: `${pct}%` }}
                          >
                            <div className="bg-[#05354d] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs whitespace-nowrap">
                              {label}
                            </div>
                            {/* Polygon 1 Arrow pointing directly downward */}
                            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#05354d]" />
                          </div>

                          {/* Progress Track */}
                          <div className="flex items-center justify-between gap-3 pt-3">
                            <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#05354d] rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-[#72787d] shrink-0">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
