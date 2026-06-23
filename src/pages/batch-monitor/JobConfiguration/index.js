import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  message,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Popconfirm,
  Typography,
  Space,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  configurationJobsURL,
  configurationApplicationsURL,
  configurationFailedIdocsURL,
  configurationGlobalIntervalsURL,
  sendEmailNotificationURL,
} from "../../../const";
import "../../admin/common.css";
import "./index.css";

dayjs.extend(customParseFormat);

const { Text } = Typography;

const DATE_FMT = "DD/MM/YYYY, HH:mm:ss";

const defaultPeriodStartDayjs = () => dayjs();
const defaultPeriodEndDayjs = () =>
  dayjs().hour(23).minute(59).second(59).millisecond(999);

const parseJobDate = (str) => {
  if (!str || typeof str !== "string") return null;
  const parsed = dayjs(str, DATE_FMT, true);
  if (parsed.isValid()) return parsed;
  const loose = dayjs(str);
  return loose.isValid() ? loose : null;
};

const formatJobDate = (v) =>
  dayjs.isDayjs(v) && v.isValid() ? v.format(DATE_FMT) : String(v || "");

const APP_STATUS_OPTIONS = [
  { value: "RUNNING", label: "Running" },
  { value: "STOPPED", label: "Stopped" },
  { value: "DEGRADED", label: "Degraded" },
  { value: "UNKNOWN", label: "Unknown" },
];

