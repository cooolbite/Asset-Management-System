'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Save } from 'lucide-react';
import '../network-devices.css';

export default function NewNetworkDevicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    deviceType: 'Router',
    ipAddress: '',
    macAddress: '',
    portCount: '',
    bandwidth: '',
    vlan: '',
    firmwareVersion: '',
    location: '',
    branch: '',
    itResponsibleId: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyExpiryDate: '',
    warrantyAlertDays: '30',
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
      const response = await fetch('/api/network-devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          portCount: formData.portCount ? parseInt(formData.portCount) : null,
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : 0,
          warrantyAlertDays: parseInt(formData.warrantyAlertDays),
          itResponsibleId: formData.itResponsibleId ? parseInt(formData.itResponsibleId) : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/network-devices/${data.data.network_device_id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error creating network device:', error);
      alert('เกิดข้อผิดพลาดในการสร้างอุปกรณ์เครือข่าย');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="network-devices-page">
        <div className="page-header">
          <a href="/dashboard/network-devices" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <h2>เพิ่มอุปกรณ์เครือข่ายใหม่</h2>
        </div>

        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-section">
            <h3>ข้อมูลพื้นฐาน</h3>
            <div className="form-row">
              <div className="form-group">
                <label>ชื่ออุปกรณ์ *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>ประเภทอุปกรณ์ *</label>
                <select
                  value={formData.deviceType}
                  onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                  required
                >
                  <option value="Router">Router</option>
                  <option value="Switch">Switch</option>
                  <option value="Access Point">Access Point</option>
                  <option value="Firewall">Firewall</option>
                  <option value="Modem">Modem</option>
                  <option value="Other">อื่นๆ</option>
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
            <h3>ข้อมูลเครือข่าย</h3>
            <div className="form-row">
              <div className="form-group">
                <label>IP Address</label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  placeholder="เช่น 192.168.1.1"
                />
              </div>
              <div className="form-group">
                <label>MAC Address</label>
                <input
                  type="text"
                  value={formData.macAddress}
                  onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                  placeholder="เช่น 00:11:22:33:44:55"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>จำนวน Port</label>
                <input
                  type="number"
                  value={formData.portCount}
                  onChange={(e) => setFormData({ ...formData, portCount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Bandwidth</label>
                <input
                  type="text"
                  value={formData.bandwidth}
                  onChange={(e) => setFormData({ ...formData, bandwidth: e.target.value })}
                  placeholder="เช่น 1Gbps, 10Gbps"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>VLAN</label>
                <input
                  type="text"
                  value={formData.vlan}
                  onChange={(e) => setFormData({ ...formData, vlan: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Firmware Version</label>
                <input
                  type="text"
                  value={formData.firmwareVersion}
                  onChange={(e) => setFormData({ ...formData, firmwareVersion: e.target.value })}
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
                <label>ตำแหน่ง (ห้อง Server/Rack)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="เช่น Server Room, Rack 1"
                />
              </div>
              <div className="form-group">
                <label>สาขา</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                />
              </div>
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

