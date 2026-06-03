import React, { useState, useEffect, useMemo, useCallback } from "react";
import { message } from "antd";
import { MdLock, MdExpandMore, MdExpandLess, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { configurationsURL, configurationsSaveURL } from "../../../const";
import { getStoredUser } from "../../../utils/authSession";
import "../common.css";
import "./index.css";

function parseAllowedValues(raw) {
  if (raw == null || raw === "") return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* not a JSON array */
  }
  return null;
}

function formatFieldLabel(name) {
  if (!name) return "";
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatGroupTitle(group) {
  return (group || "General")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function isPasswordField(field) {
  return /password/i.test(field.field_name || "");
}

function isSelectField(field) {
  const type = (field.screen_field_type || "").toLowerCase();
  return type.includes("select") || type.includes("dropdown");
}

function getValidationRegex(field) {
  if (field.validation_pattern) {
    try {
      return new RegExp(field.validation_pattern);
    } catch {
      return null;
    }
  }
  const options = parseAllowedValues(field.allowed_values);
  if (!options && typeof field.allowed_values === "string" && field.allowed_values.startsWith("^")) {
    try {
      return new RegExp(field.allowed_values);
    } catch {
      return null;
    }
  }
  return null;
}

async function loadConfigurations() {
  let res = await fetch(configurationsURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (res.status === 405 || res.status === 404) {
    res = await fetch(configurationsURL);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load configuration");
  }
  return res.json();
}

const AdminConfiguration = () => {
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const updatedBy = useMemo(() => {
    const user = getStoredUser();
    return (user?.email || user?.username || "admin@portal").trim();
  }, []);

  const groupedFields = useMemo(() => {
    const map = new Map();
    fields.forEach((field) => {
      const key = (field.field_group || "general").toLowerCase();
      if (!map.has(key)) {
        map.set(key, { key, title: formatGroupTitle(field.field_group), fields: [] });
      }
      map.get(key).fields.push(field);
    });
    return Array.from(map.values());
  }, [fields]);

  const hydrateForm = useCallback((list) => {
    const next = {};
    list.forEach((f) => {
      next[f.field_id] = f.current_value ?? "";
    });
    setValues(next);
    setInitialValues({ ...next });
    const expanded = {};
    const groups = new Set(list.map((f) => (f.field_group || "general").toLowerCase()));
    groups.forEach((g) => {
      expanded[g] = true;
    });
    setExpandedGroups(expanded);
    setVisiblePasswords({});
  }, []);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadConfigurations();
      const list = data.fields || [];
      setFields(list);
      hydrateForm(list);
    } catch (e) {
      message.error(e.message || "Failed to load configuration");
      setFields([]);
      setValues({});
      setInitialValues({});
    } finally {
      setLoading(false);
    }
  }, [hydrateForm]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setFieldValue = (fieldId, value) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const validateField = (field, value) => {
    const str = value == null ? "" : String(value).trim();
    if (field.mandatory && !str) {
      return `${formatFieldLabel(field.field_name)} is required`;
    }
    if (!str) return null;
    const regex = getValidationRegex(field);
    if (regex && !regex.test(str)) {
      return `${formatFieldLabel(field.field_name)} does not match the required format`;
    }
    const allowed = parseAllowedValues(field.allowed_values);
    if (allowed?.length && !isSelectField(field) && !allowed.includes(str)) {
      return `${formatFieldLabel(field.field_name)} must be one of the allowed values`;
    }
    return null;
  };

  const handleSave = async () => {
    const updates = [];
    for (const field of fields) {
      const current = values[field.field_id] ?? "";
      const original = initialValues[field.field_id] ?? "";
      if (String(current) === String(original)) continue;

      const err = validateField(field, current);
      if (err) {
        message.warning(err);
        return;
      }
      updates.push({
        field_id: field.field_id,
        field_value: String(current),
        updated_by: updatedBy,
      });
    }

    if (updates.length === 0) {
      message.info("No changes to save");
      return;
    }

    for (const field of fields) {
      if (field.mandatory) {
        const err = validateField(field, values[field.field_id]);
        if (err) {
          message.warning(err);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const res = await fetch(configurationsSaveURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Failed to save configuration");
      }
      if (data.failed > 0) {
        const failed = (data.results || []).filter((r) => r.status !== "saved");
        const detail = failed.map((r) => r.detail || r.status).join("; ");
        throw new Error(detail || "Some fields could not be saved");
      }
      message.success(
        data.saved === 1
          ? "Configuration saved"
          : `Configuration saved (${data.saved} fields)`
      );
      await fetchConfig();
    } catch (e) {
      message.error(e.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    const value = values[field.field_id] ?? "";
    const label = formatFieldLabel(field.field_name);
    const selectOptions = parseAllowedValues(field.allowed_values);
    const showFormatHint = !!getValidationRegex(field);
    const inputId = `config-field-${field.field_id}`;
    const isPassword = isPasswordField(field);
    const showPassword = !!visiblePasswords[field.field_id];

    let control;
    if (isSelectField(field) && selectOptions?.length) {
      control = (
        <select
          id={inputId}
          className="admin-input admin-select"
          value={value}
          onChange={(e) => setFieldValue(field.field_id, e.target.value)}
        >
          <option value="">— Select —</option>
          {selectOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    } else if (isPassword) {
      control = (
        <div className="admin-password-wrap">
          <input
            id={inputId}
            type={showPassword ? "text" : "password"}
            className="admin-input"
            value={value}
            onChange={(e) => setFieldValue(field.field_id, e.target.value)}
            autoComplete="off"
          />
          <button
            type="button"
            className="admin-password-toggle"
            onClick={() =>
              setVisiblePasswords((prev) => ({
                ...prev,
                [field.field_id]: !prev[field.field_id],
              }))
            }
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
          </button>
        </div>
      );
    } else {
      control = (
        <input
          id={inputId}
          type={field.data_type === "Numeric" ? "number" : "text"}
          className="admin-input"
          value={value}
          onChange={(e) => setFieldValue(field.field_id, e.target.value)}
        />
      );
    }

    return (
      <div key={field.field_id} className="admin-form-group admin-config-field">
        <label htmlFor={inputId} className="admin-field-label">
          {label}
          {field.mandatory && <span className="admin-config-required"> *</span>}
        </label>
        {control}
        {showFormatHint && (
          <span className="admin-config-format-hint">
            <MdLock size={14} aria-hidden />
            Format enforced
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-page-content admin-config-content">
          <p className="admin-loading">Loading configuration…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div className="admin-page-content admin-config-content">
        <div className="header-section">
          <h1 className="page-title">System Configuration</h1>
          <p className="page-subtitle">
            Edit environment and connection settings. Mandatory fields are marked with an asterisk (*).
          </p>
        </div>

        {fields.length === 0 ? (
          <p className="admin-config-empty">No configuration fields available.</p>
        ) : (
          <form
            className="admin-config-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="admin-config-sections">
              {groupedFields.map((group) => (
                <section key={group.key} className="admin-config-section">
                  <button
                    type="button"
                    className="admin-config-section-header"
                    onClick={() => toggleGroup(group.key)}
                    aria-expanded={!!expandedGroups[group.key]}
                  >
                    <span className="admin-config-section-title">{group.title}</span>
                    {expandedGroups[group.key] ? (
                      <MdExpandLess size={22} className="admin-config-chevron" aria-hidden />
                    ) : (
                      <MdExpandMore size={22} className="admin-config-chevron" aria-hidden />
                    )}
                  </button>
                  {expandedGroups[group.key] && (
                    <div className="admin-config-section-body">
                      {group.fields.map(renderField)}
                    </div>
                  )}
                </section>
              ))}
            </div>

            <div className="admin-config-footer">
              <button type="submit" className="admin-btn primary admin-config-save" disabled={saving}>
                {saving ? "Saving…" : "Save Configuration"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminConfiguration;
