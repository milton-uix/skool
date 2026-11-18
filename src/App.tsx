import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { EmergencyModal } from './components/EmergencyModal';
import { CalendarScreen } from './screens/CalendarScreen';
import { ListViewScreen } from './screens/ListViewScreen';
import { MoreScreen } from './screens/MoreScreen';
import { DetailPaymentScreen } from './screens/DetailPaymentScreen';
import { DetailExpiredScreen } from './screens/DetailExpiredScreen';
import { DetailTaskScreen } from './screens/DetailTaskScreen';
import { LoginScreen } from './screens/LoginScreen';

export const AppContent: React.FC = () => {
  const { activeTab, selectedUpdate, isLoading, currentParent } = useApp();

  // Show login screen when no parent is authenticated
  if (!currentParent) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    if (selectedUpdate) {
      if (selectedUpdate.status === 'expired') {
        return <DetailExpiredScreen update={selectedUpdate} />;
      }
      if (selectedUpdate.update_type === 'payment') {
        return <DetailPaymentScreen update={selectedUpdate} />;
      }
      if (selectedUpdate.update_type === 'task') {
        return <DetailTaskScreen update={selectedUpdate} />;
      }
      // Default to payment or task based on fields
      return <DetailPaymentScreen update={selectedUpdate} />;
    }

    switch (activeTab) {
      case 'calendar':
        return <CalendarScreen />;
      case 'updates':
        return <ListViewScreen />;
      case 'more':
        return <MoreScreen />;
      default:
        return <CalendarScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#e5e5e5] flex justify-center selection:bg-[#05354d]/20 selection:text-[#05354d]">
      {/* Mobile Frame Container (402px wide matching Figma designs) */}
      <div className="w-full max-w-[402px] min-h-screen bg-[#e5e5e5] flex flex-col relative shadow-2xl border-x border-neutral-300/60 overflow-x-hidden">
        <Header />
        
        <main className="flex-1 overflow-x-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <div className="w-8 h-8 border-3 border-[#05354d]/20 border-t-[#05354d] rounded-full animate-spin"></div>
              <span className="text-[13px] font-medium text-[#72787d]">Syncing with Supabase...</span>
            </div>
          ) : (
            renderScreen()
          )}
        </main>

        <EmergencyModal />
        <Navbar />
      </div>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
