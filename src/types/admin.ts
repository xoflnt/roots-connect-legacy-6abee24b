export type AdminSection =
  | 'dashboard'
  | 'members'
  | 'requests'
  | 'users'
  | 'data-health'
  | 'notifications'
  | 'content'
  | 'analytics'
  | 'settings';

export interface AdminRequest {
  id: string;
  type: 'add_spouse' | 'add_child' | 'other';
  target_member_id: string;
  data: {
    spouse_name?: string;
    child_name?: string;
    child_gender?: 'M' | 'F';
    text_content?: string;
  };
  notes: string | null;
  status: 'pending' | 'completed' | 'approved';
  submitted_by: string | null;
  created_at: string;
}

export interface VerifiedUser {
  id: string;
  member_id: string;
  member_name: string;
  phone: string;
  hijri_birth_date: string | null;
  verified_at: string;
}

export interface DashboardStats {
  totalMembers: number;
  livingMembers: number;
  activeUsers: number;
  totalVisits: number;
  pendingRequests: number;
}
