const AUTH_USER_KEY = "user";
const AUTH_TOKEN_KEY = "token";
const AUTH_FLAG_KEY = "isAuthenticated";
const AUTH_TAB_ID_KEY = "authTabId";
const AUTH_TAB_OWNER_PREFIX = "authTabOwner:";

const TAB_INSTANCE_ID =
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

let tabIsolationInitialized = false;
let unloadHandlerRegistered = false;

function getOwnerKey(tabId) {
  return `${AUTH_TAB_OWNER_PREFIX}${tabId}`;
}

function clearAuthOnlyInSessionStorage() {
  sessionStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_FLAG_KEY);
}

function ensureTabId() {
  let tabId = sessionStorage.getItem(AUTH_TAB_ID_KEY);
  if (!tabId) {
    tabId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(AUTH_TAB_ID_KEY, tabId);
  }
  return tabId;
}

function claimTabOwnership(tabId) {
  const ownerKey = getOwnerKey(tabId);
  const existingOwner = localStorage.getItem(ownerKey);

  if (existingOwner && existingOwner !== TAB_INSTANCE_ID) {
    // A duplicated/newly opened tab copied this tabId from another tab.
    // Start with a clean auth state in this tab and rotate to a fresh tabId.
    clearAuthOnlyInSessionStorage();
    const freshTabId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(AUTH_TAB_ID_KEY, freshTabId);
    localStorage.setItem(getOwnerKey(freshTabId), TAB_INSTANCE_ID);
    return;
  }

  localStorage.setItem(ownerKey, TAB_INSTANCE_ID);
}

export function initializeTabIsolation() {
  if (typeof window === "undefined") return;
  if (tabIsolationInitialized) return;

  const tabId = ensureTabId();
  claimTabOwnership(tabId);
  tabIsolationInitialized = true;

  if (!unloadHandlerRegistered) {
    window.addEventListener("beforeunload", () => {
      const activeTabId = sessionStorage.getItem(AUTH_TAB_ID_KEY);
      if (!activeTabId) return;
      const ownerKey = getOwnerKey(activeTabId);
      if (localStorage.getItem(ownerKey) === TAB_INSTANCE_ID) {
        localStorage.removeItem(ownerKey);
      }
    });
    unloadHandlerRegistered = true;
  }
}

initializeTabIsolation();

export function getStoredUser() {
  try {
    const raw = sessionStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAuthToken() {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function isAuthenticatedSession() {
  return (
    getAuthToken() &&
    sessionStorage.getItem(AUTH_FLAG_KEY) === "true" &&
    !!getStoredUser()
  );
}

export function setAuthSession(userData) {
  initializeTabIsolation();
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
  sessionStorage.setItem(AUTH_TOKEN_KEY, "authenticated");
  sessionStorage.setItem(AUTH_FLAG_KEY, "true");

  // Remove legacy shared auth state so each tab uses its own session.
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_FLAG_KEY);
}

export function clearAuthSession() {
  initializeTabIsolation();
  clearAuthOnlyInSessionStorage();

  // Cleanup any old auth keys that may still exist in localStorage.
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_FLAG_KEY);
}

export function migrateLegacyAuthSession() {
  initializeTabIsolation();
  const hasSessionAuth =
    !!sessionStorage.getItem(AUTH_TOKEN_KEY) &&
    sessionStorage.getItem(AUTH_FLAG_KEY) === "true" &&
    !!sessionStorage.getItem(AUTH_USER_KEY);

  const legacyToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const legacyFlag = localStorage.getItem(AUTH_FLAG_KEY);
  const legacyUser = localStorage.getItem(AUTH_USER_KEY);

  if (!hasSessionAuth && legacyToken && legacyFlag === "true" && legacyUser) {
    sessionStorage.setItem(AUTH_TOKEN_KEY, legacyToken);
    sessionStorage.setItem(AUTH_FLAG_KEY, legacyFlag);
    sessionStorage.setItem(AUTH_USER_KEY, legacyUser);
  }

  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_FLAG_KEY);
}
