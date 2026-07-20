/**
 * Default routes for limited users who have no role (login returns allowed_paths: null).
 */
export const LIMITED_USER_ALLOWED_PATHS = [
  '/process-monitor/thanksgiving',
  '/process-monitor/failed-idocs',
  '/self-service-actions',
];

export const ALL_ADMIN_PATHS = ['/admin/logs'];

export const DEFAULT_PATH_FOR_LIMITED_USER = '/process-monitor/thanksgiving';

/**
 * Default route after login.
 * Super admin / any user with home access → "/"; otherwise first allowed path.
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
 */
export function canAccessPath(path, isSuperAdmin, allowedPaths = null) {
  if (isSuperAdmin) return true;
  const effective = getAllowedPaths(false, allowedPaths);
  return effective.includes(path);
}

/**
 * Get allowed paths for the current user.
 * @returns {string[]|null} null means "all" for admin
 */
export function getAllowedPaths(isSuperAdmin, allowedPaths = null) {
  if (isSuperAdmin) return null;
  if (Array.isArray(allowedPaths) && allowedPaths.length > 0) {
    return [...allowedPaths]
      .map((p) => (typeof p === 'string' ? p.trim() : ''))
      .filter(Boolean)
      .filter((p, i, a) => a.indexOf(p) === i);
  }
  return LIMITED_USER_ALLOWED_PATHS;
}