const JobConfiguration = () => {
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appConfigLoading, setAppConfigLoading] = useState(true);
  const [appConfigError, setAppConfigError] = useState(null);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobEditingId, setJobEditingId] = useState(null);
  const [jobSubmitting, setJobSubmitting] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [appEditingId, setAppEditingId] = useState(null);
  const [appSubmitting, setAppSubmitting] = useState(false);
  const [jobIntervalCommon, setJobIntervalCommon] = useState("");
  const [appIntervalCommon, setAppIntervalCommon] = useState("");
  const [failedIdocIntervalCommon, setFailedIdocIntervalCommon] = useState("3");
  const [globalIntervalsLoading, setGlobalIntervalsLoading] = useState(true);
  const [savingJobInterval, setSavingJobInterval] = useState(false);
  const [savingAppInterval, setSavingAppInterval] = useState(false);
  const [savingFailedIdocInterval, setSavingFailedIdocInterval] = useState(false);
  const [failedIdocs, setFailedIdocs] = useState([]);
  const [failedIdocLoading, setFailedIdocLoading] = useState(true);
  const [failedIdocError, setFailedIdocError] = useState(null);
  const [failedIdocModalOpen, setFailedIdocModalOpen] = useState(false);
  const [failedIdocEditingId, setFailedIdocEditingId] = useState(null);
  const [failedIdocSubmitting, setFailedIdocSubmitting] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const [jobForm] = Form.useForm();
  const [applicationForm] = Form.useForm();
  const [failedIdocForm] = Form.useForm();

  const applicationStatusOptions = useMemo(() => {
    const map = new Map(APP_STATUS_OPTIONS.map((o) => [o.value, { ...o }]));
    applications.forEach((a) => {
      const s = (a.status || "").trim();
      if (s && !map.has(s)) map.set(s, { value: s, label: s });
    });
    return Array.from(map.values());
  }, [applications]);

  const syncJobFormWhenModalOpens = useCallback(
    (open) => {
      if (!open) return;
      if (jobEditingId == null) {
        jobForm.setFieldsValue({
          jobName: "",
          system: "",
          periodStart: defaultPeriodStartDayjs(),
          periodEnd: defaultPeriodEndDayjs(),
        });
      } else {
        const job = jobs.find((j) => j.id === jobEditingId);
        if (job) {
          jobForm.setFieldsValue({
            jobName: job.jobName,
            system: job.system,
            periodStart: parseJobDate(job.periodStart) || defaultPeriodStartDayjs(),
            periodEnd: parseJobDate(job.periodEnd) || defaultPeriodEndDayjs(),
          });
        }
      }
    },
    [jobEditingId, jobs, jobForm]
  );

  const syncApplicationFormWhenModalOpens = useCallback(
    (open) => {
      if (!open) return;
      if (appEditingId == null) {
        applicationForm.setFieldsValue({
          appName: "",
          status: undefined,
          details: "",
        });
      } else {
        const app = applications.find((a) => a.id === appEditingId);
        if (app) {
          applicationForm.setFieldsValue({
            appName: app.app_name ?? "",
            status: app.status || undefined,
            details: app.details ?? "",
          });
        }
      }
    },
    [appEditingId, applications, applicationForm]
  );

  const syncFailedIdocFormWhenModalOpens = useCallback(
    (open) => {
      if (!open) return;
      if (failedIdocEditingId == null) {
        failedIdocForm.setFieldsValue({
          messageType: "",
          sender: "",
          receiver: "",
          details: "",
        });
      } else {
        const row = failedIdocs.find((f) => f.id === failedIdocEditingId);
        if (row) {
          failedIdocForm.setFieldsValue({
            messageType: row.message_type ?? "",
            sender: row.sender ?? "",
            receiver: row.receiver ?? "",
            details: row.details ?? "",
          });
        }
      }
    },
    [failedIdocEditingId, failedIdocs, failedIdocForm]
  );

  const openCreateJob = () => {
    setJobEditingId(null);
    setJobModalOpen(true);
  };

  const openEditJob = (job) => {
    setJobEditingId(job.id);
    setJobModalOpen(true);
  };

  const fetchJobs = useCallback(async () => {
    try {
      setJobsLoading(true);
      setJobsError(null);
      const res = await fetch(configurationJobsURL);
      if (!res.ok) throw new Error("Failed to load job configuration");
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];
      setJobs(
        rows.map((row) => ({
          id: row.id,
          jobName: row.job_name ?? "",
          system: row.system ?? "",
          periodStart: row.period_start ?? "",
          periodEnd: row.period_end ?? "",
        }))
      );
    } catch (err) {
      setJobsError(err.message || "Failed to load job configuration");
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const onJobSubmit = async (values) => {
    setJobSubmitting(true);
    try {
      const start = dayjs(values.periodStart);
      const end = dayjs(values.periodEnd);
      if (start.isValid() && end.isValid() && end.isBefore(start)) {
        message.error("Period end cannot be before period start.");
        return;
      }
      const body = JSON.stringify({
        job_name: values.jobName.trim(),
        system: values.system.trim(),
        period_start: formatJobDate(values.periodStart),
        period_end: formatJobDate(values.periodEnd),
      });
      const url =
        jobEditingId != null
          ? `${configurationJobsURL}/${jobEditingId}`
          : configurationJobsURL;
      const method = jobEditingId != null ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || res.statusText || "Request failed");
      }
      message.success(
        jobEditingId != null
          ? "Job configuration updated."
          : "Job configuration created."
      );
      setJobModalOpen(false);
      jobForm.resetFields();
      await fetchJobs();
    } catch (e) {
      message.error(e.message || "Could not save job configuration");
    } finally {
      setJobSubmitting(false);
    }
  };

  const removeJob = async (id) => {
    try {
      const res = await fetch(`${configurationJobsURL}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Delete failed");
      }
      message.success("Job configuration deleted.");
      await fetchJobs();
    } catch (e) {
      message.error(e.message || "Could not delete job");
    }
  };

  const fetchApplicationConfig = useCallback(async () => {
    try {
      setAppConfigLoading(true);
      setAppConfigError(null);
      const res = await fetch(configurationApplicationsURL);
      if (!res.ok) throw new Error("Failed to load application configuration");
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];
      setApplications(
        rows.map((row) => ({
          id: row.id,
          app_name: row.app_name ?? "",
          status: row.status ?? "",
          details: row.details ?? "",
        }))
      );
    } catch (err) {
      setAppConfigError(err.message || "Failed to load application configuration");
      setApplications([]);
    } finally {
      setAppConfigLoading(false);
    }
  }, []);

  const openCreateApplication = () => {
    setAppEditingId(null);
    setAppModalOpen(true);
  };

  const openEditApplication = (app) => {
    setAppEditingId(app.id);
    setAppModalOpen(true);
  };

  const onApplicationSubmit = async (values) => {
    setAppSubmitting(true);
    try {
      const body = JSON.stringify({
        app_name: values.appName.trim(),
        status: (values.status || "").trim(),
        details: (values.details || "").trim(),
      });
      const url =
        appEditingId != null
          ? `${configurationApplicationsURL}/${appEditingId}`
          : configurationApplicationsURL;
      const method = appEditingId != null ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || res.statusText || "Request failed");
      }
      message.success(
        appEditingId != null ? "Application updated." : "Application added."
      );
      setAppModalOpen(false);
      applicationForm.resetFields();
      await fetchApplicationConfig();
    } catch (e) {
      message.error(e.message || "Could not save application");
    } finally {
      setAppSubmitting(false);
    }
  };

  const removeApplication = async (id) => {
    try {
      const res = await fetch(`${configurationApplicationsURL}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Delete failed");
      }
      message.success("Application deleted.");
      await fetchApplicationConfig();
    } catch (e) {
      message.error(e.message || "Could not delete application");
    }
  };

  const fetchFailedIdocConfig = useCallback(async () => {
    try {
      setFailedIdocLoading(true);
      setFailedIdocError(null);
      const res = await fetch(configurationFailedIdocsURL);
      if (!res.ok) throw new Error("Failed to load Failed IDOC configuration");
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];
      setFailedIdocs(
        rows.map((row) => ({
          id: row.id,
          message_type: row.message_type ?? "",
          sender: row.sender ?? "",
          receiver: row.receiver ?? "",
          details: row.details ?? "",
        }))
      );
    } catch (err) {
      setFailedIdocError(err.message || "Failed to load Failed IDOC configuration");
      setFailedIdocs([]);
    } finally {
      setFailedIdocLoading(false);
    }
  }, []);

  const openCreateFailedIdoc = () => {
    setFailedIdocEditingId(null);
    setFailedIdocModalOpen(true);
  };

  const openEditFailedIdoc = (row) => {
    setFailedIdocEditingId(row.id);
    setFailedIdocModalOpen(true);
  };

  const onFailedIdocSubmit = async (values) => {
    setFailedIdocSubmitting(true);
    try {
      const body = JSON.stringify({
        message_type: values.messageType.trim(),
        sender: (values.sender || "").trim(),
        receiver: (values.receiver || "").trim(),
        details: (values.details || "").trim(),
      });
      const url =
        failedIdocEditingId != null
          ? `${configurationFailedIdocsURL}/${failedIdocEditingId}`
          : configurationFailedIdocsURL;
      const method = failedIdocEditingId != null ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || res.statusText || "Request failed");
      }
      message.success(
        failedIdocEditingId != null
          ? "Failed IDOC configuration updated."
          : "Failed IDOC configuration created."
      );
      setFailedIdocModalOpen(false);
      failedIdocForm.resetFields();
      await fetchFailedIdocConfig();
    } catch (e) {
      message.error(e.message || "Could not save Failed IDOC configuration");
    } finally {
      setFailedIdocSubmitting(false);
    }
  };

  const removeFailedIdoc = async (id) => {
    try {
      const res = await fetch(`${configurationFailedIdocsURL}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Delete failed");
      }
      message.success("Failed IDOC configuration deleted.");
      await fetchFailedIdocConfig();
    } catch (e) {
      message.error(e.message || "Could not delete Failed IDOC configuration");
    }
  };

  const fetchGlobalIntervals = useCallback(async () => {
    try {
      setGlobalIntervalsLoading(true);
      const res = await fetch(configurationGlobalIntervalsURL);
      if (!res.ok) throw new Error("Failed to load interval settings");
      const data = await res.json();
      setJobIntervalCommon(data.job_interval_time ?? "");
      setAppIntervalCommon(data.application_interval_time ?? "");
      setFailedIdocIntervalCommon(data.failed_idoc_interval_time ?? "3");
    } catch {
      setJobIntervalCommon("");
      setAppIntervalCommon("");
      setFailedIdocIntervalCommon("3");
    } finally {
      setGlobalIntervalsLoading(false);
    }
  }, []);

  const persistGlobalIntervals = async (nextJob, nextApp, nextFailedIdoc) => {
    const res = await fetch(configurationGlobalIntervalsURL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_interval_time: (nextJob ?? "").trim(),
        application_interval_time: (nextApp ?? "").trim(),
        failed_idoc_interval_time: (nextFailedIdoc ?? "3").trim(),
      }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.detail || res.statusText || "Save failed");
    }
    const data = await res.json();
    setJobIntervalCommon(data.job_interval_time ?? "");
    setAppIntervalCommon(data.application_interval_time ?? "");
    setFailedIdocIntervalCommon(data.failed_idoc_interval_time ?? "3");
  };

  const saveJobSectionInterval = async () => {
    setSavingJobInterval(true);
    try {
      await persistGlobalIntervals(jobIntervalCommon, appIntervalCommon, failedIdocIntervalCommon);
      message.success("Interval time saved for job monitoring.");
    } catch (e) {
      message.error(e.message || "Could not save interval time");
    } finally {
      setSavingJobInterval(false);
    }
  };

  const saveAppSectionInterval = async () => {
    setSavingAppInterval(true);
    try {
      await persistGlobalIntervals(jobIntervalCommon, appIntervalCommon, failedIdocIntervalCommon);
      message.success("Interval time saved for application monitoring.");
    } catch (e) {
      message.error(e.message || "Could not save interval time");
    } finally {
      setSavingAppInterval(false);
    }
  };

  const saveFailedIdocSectionInterval = async () => {
    setSavingFailedIdocInterval(true);
    try {
      await persistGlobalIntervals(jobIntervalCommon, appIntervalCommon, failedIdocIntervalCommon);
      message.success("Interval time saved for Failed IDOC monitoring.");
    } catch (e) {
      message.error(e.message || "Could not save interval time");
    } finally {
      setSavingFailedIdocInterval(false);
    }
  };

  const sendEmailNotification = async () => {
    if (!emailRecipient.trim()) {
      message.error("Please enter an email recipient");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRecipient.trim())) {
      message.error("Please enter a valid email address");
      return;
    }

    setSendingEmail(true);
    try {
      const res = await fetch(sendEmailNotificationURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: emailRecipient.trim(),
        }),
      });
      
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || res.statusText || "Failed to send email");
      }
      
      message.success("Email notification sent successfully");
      setEmailRecipient("");
    } catch (e) {
      message.error(e.message || "Could not send email notification");
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchApplicationConfig();
  }, [fetchApplicationConfig]);

  useEffect(() => {
    fetchFailedIdocConfig();
  }, [fetchFailedIdocConfig]);

  useEffect(() => {
    fetchGlobalIntervals();
  }, [fetchGlobalIntervals]);

  return (
    <div className="admin-page-container job-config-page">
      <div className="admin-page-content">
        {/* <div className="header-section">
          <h1 className="page-title">Email Notification</h1>
          <p className="page-subtitle">
            Send email notifications for job and application configuration updates
          </p>
        </div>

        <div className="job-config-section-interval" style={{ marginBottom: "2rem" }}>
          <label className="job-config-section-interval-label" htmlFor="email-recipient">
            Email Recipient
          </label>
          <Input
            id="email-recipient"
            allowClear
            placeholder="Enter email address"
            value={emailRecipient}
            onChange={(e) => setEmailRecipient(e.target.value)}
            className="job-config-section-interval-input"
            type="email"
          />
          <Button
            type="primary"
            loading={sendingEmail}
            onClick={sendEmailNotification}
          >
            Send Email
          </Button>
        </div> */}

        <div className="header-section" style={{ marginTop: "2rem" }}>
          <h1 className="page-title">Job Configuration</h1>
          <p className="page-subtitle">
            Configure background jobs: Job Name, System, and Time Period (Start & End). Interval time below applies to all jobs in this section.
          </p>
        </div>

        <div className="job-config-section-interval">
          <label className="job-config-section-interval-label" htmlFor="job-interval-common">
            Interval time
          </label>
          <Input
            id="job-interval-common"
            allowClear
            placeholder="e.g. 15m, 1h — shared for all jobs"
            value={jobIntervalCommon}
            onChange={(e) => setJobIntervalCommon(e.target.value)}
            disabled={globalIntervalsLoading}
            className="job-config-section-interval-input"
          />
          <Button
            type="primary"
            loading={savingJobInterval}
            disabled={globalIntervalsLoading}
            onClick={saveJobSectionInterval}
          >
            Save
          </Button>
        </div>

        <div className="admin-toolbar">
          <button type="button" className="admin-btn primary" onClick={openCreateJob}>
            Add Job
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table job-config-table">
            <thead>
              <tr>
                <th>Job Name</th>
                <th>System</th>
                <th colSpan={2} className="job-config-time-period-header">Time Period</th>
                <th className="admin-th-actions">Actions</th>
              </tr>
              <tr className="job-config-period-subhead">
                <th></th>
                <th></th>
                <th className="job-config-period-subhead-cell">Period Start</th>
                <th className="job-config-period-subhead-cell">Period End</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {jobsLoading ? (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    Loading job configuration…
                  </td>
                </tr>
              ) : jobsError ? (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    {jobsError}
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    No jobs configured. Add a job to get started.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="admin-td-name">{job.jobName}</td>
                    <td>{job.system}</td>
                    <td className="job-config-period-cell">{job.periodStart}</td>
                    <td className="job-config-period-cell">{job.periodEnd}</td>
                    <td className="admin-td-actions">
                      <button
                        type="button"
                        className="admin-btn link"
                        onClick={() => openEditJob(job)}
                      >
                        Edit
                      </button>
                      <Popconfirm
                        title={`Delete “${job.jobName}”?`}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => removeJob(job.id)}
                        placement="leftTop"
                      >
                        <button type="button" className="admin-btn link danger">
                          Delete
                        </button>
                      </Popconfirm>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <section className="job-config-app-section" aria-label="Application configuration">
          <div className="header-section">
            <h2 className="page-title">Application configuration</h2>
            <p className="page-subtitle">
              Monitor and manage applications: name, status, and notification details. Interval time below applies to all applications in this section.
            </p>
          </div>

          <div className="job-config-section-interval">
            <label className="job-config-section-interval-label" htmlFor="app-interval-common">
              Interval time
            </label>
            <Input
              id="app-interval-common"
              allowClear
              placeholder="e.g. 5m — shared for all applications"
              value={appIntervalCommon}
              onChange={(e) => setAppIntervalCommon(e.target.value)}
              disabled={globalIntervalsLoading}
              className="job-config-section-interval-input"
            />
            <Button
              type="primary"
              loading={savingAppInterval}
              disabled={globalIntervalsLoading}
              onClick={saveAppSectionInterval}
            >
              Save
            </Button>
          </div>

          <div className="admin-toolbar">
            <button
              type="button"
              className="admin-btn primary"
              onClick={openCreateApplication}
            >
              Add Application
            </button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table job-config-app-table">
              <thead>
                <tr>
                  <th>Application name</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th className="admin-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appConfigLoading ? (
                  <tr>
                    <td colSpan={4} className="admin-empty">
                      Loading application data…
                    </td>
                  </tr>
                ) : appConfigError ? (
                  <tr>
                    <td colSpan={4} className="admin-empty">
                      {appConfigError}
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-empty">
                      No applications configured. Add an application to get started.
                    </td>
                  </tr>
                ) : (
                  applications.map((row) => (
                    <tr key={row.id}>
                      <td className="admin-td-name">{row.app_name || "—"}</td>
                      <td>
                        <span
                          className={
                            (row.status || "").toUpperCase() === "STOPPED"
                              ? "job-config-app-status-stopped"
                              : ""
                          }
                        >
                          {row.status || "—"}
                        </span>
                      </td>
                      <td>{row.details || "—"}</td>
                      <td className="admin-td-actions">
                        <button
                          type="button"
                          className="admin-btn link"
                          onClick={() => openEditApplication(row)}
                        >
                          Edit
                        </button>
                        <Popconfirm
                          title={`Delete “${row.app_name || "this application"}”?`}
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => removeApplication(row.id)}
                          placement="leftTop"
                        >
                          <button type="button" className="admin-btn link danger">
                            Delete
                          </button>
                        </Popconfirm>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="job-config-app-section" aria-label="Failed IDOC configuration">
          <div className="header-section">
            <h2 className="page-title">Failed IDOC Configuration</h2>
            <p className="page-subtitle">
              Configure Failed IDOC monitoring: message type, sender, receiver, and notification details. Interval time below applies to all Failed IDOC entries in this section.
            </p>
          </div>

          <div className="job-config-section-interval">
            <label className="job-config-section-interval-label" htmlFor="failed-idoc-interval-common">
              Interval time
            </label>
            <Input
              id="failed-idoc-interval-common"
              allowClear
              placeholder="e.g. 3m — shared for all Failed IDOCs"
              value={failedIdocIntervalCommon}
              onChange={(e) => setFailedIdocIntervalCommon(e.target.value)}
              disabled={globalIntervalsLoading}
              className="job-config-section-interval-input"
            />
            <Button
              type="primary"
              loading={savingFailedIdocInterval}
              disabled={globalIntervalsLoading}
              onClick={saveFailedIdocSectionInterval}
            >
              Save
            </Button>
          </div>

          <div className="admin-toolbar">
            <button
              type="button"
              className="admin-btn primary"
              onClick={openCreateFailedIdoc}
            >
              Add Failed IDOC
            </button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table job-config-app-table">
              <thead>
                <tr>
                  <th>Message Type</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Details</th>
                  <th className="admin-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {failedIdocLoading ? (
                  <tr>
                    <td colSpan={5} className="admin-empty">
                      Loading Failed IDOC configuration…
                    </td>
                  </tr>
                ) : failedIdocError ? (
                  <tr>
                    <td colSpan={5} className="admin-empty">
                      {failedIdocError}
                    </td>
                  </tr>
                ) : failedIdocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-empty">
                      No Failed IDOCs configured. Add a Failed IDOC to get started.
                    </td>
                  </tr>
                ) : (
                  failedIdocs.map((row) => (
                    <tr key={row.id}>
                      <td className="admin-td-name">{row.message_type || "—"}</td>
                      <td>{row.sender || "—"}</td>
                      <td>{row.receiver || "—"}</td>
                      <td>{row.details || "—"}</td>
                      <td className="admin-td-actions">
                        <button
                          type="button"
                          className="admin-btn link"
                          onClick={() => openEditFailedIdoc(row)}
                        >
                          Edit
                        </button>
                        <Popconfirm
                          title={`Delete “${row.message_type || "this Failed IDOC"}”?`}
                          okText="Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => removeFailedIdoc(row.id)}
                          placement="leftTop"
                        >
                          <button type="button" className="admin-btn link danger">
                            Delete
                          </button>
                        </Popconfirm>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <Modal
          title={
            <div className="job-config-modal-title">
              <span className="job-config-modal-heading">
                {jobEditingId != null ? "Edit job" : "Add job"}
              </span>
              <Text type="secondary" className="job-config-modal-subtitle">
                SAP background job path, target system, and the monitoring time window.
              </Text>
            </div>
          }
          open={jobModalOpen}
          onCancel={() => {
            setJobModalOpen(false);
            jobForm.resetFields();
          }}
          afterOpenChange={syncJobFormWhenModalOpens}
          destroyOnClose
          width={560}
          className="job-config-modal"
          footer={null}
          maskClosable={false}
        >
          <Form
            form={jobForm}
            layout="vertical"
            requiredMark="optional"
            size="middle"
            className="job-config-form"
            onFinish={onJobSubmit}
          >
            <Form.Item
              name="jobName"
              label="Job name"
              extra="Technical job or report name as registered in SAP (e.g. CDC health check)."
              rules={[
                { required: true, message: "Enter a job name" },
                { whitespace: true, message: "Job name cannot be only spaces" },
                { max: 256, message: "Use at most 256 characters" },
              ]}
            >
              <Input allowClear placeholder="/1DH/CDC_HEALTH_CHECK" autoComplete="off" />
            </Form.Item>
            <Form.Item
              name="system"
              label="System"
              extra="Landscape or instance this job runs against."
              rules={[
                { required: true, message: "Enter a system" },
                { whitespace: true, message: "System cannot be only spaces" },
                { max: 128, message: "Use at most 128 characters" },
              ]}
            >
              <Input allowClear placeholder="S4 Hana" autoComplete="off" />
            </Form.Item>
            <Form.Item
              name="periodStart"
              label="Period start"
              extra="Start of the window used for monitoring and reporting."
              rules={[{ required: true, message: "Select period start" }]}
            >
              <DatePicker
                showTime
                format={DATE_FMT}
                style={{ width: "100%" }}
                placeholder="Select date and time"
              />
            </Form.Item>
            <Form.Item
              name="periodEnd"
              label="Period end"
              extra="End of the monitoring window (must be after start)."
              rules={[{ required: true, message: "Select period end" }]}
            >
              <DatePicker
                showTime
                format={DATE_FMT}
                style={{ width: "100%" }}
                placeholder="Select date and time"
              />
            </Form.Item>
            <div className="job-config-form-footer">
              <Space>
                <Button
                  onClick={() => {
                    setJobModalOpen(false);
                    jobForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={jobSubmitting}>
                  {jobEditingId != null ? "Save changes" : "Create job"}
                </Button>
              </Space>
            </div>
          </Form>
        </Modal>

        <Modal
          title={
            <div className="job-config-modal-title">
              <span className="job-config-modal-heading">
                {appEditingId != null ? "Edit application" : "Add application"}
              </span>
              <Text type="secondary" className="job-config-modal-subtitle">
                Application identity, operational status, and contact or routing details for alerts.
              </Text>
            </div>
          }
          open={appModalOpen}
          onCancel={() => {
            setAppModalOpen(false);
            applicationForm.resetFields();
          }}
          afterOpenChange={syncApplicationFormWhenModalOpens}
          destroyOnClose
          width={560}
          className="job-config-modal"
          footer={null}
          maskClosable={false}
        >
          <Form
            form={applicationForm}
            layout="vertical"
            requiredMark="optional"
            size="middle"
            className="job-config-form"
            onFinish={onApplicationSubmit}
          >
            <Form.Item
              name="appName"
              label="Application name"
              extra="Service or API identifier as reported by monitoring (e.g. expense-tool-api)."
              rules={[
                { required: true, message: "Enter an application name" },
                { whitespace: true, message: "Name cannot be only spaces" },
                { max: 128, message: "Use at most 128 characters" },
              ]}
            >
              <Input allowClear placeholder="expense-tool-api" autoComplete="off" />
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              extra="Current health or lifecycle state. Values from the feed appear automatically in the list."
              rules={[
                { required: true, message: "Select a status" },
                { max: 64, message: "Use at most 64 characters" },
              ]}
            >
              <Select
                allowClear
                showSearch
                placeholder="Select status"
                options={applicationStatusOptions}
                optionFilterProp="label"
                popupClassName="job-config-select-dropdown"
              />
            </Form.Item>
            <Form.Item
              name="details"
              label="Details"
              extra="Notification target, runbook link, or short description."
              rules={[{ max: 500, message: "Use at most 500 characters" }]}
            >
              <Input.TextArea
                rows={3}
                allowClear
                placeholder="e.g. on-call email or escalation note"
                showCount
                maxLength={500}
              />
            </Form.Item>
            <div className="job-config-form-footer">
              <Space>
                <Button
                  onClick={() => {
                    setAppModalOpen(false);
                    applicationForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={appSubmitting}>
                  {appEditingId != null ? "Save changes" : "Add application"}
                </Button>
              </Space>
            </div>
          </Form>
        </Modal>

        <Modal
          title={
            <div className="job-config-modal-title">
              <span className="job-config-modal-heading">
                {failedIdocEditingId != null ? "Edit Failed IDOC" : "Add Failed IDOC"}
              </span>
              <Text type="secondary" className="job-config-modal-subtitle">
                Message type, sender/receiver partners, and contact or routing details for Failed IDOC alerts.
              </Text>
            </div>
          }
          open={failedIdocModalOpen}
          onCancel={() => {
            setFailedIdocModalOpen(false);
            failedIdocForm.resetFields();
          }}
          afterOpenChange={syncFailedIdocFormWhenModalOpens}
          destroyOnClose
          width={560}
          className="job-config-modal"
          footer={null}
          maskClosable={false}
        >
          <Form
            form={failedIdocForm}
            layout="vertical"
            requiredMark="optional"
            size="middle"
            className="job-config-form"
            onFinish={onFailedIdocSubmit}
          >
            <Form.Item
              name="messageType"
              label="Message type"
              extra="IDOC message type to monitor (e.g. ORDERS, INVOIC)."
              rules={[
                { required: true, message: "Enter a message type" },
                { whitespace: true, message: "Message type cannot be only spaces" },
                { max: 256, message: "Use at most 256 characters" },
              ]}
            >
              <Input allowClear placeholder="ORDERS" autoComplete="off" />
            </Form.Item>
            <Form.Item
              name="sender"
              label="Sender"
              extra="Sender partner (optional — leave blank to match any sender)."
              rules={[{ max: 256, message: "Use at most 256 characters" }]}
            >
              <Input allowClear placeholder="SAPCLNT100" autoComplete="off" />
            </Form.Item>
            <Form.Item
              name="receiver"
              label="Receiver"
              extra="Receiver partner (optional — leave blank to match any receiver)."
              rules={[{ max: 256, message: "Use at most 256 characters" }]}
            >
              <Input allowClear placeholder="PARTNER01" autoComplete="off" />
            </Form.Item>
            <Form.Item
              name="details"
              label="Details"
              extra="Notification target, runbook link, or short description."
              rules={[{ max: 500, message: "Use at most 500 characters" }]}
            >
              <Input.TextArea
                rows={3}
                allowClear
                placeholder="e.g. on-call email or escalation note"
                showCount
                maxLength={500}
              />
            </Form.Item>
            <div className="job-config-form-footer">
              <Space>
                <Button
                  onClick={() => {
                    setFailedIdocModalOpen(false);
                    failedIdocForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={failedIdocSubmitting}>
                  {failedIdocEditingId != null ? "Save changes" : "Add Failed IDOC"}
                </Button>
              </Space>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default JobConfiguration;
