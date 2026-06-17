const PROD_API_HOST = 'https://api.bainocular.seleccionconsulting.com';
const DEV_API_HOST = 'https://api-dev.bainocular.seleccionconsulting.com';

/** Dev API when app runs on localhost or a hostname containing "dev". */
function isDevEnvironment() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host.includes('dev') || host === 'localhost' || host === '127.0.0.1';
}

const apiHost = isDevEnvironment() ? DEV_API_HOST : PROD_API_HOST;

export const baseURL = `${apiHost}/api`;
export const logApiURL = `${apiHost}/log`;

/** Default password assigned to new users — triggers mandatory reset on login */
export const DEFAULT_USER_PASSWORD = 'Bainocular@123';

/** Admin reset password endpoint */
export const adminResetPasswordURL = `${baseURL}/admin/reset-password`;

export const systemMonitoringHistoryURL = `${baseURL}/history`;

/** File Upload endpoint */
export const fileUploadURL = `${apiHost}/process_file_replace`;

/** Classification records endpoint */
export const classificationRecordsURL = `${apiHost}/v1/classification/records`;

/** Classification sentence endpoint – classify a single sentence */
export const classificationSentenceURL = `${apiHost}/v1/classification/sentence`;

/** Problem description endpoint – generates summary from raw request text */
export const vectorizerProblemDescriptionURL = `${apiHost}/get-problem-description`;

/** Similar tickets / KEDB query */
export const vectorizerSimilarTicketsURL = `${apiHost}/v3/lux/similar-tickets/query`;

/** Context search — KEDB image + text query */
export const contextSearchQueryURL = `${apiHost}/context-search/query`;

/** Legacy power search endpoint */
export const powerSearchURL = `${apiHost}/power-search`;

/** AI Power Search (session-aware) — used by Web Suggested Actions */
export const aiPowerSearchURL = `${apiHost}/ai-power-search`;

/** AI Power Search image upload — used by Web Suggested Actions */
export const aiPowerSearchImageURL = `${apiHost}/chat-image`;

/** Background Job Monitoring – base URL; job list feed at `backgroundJobMonitorFeedURL` */
export const backgroundJobMonitorBaseURL = apiHost;

export const backgroundJobMonitorFeedURL = `${apiHost}/background-jobs`;

/** Failed IDOC Monitoring feed */
export const failedIdocMonitorFeedURL = `${apiHost}/failed-idocs`;

/** Job & Application configuration CRUD (same host as `baseURL`) */
export const configurationJobsURL = `${baseURL}/configuration/jobs`;
export const configurationApplicationsURL = `${baseURL}/configuration/applications`;
export const configurationGlobalIntervalsURL = `${baseURL}/configuration/global-intervals`;
export const sendEmailNotificationURL = `${baseURL}/configuration/send-email`;

/** System configuration (database credentials, URLs, etc.) */
export const configurationsURL = `${baseURL}/configurations`;
export const configurationsSaveURL = `${baseURL}/configurations/save`;

/** Luxottica Helpdesk — incident detail (Manage Queue ticket link) */
export const luxotticaHelpdeskLoginUrl =
  'https://helpdesk.luxottica.com/HDAPortal/Authentication/Login?ReturnUrl=%2fHDAPortal%2f';

export function getLuxotticaTicketUrl(requestId) {
  const id = String(requestId ?? '').trim();
  if (!id) return null;
  return `${luxotticaHelpdeskLoginUrl}#/WSCView/Detail/${id}$entity=Incident`;
}
