'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Edit, Save } from 'lucide-react';
import '../equipment.css';

interface EquipmentDetail {
  equipment_id: number;
  asset_code: string;
  name: string;
  brand: string;
  model: string;
  serial_number: string;
  purchase_date: string;
  purchase_price: number;
  warranty_expiry_date: string;
  warranty_alert_days: number;
  department: string;
  owner_id: number;
  owner_name: string;
  location_id: number;
  location_name: string;
  status: string;
  allow_borrow: boolean;
  ip_address: string;
  mac_address: string;
  description: string;
}

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [equipment, setEquipment] = useState<EquipmentDetail | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (params.id) {
      fetchEquipment();
      fetchLocations();
      fetchUsers();
    }
  }, [params.id]);

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/equipment/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEquipment(data.data);
        setFormData({
          name: data.data.name,
          brand: data.data.brand || '',
          model: data.data.model || '',
          serialNumber: data.data.serial_number || '',
          purchaseDate: data.data.purchase_date || '',
          purchasePrice: data.data.purchase_price || '',
          warrantyExpiryDate: data.data.warranty_expiry_date || '',
          warrantyAlertDays: data.data.warranty_alert_days || 30,
          department: data.data.department || '',
          ownerId: data.data.owner_id || '',
          locationId: data.data.location_id || '',
          status: data.data.status,
          allowBorrow: data.data.allow_borrow,
          ipAddress: data.data.ip_address || '',
          macAddress: data.data.mac_address || '',
          description: data.data.description || '',
        });
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

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
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/equipment/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : 0,
          warrantyAlertDays: parseInt(formData.warrantyAlertDays),
          ownerId: formData.ownerId ? parseInt(formData.ownerId) : null,
          locationId: formData.locationId ? parseInt(formData.locationId) : null,
        }),
      });

      if (response.ok) {
        setEditing(false);
        fetchEquipment();
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error updating equipment:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตอุปกรณ์');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">กำลังโหลด...</div>
      </Layout>
    );
  }

  if (!equipment) {
    return (
      <Layout>
        <div className="error">ไม่พบข้อมูลอุปกรณ์</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="equipment-page">
        <div className="page-header">
          <a href="/dashboard/equipment" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <div className="header-content">
            <div>
              <h2>{equipment.name}</h2>
              <div className="asset-code">Asset Code: {equipment.asset_code}</div>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn btn-secondary">
                <Edit size={20} />
                แก้ไข
              </button>
            )}
          </div>
        </div>

        {editing ? (
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
              <h3>การจัดเก็บและใช้งาน</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>แผนก</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
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
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>ผู้ครอบครอง</label>
                  <select
                    value={formData.ownerId}
                    onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
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
                    <option value="Retired">ปลดระวาง</option>
                    <option value="Disposed">จำหน่าย</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>IP Address</label>
                  <input
                    type="text"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>MAC Address</label>
                  <input
                    type="text"
                    value={formData.macAddress}
                    onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.allowBorrow}
                    onChange={(e) => setFormData({ ...formData, allowBorrow: e.target.checked })}
                  />
                  อนุญาตให้ยืม
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={20} />
                บันทึก
              </button>
            </div>
          </form>
        ) : (
          <div className="detail-grid">
            <div className="main-content">
              <div className="info-card">
                <h3>ข้อมูลพื้นฐาน</h3>
                <div className="info-list">
                  <div className="info-row">
                    <span className="info-label">Asset Code:</span>
                    <span className="asset-code">{equipment.asset_code}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ชื่อ:</span>
                    <span>{equipment.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ยี่ห้อ/รุ่น:</span>
                    <span>{equipment.brand} {equipment.model}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Serial Number:</span>
                    <span>{equipment.serial_number || '-'}</span>
                  </div>
                  {equipment.description && (
                    <div className="info-row">
                      <span className="info-label">รายละเอียด:</span>
                      <span>{equipment.description}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>ข้อมูลการจัดซื้อ</h3>
                <div className="info-list">
                  {equipment.purchase_date && (
                    <div className="info-row">
                      <span className="info-label">วันที่ซื้อ:</span>
                      <span>{new Date(equipment.purchase_date).toLocaleDateString('th-TH')}</span>
                    </div>
                  )}
                  {equipment.purchase_price > 0 && (
                    <div className="info-row">
                      <span className="info-label">ราคาซื้อ:</span>
                      <span>{equipment.purchase_price.toLocaleString()} บาท</span>
                    </div>
                  )}
                  {equipment.warranty_expiry_date && (
                    <div className="info-row">
                      <span className="info-label">วันหมดประกัน:</span>
                      <span>{new Date(equipment.warranty_expiry_date).toLocaleDateString('th-TH')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>การจัดเก็บและใช้งาน</h3>
                <div className="info-list">
                  {equipment.department && (
                    <div className="info-row">
                      <span className="info-label">แผนก:</span>
                      <span>{equipment.department}</span>
                    </div>
                  )}
                  {equipment.location_name && (
                    <div className="info-row">
                      <span className="info-label">สถานที่:</span>
                      <span>{equipment.location_name}</span>
                    </div>
                  )}
                  {equipment.owner_name && (
                    <div className="info-row">
                      <span className="info-label">ผู้ครอบครอง:</span>
                      <span>{equipment.owner_name}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">สถานะ:</span>
                    <span className={`status-badge status-${equipment.status.toLowerCase().replace(' ', '-')}`}>
                      {equipment.status}
                    </span>
                  </div>
                  {equipment.ip_address && (
                    <div className="info-row">
                      <span className="info-label">IP Address:</span>
                      <span>{equipment.ip_address}</span>
                    </div>
                  )}
                  {equipment.mac_address && (
                    <div className="info-row">
                      <span className="info-label">MAC Address:</span>
                      <span>{equipment.mac_address}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">อนุญาตให้ยืม:</span>
                    <span>{equipment.allow_borrow ? 'ใช่' : 'ไม่ใช่'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

