
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

const supabaseUrl = 'https://szifmsvutxcrcwfjbvsi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6aWZtc3Z1dHhjcmN3ZmpidnNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjcwNzEsImV4cCI6MjA3NTYwMzA3MX0.hvZKMI0NDQ8IdWaDonqmiyvQu-NkCN0nRHPjn0isoCA';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
