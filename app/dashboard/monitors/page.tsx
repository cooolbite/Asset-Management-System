'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Monitor } from 'lucide-react';
import './monitors.css';

interface MonitorItem {
  monitor_id: number;
  asset_code: string;
  name: string;
  brand: string;
  model: string;
  screen_size: number;
  resolution: string;
  status: string;
  department: string;
}

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<MonitorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchMonitors();
  }, [search, statusFilter]);

  const fetchMonitors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/monitors?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMonitors(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching monitors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="monitors-page">
        <div className="page-header">
          <div>
            <h2>จอภาพ</h2>
            <p className="page-description">จัดการจอภาพทั้งหมด</p>
          </div>
          <a href="/dashboard/monitors/new" className="btn btn-primary">
            <Plus size={20} />
            เพิ่มจอภาพ
          </a>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="ค้นหา Asset Code, ชื่อ..."
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
        </div>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : monitors.length === 0 ? (
          <div className="empty-state">
            <Monitor size={48} />
            <p>ไม่พบจอภาพ</p>
          </div>
        ) : (
          <div className="monitors-grid">
            {monitors.map((monitor) => (
              <div key={monitor.monitor_id} className="monitor-card">
                <div className="card-header">
                  <div>
                    <div className="asset-code">{monitor.asset_code}</div>
                    <h3>{monitor.name}</h3>
                  </div>
                </div>
                <div className="card-body">
                  <div className="spec-item">
                    <strong>ยี่ห้อ/รุ่น:</strong> {monitor.brand} {monitor.model}
                  </div>
                  {monitor.screen_size && (
                    <div className="spec-item">
                      <strong>ขนาด:</strong> {monitor.screen_size} นิ้ว
                    </div>
                  )}
                  {monitor.resolution && (
                    <div className="spec-item">
                      <strong>ความละเอียด:</strong> {monitor.resolution}
                    </div>
                  )}
                  {monitor.department && (
                    <div className="spec-item">
                      <strong>แผนก:</strong> {monitor.department}
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <a href={`/dashboard/monitors/${monitor.monitor_id}`} className="btn-link">
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

