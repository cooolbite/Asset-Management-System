'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Save } from 'lucide-react';
import '../borrow-requests.css';

export default function NewBorrowRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [computers, setComputers] = useState<any[]>([]);
  const [monitors, setMonitors] = useState<any[]>([]);
  const [printers, setPrinters] = useState<any[]>([]);
  const [networkDevices, setNetworkDevices] = useState<any[]>([]);
  const [equipmentType, setEquipmentType] = useState('equipment');
  const [formData, setFormData] = useState({
    equipmentId: '',
    computerId: '',
    monitorId: '',
    printerId: '',
    networkDeviceId: '',
    requestReason: '',
    borrowDate: '',
    expectedReturnDate: '',
    conditionBefore: 'Good',
  });

  useEffect(() => {
    fetchAvailableEquipment();
  }, [equipmentType]);

  const fetchAvailableEquipment = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (equipmentType === 'equipment') {
        const response = await fetch('/api/equipment?status=Available&limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setEquipment(data.data.equipment || []);
        }
      } else if (equipmentType === 'computer') {
        const response = await fetch('/api/computers?status=Available&limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setComputers(data.data.computers || []);
        }
      } else if (equipmentType === 'monitor') {
        const response = await fetch('/api/monitors?status=Available&limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setMonitors(data.data.monitors || []);
        }
      } else if (equipmentType === 'printer') {
        const response = await fetch('/api/printers?status=Available&limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setPrinters(data.data.printers || []);
        }
      } else if (equipmentType === 'network') {
        const response = await fetch('/api/network-devices?status=Available&limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setNetworkDevices(data.data.devices || []);
        }
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least one equipment is selected
    if (!formData.equipmentId && !formData.computerId && !formData.monitorId && 
        !formData.printerId && !formData.networkDeviceId) {
      alert('กรุณาเลือกอุปกรณ์ที่ต้องการยืม');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/borrow-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          equipmentId: formData.equipmentId ? parseInt(formData.equipmentId) : null,
          computerId: formData.computerId ? parseInt(formData.computerId) : null,
          monitorId: formData.monitorId ? parseInt(formData.monitorId) : null,
          printerId: formData.printerId ? parseInt(formData.printerId) : null,
          networkDeviceId: formData.networkDeviceId ? parseInt(formData.networkDeviceId) : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/borrow-requests/${data.data.request_id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error creating borrow request:', error);
      alert('เกิดข้อผิดพลาดในการสร้างคำขอยืม');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableItems = () => {
    switch (equipmentType) {
      case 'equipment':
        return equipment;
      case 'computer':
        return computers;
      case 'monitor':
        return monitors;
      case 'printer':
        return printers;
      case 'network':
        return networkDevices;
      default:
        return [];
    }
  };

  return (
    <Layout>
      <div className="borrow-requests-page">
        <div className="page-header">
          <a href="/dashboard/borrow-requests" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <h2>ขอยืมอุปกรณ์</h2>
        </div>

        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-section">
            <h3>เลือกอุปกรณ์</h3>
            <div className="form-group">
              <label>ประเภทอุปกรณ์</label>
              <select
                value={equipmentType}
                onChange={(e) => {
                  setEquipmentType(e.target.value);
                  setFormData({
                    ...formData,
                    equipmentId: '',
                    computerId: '',
                    monitorId: '',
                    printerId: '',
                    networkDeviceId: '',
                  });
                }}
              >
                <option value="equipment">อุปกรณ์ทั่วไป</option>
                <option value="computer">คอมพิวเตอร์</option>
                <option value="monitor">จอภาพ</option>
                <option value="printer">เครื่องพิมพ์</option>
                <option value="network">อุปกรณ์เครือข่าย</option>
              </select>
            </div>
            <div className="form-group">
              <label>เลือกอุปกรณ์ *</label>
              <select
                value={
                  formData.equipmentId ||
                  formData.computerId ||
                  formData.monitorId ||
                  formData.printerId ||
                  formData.networkDeviceId ||
                  ''
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    equipmentId: equipmentType === 'equipment' ? value : '',
                    computerId: equipmentType === 'computer' ? value : '',
                    monitorId: equipmentType === 'monitor' ? value : '',
                    printerId: equipmentType === 'printer' ? value : '',
                    networkDeviceId: equipmentType === 'network' ? value : '',
                  });
                }}
                required
              >
                <option value="">เลือกอุปกรณ์</option>
                {getAvailableItems().map((item: any) => (
                  <option key={item[`${equipmentType}_id`] || item.equipment_id || item.computer_id || item.monitor_id || item.printer_id || item.network_device_id} 
                          value={item[`${equipmentType}_id`] || item.equipment_id || item.computer_id || item.monitor_id || item.printer_id || item.network_device_id}>
                    {item.asset_code} - {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>ข้อมูลการยืม</h3>
            <div className="form-group">
              <label>เหตุผลในการยืม *</label>
              <textarea
                value={formData.requestReason}
                onChange={(e) => setFormData({ ...formData, requestReason: e.target.value })}
                required
                rows={4}
                placeholder="ระบุเหตุผลในการยืมอุปกรณ์..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>วันที่ยืม *</label>
                <input
                  type="date"
                  value={formData.borrowDate}
                  onChange={(e) => setFormData({ ...formData, borrowDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>กำหนดคืน *</label>
                <input
                  type="date"
                  value={formData.expectedReturnDate}
                  onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>สภาพอุปกรณ์ก่อนยืม</label>
              <select
                value={formData.conditionBefore}
                onChange={(e) => setFormData({ ...formData, conditionBefore: e.target.value })}
              >
                <option value="Excellent">ดีมาก</option>
                <option value="Good">ดี</option>
                <option value="Fair">พอใช้</option>
                <option value="Poor">ไม่ดี</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => router.back()} className="btn btn-secondary">
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={20} />
              {loading ? 'กำลังบันทึก...' : 'ส่งคำขอ'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

