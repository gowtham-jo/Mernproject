import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Shield, UserCheck, UserX, Search, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import { Loader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';

export const AdminUsers = ({ fixedRole }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(fixedRole || 'all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: fixedRole || 'teacher',
    phone: '',
    bio: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search,
      };
      if (roleFilter !== 'all') params.role = roleFilter;

      const res = await userService.getUsers(params);
      setUsers(res.data.users || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, page]);

  const handleToggleStatus = async (user) => {
    try {
      await userService.toggleStatus(user._id);
      toast.success(`Account ${user.isActive ? 'deactivated' : 'activated'}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      setDeleting(true);
      await userService.deleteUser(deleteUserId);
      toast.success('User account removed permanently.');
      setUsers((prev) => prev.filter((u) => u._id !== deleteUserId));
      setDeleteUserId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await userService.createUser(newUser);
      toast.success('User account created successfully!');
      setShowCreateModal(false);
      setNewUser({
        name: '',
        email: '',
        password: 'Password123!',
        role: fixedRole || 'teacher',
        phone: '',
        bio: '',
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {fixedRole === 'student'
              ? 'Manage Students'
              : fixedRole === 'teacher'
              ? 'Manage Teachers & Instructors'
              : 'User Management Directory'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {totalCount} registered user accounts on LearnHub
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)} size="md" className="font-bold flex-shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add New {fixedRole === 'teacher' ? 'Teacher' : fixedRole === 'student' ? 'Student' : 'User'}</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchBar
            placeholder="Search by name or email..."
            value={search}
            onSearch={(val) => {
              setSearch(val);
              setPage(1);
            }}
          />
        </div>

        {!fixedRole && (
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 py-2.5 px-3"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
          </select>
        )}
      </div>

      {/* Users Table */}
      {loading ? (
        <Loader text="Loading user accounts..." />
      ) : users.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Account Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Avatar src={u.profileImage} name={u.name} size="md" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{u.name}</h4>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          u.role === 'admin'
                            ? 'purple'
                            : u.role === 'teacher'
                            ? 'blue'
                            : 'slate'
                        }
                        size="sm"
                        className="capitalize font-bold"
                      >
                        {u.role}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={u.isActive ? 'green' : 'rose'} size="sm" dot>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                            u.isActive
                              ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                          title={u.isActive ? 'Deactivate user' : 'Activate user'}
                        >
                          {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => setDeleteUserId(u._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try modifying search keywords or role filters."
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New User Account"
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <Input
              label="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Dr. Alex Morgan"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="alex@learnhub.com"
              required
            />

            <Input
              label="Initial Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />

            {!fixedRole && (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
                  Assigned Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border rounded-xl p-2.5 text-xs bg-white"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher / Instructor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            )}

            <Input
              label="Phone"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />

            <div className="flex justify-end space-x-3 pt-3 border-t">
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={creating}>
                Create User
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete User Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        loading={deleting}
        title="Delete User Permanently"
        message="Are you sure you want to delete this user? Their account access will be revoked immediately."
      />
    </div>
  );
};

export default AdminUsers;
