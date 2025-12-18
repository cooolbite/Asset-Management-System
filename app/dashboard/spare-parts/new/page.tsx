'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Save } from 'lucide-react';
import '../spare-parts.css';

export default function NewSparePartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    unitPrice: '',
    unit: 'ชิ้น',
    minStock: '5',
    maxStock: '',
    initialQuantity: '0',
    location: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/spare-parts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : 0,
          minStock: parseInt(formData.minStock),
          maxStock: formData.maxStock ? parseInt(formData.maxStock) : null,
          initialQuantity: parseInt(formData.initialQuantity),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/spare-parts/${data.data.spare_part_id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error creating spare part:', error);
      alert('เกิดข้อผิดพลาดในการสร้างอะไหล่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="spare-parts-page">
        <div className="page-header">
          <a href="/dashboard/spare-parts" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <h2>เพิ่มอะไหล่ใหม่</h2>
        </div>

        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-section">
            <h3>ข้อมูลพื้นฐาน</h3>
            <div className="form-row">
              <div className="form-group">
                <label>ชื่ออะไหล่ *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>หมวดหมู่</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="เช่น Memory, Storage, Power"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ยี่ห้อ</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>รุ่น</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ราคาต่อหน่วย</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>หน่วย</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>รายละเอียด</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>การจัดการ Stock</h3>
            <div className="form-row">
              <div className="form-group">
                <label>จำนวนเริ่มต้น</label>
                <input
                  type="number"
                  value={formData.initialQuantity}
                  onChange={(e) => setFormData({ ...formData, initialQuantity: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Min Stock</label>
                <input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Max Stock</label>
                <input
                  type="number"
                  value={formData.maxStock}
                  onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>ตำแหน่งจัดเก็บ</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => router.back()} className="btn btn-secondary">
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={20} />
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

