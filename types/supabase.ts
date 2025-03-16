export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  custom_name: string;
  billing_plan: 'free' | 'pro' | 'ultimate';
  created_at: string;
  last_sign_in: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
