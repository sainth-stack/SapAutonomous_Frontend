/**
 * Default routes for limited users who have no role (login returns allowed_paths: null).
 * Users with a role must get paths only from that role — do not merge these in.
 * Admin-only routes (roles/users) are only in ALL_ADMIN_PATHS.
 */
export const LIMITED_USER_ALLOWED_PATHS = ['/kedb', '/suggested-actions-depository', '/web-suggested-actions'];
export const ALL_ADMIN_PATHS = ['/admin/roles', '/admin/users'];

export const DEFAULT_PATH_FOR_LIMITED_USER = '/kedb';

/**
 * Default route after login or when redirecting due to access denied.
 * Super admin → "/", limited user → first allowed path or /kedb.
 * @param {boolean} isSuperAdmin
 * @param {string[]|null} allowedPaths
 * @returns {string}
 */
export function getDefaultPathForUser(isSuperAdmin, allowedPaths = null) {
  if (isSuperAdmin) return '/';
  if (Array.isArray(allowedPaths) && allowedPaths.length > 0 && allowedPaths[0]) {
    return allowedPaths[0];
  }
  return DEFAULT_PATH_FOR_LIMITED_USER;
}

/**
 * Check if the current user can access the given path.
 * @param {string} path - Route path (e.g. '/kedb')
 * @param {boolean} isSuperAdmin
 * @param {string[]|null} allowedPaths - from API (null = all for super admin)
 * @returns {boolean}
 */
export function canAccessPath(path, isSuperAdmin, allowedPaths = null) {
  if (ALL_ADMIN_PATHS.includes(path)) return isSuperAdmin;
  if (isSuperAdmin) return true;
  // Must match getAllowedPaths (role paths only when assigned; else legacy defaults)
  const effective = getAllowedPaths(false, allowedPaths);
  if (path === "/sla-export") {
    return (
      effective.includes("/sla-export") ||
      effective.includes("/data-source") ||
      effective.includes("/self-monitoring") ||
      effective.includes("/sla-resolution-response-time")
    );
  }
  return effective.includes(path);
}

/**
 * Get allowed paths for the current user (for sidebar visibility).
 * @param {boolean} isSuperAdmin
 * @param {string[]|null} allowedPaths - from login: null if no role paths from server; non-empty array = role permissions only
 * @returns {string[]|null} - List of allowed path strings, or null meaning "all" for admin
 */
export function getAllowedPaths(isSuperAdmin, allowedPaths = null) {
  if (isSuperAdmin) return null; // null = all paths
  if (Array.isArray(allowedPaths) && allowedPaths.length > 0) {
    return [...allowedPaths]
      .map((p) => (typeof p === 'string' ? p.trim() : ''))
      .filter(Boolean)
      .filter((p, i, a) => a.indexOf(p) === i);
  }
  return LIMITED_USER_ALLOWED_PATHS;
}
