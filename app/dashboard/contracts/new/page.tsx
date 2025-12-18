'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Save } from 'lucide-react';
import '../contracts.css';

export default function NewContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contractNumber: '',
    contractType: 'Lease',
    title: '',
    vendorCompany: '',
    vendorContact: '',
    vendorPhone: '',
    vendorEmail: '',
    vendorAddress: '',
    startDate: '',
    endDate: '',
    contractValue: '',
    paymentTerms: '',
    alertDays: '30',
    status: 'Active',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          contractValue: formData.contractValue ? parseFloat(formData.contractValue) : null,
          alertDays: parseInt(formData.alertDays),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/contracts/${data.data.contract_id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('เกิดข้อผิดพลาดในการสร้างสัญญา');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="contracts-page">
        <div className="page-header">
          <a href="/dashboard/contracts" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <h2>เพิ่มสัญญาใหม่</h2>
        </div>

        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-section">
            <h3>ข้อมูลสัญญา</h3>
            <div className="form-row">
              <div className="form-group">
                <label>เลขที่สัญญา *</label>
                <input
                  type="text"
                  value={formData.contractNumber}
                  onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>ประเภทสัญญา *</label>
                <select
                  value={formData.contractType}
                  onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                  required
                >
                  <option value="Lease">เช่า</option>
                  <option value="Service">บริการ</option>
                  <option value="Maintenance">บำรุงรักษา</option>
                  <option value="Other">อื่นๆ</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>หัวข้อสัญญา *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>วันเริ่มต้น *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>วันสิ้นสุด *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>มูลค่าสัญญา</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.contractValue}
                  onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                />
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
            <div className="form-group">
              <label>เงื่อนไขการชำระ</label>
              <textarea
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>สถานะ</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">ใช้งาน</option>
                <option value="Expired">หมดอายุ</option>
                <option value="Cancelled">ยกเลิก</option>
                <option value="Renewed">ต่ออายุ</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>ข้อมูลคู่สัญญา</h3>
            <div className="form-group">
              <label>ชื่อบริษัท *</label>
              <input
                type="text"
                value={formData.vendorCompany}
                onChange={(e) => setFormData({ ...formData, vendorCompany: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>ผู้ติดต่อ</label>
              <input
                type="text"
                value={formData.vendorContact}
                onChange={(e) => setFormData({ ...formData, vendorContact: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  value={formData.vendorPhone}
                  onChange={(e) => setFormData({ ...formData, vendorPhone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>อีเมล</label>
                <input
                  type="email"
                  value={formData.vendorEmail}
                  onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>ที่อยู่</label>
              <textarea
                value={formData.vendorAddress}
                onChange={(e) => setFormData({ ...formData, vendorAddress: e.target.value })}
                rows={3}
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

