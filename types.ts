
export type ServiceStatus = 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Rejected';

export interface Service {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  icon: string;
  features: string[];
  image: string;
}

export interface ServiceRequest {
  id?: string;
  request_id: string;
  full_name: string;
  email: string;
  service: string;
  project_details: string;
  budget_range: string;
  deadline: string;
  status: ServiceStatus;
  created_at?: string;
  // New Client Portal Fields
  start_date?: string;
  schedule?: string;
  meeting_link?: string;
  admin_notes?: string;
}

export interface AuthState {
  session: any;
  loading: boolean;
}
