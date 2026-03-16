const SESSION_KEY = 'demo-auth-session';
const LOCK_KEY = 'demo-app-locked';

export interface SessionData {
  authenticated: boolean;
  timestamp: number;
}

export function isAuthenticated(): boolean {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return false;
    
    const data: SessionData = JSON.parse(session);
    if (!data.authenticated) return false;
    
    // Check if session expired (7 days)
    const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > SESSION_TIMEOUT) {
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export function setAuthenticated(authenticated: boolean): void {
  const data: SessionData = {
    authenticated,
    timestamp: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function isAppLocked(): boolean {
  return localStorage.getItem(LOCK_KEY) === 'true';
}

export function setAppLocked(locked: boolean): void {
  if (locked) {
    localStorage.setItem(LOCK_KEY, 'true');
  } else {
    localStorage.removeItem(LOCK_KEY);
  }
}

export async function isPasswordSet(): Promise<boolean> {
  if (!window.electronAPI) return false;
  return window.electronAPI.authIsPasswordSet();
}

export function getLockTimeout(): number {
  const stored = localStorage.getItem('demo-lock-timeout');
  return stored ? parseInt(stored, 10) : -1; // -1 means disabled
}

export function setLockTimeout(timeoutMs: number): void {
  if (timeoutMs < 0) {
    localStorage.removeItem('demo-lock-timeout');
  } else {
    localStorage.setItem('demo-lock-timeout', timeoutMs.toString());
  }
}

export async function changePassword(
  _currentPassword: string,
  _newPassword: string
): Promise<{ success: boolean; error?: string }> {
  // In demo mode, just return success
  return { success: true };
}