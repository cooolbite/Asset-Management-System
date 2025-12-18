'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Calendar, AlertCircle } from 'lucide-react';
import './pm.css';

interface PMSchedule {
  schedule_id: number;
  schedule_name: string;
  frequency_type: string;
  next_due_date: string;
  assigned_to_name: string;
  is_active: boolean;
  equipment_name: string;
  computer_name: string;
  printer_name: string;
}

export default function PMPage() {
  const [schedules, setSchedules] = useState<PMSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dueSoon, setDueSoon] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, [dueSoon]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (dueSoon) params.append('dueSoon', 'true');

      const response = await fetch(`/api/pm-schedules?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(data.data);
      }
    } catch (error) {
      console.error('Error fetching PM schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFrequencyLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      Monthly: 'รายเดือน',
      Quarterly: 'รายไตรมาส',
      SemiAnnual: 'รายครึ่งปี',
      Annual: 'รายปี',
      Custom: 'กำหนดเอง',
    };
    return labels[type] || type;
  };

  const isDueSoon = (dueDate: string) => {
    const daysUntilDue = Math.ceil(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  };

  return (
    <Layout>
      <div className="pm-page">
        <div className="page-header">
          <div>
            <h2>บำรุงรักษาเชิงป้องกัน (PM)</h2>
            <p className="page-description">จัดการตารางการบำรุงรักษาเชิงป้องกัน</p>
          </div>
          <a href="/dashboard/pm/new" className="btn btn-primary">
            <Plus size={20} />
            สร้างตาราง PM
          </a>
        </div>

        <div className="filters-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={dueSoon}
              onChange={(e) => setDueSoon(e.target.checked)}
            />
            แสดงที่ใกล้ถึงกำหนดเท่านั้น
          </label>
        </div>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : schedules.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>ไม่พบตาราง PM</p>
          </div>
        ) : (
          <div className="pm-grid">
            {schedules.map((schedule) => {
              const dueSoonFlag = isDueSoon(schedule.next_due_date);
              return (
                <div key={schedule.schedule_id} className="pm-card">
                  <div className="card-header">
                    <h3>{schedule.schedule_name}</h3>
                    {dueSoonFlag && (
                      <span className="due-soon-badge">
                        <AlertCircle size={14} />
                        ใกล้ถึงกำหนด
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="info-item">
                      <strong>อุปกรณ์:</strong>{' '}
                      {schedule.equipment_name ||
                        schedule.computer_name ||
                        schedule.printer_name ||
                        '-'}
                    </div>
                    <div className="info-item">
                      <strong>ความถี่:</strong> {getFrequencyLabel(schedule.frequency_type)}
                    </div>
                    <div className="info-item">
                      <strong>กำหนดถัดไป:</strong>{' '}
                      {new Date(schedule.next_due_date).toLocaleDateString('th-TH')}
                    </div>
                    {schedule.assigned_to_name && (
                      <div className="info-item">
                        <strong>มอบหมายให้:</strong> {schedule.assigned_to_name}
                      </div>
                    )}
                    <div className="info-item">
                      <strong>สถานะ:</strong>{' '}
                      <span className={schedule.is_active ? 'active-status' : 'inactive-status'}>
                        {schedule.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <a href={`/dashboard/pm/${schedule.schedule_id}`} className="btn-link">
                      ดูรายละเอียด
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

