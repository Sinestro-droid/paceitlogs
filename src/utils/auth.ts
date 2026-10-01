import { supabase } from './supabase';
import { AppUser } from '../types';

const LAST_USER_KEY = 'pace_it_last_user_v2';

export function cleanUserName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 40);
}

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '_').slice(0, 64);
}

export function getLastUser(): string {
  try {
    return localStorage.getItem(LAST_USER_KEY) || '';
  } catch {
    return '';
  }
}

export function setLastUser(name: string): void {
  try { localStorage.setItem(LAST_USER_KEY, name); } catch { /* ignore */ }
}

export async function login(username: string, password: string): Promise<AppUser> {
  const normalized = normalizeUsername(username);
  if (!normalized || !password) throw new Error('Username and password are required.');

  const { data: email, error: lookupError } = await supabase.rpc('get_login_email', {
    p_username: normalized,
  });
  if (lookupError || !email) {
    await new Promise((r) => setTimeout(r, 250));
    throw new Error('Invalid username or password.');
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: String(email),
    password,
  });
  if (error) throw new Error('Invalid username or password.');

  const user = await getCurrentUser();
  if (!user) throw new Error('Your account was authenticated but your profile could not be loaded.');
  setLastUser(user.username);
  return user;
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, role, disabled')
    .eq('id', user.id)
    .single();

  if (error || !profile) return null;
  if (profile.disabled) {
    await supabase.auth.signOut();
    return null;
  }

  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name || profile.username,
    role: profile.role,
  };
}

export async function changePassword(password: string): Promise<void> {
  if (password.length < 8) throw new Error('Password must be at least 8 characters.');
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function getAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Your session has expired. Please log in again.');
  return session.access_token;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export function onAuthChange(callback: (user: AppUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }
    // Avoid doing extra work synchronously inside the auth callback.
    setTimeout(async () => callback(await getCurrentUser()), 0);
  });
}
