'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './CategoryForm.css';

interface Category {
  category_id: number;
  name: string;
  asset_type: string;
  description?: string;
}

interface CategoryFormProps {
  category?: Category | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    assetType: 'Hardware',
    description: '',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        assetType: category.asset_type,
        description: category.description || '',
      });
    }
  }, [category]);

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

      const url = category
        ? `/api/categories/${category.category_id}`
        : '/api/categories';
      const method = category ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          assetType: formData.assetType,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="category-form-modal">
      <div className="category-form-header">
        <h3>{category ? 'Edit Category' : 'Add New Category'}</h3>
        <button onClick={onCancel} className="close-button">×</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-group">
          <label htmlFor="name">Category Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            maxLength={100}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="assetType">Asset Type *</label>
            <select
              id="assetType"
              name="assetType"
              value={formData.assetType}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Physical Asset">Physical Asset</option>
            </select>
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
            {loading ? 'Saving...' : category ? 'Save Changes' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

