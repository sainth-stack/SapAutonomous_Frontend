import React, { useState, useEffect, useRef, useMemo } from "react";
import { baseURL } from "../../../const";
import { message } from "antd";
import "./index.css";

// Sidebar section order and paths (must match Sidebar)
const PERMISSION_SECTIONS = [
  { title: "Data Source", paths: ["/data-source"] },
  { title: "SLA", paths: ["/sla-resolution-response-time", "/self-monitoring"] },
  { title: "Incidents Management", paths: ["/incidents-percent", "/incidents-recurring", "/incident-management", "/incidents-auto-assignment"] },
  { title: "Performance Monitoring", paths: ["/process-monitor/thanksgiving/configuration", "/process-monitor/thanksgiving", "/system-monitoring", "/process-monitor/failed-idocs", "/system-monitoring/sap-system"] },
  { title: "Resource Effectiveness", paths: ["/resource-queue-length", "/resource-incidents-resolved", "/resource-time-per-resolution"] },
  { title: "Troubleshooting Assistance", paths: ["/kedb", "/suggested-actions-depository", "/web-suggested-actions"] },
  { title: "Value Creation", paths: ["/preventive-measures", "/self-service-actions"] },
  {
    title: "Continuous Improvements",
    paths: [
      "/automation-target-areas",
      "/automation-preventive-alerts",
      "/continuous-improvements/self-diagnosis",
      "/continuous-improvements/improvise-mttr",
    ],
  },
  { title: "Effectiveness of Measures", paths: ["/effectiveness-occurrence", "/effectiveness-resolution-time"] },
  { title: "BI Report", paths: ["/bi-report"] },
  { title: "Admin", paths: ["/admin/users", "/admin/roles", "/admin/configuration"] },
];

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    permissions: [],
    accessAllData: false,
  });
  const selectAllRef = useRef(null);

  const fetchRoles = async () => {
    try {
      const r = await fetch(`${baseURL}/admin/roles`);
      if (!r.ok) throw new Error("Failed to fetch roles");
      const data = await r.json();
      setRoles(data);
    } catch (e) {
      message.error(e.message || "Failed to load roles");
      setRoles([]);
    }
  };

  const fetchPages = async () => {
    try {
      const r = await fetch(`${baseURL}/admin/pages`);
      if (!r.ok) throw new Error("Failed to fetch pages");
      const data = await r.json();
      setPages(data);
    } catch (e) {
      message.error(e.message || "Failed to load pages");
      setPages([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchRoles(), fetchPages()]);
      setLoading(false);
    })();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", description: "", permissions: [], accessAllData: false });
    setModalOpen(true);
  };

  const openEdit = (role) => {
    setEditingId(role.id);
    setForm({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || [],
      accessAllData: !!role.access_all_data,
    });
    setModalOpen(true);
  };

  const togglePermission = (path) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(path)
        ? prev.permissions.filter((p) => p !== path)
        : [...prev.permissions, path],
    }));
  };

  const allPaths = pages.map((p) => p.path);
  const allSelected = allPaths.length > 0 && form.permissions.length === allPaths.length;
  const someSelected = form.permissions.length > 0;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected, modalOpen]);

  const toggleSelectAll = () => {
    setForm((prev) => ({
      ...prev,
      permissions: allSelected ? [] : allPaths,
    }));
  };

  // Group pages by sidebar section, preserving order
  const pagesBySection = useMemo(() => {
    const pathToPage = Object.fromEntries((pages || []).map((p) => [p.path, p]));
    return PERMISSION_SECTIONS.map(({ title, paths }) => ({
      title,
      pages: paths.map((path) => pathToPage[path]).filter(Boolean),
    })).filter((s) => s.pages.length > 0);
  }, [pages]);

  const saveRole = async () => {
    if (!form.name.trim()) {
      message.warning("Role name is required");
      return;
    }
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim(),
        permissions: form.permissions,
        access_all_data: form.accessAllData,
      };
      if (editingId) {
        const r = await fetch(`${baseURL}/admin/roles/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.detail || "Update failed");
        }
        message.success("Role updated");
      } else {
        const r = await fetch(`${baseURL}/admin/roles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.detail || "Create failed");
        }
        message.success("Role created");
      }
      setModalOpen(false);
      fetchRoles();
    } catch (e) {
      message.error(e.message || "Save failed");
    }
  };

  const deleteRole = async (id) => {
    if (!window.confirm("Delete this role? Users with this role will be unassigned.")) return;
    try {
      const r = await fetch(`${baseURL}/admin/roles/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      message.success("Role deleted");
      fetchRoles();
    } catch (e) {
      message.error(e.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="admin-page-content">
          <p className="admin-loading">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div className="admin-page-content">
        <div className="header-section">
          <h1 className="page-title">Roles</h1>
          <p className="page-subtitle">Manage role names, descriptions, and page permissions</p>
        </div>

        <div className="admin-toolbar">
          <button type="button" className="admin-btn primary" onClick={openCreate}>
            Add Role
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Role Description</th>
                <th>Data access</th>
                <th>Permissions</th>
                <th className="admin-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty">No roles yet. Add a role to get started.</td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id}>
                    <td className="admin-td-name">{role.name}</td>
                    <td>{role.description || "—"}</td>
                    <td>
                      {role.access_all_data ? (
                        <span className="admin-data-scope admin-data-scope--all">All tickets</span>
                      ) : (
                        <span className="admin-data-scope admin-data-scope--assigned">Assigned only</span>
                      )}
                    </td>
                    <td>
                      <span className="admin-perms-summary">
                        {role.permissions && role.permissions.length > 0
                          ? role.permissions.join(", ")
                          : "—"}
                      </span>
                    </td>
                    <td className="admin-td-actions">
                      <button type="button" className="admin-btn link" onClick={() => openEdit(role)}>
                        Edit
                      </button>
                      <button type="button" className="admin-btn link danger" onClick={() => deleteRole(role.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {modalOpen && (
          <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="admin-modal-title">{editingId ? "Edit Role" : "Add Role"}</h2>
              <div className="admin-form-group">
                <label className="admin-field-label">Role name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Manager"
                  className="admin-input"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-field-label">Role description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description"
                  className="admin-input"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-field-label">Data access</label>
                <div className="admin-settings-card">
                  <div className="admin-settings-row">
                    <div className="admin-settings-row-content">
                      <span className="admin-settings-row-title">Access to all SLA data</span>
                      <span className="admin-settings-row-desc">
                        Users see all tickets, not only items assigned to them.
                      </span>
                    </div>
                    <label className="admin-toggle" aria-label="Access to all SLA data">
                      <input
                        type="checkbox"
                        checked={form.accessAllData}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, accessAllData: e.target.checked }))
                        }
                      />
                      <span className="admin-toggle-track" />
                    </label>
                  </div>
                </div>
              </div>
              <div className="admin-form-group admin-form-group-permissions">
                <label className="admin-field-label">Page permissions</label>
                <p className="admin-field-hint">Select which pages users with this role can open.</p>
                <div className="admin-permissions-box">
                  <div className="admin-permissions-header">
                    <label className="admin-check-label admin-select-all">
                      <input
                        type="checkbox"
                        ref={selectAllRef}
                        checked={allSelected}
                        onChange={toggleSelectAll}
                      />
                      <span>Select all</span>
                    </label>
                  </div>
                  <div className="admin-permissions-list">
                    {pagesBySection.map(({ title, pages: sectionPages }) => (
                      <div key={title} className="admin-permissions-section">
                        <div className="admin-permissions-section-title">{title}</div>
                        <div className="admin-permissions-grid">
                          {sectionPages.map((p) => (
                            <label key={p.path} className="admin-check-label">
                              <input
                                type="checkbox"
                                checked={form.permissions.includes(p.path)}
                                onChange={() => togglePermission(p.path)}
                              />
                              <span>{p.label || p.path}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="admin-btn primary" onClick={saveRole}>
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRoles;
