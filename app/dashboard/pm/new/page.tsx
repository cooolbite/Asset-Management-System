'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import '../pm.css';

export default function NewPMPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [computers, setComputers] = useState<any[]>([]);
  const [printers, setPrinters] = useState<any[]>([]);
  const [equipmentType, setEquipmentType] = useState('equipment');
  const [formData, setFormData] = useState({
    scheduleName: '',
    equipmentId: '',
    computerId: '',
    printerId: '',
    frequencyType: 'Monthly',
    frequencyValue: '1',
    nextDueDate: '',
    assignedTo: '',
    alertDays: '7',
    checklistItems: [{ name: '', isRequired: true }],
  });

  useEffect(() => {
    fetchUsers();
    fetchEquipment();
  }, [equipmentType]);

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

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (equipmentType === 'equipment') {
        const response = await fetch('/api/equipment?limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setEquipment(data.data.equipment || []);
        }
      } else if (equipmentType === 'computer') {
        const response = await fetch('/api/computers?limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setComputers(data.data.computers || []);
        }
      } else if (equipmentType === 'printer') {
        const response = await fetch('/api/printers?limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setPrinters(data.data.printers || []);
        }
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const addChecklistItem = () => {
    setFormData({
      ...formData,
      checklistItems: [...formData.checklistItems, { name: '', isRequired: true }],
    });
  };

  const removeChecklistItem = (index: number) => {
    setFormData({
      ...formData,
      checklistItems: formData.checklistItems.filter((_, i) => i !== index),
    });
  };

  const updateChecklistItem = (index: number, field: string, value: any) => {
    const updated = [...formData.checklistItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, checklistItems: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/pm-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduleName: formData.scheduleName,
          equipmentId: formData.equipmentId ? parseInt(formData.equipmentId) : null,
          computerId: formData.computerId ? parseInt(formData.computerId) : null,
          printerId: formData.printerId ? parseInt(formData.printerId) : null,
          frequencyType: formData.frequencyType,
          frequencyValue: parseInt(formData.frequencyValue),
          nextDueDate: formData.nextDueDate,
          assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : null,
          alertDays: parseInt(formData.alertDays),
          checklistItems: formData.checklistItems.filter(item => item.name.trim() !== ''),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/pm/${data.data.schedule_id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error creating PM schedule:', error);
      alert('เกิดข้อผิดพลาดในการสร้างตาราง PM');
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
      case 'printer':
        return printers;
      default:
        return [];
    }
  };

  return (
    <Layout>
      <div className="pm-page">
        <div className="page-header">
          <a href="/dashboard/pm" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <h2>สร้างตาราง PM ใหม่</h2>
        </div>

        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-section">
            <h3>ข้อมูลตาราง PM</h3>
            <div className="form-group">
              <label>ชื่อตาราง PM *</label>
              <input
                type="text"
                value={formData.scheduleName}
                onChange={(e) => setFormData({ ...formData, scheduleName: e.target.value })}
                required
                placeholder="เช่น PM เครื่องพิมพ์รายเดือน"
              />
            </div>
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
                    printerId: '',
                  });
                }}
              >
                <option value="equipment">อุปกรณ์ทั่วไป</option>
                <option value="computer">คอมพิวเตอร์</option>
                <option value="printer">เครื่องพิมพ์</option>
              </select>
            </div>
            <div className="form-group">
              <label>เลือกอุปกรณ์ *</label>
              <select
                value={
                  formData.equipmentId ||
                  formData.computerId ||
                  formData.printerId ||
                  ''
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    equipmentId: equipmentType === 'equipment' ? value : '',
                    computerId: equipmentType === 'computer' ? value : '',
                    printerId: equipmentType === 'printer' ? value : '',
                  });
                }}
                required
              >
                <option value="">เลือกอุปกรณ์</option>
                {getAvailableItems().map((item: any) => (
                  <option
                    key={
                      item.equipment_id ||
                      item.computer_id ||
                      item.printer_id
                    }
                    value={
                      item.equipment_id ||
                      item.computer_id ||
                      item.printer_id
                    }
                  >
                    {item.asset_code} - {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>กำหนดการ</h3>
            <div className="form-row">
              <div className="form-group">
                <label>ความถี่ *</label>
                <select
                  value={formData.frequencyType}
                  onChange={(e) => setFormData({ ...formData, frequencyType: e.target.value })}
                  required
                >
                  <option value="Monthly">รายเดือน</option>
                  <option value="Quarterly">รายไตรมาส</option>
                  <option value="SemiAnnual">รายครึ่งปี</option>
                  <option value="Annual">รายปี</option>
                  <option value="Custom">กำหนดเอง</option>
                </select>
              </div>
              <div className="form-group">
                <label>จำนวน (เดือน/ไตรมาส/ปี)</label>
                <input
                  type="number"
                  value={formData.frequencyValue}
                  onChange={(e) => setFormData({ ...formData, frequencyValue: e.target.value })}
                  min="1"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>กำหนดถัดไป *</label>
                <input
                  type="date"
                  value={formData.nextDueDate}
                  onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>แจ้งเตือนก่อนถึงกำหนด (วัน)</label>
                <input
                  type="number"
                  value={formData.alertDays}
                  onChange={(e) => setFormData({ ...formData, alertDays: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>มอบหมายให้</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <option value="">เลือกช่าง</option>
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Checklist ตรวจสอบ</h3>
            {formData.checklistItems.map((item, index) => (
              <div key={index} className="checklist-item">
                <div className="form-group" style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      updateChecklistItem(index, 'name', e.target.value)
                    }
                    placeholder="รายการตรวจสอบ"
                  />
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={item.isRequired}
                    onChange={(e) =>
                      updateChecklistItem(index, 'isRequired', e.target.checked)
                    }
                  />
                  จำเป็น
                </label>
                {formData.checklistItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(index)}
                    className="btn-icon"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addChecklistItem}
              className="btn btn-secondary"
              style={{ marginTop: '1rem' }}
            >
              <Plus size={20} />
              เพิ่มรายการ
            </button>
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

