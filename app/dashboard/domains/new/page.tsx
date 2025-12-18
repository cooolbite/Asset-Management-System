'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Save } from 'lucide-react';
import '../domains.css';

export default function NewDomainPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    domainName: '',
    registrar: '',
    registrationDate: '',
    expiryDate: '',
    alertDays: '30',
    hostingProvider: '',
    hostingPackage: '',
    hostingCost: '',
    hostingExpiryDate: '',
    sslType: '',
    sslIssuer: '',
    sslExpiryDate: '',
    sslAlertDays: '30',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          alertDays: parseInt(formData.alertDays),
          hostingCost: formData.hostingCost ? parseFloat(formData.hostingCost) : null,
          sslAlertDays: parseInt(formData.sslAlertDays),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/domains/${data.data.domain_id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error creating domain:', error);
      alert('เกิดข้อผิดพลาดในการสร้างโดเมน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="domains-page">
        <div className="page-header">
          <a href="/dashboard/domains" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <h2>เพิ่มโดเมนใหม่</h2>
        </div>

        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-section">
            <h3>ข้อมูลโดเมน</h3>
            <div className="form-row">
              <div className="form-group">
                <label>ชื่อโดเมน *</label>
                <input
                  type="text"
                  value={formData.domainName}
                  onChange={(e) => setFormData({ ...formData, domainName: e.target.value })}
                  required
                  placeholder="เช่น example.com"
                />
              </div>
              <div className="form-group">
                <label>Registrar</label>
                <input
                  type="text"
                  value={formData.registrar}
                  onChange={(e) => setFormData({ ...formData, registrar: e.target.value })}
                  placeholder="เช่น Namecheap, GoDaddy"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>วันที่จดทะเบียน</label>
                <input
                  type="date"
                  value={formData.registrationDate}
                  onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>วันหมดอายุ *</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
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
            <h3>ข้อมูล Hosting</h3>
            <div className="form-row">
              <div className="form-group">
                <label>ผู้ให้บริการ Hosting</label>
                <input
                  type="text"
                  value={formData.hostingProvider}
                  onChange={(e) => setFormData({ ...formData, hostingProvider: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>แพ็กเกจ</label>
                <input
                  type="text"
                  value={formData.hostingPackage}
                  onChange={(e) => setFormData({ ...formData, hostingPackage: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ค่าใช้จ่าย Hosting</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hostingCost}
                  onChange={(e) => setFormData({ ...formData, hostingCost: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>วันหมดอายุ Hosting</label>
                <input
                  type="date"
                  value={formData.hostingExpiryDate}
                  onChange={(e) => setFormData({ ...formData, hostingExpiryDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>ข้อมูล SSL Certificate</h3>
            <div className="form-row">
              <div className="form-group">
                <label>ประเภท SSL</label>
                <input
                  type="text"
                  value={formData.sslType}
                  onChange={(e) => setFormData({ ...formData, sslType: e.target.value })}
                  placeholder="เช่น Let's Encrypt, Wildcard SSL"
                />
              </div>
              <div className="form-group">
                <label>ผู้ออก (CA)</label>
                <input
                  type="text"
                  value={formData.sslIssuer}
                  onChange={(e) => setFormData({ ...formData, sslIssuer: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>วันหมดอายุ SSL</label>
                <input
                  type="date"
                  value={formData.sslExpiryDate}
                  onChange={(e) => setFormData({ ...formData, sslExpiryDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>แจ้งเตือนก่อนหมด SSL (วัน)</label>
                <input
                  type="number"
                  value={formData.sslAlertDays}
                  onChange={(e) => setFormData({ ...formData, sslAlertDays: e.target.value })}
                />
              </div>
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

