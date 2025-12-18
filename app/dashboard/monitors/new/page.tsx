'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Save } from 'lucide-react';
import '../monitors.css';

export default function NewMonitorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [computers, setComputers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    screenSize: '',
    resolution: '',
    displayType: '',
    ports: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyExpiryDate: '',
    warrantyAlertDays: '30',
    computerId: '',
    itResponsibleId: '',
    branch: '',
    department: '',
    status: 'Available',
    description: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchComputers();
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

  const fetchComputers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/computers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setComputers(data.data.computers || []);
      }
    } catch (error) {
      console.error('Error fetching computers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/monitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          screenSize: formData.screenSize ? parseInt(formData.screenSize) : null,
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : 0,
          warrantyAlertDays: parseInt(formData.warrantyAlertDays),
          computerId: formData.computerId ? parseInt(formData.computerId) : null,
          itResponsibleId: formData.itResponsibleId ? parseInt(formData.itResponsibleId) : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/monitors/${data.data.monitor_id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error creating monitor:', error);
      alert('เกิดข้อผิดพลาดในการสร้างจอภาพ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="monitors-page">
        <div className="page-header">
          <a href="/dashboard/monitors" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <h2>เพิ่มจอภาพใหม่</h2>
        </div>

        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-section">
            <h3>ข้อมูลพื้นฐาน</h3>
            <div className="form-row">
              <div className="form-group">
                <label>ชื่อจอภาพ *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>ยี่ห้อ</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>รุ่น</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
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
            <div className="form-row">
              <div className="form-group">
                <label>ขนาดหน้าจอ (นิ้ว)</label>
                <input
                  type="number"
                  value={formData.screenSize}
                  onChange={(e) => setFormData({ ...formData, screenSize: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>ความละเอียด</label>
                <input
                  type="text"
                  value={formData.resolution}
                  onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                  placeholder="เช่น 1920x1080"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ประเภทจอ</label>
                <select
                  value={formData.displayType}
                  onChange={(e) => setFormData({ ...formData, displayType: e.target.value })}
                >
                  <option value="">เลือกประเภท</option>
                  <option value="IPS">IPS</option>
                  <option value="VA">VA</option>
                  <option value="TN">TN</option>
                  <option value="OLED">OLED</option>
                </select>
              </div>
              <div className="form-group">
                <label>พอร์ตเชื่อมต่อ</label>
                <input
                  type="text"
                  value={formData.ports}
                  onChange={(e) => setFormData({ ...formData, ports: e.target.value })}
                  placeholder="เช่น HDMI, VGA, DVI"
                />
              </div>
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
          </div>

          <div className="form-section">
            <h3>การใช้งาน</h3>
            <div className="form-row">
              <div className="form-group">
                <label>เชื่อมกับคอมพิวเตอร์</label>
                <select
                  value={formData.computerId}
                  onChange={(e) => setFormData({ ...formData, computerId: e.target.value })}
                >
                  <option value="">ไม่เชื่อม</option>
                  {computers.map((comp) => (
                    <option key={comp.computer_id} value={comp.computer_id}>
                      {comp.asset_code} - {comp.name}
                    </option>
                  ))}
                </select>
              </div>
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

