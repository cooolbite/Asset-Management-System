'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import '../printers.css';

interface PrinterDetail {
  printer_id: number;
  asset_code: string;
  name: string;
  brand: string;
  model: string;
  printer_type: string;
  color_type: string;
  ip_address: string;
  status: string;
  location_name: string;
  department: string;
  it_responsible_name: string;
  is_shared: boolean;
  warranty_expiry_date: string;
}

export default function PrinterDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [printer, setPrinter] = useState<PrinterDetail | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchPrinter();
    }
  }, [params.id]);

  const fetchPrinter = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/printers/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPrinter(data.data);
      }
    } catch (error) {
      console.error('Error fetching printer:', error);
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

  if (!printer) {
    return (
      <Layout>
        <div className="error">ไม่พบข้อมูลเครื่องพิมพ์</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="printers-page">
        <div className="page-header">
          <a href="/dashboard/printers" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <div>
            <h2>{printer.name}</h2>
            <div className="asset-code">Asset Code: {printer.asset_code}</div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="main-content">
            <div className="info-card">
              <h3>ข้อมูลพื้นฐาน</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">Asset Code:</span>
                  <span className="asset-code">{printer.asset_code}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ชื่อ:</span>
                  <span>{printer.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ยี่ห้อ/รุ่น:</span>
                  <span>{printer.brand} {printer.model}</span>
                </div>
                {printer.printer_type && (
                  <div className="info-row">
                    <span className="info-label">ประเภท:</span>
                    <span>{printer.printer_type}</span>
                  </div>
                )}
                {printer.color_type && (
                  <div className="info-row">
                    <span className="info-label">สี:</span>
                    <span>{printer.color_type}</span>
                  </div>
                )}
                {printer.ip_address && (
                  <div className="info-row">
                    <span className="info-label">IP Address:</span>
                    <span>{printer.ip_address}</span>
                  </div>
                )}
                {printer.location_name && (
                  <div className="info-row">
                    <span className="info-label">สถานที่:</span>
                    <span>{printer.location_name}</span>
                  </div>
                )}
                {printer.department && (
                  <div className="info-row">
                    <span className="info-label">แผนก:</span>
                    <span>{printer.department}</span>
                  </div>
                )}
                {printer.it_responsible_name && (
                  <div className="info-row">
                    <span className="info-label">ผู้รับผิดชอบ IT:</span>
                    <span>{printer.it_responsible_name}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Shared Printer:</span>
                  <span>{printer.is_shared ? 'ใช่' : 'ไม่ใช่'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">สถานะ:</span>
                  <span>{printer.status}</span>
                </div>
                {printer.warranty_expiry_date && (
                  <div className="info-row">
                    <span className="info-label">วันหมดประกัน:</span>
                    <span>{new Date(printer.warranty_expiry_date).toLocaleDateString('th-TH')}</span>
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

