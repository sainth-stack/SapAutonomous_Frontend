// export const baseURL = 'https://backend-ams-fastapi.cfapps.us10-001.hana.ondemand.com/api'
export const baseURL = 'http://localhost:8000/api'
export const logApiURL = 'https://bainocular-log-api.cfapps.us10-001.hana.ondemand.com/log';

export const systemMonitoringHistoryURL = 'https://ans-webhook-happy-civet-oc.cfapps.us10-001.hana.ondemand.com/api/history';

/** AMS vectorizer – problem summary from raw request text (used before web search on self-monitoring) */
export const vectorizerProblemDescriptionURL =
  'https://ams-vectorizer.cfapps.us10-001.hana.ondemand.com/get-problem-description';

/** Similar tickets / KEDB query */
export const vectorizerSimilarTicketsURL =
  'https://ams-vectorizer.cfapps.us10-001.hana.ondemand.com/v3/lux/similar-tickets/query';
// Batch Monitoring (legacy – commented in favor of Background Job Monitoring)
// export const batchMonitorURL = 'https://tg-monitoring-backend.cfapps.us10-001.hana.ondemand.com/v1/automate/idoc-data/status';

/** Background Job Monitoring – base URL; job list feed at `backgroundJobMonitorFeedURL` */
export const backgroundJobMonitorBaseURL = 'https://jobprocessmonitor-balanced-chipmunk-cq.cfapps.us10-001.hana.ondemand.com';

export const backgroundJobMonitorFeedURL = `${backgroundJobMonitorBaseURL}/background-jobs`;

/** Job & Application configuration CRUD (same host as `baseURL`) */
export const configurationJobsURL = `${baseURL}/configuration/jobs`;
export const configurationApplicationsURL = `${baseURL}/configuration/applications`;
export const configurationGlobalIntervalsURL = `${baseURL}/configuration/global-intervals`;
export const sendEmailNotificationURL = `${baseURL}/configuration/send-email`;