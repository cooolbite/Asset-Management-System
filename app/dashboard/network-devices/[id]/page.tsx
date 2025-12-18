'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import '../network-devices.css';

interface NetworkDeviceDetail {
  network_device_id: number;
  asset_code: string;
  name: string;
  brand: string;
  model: string;
  device_type: string;
  ip_address: string;
  mac_address: string;
  port_count: number;
  bandwidth: string;
  vlan: string;
  firmware_version: string;
  location: string;
  branch: string;
  it_responsible_name: string;
  status: string;
  warranty_expiry_date: string;
}

export default function NetworkDeviceDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<NetworkDeviceDetail | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchDevice();
    }
  }, [params.id]);

  const fetchDevice = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/network-devices/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDevice(data.data);
      }
    } catch (error) {
      console.error('Error fetching network device:', error);
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

  if (!device) {
    return (
      <Layout>
        <div className="error">ไม่พบข้อมูลอุปกรณ์เครือข่าย</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="network-devices-page">
        <div className="page-header">
          <a href="/dashboard/network-devices" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <div>
            <h2>{device.name}</h2>
            <div className="asset-code">Asset Code: {device.asset_code}</div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="main-content">
            <div className="info-card">
              <h3>ข้อมูลพื้นฐาน</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">Asset Code:</span>
                  <span className="asset-code">{device.asset_code}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ชื่อ:</span>
                  <span>{device.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ประเภท:</span>
                  <span>{device.device_type}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ยี่ห้อ/รุ่น:</span>
                  <span>{device.brand} {device.model}</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>ข้อมูลเครือข่าย</h3>
              <div className="info-list">
                {device.ip_address && (
                  <div className="info-row">
                    <span className="info-label">IP Address:</span>
                    <span>{device.ip_address}</span>
                  </div>
                )}
                {device.mac_address && (
                  <div className="info-row">
                    <span className="info-label">MAC Address:</span>
                    <span>{device.mac_address}</span>
                  </div>
                )}
                {device.port_count && (
                  <div className="info-row">
                    <span className="info-label">จำนวน Port:</span>
                    <span>{device.port_count}</span>
                  </div>
                )}
                {device.bandwidth && (
                  <div className="info-row">
                    <span className="info-label">Bandwidth:</span>
                    <span>{device.bandwidth}</span>
                  </div>
                )}
                {device.vlan && (
                  <div className="info-row">
                    <span className="info-label">VLAN:</span>
                    <span>{device.vlan}</span>
                  </div>
                )}
                {device.firmware_version && (
                  <div className="info-row">
                    <span className="info-label">Firmware Version:</span>
                    <span>{device.firmware_version}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3>การใช้งาน</h3>
              <div className="info-list">
                {device.location && (
                  <div className="info-row">
                    <span className="info-label">ตำแหน่ง:</span>
                    <span>{device.location}</span>
                  </div>
                )}
                {device.branch && (
                  <div className="info-row">
                    <span className="info-label">สาขา:</span>
                    <span>{device.branch}</span>
                  </div>
                )}
                {device.it_responsible_name && (
                  <div className="info-row">
                    <span className="info-label">ผู้รับผิดชอบ IT:</span>
                    <span>{device.it_responsible_name}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">สถานะ:</span>
                  <span>{device.status}</span>
                </div>
                {device.warranty_expiry_date && (
                  <div className="info-row">
                    <span className="info-label">วันหมดประกัน:</span>
                    <span>{new Date(device.warranty_expiry_date).toLocaleDateString('th-TH')}</span>
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

