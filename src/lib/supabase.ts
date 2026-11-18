import { createClient } from '@supabase/supabase-js';
import { FeedUpdate, Parent, TaskItem, UpdateVersion } from '../types';

const SUPABASE_URL = 'https://kmzcdnhukctlelxhpftu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttemNkbmh1a2N0bGVseGhwZnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzNTA3MzAsImV4cCI6MjEwOTkyNjczMH0.TJ8fZELddK6LSYDPG9np-L9lGL2Ds4iVEIxgOwNwYJo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Helper to ensure a user is authenticated before performing a Supabase RPC or query.
 * Throws an error if no session is present.
 */
export async function requireAuth<T>(callback: (session: any) => Promise<T>): Promise<T> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    throw new Error('Unauthenticated: no active Supabase session');
  }
  return callback(data.session);
}


export const DEFAULT_CHILD_ID = '00000000-0000-0000-0000-000000000002';
export const PARENT_VIME_ID = 'a1111111-1111-1111-1111-111111111111'; // Vime Gold (Mother)
export const PARENT_BLESSING_ID = 'b2222222-2222-2222-2222-222222222222'; // Blessing (Father)

export async function fetchParents(): Promise<Parent[]> {
  const { data, error } = await supabase
    .from('parents')
    .select('*')
    .order('full_name');
  if (error) {
    console.error('fetchParents error:', error);
    return [];
  }
  return data || [];
}

export async function fetchUpdatesFeed(parentId: string, childId: string = DEFAULT_CHILD_ID): Promise<FeedUpdate[]> {
  const { data, error } = await supabase
    .rpc('get_parent_updates_feed', {
      p_parent_id: parentId,
      p_child_id: childId
    });

  if (error) {
    console.error('fetchUpdatesFeed error:', error);
    return [];
  }
  return data || [];
}

export async function acknowledgeUpdate(updateId: string, parentId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('acknowledge_update', {
      p_update_id: updateId,
      p_parent_id: parentId
    });

  if (error) {
    console.error('acknowledgeUpdate error:', error);
    throw error;
  }
  return data?.success ?? true;
}

export async function submitDecision(
  updateId: string,
  parentId: string,
  decision: 'interested' | 'not_interested'
): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('submit_parent_decision', {
      p_update_id: updateId,
      p_parent_id: parentId,
      p_decision: decision
    });

  if (error) {
    console.error('submitDecision error:', error);
    throw error;
  }
  return data?.success ?? true;
}

export async function fetchTasks(updateId: string): Promise<TaskItem[]> {
  const { data, error } = await supabase
    .from('update_tasks')
    .select('*')
    .eq('update_id', updateId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('fetchTasks error:', error);
    return [];
  }
  return data || [];
}

export async function toggleTask(
  taskId: string,
  parentId: string,
  isCompleted: boolean
): Promise<boolean> {
  const { error } = await supabase
    .from('update_tasks')
    .update({
      is_completed: isCompleted,
      completed_by_parent_id: isCompleted ? parentId : null,
      completed_at: isCompleted ? new Date().toISOString() : null
    })
    .eq('id', taskId);

  if (error) {
    console.error('toggleTask error:', error);
    throw error;
  }
  return true;
}

export async function checkCanComplete(updateId: string): Promise<{ eligible: boolean; reasons: string[] }> {
  const { data, error } = await supabase
    .rpc('can_complete_update', {
      p_update_id: updateId
    });

  if (error) {
    console.error('checkCanComplete error:', error);
    return { eligible: false, reasons: ['Verification failed'] };
  }
  return {
    eligible: data?.eligible ?? false,
    reasons: data?.reasons || []
  };
}

export async function completeUpdate(updateId: string, parentId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('complete_update', {
      p_update_id: updateId,
      p_parent_id: parentId
    });

  if (error) {
    console.error('completeUpdate error:', error);
    throw error;
  }
  return data?.success ?? true;
}

export async function fetchUpdateVersions(updateId: string): Promise<UpdateVersion[]> {
  const { data, error } = await supabase
    .from('update_versions')
    .select('*')
    .eq('update_id', updateId)
    .order('version_number', { ascending: false });

  if (error) {
    console.error('fetchUpdateVersions error:', error);
    return [];
  }
  return data || [];
}

export async function modifyUpdate(
  updateId: string,
  newTitle: string,
  newDescription: string,
  changeSummary: string
): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('modify_school_update', {
      p_update_id: updateId,
      p_new_title: newTitle,
      p_new_description: newDescription,
      p_change_summary: changeSummary
    });

  if (error) {
    console.error('modifyUpdate error:', error);
    throw error;
  }
  return data?.success ?? true;
}

export async function cancelUpdate(updateId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('cancel_school_update', {
      p_update_id: updateId
    });

  if (error) {
    console.error('cancelUpdate error:', error);
    throw error;
  }
  return data?.success ?? true;
}

