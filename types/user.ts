export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  provider: string;
  created_at: string;
  last_sign_in: string;
  usage_limit?: number;
  billing_plan?: string;
}

export interface Profile {
  id: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  full_name?: string;
  updated_at?: string;
  plan?: string;
  role?: string;
}
