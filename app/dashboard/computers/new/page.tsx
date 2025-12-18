'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Save } from 'lucide-react';
import '../computers.css';

export default function NewComputerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    computerType: 'PC',
    cpu: '',
    ram: '',
    storage: '',
    storageType: 'SSD',
    os: '',
    osVersion: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyExpiryDate: '',
    warrantyAlertDays: '30',
    contractNumber: '',
    contractStartDate: '',
    contractEndDate: '',
    monthlyRent: '',
    lessorCompany: '',
    lessorContact: '',
    itResponsibleId: '',
    userId: '',
    branch: '',
    department: '',
    status: 'Available',
    description: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/computers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : 0,
          warrantyAlertDays: parseInt(formData.warrantyAlertDays),
          monthlyRent: formData.monthlyRent ? parseFloat(formData.monthlyRent) : null,
          itResponsibleId: formData.itResponsibleId ? parseInt(formData.itResponsibleId) : null,
          userId: formData.userId ? parseInt(formData.userId) : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/computers/${data.data.computer_id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error creating computer:', error);
      alert('เกิดข้อผิดพลาดในการสร้างคอมพิวเตอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="computers-page">
        <div className="page-header">
          <a href="/dashboard/computers" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <h2>เพิ่มคอมพิวเตอร์ใหม่</h2>
        </div>

        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-section">
            <h3>ข้อมูลพื้นฐาน</h3>
            <div className="form-row">
              <div className="form-group">
                <label>ชื่อคอมพิวเตอร์ *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>ประเภท *</label>
                <select
                  value={formData.computerType}
                  onChange={(e) => setFormData({ ...formData, computerType: e.target.value })}
                  required
                >
                  <option value="PC">PC</option>
                  <option value="Laptop">Laptop</option>
                </select>
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
            <div className="form-group">
              <label>Serial Number</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Specifications</h3>
            <div className="form-row">
              <div className="form-group">
                <label>CPU</label>
                <input
                  type="text"
                  value={formData.cpu}
                  onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>RAM</label>
                <input
                  type="text"
                  value={formData.ram}
                  onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                  placeholder="เช่น 8GB, 16GB"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Storage</label>
                <input
                  type="text"
                  value={formData.storage}
                  onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                  placeholder="เช่น 256GB, 512GB"
                />
              </div>
              <div className="form-group">
                <label>Storage Type</label>
                <select
                  value={formData.storageType}
                  onChange={(e) => setFormData({ ...formData, storageType: e.target.value })}
                >
                  <option value="HDD">HDD</option>
                  <option value="SSD">SSD</option>
                  <option value="NVMe">NVMe</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>OS</label>
                <input
                  type="text"
                  value={formData.os}
                  onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                  placeholder="เช่น Windows, macOS, Linux"
                />
              </div>
              <div className="form-group">
                <label>OS Version</label>
                <input
                  type="text"
                  value={formData.osVersion}
                  onChange={(e) => setFormData({ ...formData, osVersion: e.target.value })}
                  placeholder="เช่น Windows 11, macOS 14"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>ข้อมูลการจัดซื้อ/เช่า</h3>
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
                <label>วันหมดประกัน</label>
                <input
                  type="date"
                  value={formData.warrantyExpiryDate}
                  onChange={(e) => setFormData({ ...formData, warrantyExpiryDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>แจ้งเตือนก่อนหมด (วัน)</label>
                <input
                  type="number"
                  value={formData.warrantyAlertDays}
                  onChange={(e) => setFormData({ ...formData, warrantyAlertDays: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>เลขที่สัญญาเช่า</label>
              <input
                type="text"
                value={formData.contractNumber}
                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>วันเริ่มสัญญา</label>
                <input
                  type="date"
                  value={formData.contractStartDate}
                  onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>วันสิ้นสุดสัญญา</label>
                <input
                  type="date"
                  value={formData.contractEndDate}
                  onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ค่าเช่ารายเดือน</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>บริษัทผู้ให้เช่า</label>
                <input
                  type="text"
                  value={formData.lessorCompany}
                  onChange={(e) => setFormData({ ...formData, lessorCompany: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>ผู้ติดต่อผู้ให้เช่า</label>
              <input
                type="text"
                value={formData.lessorContact}
                onChange={(e) => setFormData({ ...formData, lessorContact: e.target.value })}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>การใช้งาน</h3>
            <div className="form-row">
              <div className="form-group">
                <label>ผู้รับผิดชอบ IT</label>
                <select
                  value={formData.itResponsibleId}
                  onChange={(e) => setFormData({ ...formData, itResponsibleId: e.target.value })}
                >
                  <option value="">เลือกผู้ใช้</option>
                  {users.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>ผู้ใช้/ผู้เช่า</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                >
                  <option value="">เลือกผู้ใช้</option>
                  {users.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>สาขา</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>แผนก</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>สถานะ</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Available">พร้อมใช้งาน</option>
                <option value="In Use">กำลังใช้งาน</option>
                <option value="Repair">ซ่อม</option>
              </select>
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

