'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './VendorList.css';
import VendorForm from './VendorForm';

interface Vendor {
  vendor_id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export default function VendorList() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [search, setSearch] = useState('');

  const fetchVendors = async () => {
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

      const response = await fetch(`/api/vendors?${queryParams.toString()}`, {
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
        setError(data.error?.message || 'Failed to load vendors');
        setLoading(false);
        return;
      }

      if (data.success) {
        setVendors(data.data);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [search]);

  const handleDelete = async (vendorId: number, vendorName: string) => {
    if (!confirm(`Are you sure you want to delete vendor/supplier "${vendorName}"?`)) {
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error?.message || 'Failed to delete vendor');
        return;
      }

      fetchVendors();
    } catch (err) {
      alert('Connection error. Please try again.');
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVendor(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchVendors();
  };

  return (
    <div className="vendor-list-container">
      {showForm && (
        <div className="modal-overlay" onClick={handleFormClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <VendorForm
              vendor={editingVendor}
              onSuccess={handleFormSuccess}
              onCancel={handleFormClose}
            />
          </div>
        </div>
      )}

      <div className="page-actions">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search vendors/suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ width: '300px' }}
          />
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={20} /> Add Vendor/Supplier
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <div className="loading-state">
          <p>Loading...</p>
        </div>
      )}

      {!loading && !error && (
        <div className="vendors-table-container">
          <table className="vendors-table">
            <thead>
              <tr>
                <th>Vendor/Supplier Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-data">
                    No vendors/suppliers found
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.vendor_id}>
                    <td>{vendor.name}</td>
                    <td>{vendor.contact_person || '-'}</td>
                    <td>{vendor.email || '-'}</td>
                    <td>{vendor.phone || '-'}</td>
                    <td>{vendor.address || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(vendor)}
                          className="btn-icon btn-edit"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.vendor_id, vendor.name)}
                          className="btn-icon btn-delete"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

