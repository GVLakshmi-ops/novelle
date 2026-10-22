/** Novelle authentication backed by Supabase Auth. Demo mode remains local-only. */

import { User } from '../types/auth';
import { getSupabaseClient } from './supabase';

const CURRENT_USER_KEY = 'novelle_auth_user_v1';
const AUTH_TOKEN_KEY = 'novelle_auth_token_v1';

function authConfigError(): string {
  return 'Supabase is not configured for this deployment. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Project Settings → Environment Variables, then redeploy.';
}

function mapSupabaseUser(authUser: any): User {
  const metadata = authUser.user_metadata || {};
  return {
    id: authUser.id,
    name: metadata.full_name || metadata.name || (authUser.email ? authUser.email.split('@')[0] : 'Reader'),
    email: authUser.email || '',
    avatarUrl: metadata.avatar_url,
    createdAt: authUser.created_at || new Date().toISOString(),
    readingGoalPerYear: metadata.reading_goal_per_year || 50,
  };
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  try { return localStorage.getItem(AUTH_TOKEN_KEY); } catch { return null; }
}

export function saveSession(user: User, token: string): void {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    window.dispatchEvent(new Event('novelle_auth_changed'));
  } catch (err) { console.error('Failed to save session:', err); }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.dispatchEvent(new Event('novelle_auth_changed'));
  } catch (err) { console.error('Failed to clear session:', err); }
  const supabase = getSupabaseClient();
  if (supabase) void supabase.auth.signOut();
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: authConfigError() };
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    if (!data.user || !data.session) return { success: false, error: 'Login did not return an active session. Please try again.' };
    const user = mapSupabaseUser(data.user);
    saveSession(user, data.session.access_token);
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unable to connect to Supabase.' };
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: authConfigError() };
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) return { success: false, error: error.message };
    if (!data.user) return { success: false, error: 'Supabase did not return a user. Please try again.' };
    if (!data.session) {
      return { success: false, error: 'Account created. Check your email to confirm the account, then return here to log in. If you want immediate login, disable email confirmations in Supabase Authentication settings.' };
    }
    const user = mapSupabaseUser(data.user);
    saveSession(user, data.session.access_token);
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unable to create account with Supabase.' };
  }
}

export async function loginAsDemo(): Promise<{ success: boolean; user?: User; error?: string }> {
  const user: User = {
    id: 'usr-demo-01',
    name: 'Demo Reader',
    email: 'demo@novelle.app',
    createdAt: '2025-01-01T00:00:00.000Z',
    readingGoalPerYear: 50,
  };
  saveSession(user, 'novelle-local-demo-session');
  return { success: true, user };
}
