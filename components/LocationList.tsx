'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './LocationList.css';
import LocationForm from './LocationForm';

interface Location {
  location_id: number;
  name: string;
  address?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export default function LocationList() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [search, setSearch] = useState('');

  const fetchLocations = async () => {
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

      const response = await fetch(`/api/locations?${queryParams.toString()}`, {
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
        setError(data.error?.message || 'Failed to load locations');
        setLoading(false);
        return;
      }

      if (data.success) {
        setLocations(data.data);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [search]);

  const handleDelete = async (locationId: number, locationName: string) => {
    if (!confirm(`Are you sure you want to delete location "${locationName}"?`)) {
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error?.message || 'Failed to delete location');
        return;
      }

      fetchLocations();
    } catch (err) {
      alert('Connection error. Please try again.');
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLocation(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchLocations();
  };

  return (
    <div className="location-list-container">
      {showForm && (
        <div className="modal-overlay" onClick={handleFormClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <LocationForm
              location={editingLocation}
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
            placeholder="Search locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ width: '300px' }}
          />
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={20} /> Add Location
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <div className="loading-state">
          <p>Loading...</p>
        </div>
      )}

      {!loading && !error && (
        <div className="locations-table-container">
          <table className="locations-table">
            <thead>
              <tr>
                <th>Location Name</th>
                <th>Address</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="no-data">
                    No locations found
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr key={location.location_id}>
                    <td>{location.name}</td>
                    <td>{location.address || '-'}</td>
                    <td>{location.description || '-'}</td>
                    <td>
                      {new Date(location.created_at).toLocaleDateString('en-US')}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(location)}
                          className="btn-icon btn-edit"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(location.location_id, location.name)}
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

