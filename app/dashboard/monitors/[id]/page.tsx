'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import '../monitors.css';

interface MonitorDetail {
  monitor_id: number;
  asset_code: string;
  name: string;
  brand: string;
  model: string;
  screen_size: number;
  resolution: string;
  display_type: string;
  ports: string;
  status: string;
  computer_name: string;
  computer_code: string;
  it_responsible_name: string;
  department: string;
  warranty_expiry_date: string;
}

export default function MonitorDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [monitor, setMonitor] = useState<MonitorDetail | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchMonitor();
    }
  }, [params.id]);

  const fetchMonitor = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/monitors/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMonitor(data.data);
      }
    } catch (error) {
      console.error('Error fetching monitor:', error);
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

  if (!monitor) {
    return (
      <Layout>
        <div className="error">ไม่พบข้อมูลจอภาพ</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="monitors-page">
        <div className="page-header">
          <a href="/dashboard/monitors" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <div>
            <h2>{monitor.name}</h2>
            <div className="asset-code">Asset Code: {monitor.asset_code}</div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="main-content">
            <div className="info-card">
              <h3>ข้อมูลพื้นฐาน</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">Asset Code:</span>
                  <span className="asset-code">{monitor.asset_code}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ชื่อ:</span>
                  <span>{monitor.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ยี่ห้อ/รุ่น:</span>
                  <span>{monitor.brand} {monitor.model}</span>
                </div>
                {monitor.screen_size && (
                  <div className="info-row">
                    <span className="info-label">ขนาดหน้าจอ:</span>
                    <span>{monitor.screen_size} นิ้ว</span>
                  </div>
                )}
                {monitor.resolution && (
                  <div className="info-row">
                    <span className="info-label">ความละเอียด:</span>
                    <span>{monitor.resolution}</span>
                  </div>
                )}
                {monitor.display_type && (
                  <div className="info-row">
                    <span className="info-label">ประเภทจอ:</span>
                    <span>{monitor.display_type}</span>
                  </div>
                )}
                {monitor.ports && (
                  <div className="info-row">
                    <span className="info-label">พอร์ต:</span>
                    <span>{monitor.ports}</span>
                  </div>
                )}
                {monitor.computer_name && (
                  <div className="info-row">
                    <span className="info-label">เชื่อมกับคอมพิวเตอร์:</span>
                    <span>{monitor.computer_code} - {monitor.computer_name}</span>
                  </div>
                )}
                {monitor.department && (
                  <div className="info-row">
                    <span className="info-label">แผนก:</span>
                    <span>{monitor.department}</span>
                  </div>
                )}
                {monitor.it_responsible_name && (
                  <div className="info-row">
                    <span className="info-label">ผู้รับผิดชอบ IT:</span>
                    <span>{monitor.it_responsible_name}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">สถานะ:</span>
                  <span>{monitor.status}</span>
                </div>
                {monitor.warranty_expiry_date && (
                  <div className="info-row">
                    <span className="info-label">วันหมดประกัน:</span>
                    <span>{new Date(monitor.warranty_expiry_date).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

