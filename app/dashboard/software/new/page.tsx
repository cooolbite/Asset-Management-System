'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Save } from 'lucide-react';
import '../software.css';

export default function NewSoftwarePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    softwareName: '',
    version: '',
    licenseType: 'Perpetual',
    licenseKey: '',
    totalLicenses: '1',
    usedLicenses: '0',
    purchaseDate: '',
    purchasePrice: '',
    vendor: '',
    expiryDate: '',
    alertDays: '30',
    invoiceNumber: '',
    contractNumber: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/software-licenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          totalLicenses: parseInt(formData.totalLicenses),
          usedLicenses: parseInt(formData.usedLicenses),
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
          alertDays: parseInt(formData.alertDays),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/software/${data.data.license_id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error creating software license:', error);
      alert('เกิดข้อผิดพลาดในการสร้างซอฟต์แวร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="software-page">
        <div className="page-header">
          <a href="/dashboard/software" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <h2>เพิ่มซอฟต์แวร์ใหม่</h2>
        </div>

        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-section">
            <h3>ข้อมูลซอฟต์แวร์</h3>
            <div className="form-row">
              <div className="form-group">
                <label>ชื่อซอฟต์แวร์ *</label>
                <input
                  type="text"
                  value={formData.softwareName}
                  onChange={(e) => setFormData({ ...formData, softwareName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>เวอร์ชัน</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ประเภท License *</label>
                <select
                  value={formData.licenseType}
                  onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                  required
                >
                  <option value="Perpetual">Perpetual (ถาวร)</option>
                  <option value="Subscription">Subscription (รายเดือน/รายปี)</option>
                  <option value="Trial">Trial (ทดลองใช้)</option>
                </select>
              </div>
              <div className="form-group">
                <label>จำนวน License *</label>
                <input
                  type="number"
                  value={formData.totalLicenses}
                  onChange={(e) => setFormData({ ...formData, totalLicenses: e.target.value })}
                  required
                  min="1"
                />
              </div>
            </div>
            <div className="form-group">
              <label>License Key</label>
              <textarea
                value={formData.licenseKey}
                onChange={(e) => setFormData({ ...formData, licenseKey: e.target.value })}
                rows={2}
                placeholder="ระบุ License Key (ถ้ามี)"
              />
            </div>
            <div className="form-group">
              <label>ใช้ไปแล้ว</label>
              <input
                type="number"
                value={formData.usedLicenses}
                onChange={(e) => setFormData({ ...formData, usedLicenses: e.target.value })}
                min="0"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>ข้อมูลการจัดซื้อ</h3>
            <div className="form-row">
              <div className="form-group">
                <label>วันที่ซื้อ</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>ราคาซื้อ</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Vendor/ผู้จำหน่าย</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>วันหมดอายุ</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>เลขที่ Invoice</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>เลขที่สัญญา</label>
                <input
                  type="text"
                  value={formData.contractNumber}
                  onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>แจ้งเตือนก่อนหมด (วัน)</label>
              <input
                type="number"
                value={formData.alertDays}
                onChange={(e) => setFormData({ ...formData, alertDays: e.target.value })}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>หมายเหตุ</h3>
            <div className="form-group">
              <label>หมายเหตุ</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
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

