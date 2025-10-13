
export interface User {
  id: string;
  userid: string;
  name: string;
  role: string;
  password?: string; // Added for sign-in check
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  clock_in: string;
  clock_out: string | null;
  total_time: string | null;
  created_at: string;
}

export interface IdleRecord {
  id: string;
  user_id: string;
  attendance_id: string;
  idle_start: string;
  idle_end: string | null;
  duration_seconds: number | null;
  created_at: string;
}

// Basic Supabase schema typing for better type safety
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id'>;
        Update: Partial<User>;
      };
      attendance: {
        Row: AttendanceRecord;
        Insert: Omit<AttendanceRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<AttendanceRecord, 'id' | 'user_id' | 'created_at'>>;
      };
      idle_time: {
        Row: IdleRecord;
        Insert: Omit<IdleRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<IdleRecord, 'id' | 'user_id' | 'attendance_id' | 'created_at'>>;
      };
    };
  };
}
