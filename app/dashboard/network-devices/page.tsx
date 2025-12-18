'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Network } from 'lucide-react';
import './network-devices.css';

interface NetworkDevice {
  network_device_id: number;
  asset_code: string;
  name: string;
  brand: string;
  model: string;
  device_type: string;
  ip_address: string;
  status: string;
  branch: string;
}

export default function NetworkDevicesPage() {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchDevices();
  }, [search, statusFilter, typeFilter]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(`/api/network-devices?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDevices(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching network devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      Router: 'Router',
      Switch: 'Switch',
      'Access Point': 'Access Point',
      Firewall: 'Firewall',
      Modem: 'Modem',
      Other: 'อื่นๆ',
    };
    return labels[type] || type;
  };

  return (
    <Layout>
      <div className="network-devices-page">
        <div className="page-header">
          <div>
            <h2>อุปกรณ์เครือข่าย</h2>
            <p className="page-description">จัดการอุปกรณ์เครือข่ายทั้งหมด</p>
          </div>
          <a href="/dashboard/network-devices/new" className="btn btn-primary">
            <Plus size={20} />
            เพิ่มอุปกรณ์เครือข่าย
          </a>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="ค้นหา Asset Code, ชื่อ, IP Address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">ทุกสถานะ</option>
            <option value="Available">พร้อมใช้งาน</option>
            <option value="In Use">กำลังใช้งาน</option>
            <option value="Repair">ซ่อม</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">ทุกประเภท</option>
            <option value="Router">Router</option>
            <option value="Switch">Switch</option>
            <option value="Access Point">Access Point</option>
            <option value="Firewall">Firewall</option>
            <option value="Modem">Modem</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : devices.length === 0 ? (
          <div className="empty-state">
            <Network size={48} />
            <p>ไม่พบอุปกรณ์เครือข่าย</p>
          </div>
        ) : (
          <div className="devices-grid">
            {devices.map((device) => (
              <div key={device.network_device_id} className="device-card">
                <div className="card-header">
                  <div>
                    <div className="asset-code">{device.asset_code}</div>
                    <h3>{device.name}</h3>
                  </div>
                  <span className="device-type-badge">{getDeviceTypeLabel(device.device_type)}</span>
                </div>
                <div className="card-body">
                  <div className="spec-item">
                    <strong>ยี่ห้อ/รุ่น:</strong> {device.brand} {device.model}
                  </div>
                  {device.ip_address && (
                    <div className="spec-item">
                      <strong>IP Address:</strong> {device.ip_address}
                    </div>
                  )}
                  {device.branch && (
                    <div className="spec-item">
                      <strong>สาขา:</strong> {device.branch}
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <a href={`/dashboard/network-devices/${device.network_device_id}`} className="btn-link">
                    ดูรายละเอียด
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

