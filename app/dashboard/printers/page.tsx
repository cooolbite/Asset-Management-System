'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Printer } from 'lucide-react';
import './printers.css';

interface PrinterItem {
  printer_id: number;
  asset_code: string;
  name: string;
  brand: string;
  model: string;
  printer_type: string;
  color_type: string;
  ip_address: string;
  status: string;
  department: string;
}

export default function PrintersPage() {
  const [printers, setPrinters] = useState<PrinterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPrinters();
  }, [search, statusFilter]);

  const fetchPrinters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/printers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPrinters(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching printers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="printers-page">
        <div className="page-header">
          <div>
            <h2>เครื่องพิมพ์</h2>
            <p className="page-description">จัดการเครื่องพิมพ์ทั้งหมด</p>
          </div>
          <a href="/dashboard/printers/new" className="btn btn-primary">
            <Plus size={20} />
            เพิ่มเครื่องพิมพ์
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
        </div>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : printers.length === 0 ? (
          <div className="empty-state">
            <Printer size={48} />
            <p>ไม่พบเครื่องพิมพ์</p>
          </div>
        ) : (
          <div className="printers-grid">
            {printers.map((printer) => (
              <div key={printer.printer_id} className="printer-card">
                <div className="card-header">
                  <div>
                    <div className="asset-code">{printer.asset_code}</div>
                    <h3>{printer.name}</h3>
                  </div>
                </div>
                <div className="card-body">
                  <div className="spec-item">
                    <strong>ยี่ห้อ/รุ่น:</strong> {printer.brand} {printer.model}
                  </div>
                  {printer.printer_type && (
                    <div className="spec-item">
                      <strong>ประเภท:</strong> {printer.printer_type}
                    </div>
                  )}
                  {printer.color_type && (
                    <div className="spec-item">
                      <strong>สี:</strong> {printer.color_type}
                    </div>
                  )}
                  {printer.ip_address && (
                    <div className="spec-item">
                      <strong>IP Address:</strong> {printer.ip_address}
                    </div>
                  )}
                  {printer.department && (
                    <div className="spec-item">
                      <strong>แผนก:</strong> {printer.department}
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <a href={`/dashboard/printers/${printer.printer_id}`} className="btn-link">
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

