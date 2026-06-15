// For local development, use: http://localhost:8000/api
// export const baseURL = 'http://localhost:8000/api'
export const baseURL = 'https://api.bainocular.seleccionconsulting.com/api'
export const logApiURL = 'https://api.bainocular.seleccionconsulting.com/log';
export const systemMonitoringHistoryURL = 'https://api.bainocular.seleccionconsulting.com/api/history';

/** File Upload endpoint */
export const fileUploadURL = 'https://api.bainocular.seleccionconsulting.com/process_file_replace';

/** Classification records endpoint */
export const classificationRecordsURL = 'https://api.bainocular.seleccionconsulting.com/v1/classification/records';

/** Classification sentence endpoint – classify a single sentence */
export const classificationSentenceURL = 'https://api.bainocular.seleccionconsulting.com/v1/classification/sentence';

/** Problem description endpoint – generates summary from raw request text */
export const vectorizerProblemDescriptionURL =
  'https://api.bainocular.seleccionconsulting.com/get-problem-description';

/** Similar tickets / KEDB query */
export const vectorizerSimilarTicketsURL =
  'https://api.bainocular.seleccionconsulting.com/v3/lux/similar-tickets/query';

/** Context search — KEDB image + text query */
export const contextSearchQueryURL =
  'https://api.bainocular.seleccionconsulting.com/context-search/query';

/** Legacy power search endpoint */
export const powerSearchURL = 'https://api.bainocular.seleccionconsulting.com/power-search';

/** AI Power Search (session-aware) — used by Web Suggested Actions */
export const aiPowerSearchURL = 'https://api.bainocular.seleccionconsulting.com/ai-power-search';

/** AI Power Search image upload — used by Web Suggested Actions */
export const aiPowerSearchImageURL = 'https://api.bainocular.seleccionconsulting.com/chat-image';

/** Background Job Monitoring – base URL; job list feed at `backgroundJobMonitorFeedURL` */
export const backgroundJobMonitorBaseURL = 'https://api.bainocular.seleccionconsulting.com';

export const backgroundJobMonitorFeedURL = `${backgroundJobMonitorBaseURL}/background-jobs`;

/** Failed IDOC Monitoring feed */
export const failedIdocMonitorFeedURL = `${backgroundJobMonitorBaseURL}/failed-idocs`;

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