import React, { useState, useEffect } from "react";
import { baseURL } from "../../../const";
import { message } from "antd";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import "./index.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role_id: "",
    is_super_admin: false,
  });

  const fetchUsers = async () => {
    try {
      const r = await fetch(`${baseURL}/admin/users`);
      if (!r.ok) throw new Error("Failed to fetch users");
      const data = await r.json();
      setUsers(data);
    } catch (e) {
      message.error(e.message || "Failed to load users");
      setUsers([]);
    }
  };

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

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchRoles()]);
      setLoading(false);
    })();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      username: "",
      email: "",
      password: "",
      role_id: "",
      is_super_admin: false,
    });
    setShowPassword(true);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingId(user.id);
    setForm({
      username: user.username,
      email: user.email,
      password: "",
      role_id: user.role_id ?? "",
      is_super_admin: user.is_super_admin || false,
    });
    setShowPassword(false);
    setModalOpen(true);
  };

  const saveUser = async () => {
    if (!form.email.trim()) {
      message.warning("Email is required");
      return;
    }
    if (!form.username.trim()) {
      message.warning("Username is required");
      return;
    }
    if (!editingId && !form.password) {
      message.warning("Password is required for new user");
      return;
    }
    try {
      if (editingId) {
        const body = {
          username: form.username.trim(),
          email: form.email.trim(),
          role_id: form.role_id === "" ? 0 : Number(form.role_id),
          is_super_admin: form.is_super_admin,
        };
        if (form.password && form.password.trim()) body.password = form.password;
        const r = await fetch(`${baseURL}/admin/users/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.detail || "Update failed");
        }
        message.success("User updated");
      } else {
        const r = await fetch(`${baseURL}/admin/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
            role_id: form.role_id === "" ? null : Number(form.role_id),
            is_super_admin: form.is_super_admin,
          }),
        });
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.detail || "Create failed");
        }
        message.success("User created");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (e) {
      message.error(e.message || "Save failed");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user? They will no longer be able to log in.")) return;
    try {
      const r = await fetch(`${baseURL}/admin/users/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Delete failed");
      message.success("User deleted");
      fetchUsers();
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
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage usernames, emails, passwords, and role assignment</p>
        </div>

        <div className="admin-toolbar">
          <button type="button" className="admin-btn primary" onClick={openCreate}>
            Add User
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Details</th>
                <th>Role</th>
                <th className="admin-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-empty">No users yet. Add a user to get started.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className="admin-user-email">{user.email}</span>
                    </td>
                    <td>{user.username || "—"}</td>
                    <td>{user.role_name || "—"}</td>
                    <td className="admin-td-actions">
                      <button type="button" className="admin-btn link" onClick={() => openEdit(user)}>
                        Edit
                      </button>
                      <button type="button" className="admin-btn link danger" onClick={() => deleteUser(user.id)}>
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
              <h2 className="admin-modal-title">{editingId ? "Edit User" : "Add User"}</h2>
              <div className="admin-form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="Display name"
                  className="admin-input"
                />
              </div>
              <div className="admin-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="user@example.com"
                  className="admin-input"
                  disabled={!!editingId}
                />
                {editingId && <span className="admin-field-hint">Email cannot be changed</span>}
              </div>
              <div className="admin-form-group">
                <label>Password {editingId && "(leave blank to keep current)"}</label>
                <div className="admin-password-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder={editingId ? "Leave blank to keep" : "Enter password"}
                    className="admin-input"
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>
              <div className="admin-form-group">
                <label>Role</label>
                <select
                  value={form.role_id}
                  onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}
                  className="admin-input admin-select"
                >
                  <option value="">— No role —</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.is_super_admin}
                    onChange={(e) => setForm((f) => ({ ...f, is_super_admin: e.target.checked }))}
                  />
                  <span>Admin (full access to all pages and admin)</span>
                </label>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="admin-btn primary" onClick={saveUser}>
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

export default AdminUsers;
