import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pnpabkmytgxxlfhkhbdg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucGFia215dGd4eGxmaGtoYmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjQ3MTMsImV4cCI6MjA2Njg0MDcxM30.sv0zS35FeiPnpgmnjjkjSmsnmE9vwZMgMVEosPggz1U';
 
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 