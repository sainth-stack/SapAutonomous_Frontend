/** SapAutonomous API hosts */
const PROD_API_HOST = 'http://18.143.150.140:4001';
const DEV_API_HOST = 'http://18.143.150.140:4001';

/** Dev API when app runs on localhost or a hostname containing "dev". */
function isDevEnvironment() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host.includes('dev') || host === 'localhost' || host === '127.0.0.1';
}

const apiHost = isDevEnvironment() ? DEV_API_HOST : PROD_API_HOST;

export const baseURL = `${apiHost}/api`;
export const logApiURL = `${apiHost}/log`;

/** Background Job Monitoring */
export const backgroundJobMonitorFeedURL = `${apiHost}/background-jobs`;

/** Failed IDOC Monitoring */
export const failedIdocMonitorFeedURL = `${apiHost}/failed-idocs`;
export const retriggerIdocsURL = `${apiHost}/retrigger-idocs`;
export const retriggerBulkIdocsURL = `${apiHost}/retrigger-bulk-idocs`;

/** Job & Failed IDOC configuration (used by monitoring pages) */
export const configurationJobsURL = `${baseURL}/configuration/jobs`;
export const configurationFailedIdocsURL = `${baseURL}/configuration/failed-idocs`;
export const configurationGlobalIntervalsURL = `${baseURL}/configuration/global-intervals`;

/** AI Power Search (Failed IDocs SearchModal) */
export const aiPowerSearchURL = `${apiHost}/ai-power-search`;

/** User activity logs — supports from_date / to_date query params (YYYY-MM-DD) */
export const userActivityURL = `${apiHost}/download_user_activity`;
