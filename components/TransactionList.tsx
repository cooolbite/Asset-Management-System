'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './TransactionList.css';

interface Transaction {
  transaction_id: number;
  asset_id: number;
  transaction_type: string;
  assigned_to: string;
  assigned_location: string;
  transaction_date: string;
  expected_return_date?: string;
  actual_return_date?: string;
  condition?: string;
  notes?: string;
  serial_number: string;
  asset_name: string;
  asset_type: string;
  performed_by_username: string;
  performed_by_fullname: string;
}

interface TransactionListProps {
  initialType?: string;
  initialDateFrom?: string;
  initialDateTo?: string;
  initialPage?: number;
  initialLimit?: number;
}

export default function TransactionList({
  initialType = '',
  initialDateFrom = '',
  initialDateTo = '',
  initialPage = 1,
  initialLimit = 25,
}: TransactionListProps) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });

  const [type, setType] = useState(initialType);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const queryParams = new URLSearchParams();
      if (type) queryParams.set('type', type);
      if (dateFrom) queryParams.set('dateFrom', dateFrom);
      if (dateTo) queryParams.set('dateTo', dateTo);
      queryParams.set('page', pagination.page.toString());
      queryParams.set('limit', pagination.limit.toString());

      const response = await fetch(`/api/transactions?${queryParams.toString()}`, {
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
        setError(data.error?.message || 'Failed to load transactions');
        setLoading(false);
        return;
      }

      if (data.success) {
        setTransactions(data.data.transactions);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, pagination.limit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    router.push(
      `/dashboard/transactions?type=${encodeURIComponent(type)}&dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}&page=1&limit=${pagination.limit}`
    );
    fetchTransactions();
  };

  const handleReset = () => {
    setType('');
    setDateFrom('');
    setDateTo('');
    setPagination({ ...pagination, page: 1 });
    router.push(`/dashboard/transactions?page=1&limit=${pagination.limit}`);
    setTimeout(() => fetchTransactions(), 100);
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    router.push(
      `/dashboard/transactions?type=${encodeURIComponent(type)}&dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}&page=${newPage}&limit=${pagination.limit}`
    );
  };

  const getTypeLabel = (type: string) => {
    return type === 'Check-out' ? 'Check-out' : 'Check-in';
  };

  const getTypeBadgeClass = (type: string) => {
    return type === 'Check-out' ? 'type-checkout' : 'type-checkin';
  };

  const getConditionLabel = (condition?: string) => {
    return condition || '-';
  };

  return (
    <div className="transaction-list-container">
      {/* Search and Filter */}
      <div className="search-filter-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="form-input"
            >
              <option value="">All Types</option>
              <option value="Check-out">Check-out</option>
              <option value="Check-in">Check-in</option>
            </select>
            <input
              type="date"
              placeholder="Start Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="form-input"
            />
            <input
              type="date"
              placeholder="End Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="form-input"
            />
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
          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Asset</th>
                  <th>Serial Number</th>
                  <th>Assigned To</th>
                  <th>Location</th>
                  <th>Expected Return</th>
                  <th>Actual Return</th>
                  <th>Condition</th>
                  <th>Performed By</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="no-data">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.transaction_id}>
                      <td>
                        {new Date(transaction.transaction_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td>
                        <span className={`type-badge ${getTypeBadgeClass(transaction.transaction_type)}`}>
                          {getTypeLabel(transaction.transaction_type)}
                        </span>
                      </td>
                      <td>{transaction.asset_name}</td>
                      <td>{transaction.serial_number}</td>
                      <td>{transaction.assigned_to || '-'}</td>
                      <td>{transaction.assigned_location}</td>
                      <td>
                        {transaction.expected_return_date
                          ? new Date(transaction.expected_return_date).toLocaleDateString('en-US')
                          : '-'}
                      </td>
                      <td>
                        {transaction.actual_return_date
                          ? new Date(transaction.actual_return_date).toLocaleDateString('en-US')
                          : '-'}
                      </td>
                      <td>{getConditionLabel(transaction.condition)}</td>
                      <td>{transaction.performed_by_fullname || transaction.performed_by_username}</td>
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

