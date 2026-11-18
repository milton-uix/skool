import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FeedUpdate, TaskItem } from '../types';
import { Calendar, Clock, MapPin, CheckCircle2, Check, AlertCircle } from 'lucide-react';
import { fetchTasks, checkCanComplete } from '../lib/supabase';

interface DetailTaskScreenProps {
  update: FeedUpdate;
}

export const DetailTaskScreen: React.FC<DetailTaskScreenProps> = ({ update }) => {
  const { currentParent, otherParent, acknowledge, toggleTaskItem, complete } = useApp();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [canCompleteEligibility, setCanCompleteEligibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load to-do items for this task update
  useEffect(() => {
    async function load() {
      const items = await fetchTasks(update.id);
      setTasks(items);
    }
    load();
  }, [update.id]);

  // Check backend completion eligibility
  useEffect(() => {
    async function verify() {
      const res = await checkCanComplete(update.id);
      setCanCompleteEligibility(res.eligible);
    }
    verify();
  }, [update, tasks]);

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await acknowledge(update.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to acknowledge');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (task: TaskItem) => {
    setErrorMessage(null);
    const newStatus = !task.is_completed;

    // Optimistic UI update
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id
          ? {
            ...t,
            is_completed: newStatus,
            completed_by_parent_id: newStatus ? currentParent?.id : undefined
          }
          : t
      )
    );

    try {
      await toggleTaskItem(task.id, newStatus);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update to-do item');
      // Rollback
      const fresh = await fetchTasks(update.id);
      setTasks(fresh);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await complete(update.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bothAcknowledged = update.my_ack && update.other_ack;
  const allTasksCompleted = tasks.length > 0 && tasks.every(t => t.is_completed);

  return (
    <div className="flex flex-col max-w-[402px] mx-auto w-full px-4 pt-2 pb-32 space-y-4">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-[16px] p-4 shadow-[1px_1px_3px_rgba(0,0,0,0.08)] border border-gray-100 space-y-4">
        {/* Author / Teacher Row */}
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
        <p className="text-[14px] text-[#05354d] leading-relaxed font-normal">
          {update.description}
        </p>

        {/* Location & Time Pills */}
        <div className="flex flex-wrap gap-2 text-[12px] font-semibold text-[#72787d]">


          <div className="bg-[#f3f4f2] flex items-center gap-1.5 px-2.5 py-1 rounded-md">
            <MapPin className="w-3.5 h-3.5" />
            <span>City Science Museum</span>
            <div className="bg-[#f3f4f2] flex items-center gap-1.5 px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5" />
              <span>8:30 AM – 3:00 PM</span>
            </div>
          </div>
        </div>
        <div className="bg-[#f3f4f2] flex items-center gap-1.5 px-2.5 py-1 rounded-md">
          <Calendar className="w-3.5 h-3.5" />
          <span>November 24</span>
        </div>
      </div>

      {/* Acknowledgment Section */}
      <div className="flex flex-col items-center space-y-2">
        {!update.my_ack ? (
          <button
            onClick={handleAcknowledge}
            disabled={isSubmitting}
            className="w-[200px] bg-[#05354d] hover:bg-[#074766] active:scale-95 text-white py-3 px-4 rounded-lg font-semibold text-[15px] shadow-[2px_2px_4px_rgba(5,53,77,0.35)] transition-all flex items-center justify-center gap-2"
          >
            <span>Acknowledge</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        ) : bothAcknowledged ? (
          <div className="flex items-center justify-center gap-1.5 text-[#27845b] text-[13px] font-medium bg-[#27845b]/10 py-2 px-4 rounded-xl border border-[#27845b]/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>Both parents have acknowledged this update.</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-[13px] text-[#72787d] text-center">
            <span className="font-semibold text-[#05354d]">Acknowledged</span>
            <p className="text-[12px]">Waiting for the other parent’s acknowledgment.</p>
          </div>
        )}
      </div>

      {/* To-Do Checklist Section (Figma 90:501) */}
      <div className="bg-white rounded-[16px] p-4 shadow-[1px_1px_3px_rgba(0,0,0,0.08)] border border-gray-100 space-y-3">
        <h3 className="text-[16px] font-semibold text-[#05354d]">To-Do List</h3>
        <div className="border-t border-gray-100"></div>

        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompletedByMe = task.completed_by_parent_id === currentParent?.id;

            return (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 active:scale-[0.99] cursor-pointer transition-all border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${task.is_completed
                      ? 'bg-[#05354d] text-white'
                      : 'border border-gray-300 text-transparent'
                      }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span
                    className={`text-[14px] ${task.is_completed ? 'line-through text-[#72787d]' : 'text-[#191c1b] font-medium'
                      }`}
                  >
                    {task.title}
                  </span>
                </div>

                {/* Responsible parent attribution tag */}
                {task.is_completed && (
                  <span className="text-[12px] text-[#72787d] shrink-0 font-medium">
                    {isCompletedByMe ? '(You)' : otherParent?.full_name || 'Partner'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[12px] text-[#72787d] text-center pt-2 border-t border-gray-100">
          Both parents can see this selection.
        </p>
      </div>

      {/* Progress Tracker Card at Bottom (Figma 90:596) */}
      <div className="bg-white rounded-[16px] p-4 shadow-[1px_1px_3px_rgba(0,0,0,0.08)] border border-gray-100 space-y-4">

        {/* COMPLETION ACTION: Strictly hidden until both acknowledged AND all to-dos completed */}
        {(canCompleteEligibility || update.is_completed) && (
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 animate-fade-in">
            <span className="text-[15px] font-semibold text-[#05354d]">
              Mark as complete
            </span>
            {update.is_completed ? (
              <span className="text-[13px] font-semibold text-[#27845b] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Completed by {update.completed_by_name || currentParent?.full_name}
              </span>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-[#27845b] hover:bg-[#206e4b] active:scale-95 text-white px-4 py-1.5 rounded-full text-[13px] font-semibold shadow-sm transition-all"
              >
                Mark Completed
              </button>
            )}
          </div>
        )}

        {/* 3-Step Progress Indicators: Acknowledge -> To-Do -> Complete */}
        <div className="flex items-center justify-between px-2 pt-1 text-[12px]">
          <div className="flex flex-col items-center">
            <div
              className={`w-2.5 h-2.5 rounded-full mb-1.5 ${bothAcknowledged ? 'bg-[#27845b]' : 'bg-[#72787d]'
                }`}
            ></div>
            <span className={bothAcknowledged ? 'text-[#27845b] font-semibold' : 'text-[#72787d]'}>
              Acknowledge
            </span>
          </div>

          <div className="flex-1 h-0.5 mx-2 bg-gray-200">
            <div
              className={`h-full ${bothAcknowledged && allTasksCompleted ? 'bg-[#27845b]' : 'bg-transparent'
                }`}
            ></div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-2.5 h-2.5 rounded-full mb-1.5 ${allTasksCompleted ? 'bg-[#27845b]' : 'bg-[#72787d]'
                }`}
            ></div>
            <span className={allTasksCompleted ? 'text-[#27845b] font-semibold' : 'text-[#72787d]'}>
              To-Do
            </span>
          </div>

          <div className="flex-1 h-0.5 mx-2 bg-gray-200">
            <div
              className={`h-full ${update.is_completed ? 'bg-[#27845b]' : 'bg-transparent'
                }`}
            ></div>
          </div>

          <div className="flex flex-col items-center">
            <div
              className={`w-2.5 h-2.5 rounded-full mb-1.5 ${update.is_completed ? 'bg-[#27845b]' : 'bg-[#72787d]'
                }`}
            ></div>
            <span className={update.is_completed ? 'text-[#27845b] font-semibold' : 'text-[#72787d]'}>
              Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
