'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import './UserList.css';
import UserForm from './UserForm';

interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  department?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserListProps {
  initialSearch?: string;
  initialRole?: string;
  initialStatus?: string;
  initialPage?: number;
  initialLimit?: number;
}

export default function UserList({
  initialSearch = '',
  initialRole = '',
  initialStatus = '',
  initialPage = 1,
  initialLimit = 25,
}: UserListProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState(initialSearch);
  const [role, setRole] = useState(initialRole);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (role) queryParams.set('role', role);
      if (statusFilter) queryParams.set('status', statusFilter);
      queryParams.set('page', pagination.page.toString());
      queryParams.set('limit', pagination.limit.toString());

      const response = await fetch(`/api/users?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        setError(data.error?.message || 'Failed to load users');
        setLoading(false);
        return;
      }

      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    router.push(
      `/dashboard/users?search=${encodeURIComponent(search)}&role=${encodeURIComponent(role)}&status=${encodeURIComponent(statusFilter)}&page=1&limit=${pagination.limit}`
    );
    fetchUsers();
  };

  const handleReset = () => {
    setSearch('');
    setRole('');
    setStatusFilter('');
    setPagination({ ...pagination, page: 1 });
    router.push(`/dashboard/users?page=1&limit=${pagination.limit}`);
    setTimeout(() => fetchUsers(), 100);
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    router.push(
      `/dashboard/users?search=${encodeURIComponent(search)}&role=${encodeURIComponent(role)}&status=${encodeURIComponent(statusFilter)}&page=${newPage}&limit=${pagination.limit}`
    );
  };

  const handleUserCreated = () => {
    setShowForm(false);
    fetchUsers();
  };

  const getRoleLabel = (role: string) => {
    return role;
  };

  const getStatusLabel = (status: string) => {
    return status;
  };

  const getStatusBadgeClass = (status: string) => {
    return status === 'Active' ? 'status-active' : 'status-inactive';
  };

  return (
    <div className="user-list-container">
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <UserForm onSuccess={handleUserCreated} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      <div className="page-actions">
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={20} /> Add New User
        </button>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Search Username, Email, Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-input"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            <button type="button" onClick={handleReset} className="btn btn-secondary">
              Reset
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <div className="loading-state">
          <p>Loading...</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Full Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.user_id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.full_name}</td>
                      <td>{getRoleLabel(user.role)}</td>
                      <td>{user.department || '-'}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                          {getStatusLabel(user.status)}
                        </span>
                      </td>
                      <td>
                        {new Date(user.created_at).toLocaleDateString('en-US')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages} (Total: {pagination.total})
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

