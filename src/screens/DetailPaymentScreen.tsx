import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FeedUpdate } from '../types';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';

interface DetailPaymentScreenProps {
  update: FeedUpdate;
}

export const DetailPaymentScreen: React.FC<DetailPaymentScreenProps> = ({ update }) => {
  const { currentParent, acknowledge, submitDecision, complete } = useApp();
  
  const [isPaid, setIsPaid] = useState(update.is_completed || false);
  const [payerName, setPayerName] = useState<string | null>(update.is_completed ? (update.completed_by_name || 'Vime Gold') : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bothAcknowledged = update.my_ack && update.other_ack;
  const decisionsDiffer = update.requires_decision && 
    update.my_decision && 
    update.other_decision && 
    update.my_decision !== update.other_decision;

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

  const handleDecisionToggle = async (choice: 'interested' | 'not_interested') => {
    // Cannot revoke once paid
    if (isPaid || update.is_completed) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await submitDecision(update.id, choice);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePay = () => {
    if (!bothAcknowledged) {
      setErrorMessage('Both parents must acknowledge first.');
      return;
    }
    if (decisionsDiffer) {
      setErrorMessage('Both parents must agree on the decision before paying.');
      return;
    }
    if (update.my_decision !== 'interested') {
      setErrorMessage('Payment is only required if interested.');
      return;
    }
    setIsPaid(true);
    setPayerName(currentParent?.full_name || 'You');
  };

  const handleToggleComplete = async () => {
    if (update.is_completed) return; // already completed
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

  return (
    <div className="flex flex-col max-w-[402px] mx-auto w-full px-4 pt-2 pb-32 space-y-4 select-none">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Event Card (Figma 74:1224) */}
      <div className="bg-white rounded-[20px] p-4 shadow-[0px_2px_8px_rgba(5,53,77,0.06)] border border-neutral-200/80 space-y-4">
        {/* Author / Teacher Row */}
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-full bg-[#05354d]/10 overflow-hidden flex items-center justify-center text-[#05354d] font-bold text-sm shrink-0">
            {update.author_name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-semibold text-[#05354d] leading-snug">
              {update.author_name}
            </span>
            <span className="text-[12px] text-[#72787d]">
              {update.author_role}
            </span>
          </div>
        </div>

        {/* Date & Time Row */}
        <div className="grid grid-cols-2 gap-2 text-[13px] text-[#05354d]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#72787d] shrink-0" />
            <span className="font-medium">
              {new Date(update.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          {update.event_time && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#72787d] shrink-0" />
              <span>{update.event_time}</span>
            </div>
          )}
        </div>

        {update.location && (
          <div className="flex items-center gap-2 text-[13px] text-[#05354d]">
            <MapPin className="w-4 h-4 text-[#72787d] shrink-0" />
            <span>{update.location}</span>
          </div>
        )}

        {/* Description */}
        <div className="text-[13.5px] text-[#191c1b] leading-relaxed pt-1">
          <p>{update.description}</p>
        </div>

        {/* Both Parents Acknowledgment Status Bar */}
        <div className="pt-2">
          {bothAcknowledged ? (
            <div className="flex items-center justify-center gap-2 bg-[#27845b]/10 text-[#27845b] py-2.5 px-3 rounded-xl border border-[#27845b]/20 text-[13px] font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Both parents acknowledged</span>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-[13px]">
              <span className="text-[#72787d]">Acknowledgment required by both parents</span>
              {!update.my_ack && (
                <button
                  onClick={handleAcknowledge}
                  disabled={isSubmitting}
                  className="px-3 py-1 bg-[#05354d] text-white text-[12px] font-bold rounded-full hover:bg-[#042a3a] active:scale-95 transition-all shadow-xs"
                >
                  Acknowledge
                </button>
              )}
            </div>
          )}
        </div>

        {/* Shared Decision Section */}
        {update.requires_decision && (
          <div className="pt-2 border-t border-neutral-100 space-y-3">
            <span className="text-[13px] font-bold text-[#05354d]">
              {update.decision_question || 'Is your child participating?'}
            </span>

            {/* Decision Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDecisionToggle('interested')}
                disabled={isSubmitting || isPaid || update.is_completed}
                className={`py-2 px-3 rounded-xl text-[13px] font-bold border transition-all ${
                  update.my_decision === 'interested'
                    ? 'bg-[#05354d] text-white border-[#05354d] shadow-xs'
                    : 'bg-white text-[#05354d] border-neutral-200 hover:border-neutral-300'
                } ${isPaid || update.is_completed ? 'cursor-default' : 'active:scale-95'}`}
              >
                Yes (Interested)
              </button>

              <button
                type="button"
                onClick={() => handleDecisionToggle('not_interested')}
                disabled={isSubmitting || isPaid || update.is_completed}
                className={`py-2 px-3 rounded-xl text-[13px] font-bold border transition-all ${
                  update.my_decision === 'not_interested'
                    ? 'bg-[#05354d] text-white border-[#05354d] shadow-xs'
                    : 'bg-white text-[#05354d] border-neutral-200 hover:border-neutral-300'
                } ${isPaid || update.is_completed ? 'cursor-default' : 'active:scale-95'}`}
              >
                No (Not Interested)
              </button>
            </div>

            {/* Decisions Differ -> Conflict Callout Box (Figma Frame 74:1347) */}
            {decisionsDiffer && (
              <div className="bg-[#c94c4c]/10 border border-[#c94c4c]/30 rounded-xl p-3.5 space-y-1 animate-fade-in">
                <h4 className="text-[14px] font-bold text-[#c94c4c]">
                  Decisions Differ
                </h4>
                <p className="text-[13px] text-[#05354d] leading-relaxed">
                  Both parents must agree on the same response by November 10. If no agreement is reached, it will be considered <strong>“Not Interested”</strong>, and the child will not be eligible to participate.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Action Section */}
      <div className="flex flex-col items-center pt-2">
        {isPaid || update.is_completed ? (
          /* Success message replacing button: "xxx has paid for the event" */
          <div className="w-full flex items-center justify-center gap-2 bg-[#27845b]/10 text-[#27845b] py-3.5 px-4 rounded-xl border border-[#27845b]/20 text-[14px] font-bold text-center">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{payerName || 'Vime Gold'} has paid for the event</span>
          </div>
        ) : (
          <button
            onClick={handlePay}
            disabled={!bothAcknowledged || decisionsDiffer || update.my_decision !== 'interested'}
            className={`w-[220px] py-3 px-4 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 shadow-md ${
              bothAcknowledged && !decisionsDiffer && update.my_decision === 'interested'
                ? 'bg-[#05354d] hover:bg-[#042a3a] active:scale-95 text-white'
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay now ${update.payment_amount ? Number(update.payment_amount).toFixed(2) : '2.50'}</span>
          </button>
        )}
      </div>

      {/* Progress & Mark As Complete Section (Figma: Frame 83 with Frames 90, 91, 92 toggle) */}
      <div className="bg-white rounded-[20px] p-4 shadow-[0px_2px_8px_rgba(5,53,77,0.06)] border border-neutral-200/80 space-y-4">
        
        {/* Toggle Modal Pops Up once payment is done: Frame 83 */}
        {(isPaid || update.is_completed) && (
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
            <span className="text-[15px] font-bold text-[#05354d]">
              Mark as complete
            </span>

            {/* Toggle Bar - Frame 90, 91, 92 */}
            <button
              onClick={handleToggleComplete}
              disabled={isSubmitting || update.is_completed}
              className={`w-[48px] h-[26px] rounded-full p-1 transition-all duration-500 flex items-center ${
                update.is_completed ? 'bg-[#27845b] justify-end' : 'bg-neutral-300 justify-start'
              }`}
              title={update.is_completed ? 'Completed' : 'Click toggle to mark complete'}
            >
              <div className="w-[18px] h-[18px] bg-white rounded-full shadow-sm" />
            </button>
          </div>
        )}

        {/* 3-Step Connected Progress Line: Acknowledge -> Payment -> Complete */}
        <div className="flex items-center justify-between px-3 pt-1 text-[12px]">
          {/* Step 1: Acknowledge */}
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full mb-1.5 transition-colors ${
                bothAcknowledged ? 'bg-[#27845b]' : 'bg-[#72787d]'
              }`}
            />
            <span className={`font-semibold ${bothAcknowledged ? 'text-[#27845b]' : 'text-[#72787d]'}`}>
              Acknowledge
            </span>
          </div>

          {/* Line 1 */}
          <div className="flex-1 h-[2px] bg-neutral-200 mx-2 -mt-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isPaid || update.is_completed ? 'bg-[#27845b] w-full' : 'bg-transparent w-0'
              }`}
            />
          </div>

          {/* Step 2: Payment */}
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full mb-1.5 transition-colors ${
                isPaid || update.is_completed ? 'bg-[#27845b]' : 'bg-[#72787d]'
              }`}
            />
            <span className={`font-semibold ${isPaid || update.is_completed ? 'text-[#27845b]' : 'text-[#72787d]'}`}>
              Payment
            </span>
          </div>

          {/* Line 2 */}
          <div className="flex-1 h-[2px] bg-neutral-200 mx-2 -mt-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                update.is_completed ? 'bg-[#27845b] w-full' : 'bg-transparent w-0'
              }`}
            />
          </div>

          {/* Step 3: Complete */}
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full mb-1.5 transition-colors ${
                update.is_completed ? 'bg-[#27845b]' : 'bg-[#72787d]'
              }`}
            />
            <span className={`font-semibold ${update.is_completed ? 'text-[#27845b]' : 'text-[#72787d]'}`}>
              Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
