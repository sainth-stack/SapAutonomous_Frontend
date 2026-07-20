import { logApiURL } from '../const';
import { getStoredUser } from './authSession';

/**
 * Maps app routes to human-readable module names for the log API.
 */
const PATH_LOG_CONFIG = {
  '/': {
    moduleName: 'Home',
    programName: 'home/index.js',
  },
  '/login': {
    moduleName: 'Login',
    programName: 'Login/index.js',
  },
  '/process-monitor/thanksgiving': {
    moduleName: 'SAP Job Monitoring',
    programName: 'batch-monitor/index.js',
  },
  '/process-monitor/failed-idocs': {
    moduleName: 'Failed IDOC Monitoring',
    programName: 'failed-idoc-monitoring/index.js',
  },
  '/self-service-actions': {
    moduleName: 'SAP Joule',
    programName: 'self-service-actions/index.js',
  },
  '/admin/logs': {
    moduleName: 'Admin — Logs',
    programName: 'admin/Logs/index.js',
  },
};

const toTitleCase = (value = '') =>
  value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const normalizePath = (pathname = '') => {
  const p = (pathname || '/').split('?')[0];
  if (!p || p === '/') return '/';
  return p.replace(/\/+$/, '') || '/';
};

export const isAdminRoutePath = (pathname = '') =>
  /^\/admin(\/|$)/i.test(normalizePath(pathname));

export const getLogMetaFromPath = (pathname = '') => {
  const normalized = normalizePath(pathname);
  const keys = Object.keys(PATH_LOG_CONFIG).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (normalized === key || (key !== '/' && normalized.startsWith(`${key}/`))) {
      return PATH_LOG_CONFIG[key];
    }
  }

  const segment = normalized.split('/').filter(Boolean).pop() || 'home';
  return {
    moduleName: toTitleCase(segment) || 'Unknown Module',
    programName: `${segment}.js`,
  };
};

export const sendAppLog = async ({
  pathname = typeof window !== 'undefined' ? window.location.pathname : '/',
  user = getStoredUser()?.email,
  logType = 'I',
  content = '',
}) => {
  const { moduleName, programName } = getLogMetaFromPath(pathname);
  const payload = {
    module_name: moduleName,
    program_name: programName,
    user,
    log_type: logType,
    content,
  };

  try {
    const response = await fetch(logApiURL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    if (!response.ok) {
      throw new Error(`Log API returned ${response.status}`);
    }

    return true;
  } catch (error) {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const sent = navigator.sendBeacon(
        logApiURL,
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      );
      if (sent) return true;
    }

    console.error('Failed to send app log:', error, payload);
    return false;
  }
};
