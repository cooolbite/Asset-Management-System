'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, HardDrive, CheckCircle, XCircle, Clock } from 'lucide-react';
import './equipment.css';

interface Equipment {
  equipment_id: number;
  asset_code: string;
  name: string;
  brand: string;
  model: string;
  serial_number: string;
  status: string;
  department: string;
  owner_name: string;
  location_name: string;
  warranty_expiry_date: string;
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEquipment();
  }, [search, statusFilter, page]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/equipment?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEquipment(data.data.equipment);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { label: string; class: string } } = {
      Available: { label: 'พร้อมใช้งาน', class: 'status-available' },
      'In Use': { label: 'กำลังใช้งาน', class: 'status-in-use' },
      Repair: { label: 'ซ่อม', class: 'status-repair' },
      Retired: { label: 'ปลดระวาง', class: 'status-retired' },
      Disposed: { label: 'จำหน่าย', class: 'status-disposed' },
    };
    return badges[status] || { label: status, class: '' };
  };

  return (
    <Layout>
      <div className="equipment-page">
        <div className="page-header">
          <div>
            <h2>อุปกรณ์ทั่วไป</h2>
            <p className="page-description">จัดการอุปกรณ์ทั่วไปทั้งหมด</p>
          </div>
          <a href="/dashboard/equipment/new" className="btn btn-primary">
            <Plus size={20} />
            เพิ่มอุปกรณ์
          </a>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="ค้นหา Asset Code, ชื่อ, Serial Number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="">ทุกสถานะ</option>
            <option value="Available">พร้อมใช้งาน</option>
            <option value="In Use">กำลังใช้งาน</option>
            <option value="Repair">ซ่อม</option>
            <option value="Retired">ปลดระวาง</option>
            <option value="Disposed">จำหน่าย</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : equipment.length === 0 ? (
          <div className="empty-state">
            <HardDrive size={48} />
            <p>ไม่พบอุปกรณ์</p>
          </div>
        ) : (
          <>
            <div className="equipment-table-container">
              <table className="equipment-table">
                <thead>
                  <tr>
                    <th>Asset Code</th>
                    <th>ชื่ออุปกรณ์</th>
                    <th>ยี่ห้อ/รุ่น</th>
                    <th>Serial Number</th>
                    <th>แผนก</th>
                    <th>สถานที่</th>
                    <th>สถานะ</th>
                    <th>ประกันหมด</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((item) => {
                    const statusBadge = getStatusBadge(item.status);
                    return (
                      <tr key={item.equipment_id}>
                        <td>
                          <strong className="asset-code">{item.asset_code}</strong>
                        </td>
                        <td>{item.name}</td>
                        <td>
                          {item.brand} {item.model}
                        </td>
                        <td>{item.serial_number || '-'}</td>
                        <td>{item.department || '-'}</td>
                        <td>{item.location_name || '-'}</td>
                        <td>
                          <span className={`status-badge ${statusBadge.class}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td>
                          {item.warranty_expiry_date
                            ? new Date(item.warranty_expiry_date).toLocaleDateString('th-TH')
                            : '-'}
                        </td>
                        <td>
                          <a
                            href={`/dashboard/equipment/${item.equipment_id}`}
                            className="btn-link"
                          >
                            ดูรายละเอียด
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary"
                >
                  ก่อนหน้า
                </button>
                <span>
                  หน้า {page} จาก {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-secondary"
                >
                  ถัดไป
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

