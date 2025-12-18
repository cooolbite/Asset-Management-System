'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import '../pm.css';

interface PMDetail {
  schedule_id: number;
  schedule_name: string;
  frequency_type: string;
  frequency_value: number;
  next_due_date: string;
  assigned_to_name: string;
  is_active: boolean;
  alert_days: number;
  equipment_name: string;
  computer_name: string;
  printer_name: string;
}

export default function PMDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<PMDetail | null>(null);
  const [checklist, setChecklist] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchPM();
    }
  }, [params.id]);

  const fetchPM = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/pm-schedules/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSchedule(data.data.schedule);
        setChecklist(data.data.checklist || []);
      }
    } catch (error) {
      console.error('Error fetching PM schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">กำลังโหลด...</div>
      </Layout>
    );
  }

  if (!schedule) {
    return (
      <Layout>
        <div className="error">ไม่พบข้อมูลตาราง PM</div>
      </Layout>
    );
  }

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

  return (
    <Layout>
      <div className="pm-page">
        <div className="page-header">
          <a href="/dashboard/pm" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <div>
            <h2>{schedule.schedule_name}</h2>
          </div>
        </div>

        <div className="detail-grid">
          <div className="main-content">
            <div className="info-card">
              <h3>ข้อมูลตาราง PM</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">ชื่อตาราง:</span>
                  <span>{schedule.schedule_name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">อุปกรณ์:</span>
                  <span>
                    {schedule.equipment_name ||
                      schedule.computer_name ||
                      schedule.printer_name ||
                      '-'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">ความถี่:</span>
                  <span>
                    {getFrequencyLabel(schedule.frequency_type)} ทุก{' '}
                    {schedule.frequency_value}{' '}
                    {schedule.frequency_type === 'Monthly'
                      ? 'เดือน'
                      : schedule.frequency_type === 'Quarterly'
                      ? 'ไตรมาส'
                      : schedule.frequency_type === 'Annual'
                      ? 'ปี'
                      : ''}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">กำหนดถัดไป:</span>
                  <span>
                    {new Date(schedule.next_due_date).toLocaleDateString('th-TH')}
                  </span>
                </div>
                {schedule.assigned_to_name && (
                  <div className="info-row">
                    <span className="info-label">มอบหมายให้:</span>
                    <span>{schedule.assigned_to_name}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">สถานะ:</span>
                  <span className={schedule.is_active ? 'active-status' : 'inactive-status'}>
                    {schedule.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">แจ้งเตือนก่อนถึงกำหนด:</span>
                  <span>{schedule.alert_days} วัน</span>
                </div>
              </div>
            </div>

            {checklist.length > 0 && (
              <div className="info-card">
                <h3>Checklist ตรวจสอบ</h3>
                <div className="checklist-list">
                  {checklist.map((item, index) => (
                    <div key={item.checklist_id} className="checklist-item-display">
                      <span className="checklist-number">{index + 1}.</span>
                      <span>{item.item_name}</span>
                      {item.is_required && (
                        <span className="required-badge">จำเป็น</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

