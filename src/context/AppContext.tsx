import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FeedUpdate, Parent, Child } from '../types';
import {
  DEFAULT_CHILD_ID,
  PARENT_BLESSING_ID,
  PARENT_VIME_ID,
  fetchParents,
  fetchUpdatesFeed,
  acknowledgeUpdate as apiAcknowledge,
  submitDecision as apiSubmitDecision,
  toggleTask as apiToggleTask,
  completeUpdate as apiCompleteUpdate,
  supabase
} from '../lib/supabase';

interface AppContextType {
  parents: Parent[];
  currentParent: Parent | null;
  otherParent: Parent | null;
  child: Child;
  updates: FeedUpdate[];
  isLoading: boolean;
  activeTab: 'calendar' | 'updates' | 'more';
  setActiveTab: (tab: 'calendar' | 'updates' | 'more') => void;
  selectedUpdate: FeedUpdate | null;
  setSelectedUpdate: (update: FeedUpdate | null) => void;
  activeEmergency: FeedUpdate | null;
  dismissEmergency: () => void;
  switchParent: (parentId: string) => void;
  refreshData: () => Promise<void>;
  acknowledge: (updateId: string) => Promise<void>;
  submitDecision: (updateId: string, decision: 'interested' | 'not_interested') => Promise<void>;
  toggleTaskItem: (taskId: string, isCompleted: boolean) => Promise<void>;
  complete: (updateId: string) => Promise<void>;
  login: (studentId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultChild: Child = {
  id: DEFAULT_CHILD_ID,
  school_id: '00000000-0000-0000-0000-000000000001',
  first_name: 'Leo',
  last_name: 'Parker',
  grade: 'Grade 3'
};

const defaultParents: Parent[] = [
  { id: PARENT_VIME_ID, full_name: 'Vime Gold', role_label: 'Mother' },
  { id: PARENT_BLESSING_ID, full_name: 'Blessing', role_label: 'Father' }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parents, setParents] = useState<Parent[]>(defaultParents);
  const [currentParent, setCurrentParent] = useState<Parent | null>(null);
  const [child] = useState<Child>(defaultChild);
  const [updates, setUpdates] = useState<FeedUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'calendar' | 'updates' | 'more'>('calendar');
  const [selectedUpdate, setSelectedUpdate] = useState<FeedUpdate | null>(null);
  const [activeEmergency, setActiveEmergency] = useState<FeedUpdate | null>(null);
  const [dismissedEmergencyIds, setDismissedEmergencyIds] = useState<Set<string>>(new Set());

  const otherParent = parents.find(p => p.id !== currentParent?.id) || parents[1] || null;

  const refreshData = useCallback(async () => {
    if (!currentParent) return;
    try {
      const feed = await fetchUpdatesFeed(currentParent.id, child.id);
      setUpdates(feed);

      // Check for active emergency: show once in a while (e.g. check sessionStorage so it doesn't pop up every navigation)
      const emergency = feed.find(u => u.is_emergency && !dismissedEmergencyIds.has(u.id));
      const hasSeenSessionAlert = sessionStorage.getItem(`seen_emergency_${emergency?.id}`);
      if (emergency && !hasSeenSessionAlert) {
        setActiveEmergency(emergency);
      }

      // Update selectedUpdate if currently viewing one
      if (selectedUpdate) {
        const fresh = feed.find(u => u.id === selectedUpdate.id);
        if (fresh) setSelectedUpdate(fresh);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentParent, child.id, dismissedEmergencyIds, selectedUpdate]);

  useEffect(() => {
    async function init() {
      const parentList = await fetchParents();
      if (parentList.length > 0) {
        setParents(parentList);
        // Do NOT auto-select a parent; the user must log in via LoginScreen
      }
      setIsLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (currentParent) {
      setIsLoading(true);
      refreshData();
    }
  }, [currentParent?.id]);

  // Realtime subscription to database changes
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'school_updates' },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parent_acknowledgments' },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'parent_decisions' },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'update_tasks' },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'update_completions' },
        () => refreshData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

  const switchParent = (parentId: string) => {
    const parent = parents.find(p => p.id === parentId);
    if (parent) {
      setCurrentParent(parent);
    }
  };

  const dismissEmergency = () => {
    if (activeEmergency) {
      sessionStorage.setItem(`seen_emergency_${activeEmergency.id}`, 'true');
      setDismissedEmergencyIds(prev => new Set(prev).add(activeEmergency.id));
      setActiveEmergency(null);
    }
  };

  const acknowledge = async (updateId: string) => {
    if (!currentParent) return;
    await apiAcknowledge(updateId, currentParent.id);
    await refreshData();
  };

  const submitDecision = async (updateId: string, decision: 'interested' | 'not_interested') => {
    if (!currentParent) return;
    await apiSubmitDecision(updateId, currentParent.id, decision);
    await refreshData();
  };

  const toggleTaskItem = async (taskId: string, isCompleted: boolean) => {
    if (!currentParent) return;
    await apiToggleTask(taskId, currentParent.id, isCompleted);
    await refreshData();
  };

  const complete = async (updateId: string) => {
    if (!currentParent) return;
    await apiCompleteUpdate(updateId, currentParent.id);
    await refreshData();
  };

  // ---------------------------------------------------------------
  // Login – calls the RPC that we created on Supabase
  // ---------------------------------------------------------------
  const login = async (studentId: string, password: string) => {
    const { data, error } = await supabase.rpc('parent_login', {
      p_student_id: studentId,
      p_password: password,
    });
    if (error) {
      console.error('Login RPC error:', error);
      throw new Error('Login failed');
    }
    if (!data || data.length === 0) {
      throw new Error('Invalid credentials');
    }
    const parent = data[0];
    const loggedParent: Parent = {
      id: parent.id,
      full_name: parent.full_name,
      role_label: parent.role_label,
    };
    setCurrentParent(loggedParent);
    // Load the feed for the newly‑logged‑in parent
    await refreshData();
  };

  // ---------------------------------------------------------------
  // Logout – clears Supabase auth session and local state
  // ---------------------------------------------------------------
  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentParent(null);
    setUpdates([]);
    setSelectedUpdate(null);
    setActiveTab('calendar');
    setIsLoading(false);
  };

  return (
    <AppContext.Provider
      value={{
        parents,
        currentParent,
        otherParent,
        child,
        updates,
        isLoading,
        activeTab,
        setActiveTab,
        selectedUpdate,
        setSelectedUpdate,
        activeEmergency,
        dismissEmergency,
        switchParent,
        refreshData,
        acknowledge,
        submitDecision,
        toggleTaskItem,
        complete,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

