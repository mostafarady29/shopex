"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Edit2, Trash2, UserCog, Shield, User,
  ChevronDown, X, Loader2, AlertCircle, Check, RefreshCw
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
  orders: { id: string }[];
  affiliate?: { id: string; status: string; referralCode: string } | null;
}

const ROLE_COLORS: Record<string, string> = {
  admin:      "bg-[#FDEDF0] text-[#CC0C39]",
  supervisor: "bg-[#EEF2FF] text-[#4F46E5]",
  affiliate:  "bg-[#FFF7EC] text-[#FF9900]",
  customer:   "bg-[#E8F8F0] text-[#00A650]",
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  admin:      <Shield className="w-3 h-3" />,
  supervisor: <UserCog className="w-3 h-3" />,
  affiliate:  <User className="w-3 h-3" />,
  customer:   <User className="w-3 h-3" />,
};

// ─── Modal ─────────────────────────────────────────────────────────────────
function UserModal({
  user,
  currentUserRole,
  onClose,
  onSaved,
}: {
  user: UserData | null;
  currentUserRole: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName:  user?.lastName  || "",
    email:     user?.email     || "",
    phone:     user?.phone     || "",
    role:      user?.role      || "customer",
    password:  "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isEdit && !form.password) { setError("Password is required"); return; }
    setLoading(true);
    try {
      const payload: Record<string, string> = { ...form };
      if (isEdit && !form.password) delete payload.password;
      if (isEdit) {
        await api.put(`/admin/users/${user!.id}`, payload);
      } else {
        await api.post("/admin/users", payload);
      }
      setSuccess(true);
      setTimeout(() => { onSaved(); onClose(); }, 700);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const roles = currentUserRole === "admin"
    ? ["customer", "affiliate", "supervisor", "admin"]
    : ["customer", "affiliate", "supervisor"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-up">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]">
          <h2 className="text-lg font-black text-[#111]">
            {isEdit ? "Edit User" : "Add New User"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F5F5F7] text-[#888]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FDEDF0] border border-[#FABCCA] rounded-xl flex items-center gap-2 text-sm text-[#CC0C39]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-[#E8F8F0] border border-[#A3DEC0] rounded-xl flex items-center gap-2 text-sm text-[#00A650]">
              <Check className="w-4 h-4 flex-shrink-0" /> Saved successfully!
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-[#555] mb-1.5">First Name *</label>
              <input value={form.firstName} onChange={set("firstName")} required
                className="w-full border border-[#DDD] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                placeholder="John" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-[#555] mb-1.5">Last Name *</label>
              <input value={form.lastName} onChange={set("lastName")} required
                className="w-full border border-[#DDD] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
                placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#555] mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={set("email")} required
              className="w-full border border-[#DDD] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
              placeholder="john@example.com" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#555] mb-1.5">Phone</label>
            <input value={form.phone} onChange={set("phone")}
              className="w-full border border-[#DDD] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
              placeholder="+1 555 000 0000" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#555] mb-1.5">
              {isEdit ? "New Password (leave blank to keep)" : "Password *"}
            </label>
            <input type="password" value={form.password} onChange={set("password")}
              required={!isEdit}
              className="w-full border border-[#DDD] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900]"
              placeholder={isEdit ? "Leave blank to keep current" : "At least 6 characters"} />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#555] mb-1.5">Role *</label>
            <div className="relative">
              <select value={form.role} onChange={set("role")}
                className="w-full border border-[#DDD] rounded-xl px-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] bg-white">
                {roles.map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-[#DDD] text-[#555] font-bold text-sm py-2.5 rounded-xl hover:bg-[#F5F5F7] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || success}
              className="flex-1 bg-[#FF9900] hover:bg-[#E68A00] text-[#111] font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <Check className="w-4 h-4" /> : null}
              {loading ? "Saving..." : success ? "Saved!" : isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────
function DeleteConfirm({ user, onClose, onDeleted }: { user: UserData; onClose: () => void; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/admin/users/${user.id}`);
      onDeleted();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-fade-up">
        <div className="w-12 h-12 rounded-full bg-[#FDEDF0] flex items-center justify-center mx-auto">
          <Trash2 className="w-5 h-5 text-[#CC0C39]" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-black text-[#111] mb-1">Delete User</h3>
          <p className="text-sm text-[#555]">
            Are you sure you want to delete <strong>{user.firstName} {user.lastName}</strong>? This action cannot be undone.
          </p>
        </div>
        {error && <p className="text-xs text-[#CC0C39] text-center">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-[#DDD] text-[#555] font-bold text-sm py-2.5 rounded-xl hover:bg-[#F5F5F7] transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 bg-[#CC0C39] hover:bg-[#A50930] text-white font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers]         = useState<UserData[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modalUser, setModalUser]   = useState<UserData | null | "new">(null);
  const [deleteUser, setDeleteUser] = useState<UserData | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search)     params.search = search;
      if (roleFilter) params.role   = roleFilter;
      const res = await api.get("/admin/users", { params });
      setUsers(res.data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const roleBadge = (role: string) => (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${ROLE_COLORS[role] || "bg-[#F5F5F7] text-[#555]"}`}>
      {ROLE_ICON[role]} {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111]">Users</h1>
          <p className="text-sm text-[#555] mt-1">Manage all platform users, roles, and permissions.</p>
        </div>
        <button
          onClick={() => setModalUser("new")}
          className="bg-[#FF9900] hover:bg-[#E68A00] text-[#111] px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-[#E5E5E5] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#F5F5F7] text-sm py-2.5 pl-9 pr-4 rounded-xl border border-transparent focus:bg-white focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] outline-none transition-all"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-[#F5F5F7] border border-transparent text-sm font-medium text-[#555] px-4 py-2.5 pr-8 rounded-xl focus:outline-none focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] transition-all">
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="affiliate">Affiliate</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
          </div>
          <button onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E5E5] rounded-xl text-sm font-bold text-[#555] hover:bg-[#F5F5F7] transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {["customer", "affiliate", "supervisor", "admin"].map(role => {
            const count = users.filter(u => u.role === role).length;
            return (
              <div key={role} className="bg-white rounded-2xl border border-[#E5E5E5] p-4 shadow-sm">
                <p className="text-xs font-bold text-[#888] uppercase tracking-wider mb-1">{role}s</p>
                <p className="text-2xl font-black text-[#111]">{count}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#888]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#888]">
            <UserCog className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F9F9] border-b border-[#E5E5E5]">
                  <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">User</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Role</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Orders</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Referral Code</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider">Joined</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#888] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-[#FDFDFD] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF9900] to-[#FF6600] text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#111]">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-[#888]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">{roleBadge(u.role)}</td>
                    <td className="py-4 px-6 text-sm font-bold text-[#111]">{u.orders.length}</td>
                    <td className="py-4 px-6">
                      {u.affiliate ? (
                        <span className="text-xs font-mono bg-[#F5F5F7] px-2 py-1 rounded-lg text-[#555]">
                          {u.affiliate.referralCode}
                        </span>
                      ) : <span className="text-xs text-[#BBB]">—</span>}
                    </td>
                    <td className="py-4 px-6 text-sm text-[#888]">
                      {new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setModalUser(u)}
                          className="p-1.5 text-[#555] hover:text-[#FF9900] hover:bg-[#FFF7EC] rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {currentUser?.role === "admin" && u.id !== currentUser.id && (
                          <button onClick={() => setDeleteUser(u)}
                            className="p-1.5 text-[#555] hover:text-[#CC0C39] hover:bg-[#FDEDF0] rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modalUser === "new" || (modalUser && typeof modalUser === "object")) && (
        <UserModal
          user={modalUser === "new" ? null : modalUser as UserData}
          currentUserRole={currentUser?.role || "admin"}
          onClose={() => setModalUser(null)}
          onSaved={fetchUsers}
        />
      )}
      {deleteUser && (
        <DeleteConfirm
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onDeleted={fetchUsers}
        />
      )}
    </div>
  );
}
