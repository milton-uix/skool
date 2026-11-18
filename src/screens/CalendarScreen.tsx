import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Category, FeedUpdate } from '../types';
import { MapPin, Clock, Lock } from 'lucide-react';

interface DayInfo {
  day: number;
  dateStr: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Sun, 6=Sat
  weekIndex: number;
  dots: string[];
  isCurrentMonth: boolean;
  isToday?: boolean;
}

export const CalendarScreen: React.FC = () => {
  const { updates, setSelectedUpdate } = useApp();
  
  // Present date is Nov 18, 2026 (matching Figma TODAY state)
  const TODAY_STR = '2026-11-18';
  const TODAY_YEAR = 2026;
  const TODAY_MONTH = 10; // 0-indexed: 10 = Nov

  const [selectedYear, setSelectedYear] = useState(TODAY_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(TODAY_MONTH);
  const [selectedDate, setSelectedDate] = useState(TODAY_STR);
  
  // Collapse state: false = full month, true = compact week
  const [isWeekView, setIsWeekView] = useState(false);
  const [activeWeekIndex, setActiveWeekIndex] = useState(2); // Week 3 (Nov 15-21)
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const eventCardsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

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

  // Build calendar matrix (including previous and next month boundary days)
  const calendarDays = useMemo(() => {
    const totalDaysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sun
    
    // Updates dot map
    const dateDotsMap: { [date: string]: string[] } = {};
    updates.forEach(u => {
      const color = getCategoryColor(u.category);
      if (!dateDotsMap[u.event_date]) {
        dateDotsMap[u.event_date] = [];
      }
      if (!dateDotsMap[u.event_date].includes(color) && dateDotsMap[u.event_date].length < 3) {
        dateDotsMap[u.event_date].push(color);
      }
    });

    const days: DayInfo[] = [];

    // Prefix padding from previous month (low opacity)
    const prevMonthDays = new Date(selectedYear, selectedMonth, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevM = selectedMonth === 0 ? 11 : selectedMonth - 1;
      const prevY = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
      const dStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        dateStr: dStr,
        dayOfWeek: days.length % 7,
        weekIndex: 0,
        dots: dateDotsMap[dStr] || [],
        isCurrentMonth: false,
        isToday: dStr === TODAY_STR,
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthPadded = String(selectedMonth + 1).padStart(2, '0');
      const dayPadded = String(d).padStart(2, '0');
      const dateStr = `${selectedYear}-${monthPadded}-${dayPadded}`;
      const dayOfWeek = (firstDayIndex + d - 1) % 7;
      const weekIndex = Math.floor((firstDayIndex + d - 1) / 7);

      days.push({
        day: d,
        dateStr,
        dayOfWeek,
        weekIndex,
        dots: dateDotsMap[dateStr] || [],
        isCurrentMonth: true,
        isToday: dateStr === TODAY_STR,
      });
    }

    // Suffix padding into next month (e.g. Dec 1 in grey low opacity as in Figma)
    let nextDay = 1;
    while (days.length % 7 !== 0 || days.length < 35) {
      const nextM = selectedMonth === 11 ? 0 : selectedMonth + 1;
      const nextY = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
      const dStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
      const weekIndex = Math.floor((days.length) / 7);
      days.push({
        day: nextDay,
        dateStr: dStr,
        dayOfWeek: days.length % 7,
        weekIndex,
        dots: dateDotsMap[dStr] || [],
        isCurrentMonth: false,
        isToday: dStr === TODAY_STR,
      });
      nextDay++;
    }

    return days;
  }, [selectedYear, selectedMonth, updates]);

  // Current displayed week days for the week view
  const currentWeekDays = useMemo(() => {
    return calendarDays.slice(activeWeekIndex * 7, (activeWeekIndex + 1) * 7);
  }, [calendarDays, activeWeekIndex]);

  // Keep activeWeekIndex in sync with selectedDate
  useEffect(() => {
    const day = calendarDays.find(d => d.dateStr === selectedDate);
    if (day) {
      setActiveWeekIndex(day.weekIndex);
    }
  }, [selectedDate, calendarDays]);

  // Scroll listener: Smooth month-to-week transition with 800ms gentle animation
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 45 && !isWeekView) {
      setIsWeekView(true);
    } else if (scrollTop <= 10 && isWeekView) {
      setIsWeekView(false);
    }
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    const matchingUpdate = updates.find(u => u.event_date === dateStr);
    if (matchingUpdate) {
      const el = eventCardsRefs.current[matchingUpdate.id];
      if (el && scrollContainerRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleTodayClick = () => {
    setSelectedYear(TODAY_YEAR);
    setSelectedMonth(TODAY_MONTH);
    setSelectedDate(TODAY_STR);
    setActiveWeekIndex(2);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleMonthWeek = () => {
    setIsWeekView(prev => {
      const next = !prev;
      if (!next && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return next;
    });
  };

  // Swiping handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped Right -> Previous
        if (isWeekView) {
          if (activeWeekIndex > 0) setActiveWeekIndex(w => w - 1);
        } else {
          if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(y => y - 1);
          } else {
            setSelectedMonth(m => m - 1);
          }
        }
      } else {
        // Swiped Left -> Next
        if (isWeekView) {
          const maxWeek = Math.floor(calendarDays.length / 7) - 1;
          if (activeWeekIndex < maxWeek) setActiveWeekIndex(w => w + 1);
        } else {
          if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(y => y + 1);
          } else {
            setSelectedMonth(m => m + 1);
          }
        }
      }
    }
    touchStartX.current = null;
  };

  // Generate days timeline for the content list below calendar (Nov 15 to Nov 30)
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
    return `${daysArr[dt.getDay()]}, ${monthNames[dt.getMonth()]} ${dt.getDate()}`;
  };

  const isDifferentFromToday = selectedDate !== TODAY_STR || selectedMonth !== TODAY_MONTH || selectedYear !== TODAY_YEAR;

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-[402px] mx-auto w-full relative select-none">
      
      {/* Calendar Header with Today Button */}
      <div className="px-4 pt-2 pb-1 flex items-center justify-between shrink-0 bg-[#e5e5e5]">
        <h1 className="text-[20px] font-bold text-[#05354d] tracking-tight">
          {monthNames[selectedMonth]} {selectedYear}
        </h1>

        {/* Stroked "Today" button - visible only when changed from present date */}
        {isDifferentFromToday && (
          <button
            onClick={handleTodayClick}
            className="px-3 py-1 rounded-full border border-[#05354d] text-[#05354d] text-[12px] font-bold hover:bg-[#05354d]/5 active:scale-95 transition-all shadow-xs"
          >
            Today
          </button>
        )}
      </div>

      {/* Calendar Card - Gentle Apple Transition 800ms */}
      <div 
        className="px-4 py-2 shrink-0 transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-white rounded-[24px] p-3 shadow-[0px_4px_16px_rgba(5,53,77,0.08)] border border-neutral-200/60 transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)]">
          
          {/* Day of week headers */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
              <span key={d} className="text-[11px] font-bold text-[#72787d] tracking-wider py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Matrix Grid */}
          <div className={`transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden ${isWeekView ? 'max-h-[64px]' : 'max-h-[320px]'}`}>
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {(isWeekView ? currentWeekDays : calendarDays).map((dayInfo, idx) => {
                const isSelected = dayInfo.dateStr === selectedDate;
                const isToday = dayInfo.isToday;
                const isCurrentMonth = dayInfo.isCurrentMonth;

                return (
                  <div
                    key={`${dayInfo.dateStr}-${idx}`}
                    onClick={() => handleDateClick(dayInfo.dateStr)}
                    className="flex flex-col items-center justify-center py-1 cursor-pointer transition-all active:scale-95 group"
                  >
                    <div
                      className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-[13px] font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#05354d] text-white shadow-md'
                          : isToday
                          ? 'border border-[#05354d] text-[#05354d]'
                          : isCurrentMonth
                          ? 'text-[#191c1b] group-hover:bg-neutral-100'
                          : 'text-neutral-400 opacity-40' // Dec 1 grey low opacity
                      }`}
                    >
                      {dayInfo.day}
                    </div>

                    {/* Category Dots */}
                    <div className="h-1.5 flex items-center gap-0.5 mt-0.5">
                      {dayInfo.dots.map((color, dIdx) => (
                        <span
                          key={dIdx}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Frame 19: Category Legend Indicator (School, In-class, Occasion) */}
          <div className="pt-2.5 mt-1 border-t border-neutral-100 flex items-center justify-center gap-4 text-[11px] font-semibold text-[#72787d]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1b6775]" />
              <span>School</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#719b50]" />
              <span>In-class</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#b71aba]" />
              <span>Occasion</span>
            </div>
          </div>

          {/* Pull toggle handle */}
          <div
            onClick={toggleMonthWeek}
            className="flex items-center justify-center pt-2 cursor-pointer group"
            title={isWeekView ? 'Pull down for month view' : 'Collapse to week view'}
          >
            <div className="w-10 h-1 bg-[#d9d9d9] group-hover:bg-[#05354d]/50 rounded-full transition-colors" />
          </div>
        </div>
      </div>

      {/* Feed Below Calendar: Present Date Starts at Top, All Days Shown, No Events on Empty Days */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 pb-32 space-y-5 no-scrollbar"
      >
        {timelineDates.map((dateStr) => {
          const dayUpdates = updates.filter(u => u.event_date === dateStr);
          const isPast = dateStr < TODAY_STR;
          const isSelectedDay = dateStr === selectedDate;

          return (
            <div key={dateStr} className={`space-y-3 ${isPast ? 'opacity-60' : ''}`}>
              {/* Date Header */}
              <div className="flex items-center justify-between pt-1">
                <span className={`text-[15px] font-bold ${isSelectedDay ? 'text-[#05354d]' : 'text-[#72787d]'}`}>
                  {formatDateHeader(dateStr)}
                </span>
                {dateStr === TODAY_STR && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#05354d] text-white">
                    TODAY
                  </span>
                )}
              </div>

              {/* Day's Events or "No Events" (Figma: Frame 19 / 59:258) */}
              {dayUpdates.length === 0 ? (
                <div className="bg-white/80 rounded-2xl py-3.5 px-4 text-center border border-dashed border-neutral-200">
                  <span className="text-[13px] font-semibold text-[#72787d]">No Events</span>
                </div>
              ) : (
                dayUpdates.map((update) => {
                  const categoryColor = getCategoryColor(update.category);
                  const isLocked = update.is_locked;

                  return (
                    <div
                      key={update.id}
                      ref={el => (eventCardsRefs.current[update.id] = el)}
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

                      {/* Info Row: Location, Time & Deadline on one line */}
                      <div className="flex items-center justify-between text-[12px] text-[#72787d] pt-1 pb-2">
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

                      {/* Payment Required Tag if applicable (Figma Frame 18 / 63:176) */}
                      {update.payment_amount && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#05354d]/5 border border-[#05354d]/15 text-[11px] font-bold text-[#05354d] mb-2">
                          <span>$</span>
                          <span>Payment Required</span>
                        </div>
                      )}
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
