export type Category = 'SCHOOL' | 'IN-CLASS' | 'OCCASION' | 'EMERGENCY';

export type UpdateType = 'notice' | 'payment' | 'task' | 'emergency';

export type UpdateStatus = 'active' | 'expired' | 'modified' | 'cancelled';

export interface Parent {
  id: string;
  full_name: string;
  email?: string;
  role_label: string;
}

export interface Child {
  id: string;
  school_id: string;
  first_name: string;
  last_name: string;
  grade: string;
}

export interface TaskItem {
  id: string;
  update_id: string;
  title: string;
  is_completed: boolean;
  completed_by_parent_id?: string;
  completed_at?: string;
  sort_order: number;
}

export interface FeedUpdate {
  id: string;
  title: string;
  description: string;
  category: Category;
  author_name: string;
  author_role: string;
  author_avatar?: string;
  event_date: string; // YYYY-MM-DD
  event_time?: string;
  location?: string;
  deadline_date?: string;
  update_type: UpdateType;
  payment_amount?: number;
  requires_decision: boolean;
  decision_question?: string;
  decision_deadline?: string;
  status: UpdateStatus;
  is_emergency: boolean;
  version: number;
  created_at: string;
  
  // Dynamic fields from get_parent_updates_feed
  my_ack: boolean;
  my_ack_at?: string;
  other_ack: boolean;
  other_parent_name?: string;
  other_ack_at?: string;
  my_decision?: 'interested' | 'not_interested' | null;
  other_decision?: 'interested' | 'not_interested' | null;
  decisions_match: boolean;
  is_completed: boolean;
  completed_by_name?: string;
  completed_at?: string;
  tasks_total: number;
  tasks_completed: number;
  can_complete: boolean;
  is_locked: boolean;
  lock_reason?: string;
}

export interface UpdateVersion {
  id: string;
  update_id: string;
  version_number: number;
  title: string;
  description: string;
  changed_at: string;
  change_summary?: string;
}

