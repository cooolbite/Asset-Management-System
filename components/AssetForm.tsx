'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './AssetForm.css';

interface Category {
  category_id: number;
  name: string;
  asset_type: string;
}

interface Location {
  location_id: number;
  name: string;
}

export default function AssetForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState({
    serialNumber: '',
    assetName: '',
    assetType: 'Hardware',
    categoryId: '',
    locationId: '',
    acquisitionDate: '',
    cost: '',
    status: 'Available',
    description: '',
    vendorSupplier: '',
    warrantyExpiryDate: '',
  });

  useEffect(() => {
    fetchCategoriesAndLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Filter categories when asset type changes
    if (formData.assetType) {
      fetchCategoriesAndLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.assetType]);

  const fetchCategoriesAndLocations = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      // Fetch categories
      const categoriesResponse = await fetch(
        `/api/categories?type=${formData.assetType}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const categoriesData = await categoriesResponse.json();
      if (categoriesData.success) {
        setCategories(categoriesData.data);
      }

      // Fetch locations
      const locationsResponse = await fetch('/api/locations', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const locationsData = await locationsResponse.json();
      if (locationsData.success) {
        setLocations(locationsData.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          serialNumber: formData.serialNumber,
          assetName: formData.assetName,
          assetType: formData.assetType,
          categoryId: parseInt(formData.categoryId),
          locationId: parseInt(formData.locationId),
          acquisitionDate: formData.acquisitionDate,
          cost: parseFloat(formData.cost),
          status: formData.status,
          description: formData.description || undefined,
          vendorSupplier: formData.vendorSupplier || undefined,
          warrantyExpiryDate: formData.warrantyExpiryDate || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'เกิดข้อผิดพลาดในการสร้างทรัพย์สิน');
        setLoading(false);
        return;
      }

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/assets');
        }, 1500);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset category when asset type changes
    if (name === 'assetType') {
      setFormData((prev) => ({
        ...prev,
        categoryId: '',
      }));
    }
  };

  return (
    <div className="asset-form-container">
      {success && (
        <div className="success-message">
          ✅ Asset created successfully! Redirecting...
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="asset-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="serialNumber">Serial Number *</label>
            <input
              type="text"
              id="serialNumber"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              required
              maxLength={50}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="assetName">Asset Name *</label>
            <input
              type="text"
              id="assetName"
              name="assetName"
              value={formData.assetName}
              onChange={handleChange}
              required
              maxLength={200}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
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
            <label htmlFor="categoryId">Category *</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              disabled={loading || categories.length === 0}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <small className="form-hint">Please select asset type first</small>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="locationId">Location *</label>
            <select
              id="locationId"
              name="locationId"
              value={formData.locationId}
              onChange={handleChange}
              required
              disabled={loading || locations.length === 0}
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc.location_id} value={loc.location_id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="acquisitionDate">Acquisition Date *</label>
            <input
              type="date"
              id="acquisitionDate"
              name="acquisitionDate"
              value={formData.acquisitionDate}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cost">Cost (THB) *</label>
            <input
              type="number"
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="vendorSupplier">Vendor/Supplier</label>
            <input
              type="text"
              id="vendorSupplier"
              name="vendorSupplier"
              value={formData.vendorSupplier}
              onChange={handleChange}
              maxLength={200}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="warrantyExpiryDate">Warranty Expiry Date</label>
            <input
              type="date"
              id="warrantyExpiryDate"
              name="warrantyExpiryDate"
              value={formData.warrantyExpiryDate}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
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
            onClick={() => router.back()}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

