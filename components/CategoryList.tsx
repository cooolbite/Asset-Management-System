'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './CategoryList.css';
import CategoryForm from './CategoryForm';

interface Category {
  category_id: number;
  name: string;
  asset_type: string;
  description?: string;
  created_at: string;
}

export default function CategoryList() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    setError('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const queryParams = new URLSearchParams();
      if (filterType) queryParams.set('type', filterType);

      const response = await fetch(`/api/categories?${queryParams.toString()}`, {
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
        setError(data.error?.message || 'Failed to load categories');
        setLoading(false);
        return;
      }

      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [filterType]);

  const handleDelete = async (categoryId: number, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete category "${categoryName}"?`)) {
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error?.message || 'Failed to delete category');
        return;
      }

      fetchCategories();
    } catch (err) {
      alert('Connection error. Please try again.');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchCategories();
  };

  const getTypeLabel = (type: string) => {
    return type;
  };

  return (
    <div className="category-list-container">
      {showForm && (
        <div className="modal-overlay" onClick={handleFormClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CategoryForm
              category={editingCategory}
              onSuccess={handleFormSuccess}
              onCancel={handleFormClose}
            />
          </div>
        </div>
      )}

      <div className="page-actions">
        <div className="filter-section">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-input"
            style={{ width: '200px' }}
          >
            <option value="">All Types</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Physical Asset">Physical Asset</option>
          </select>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus size={20} /> Add Category
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && (
        <div className="loading-state">
          <p>Loading...</p>
        </div>
      )}

      {!loading && !error && (
        <div className="categories-table-container">
          <table className="categories-table">
            <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Asset Type</th>
                  <th>Description</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="no-data">
                      No categories found
                    </td>
                  </tr>
                ) : (
                categories.map((category) => (
                  <tr key={category.category_id}>
                    <td>{category.name}</td>
                    <td>{getTypeLabel(category.asset_type)}</td>
                    <td>{category.description || '-'}</td>
                      <td>
                        {new Date(category.created_at).toLocaleDateString('en-US')}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(category)}
                            className="btn-icon btn-edit"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(category.category_id, category.name)}
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

