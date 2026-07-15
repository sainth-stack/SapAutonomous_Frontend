const AUTH_USER_KEY = "user";
const AUTH_TOKEN_KEY = "token";
const AUTH_FLAG_KEY = "isAuthenticated";

function clearAuthInLocalStorage() {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_FLAG_KEY);
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
    localStorage.getItem(AUTH_FLAG_KEY) === "true" &&
    !!localStorage.getItem(AUTH_TOKEN_KEY) &&
    !!getStoredUser()
  );
}

export function setAuthSession(userData) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
  localStorage.setItem(AUTH_TOKEN_KEY, "authenticated");
  localStorage.setItem(AUTH_FLAG_KEY, "true");
}

export function clearAuthSession() {
  clearAuthInLocalStorage();
}
