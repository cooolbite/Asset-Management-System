'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Save } from 'lucide-react';
import './new-repair.css';

interface ProblemType {
  problem_type_id: number;
  name: string;
}

export default function NewRepairPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemTypeId: '',
    priority: 'Normal',
    location: '',
    assetId: '',
    equipmentId: '',
    computerId: '',
    monitorId: '',
    printerId: '',
    networkDeviceId: '',
  });

  useEffect(() => {
    fetchProblemTypes();
  }, []);

  const fetchProblemTypes = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/problem-types', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProblemTypes(data.data);
      }
    } catch (error) {
      console.error('Error fetching problem types:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/repairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          problemTypeId: formData.problemTypeId ? parseInt(formData.problemTypeId) : null,
          priority: formData.priority,
          location: formData.location,
          assetId: formData.assetId ? parseInt(formData.assetId) : null,
          equipmentId: formData.equipmentId ? parseInt(formData.equipmentId) : null,
          computerId: formData.computerId ? parseInt(formData.computerId) : null,
          monitorId: formData.monitorId ? parseInt(formData.monitorId) : null,
          printerId: formData.printerId ? parseInt(formData.printerId) : null,
          networkDeviceId: formData.networkDeviceId ? parseInt(formData.networkDeviceId) : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/repairs/${data.data.ticket_id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error creating repair ticket:', error);
      alert('เกิดข้อผิดพลาดในการสร้างงานซ่อม');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="new-repair-page">
        <div className="page-header">
          <a href="/dashboard/repairs" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <h2>แจ้งซ่อมใหม่</h2>
        </div>

        <form onSubmit={handleSubmit} className="repair-form">
          <div className="form-section">
            <h3>ข้อมูลงานซ่อม</h3>
            <div className="form-group">
              <label>หัวข้อปัญหา *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="ระบุหัวข้อปัญหาที่พบ"
              />
            </div>

            <div className="form-group">
              <label>รายละเอียดปัญหา *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
                placeholder="อธิบายรายละเอียดของปัญหา..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ประเภทปัญหา</label>
                <select
                  value={formData.problemTypeId}
                  onChange={(e) => setFormData({ ...formData, problemTypeId: e.target.value })}
                >
                  <option value="">เลือกประเภทปัญหา</option>
                  {problemTypes.map((type) => (
                    <option key={type.problem_type_id} value={type.problem_type_id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>ความเร่งด่วน</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">ต่ำ</option>
                  <option value="Normal">ปกติ</option>
                  <option value="High">สูง</option>
                  <option value="Urgent">ด่วนมาก</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>ตำแหน่งอุปกรณ์</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="เช่น ห้อง 301, ชั้น 2"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>อุปกรณ์ที่ต้องการซ่อม</h3>
            <p className="section-description">ระบุอุปกรณ์ที่ต้องการซ่อม (เลือกอย่างใดอย่างหนึ่ง)</p>
            
            <div className="form-group">
              <label>รหัสทรัพย์สิน (Asset)</label>
              <input
                type="text"
                value={formData.assetId}
                onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                placeholder="ระบุ Asset ID"
              />
            </div>

            <div className="form-group">
              <label>อุปกรณ์ทั่วไป (Equipment ID)</label>
              <input
                type="text"
                value={formData.equipmentId}
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                placeholder="ระบุ Equipment ID"
              />
            </div>

            <div className="form-group">
              <label>คอมพิวเตอร์ (Computer ID)</label>
              <input
                type="text"
                value={formData.computerId}
                onChange={(e) => setFormData({ ...formData, computerId: e.target.value })}
                placeholder="ระบุ Computer ID"
              />
            </div>

            <div className="form-group">
              <label>จอภาพ (Monitor ID)</label>
              <input
                type="text"
                value={formData.monitorId}
                onChange={(e) => setFormData({ ...formData, monitorId: e.target.value })}
                placeholder="ระบุ Monitor ID"
              />
            </div>

            <div className="form-group">
              <label>เครื่องพิมพ์ (Printer ID)</label>
              <input
                type="text"
                value={formData.printerId}
                onChange={(e) => setFormData({ ...formData, printerId: e.target.value })}
                placeholder="ระบุ Printer ID"
              />
            </div>

            <div className="form-group">
              <label>อุปกรณ์เครือข่าย (Network Device ID)</label>
              <input
                type="text"
                value={formData.networkDeviceId}
                onChange={(e) => setFormData({ ...formData, networkDeviceId: e.target.value })}
                placeholder="ระบุ Network Device ID"
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

