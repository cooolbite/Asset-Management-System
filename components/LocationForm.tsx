'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './LocationForm.css';

interface Location {
  location_id: number;
  name: string;
  address?: string;
  description?: string;
}

interface LocationFormProps {
  location?: Location | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LocationForm({ location, onSuccess, onCancel }: LocationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
  });

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        address: location.address || '',
        description: location.description || '',
      });
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const url = location
        ? `/api/locations/${location.location_id}`
        : '/api/locations';
      const method = location ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address || undefined,
          description: formData.description || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'เกิดข้อผิดพลาด');
        setLoading(false);
        return;
      }

      if (data.success) {
        onSuccess();
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="location-form-modal">
      <div className="location-form-header">
        <h3>{location ? 'Edit Location' : 'Add New Location'}</h3>
        <button onClick={onCancel} className="close-button">×</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="location-form">
        <div className="form-group">
          <label htmlFor="name">Location Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={200}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">ที่อยู่</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : location ? 'Save Changes' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

