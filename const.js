// For local development, use: http://localhost:8000/api
export const baseURL = 'http://localhost:8000/api'
// export const baseURL = 'https://api.bainocular.seleccionconsulting.com/api'
export const logApiURL = 'https://bainocular-log-api.cfapps.us10-001.hana.ondemand.com/log';
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

/** Power search endpoint */
export const powerSearchURL = 'https://api.bainocular.seleccionconsulting.com/power-search';

/** Background Job Monitoring – base URL; job list feed at `backgroundJobMonitorFeedURL` */
export const backgroundJobMonitorBaseURL = 'https://api.bainocular.seleccionconsulting.com';

export const backgroundJobMonitorFeedURL = `${backgroundJobMonitorBaseURL}/background-jobs`;

/** Job & Application configuration CRUD (same host as `baseURL`) */
export const configurationJobsURL = `${baseURL}/configuration/jobs`;
export const configurationApplicationsURL = `${baseURL}/configuration/applications`;
export const configurationGlobalIntervalsURL = `${baseURL}/configuration/global-intervals`;
export const sendEmailNotificationURL = `${baseURL}/configuration/send-email`;