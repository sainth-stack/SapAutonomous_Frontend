import { logApiURL } from '../const';
import { getStoredUser } from './authSession';

/**
 * Maps app routes to human-readable module names and source file identifiers for the log API.
 * Keys are normalized paths (no trailing slash). Longer paths are matched first.
 */
const PATH_LOG_CONFIG = {
  '/': {
    moduleName: 'Data Source',
    programName: 'data-source/index.js'
  },
  '/data-source': {
    moduleName: 'Data Source',
    programName: 'data-source/index.js'
  },
  '/login': {
    moduleName: 'Login',
    programName: 'Login/index.js'
  },
  '/self-monitoring': {
    moduleName: 'Self Monitoring',
    programName: 'data/index.js'
  },
  '/sla-export': {
    moduleName: 'SLA Export',
    programName: 'sla-export/index.js'
  },
  '/incident-management': {
    moduleName: 'Incident Management',
    programName: 'incident-management/index.js'
  },
  '/kedb': {
    moduleName: 'Knowledge Search',
    programName: 'kedb/index.js'
  },
  '/sla-resolution-response-time': {
    moduleName: 'SLA Resolution & Response Time',
    programName: 'sla-combined/index.js'
  },
  '/incidents-percent': {
    moduleName: 'Incidents — Percent',
    programName: 'ComingSoon.js'
  },
  '/incidents-recurring': {
    moduleName: 'Incidents — Recurring',
    programName: 'ComingSoon.js'
  },
  '/incidents-auto-assignment': {
    moduleName: 'Incidents — Auto Assignment',
    programName: 'ComingSoon.js'
  },
  '/process-monitor/thanksgiving/configuration': {
    moduleName: 'Batch Monitor — Job Configuration',
    programName: 'batch-monitor/JobConfiguration/index.js'
  },
  '/process-monitor/thanksgiving': {
    moduleName: 'Batch Monitor — Thanksgiving',
    programName: 'batch-monitor/index.js'
  },
  '/process-monitor/failed-idocs': {
    moduleName: 'Failed IDOC Monitoring',
    programName: 'failed-idoc-monitoring/index.js'
  },
  '/system-monitoring': {
    moduleName: 'System Monitoring',
    programName: 'system-monitoring/index.js'
  },
  '/system-monitoring/sap-system': {
    moduleName: 'System Monitoring — SAP System',
    programName: 'ComingSoon.js'
  },
  '/resource-queue-length': {
    moduleName: 'Resource — Queue Length',
    programName: 'ComingSoon.js'
  },
  '/resource-incidents-resolved': {
    moduleName: 'Resource — Incidents Resolved',
    programName: 'resource-effectiveness-consultant/index.js'
  },
  '/resource-time-per-resolution': {
    moduleName: 'Resource — Time per Resolution',
    programName: 'ComingSoon.js'
  },
  '/suggested-actions-depository': {
    moduleName: 'Suggested Actions Depository',
    programName: 'ComingSoon.js'
  },
  '/web-suggested-actions': {
    moduleName: 'Web Suggested Actions',
    programName: 'web-suggested-actions/index.js'
  },
  '/preventive-measures': {
    moduleName: 'Preventive Measures',
    programName: 'ComingSoon.js'
  },
  '/self-service-actions': {
    moduleName: 'Self-Service Actions',
    programName: 'self-service-actions/index.js'
  },
  '/automation-target-areas': {
    moduleName: 'Potential Automation',
    programName: 'ComingSoon.js'
  },
  '/automation-preventive-alerts': {
    moduleName: 'Proactive Alerts',
    programName: 'ComingSoon.js'
  },
  '/continuous-improvements/self-diagnosis': {
    moduleName: 'Self Diagnosis',
    programName: 'ComingSoon.js'
  },
  '/continuous-improvements/improvise-mttr': {
    moduleName: 'Improvise MTTR',
    programName: 'ComingSoon.js'
  },
  '/effectiveness-occurrence': {
    moduleName: 'Effectiveness — Occurrence',
    programName: 'ComingSoon.js'
  },
  '/effectiveness-resolution-time': {
    moduleName: 'Effectiveness — Resolution Time',
    programName: 'ComingSoon.js'
  },
  '/bi-report': {
    moduleName: 'BI Report',
    programName: 'bi-report/index.js'
  },
  '/admin/roles': {
    moduleName: 'Admin — Roles',
    programName: 'admin/Roles/index.js'
  },
  '/admin/users': {
    moduleName: 'Admin — Users',
    programName: 'admin/Users/index.js'
  },
  '/admin/configuration': {
    moduleName: 'Admin — System Configuration',
    programName: 'admin/Configuration/index.js'
  }
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

/** Super-admin screens under `/admin/*` — skipped for automatic page-visit logs. */
export const isAdminRoutePath = (pathname = '') =>
  /^\/admin(\/|$)/i.test(normalizePath(pathname));

/**
 * Resolves module_name and program_name for the current route.
 * Matches the longest configured path prefix first (handles nested routes).
 */
export const getLogMetaFromPath = (pathname = '') => {
  const normalized = normalizePath(pathname);
  const keys = Object.keys(PATH_LOG_CONFIG).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (normalized === key || (key !== '/' && normalized.startsWith(`${key}/`))) {
      return PATH_LOG_CONFIG[key];
    }
  }

  const segment = normalized.split('/').filter(Boolean).pop() || 'home';
  const pageName = toTitleCase(segment);
  return {
    moduleName: pageName || 'Unknown Module',
    programName: `${segment}.js`
  };
};

export const sendAppLog = async ({
  pathname = typeof window !== 'undefined' ? window.location.pathname : '/',
  user = getStoredUser()?.email ,
  logType = 'I',
  content = ''
}) => {
  const { moduleName, programName } = getLogMetaFromPath(pathname);
  const payload = {
    module_name: moduleName,
    program_name: programName,
    user,
    log_type: logType,
    content
  };

  try {
    const response = await fetch(logApiURL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      keepalive: true
    });

    if (!response.ok) {
      throw new Error(`Log API returned ${response.status}`);
    }

    return true;
  } catch (error) {
    // Fallback for browsers/CORS edge cases; do not block primary app flow.
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const sent = navigator.sendBeacon(
        logApiURL,
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      );
      if (sent) {
        return true;
      }
    }

    console.error('Failed to send app log:', error, payload);
    return false;
  }
};
