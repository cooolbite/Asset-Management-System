'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './AssetList.css';

interface Asset {
  asset_id: number;
  serial_number: string;
  asset_name: string;
  asset_type: string;
  category_name: string;
  location_name: string;
  acquisition_date: string;
  cost: number;
  status: string;
  description?: string;
  vendor_supplier?: string;
  warranty_expiry_date?: string;
}

interface AssetListProps {
  initialSearch?: string;
  initialType?: string;
  initialStatus?: string;
  initialPage?: number;
  initialLimit?: number;
}

export default function AssetList({
  initialSearch = '',
  initialType = '',
  initialStatus = '',
  initialPage = 1,
  initialLimit = 25,
}: AssetListProps) {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });

  // Search and filter states
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState(initialType);
  const [status, setStatus] = useState(initialStatus);

  // Fetch assets
  const fetchAssets = async () => {
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
      if (type) queryParams.set('type', type);
      if (status) queryParams.set('status', status);
      queryParams.set('page', pagination.page.toString());
      queryParams.set('limit', pagination.limit.toString());

      const response = await fetch(`/api/assets?${queryParams.toString()}`, {
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
        setError(data.error?.message || 'Failed to load assets');
        setLoading(false);
        return;
      }

      if (data.success) {
        setAssets(data.data.assets);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [pagination.page, pagination.limit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    router.push(
      `/dashboard/assets?search=${encodeURIComponent(search)}&type=${encodeURIComponent(type)}&status=${encodeURIComponent(status)}&page=1&limit=${pagination.limit}`
    );
    fetchAssets();
  };

  const handleReset = () => {
    setSearch('');
    setType('');
    setStatus('');
    setPagination({ ...pagination, page: 1 });
    router.push(`/dashboard/assets?page=1&limit=${pagination.limit}`);
    setTimeout(() => fetchAssets(), 100);
  };

  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
    router.push(
      `/dashboard/assets?search=${encodeURIComponent(search)}&type=${encodeURIComponent(type)}&status=${encodeURIComponent(status)}&page=${newPage}&limit=${pagination.limit}`
    );
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Available':
        return 'status-available';
      case 'In Use':
        return 'status-in-use';
      case 'Maintenance':
        return 'status-maintenance';
      case 'Retired':
        return 'status-retired';
      case 'Lost':
        return 'status-lost';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      Available: 'Available',
      'In Use': 'In Use',
      Maintenance: 'Maintenance',
      Retired: 'Retired',
      Lost: 'Lost',
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    return type;
  };

  return (
    <div className="asset-list-container">
      {/* Search and Filter */}
      <div className="search-filter-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Search Serial Number, Asset Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="form-input"
            >
              <option value="">All Types</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Physical Asset">Physical Asset</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-input"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
              <option value="Lost">Lost</option>
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

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <p>Loading...</p>
        </div>
      )}

      {/* Assets Table */}
      {!loading && !error && (
        <>
          <div className="assets-table-container">
            <table className="assets-table">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Asset Name</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Cost (THB)</th>
                  <th>Status</th>
                  <th>Acquisition Date</th>
                </tr>
              </thead>
              <tbody>
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="no-data">
                      No assets found
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => (
                    <tr key={asset.asset_id}>
                      <td>{asset.serial_number}</td>
                      <td>{asset.asset_name}</td>
                      <td>{getTypeLabel(asset.asset_type)}</td>
                      <td>{asset.category_name}</td>
                      <td>{asset.location_name}</td>
                      <td>{asset.cost.toLocaleString('en-US')}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(asset.status)}`}>
                          {getStatusLabel(asset.status)}
                        </span>
                      </td>
                      <td>
                        {new Date(asset.acquisition_date).toLocaleDateString('en-US')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

