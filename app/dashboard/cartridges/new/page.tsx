'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Save } from 'lucide-react';
import '../cartridges.css';

export default function NewCartridgePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    model: '',
    brand: '',
    color: '',
    type: 'Original',
    price: '',
    printerModel: '',
    minStock: '5',
    initialQuantity: '0',
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/cartridges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : 0,
          minStock: parseInt(formData.minStock),
          initialQuantity: parseInt(formData.initialQuantity),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/cartridges/${data.data.cartridge_id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error creating cartridge:', error);
      alert('เกิดข้อผิดพลาดในการสร้างตลับหมึก');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="cartridges-page">
        <div className="page-header">
          <a href="/dashboard/cartridges" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <h2>เพิ่มตลับหมึกใหม่</h2>
        </div>

        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-section">
            <h3>ข้อมูลตลับหมึก</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Model *</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  placeholder="เช่น HP 305 Black"
                />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="เช่น HP, Canon, Brother"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>สี</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                >
                  <option value="">เลือกสี</option>
                  <option value="Black">ดำ</option>
                  <option value="C">Cyan</option>
                  <option value="M">Magenta</option>
                  <option value="Y">Yellow</option>
                  <option value="K">Black (K)</option>
                  <option value="Color">สี</option>
                </select>
              </div>
              <div className="form-group">
                <label>ประเภท</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Original">Original</option>
                  <option value="Compatible">เทียบ</option>
                  <option value="Refill">Refill</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ราคา</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>รุ่นเครื่องพิมพ์ที่ใช้</label>
                <input
                  type="text"
                  value={formData.printerModel}
                  onChange={(e) => setFormData({ ...formData, printerModel: e.target.value })}
                  placeholder="เช่น HP LaserJet Pro M404dn"
                />
              </div>
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
            <div className="form-group">
              <label>ตำแหน่งจัดเก็บ</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
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

