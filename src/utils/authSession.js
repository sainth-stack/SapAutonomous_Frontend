const AUTH_USER_KEY = "user";
const AUTH_TOKEN_KEY = "token";
const AUTH_FLAG_KEY = "isAuthenticated";
const AUTH_TAB_ID_KEY = "authTabId";
const AUTH_TAB_OWNER_PREFIX = "authTabOwner:";

function clearAuthInLocalStorage() {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_FLAG_KEY);
}

function clearSessionAuthStorage() {
  sessionStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_FLAG_KEY);
  sessionStorage.removeItem(AUTH_TAB_ID_KEY);
}

function cleanupTabOwnerKeys() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(AUTH_TAB_OWNER_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function isAuthenticatedSession() {
  return (
    getAuthToken() &&
    localStorage.getItem(AUTH_FLAG_KEY) === "true" &&
    !!getStoredUser()
  );
}

export function setAuthSession(userData) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
  localStorage.setItem(AUTH_TOKEN_KEY, "authenticated");
  localStorage.setItem(AUTH_FLAG_KEY, "true");
  clearSessionAuthStorage();
}

export function clearAuthSession() {
  clearAuthInLocalStorage();
  clearSessionAuthStorage();
  cleanupTabOwnerKeys();
}

export function migrateLegacyAuthSession() {
  const hasLocalAuth =
    !!localStorage.getItem(AUTH_TOKEN_KEY) &&
    localStorage.getItem(AUTH_FLAG_KEY) === "true" &&
    !!localStorage.getItem(AUTH_USER_KEY);

  const sessionToken = sessionStorage.getItem(AUTH_TOKEN_KEY);
  const sessionFlag = sessionStorage.getItem(AUTH_FLAG_KEY);
  const sessionUser = sessionStorage.getItem(AUTH_USER_KEY);

  if (!hasLocalAuth && sessionToken && sessionFlag === "true" && sessionUser) {
    localStorage.setItem(AUTH_TOKEN_KEY, sessionToken);
    localStorage.setItem(AUTH_FLAG_KEY, sessionFlag);
    localStorage.setItem(AUTH_USER_KEY, sessionUser);
  }

  clearSessionAuthStorage();
  cleanupTabOwnerKeys();
}
