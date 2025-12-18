'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import '../software.css';

interface SoftwareDetail {
  license_id: number;
  software_name: string;
  version: string;
  license_type: string;
  total_licenses: number;
  used_licenses: number;
  available_licenses: number;
  expiry_date: string;
  vendor: string;
  purchase_price: number;
}

export default function SoftwareDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [software, setSoftware] = useState<SoftwareDetail | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchSoftware();
    }
  }, [params.id]);

  const fetchSoftware = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/software-licenses/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSoftware(data.data);
      }
    } catch (error) {
      console.error('Error fetching software:', error);
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

  if (!software) {
    return (
      <Layout>
        <div className="error">ไม่พบข้อมูลซอฟต์แวร์</div>
      </Layout>
    );
  }

  const usagePercent = software.total_licenses > 0 
    ? Math.round((software.used_licenses / software.total_licenses) * 100) 
    : 0;

  return (
    <Layout>
      <div className="software-page">
        <div className="page-header">
          <a href="/dashboard/software" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <div>
            <h2>{software.software_name}</h2>
            {software.version && <span className="version">v{software.version}</span>}
          </div>
        </div>

        <div className="detail-grid">
          <div className="main-content">
            <div className="info-card">
              <h3>ข้อมูลซอฟต์แวร์</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">ชื่อซอฟต์แวร์:</span>
                  <span>{software.software_name}</span>
                </div>
                {software.version && (
                  <div className="info-row">
                    <span className="info-label">เวอร์ชัน:</span>
                    <span>{software.version}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">ประเภท License:</span>
                  <span>{software.license_type}</span>
                </div>
                {software.vendor && (
                  <div className="info-row">
                    <span className="info-label">Vendor:</span>
                    <span>{software.vendor}</span>
                  </div>
                )}
                {software.expiry_date && (
                  <div className="info-row">
                    <span className="info-label">วันหมดอายุ:</span>
                    <span>{new Date(software.expiry_date).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
                {software.purchase_price > 0 && (
                  <div className="info-row">
                    <span className="info-label">ราคาซื้อ:</span>
                    <span>{software.purchase_price.toLocaleString()} บาท</span>
                  </div>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3>License Usage</h3>
              <div className="license-usage">
                <div className="usage-header">
                  <span>
                    ใช้ไป {software.used_licenses} / {software.total_licenses} License
                  </span>
                  <span className="usage-percent">{usagePercent}%</span>
                </div>
                <div className="usage-bar">
                  <div
                    className="usage-fill"
                    style={{ width: `${usagePercent}%` }}
                  ></div>
                </div>
                <div className="usage-footer">
                  <span className="available">
                    คงเหลือ {software.available_licenses} License
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

