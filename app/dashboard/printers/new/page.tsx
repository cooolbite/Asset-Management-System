'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Save } from 'lucide-react';
import '../printers.css';

export default function NewPrinterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    printerType: '',
    colorType: '',
    ipAddress: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyExpiryDate: '',
    warrantyAlertDays: '30',
    locationId: '',
    branch: '',
    department: '',
    itResponsibleId: '',
    isShared: false,
    status: 'Available',
    description: '',
  });

  useEffect(() => {
    fetchLocations();
    fetchUsers();
  }, []);

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/locations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLocations(data.data.locations || []);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

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
      const response = await fetch('/api/printers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : 0,
          warrantyAlertDays: parseInt(formData.warrantyAlertDays),
          locationId: formData.locationId ? parseInt(formData.locationId) : null,
          itResponsibleId: formData.itResponsibleId ? parseInt(formData.itResponsibleId) : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/printers/${data.data.printer_id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error creating printer:', error);
      alert('เกิดข้อผิดพลาดในการสร้างเครื่องพิมพ์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="printers-page">
        <div className="page-header">
          <a href="/dashboard/printers" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <h2>เพิ่มเครื่องพิมพ์ใหม่</h2>
        </div>

        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-section">
            <h3>ข้อมูลพื้นฐาน</h3>
            <div className="form-row">
              <div className="form-group">
                <label>ชื่อเครื่องพิมพ์ *</label>
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
                <label>ประเภทเครื่องพิมพ์</label>
                <select
                  value={formData.printerType}
                  onChange={(e) => setFormData({ ...formData, printerType: e.target.value })}
                >
                  <option value="">เลือกประเภท</option>
                  <option value="Laser">Laser</option>
                  <option value="Inkjet">Inkjet</option>
                  <option value="Dot Matrix">Dot Matrix</option>
                  <option value="Thermal">Thermal</option>
                </select>
              </div>
              <div className="form-group">
                <label>สี</label>
                <select
                  value={formData.colorType}
                  onChange={(e) => setFormData({ ...formData, colorType: e.target.value })}
                >
                  <option value="">เลือกสี</option>
                  <option value="Color">สี</option>
                  <option value="Monochrome">ขาวดำ</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>IP Address</label>
              <input
                type="text"
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                placeholder="เช่น 192.168.1.100"
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
                <label>สถานที่</label>
                <select
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                >
                  <option value="">เลือกสถานที่</option>
                  {locations.map((loc) => (
                    <option key={loc.location_id} value={loc.location_id}>
                      {loc.name}
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
            <div className="form-row">
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
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isShared}
                    onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                  />
                  Shared Printer
                </label>
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

