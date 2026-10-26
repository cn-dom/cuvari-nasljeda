import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const REMEMBER_ME_STORAGE_KEY = "patriasoul.auth.remember-me";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  !supabaseUrl.includes("YOUR-TEST-PROJECT") &&
  !supabasePublishableKey.includes("YOUR_TEST_PUBLISHABLE_KEY")
);

// Store a session in localStorage only when the member explicitly chooses
// "Zapamti me". Otherwise use sessionStorage so the session ends with the tab.
function getAuthStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REMEMBER_ME_STORAGE_KEY) === "false"
      ? window.sessionStorage
      : window.localStorage;
  } catch {
    return window.sessionStorage;
  }
}

const authStorage = {
  getItem(key) {
    try { return getAuthStorage()?.getItem(key) ?? null; } catch { return null; }
  },
  setItem(key, value) {
    try { getAuthStorage()?.setItem(key, value); } catch { /* Browser storage may be disabled. */ }
  },
  removeItem(key) {
    try { window.localStorage.removeItem(key); } catch { /* Ignore unavailable storage. */ }
    try { window.sessionStorage.removeItem(key); } catch { /* Ignore unavailable storage. */ }
  },
};

export function setAuthRememberMePreference(remember) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REMEMBER_ME_STORAGE_KEY, remember ? "true" : "false");
    if (!remember && supabaseUrl) {
      const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
      window.localStorage.removeItem(`sb-${projectRef}-auth-token`);
    }
  } catch {
    // The login flow can still proceed when browser storage is restricted.
  }
}

// The app remains usable as a visual prototype until a separate test project
// is configured. Never put a service_role/secret key in a VITE_* variable.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: authStorage,
      },
    })
  : null;
