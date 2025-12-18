'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Computer } from 'lucide-react';
import './computers.css';

interface Computer {
  computer_id: number;
  asset_code: string;
  name: string;
  brand: string;
  model: string;
  computer_type: string;
  cpu: string;
  ram: string;
  storage: string;
  os: string;
  status: string;
  department: string;
  user_name: string;
  contract_end_date: string;
}

export default function ComputersPage() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchComputers();
  }, [search, statusFilter, typeFilter, page]);

  const fetchComputers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);

      const response = await fetch(`/api/computers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setComputers(data.data.computers);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching computers:', error);
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
    };
    return badges[status] || { label: status, class: '' };
  };

  return (
    <Layout>
      <div className="computers-page">
        <div className="page-header">
          <div>
            <h2>คอมพิวเตอร์</h2>
            <p className="page-description">จัดการคอมพิวเตอร์ทั้งหมด</p>
          </div>
          <a href="/dashboard/computers/new" className="btn btn-primary">
            <Plus size={20} />
            เพิ่มคอมพิวเตอร์
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
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="">ทุกประเภท</option>
            <option value="PC">PC</option>
            <option value="Laptop">Laptop</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : computers.length === 0 ? (
          <div className="empty-state">
            <Computer size={48} />
            <p>ไม่พบคอมพิวเตอร์</p>
          </div>
        ) : (
          <>
            <div className="computers-grid">
              {computers.map((computer) => {
                const statusBadge = getStatusBadge(computer.status);
                return (
                  <div key={computer.computer_id} className="computer-card">
                    <div className="card-header">
                      <div>
                        <div className="asset-code">{computer.asset_code}</div>
                        <h3>{computer.name}</h3>
                      </div>
                      <span className={`status-badge ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="spec-item">
                        <strong>ประเภท:</strong> {computer.computer_type}
                      </div>
                      <div className="spec-item">
                        <strong>CPU:</strong> {computer.cpu || '-'}
                      </div>
                      <div className="spec-item">
                        <strong>RAM:</strong> {computer.ram || '-'}
                      </div>
                      <div className="spec-item">
                        <strong>Storage:</strong> {computer.storage || '-'}
                      </div>
                      <div className="spec-item">
                        <strong>OS:</strong> {computer.os || '-'}
                      </div>
                      {computer.user_name && (
                        <div className="spec-item">
                          <strong>ผู้ใช้:</strong> {computer.user_name}
                        </div>
                      )}
                      {computer.contract_end_date && (
                        <div className="spec-item">
                          <strong>สัญญาหมด:</strong>{' '}
                          {new Date(computer.contract_end_date).toLocaleDateString('th-TH')}
                        </div>
                      )}
                    </div>
                    <div className="card-footer">
                      <a
                        href={`/dashboard/computers/${computer.computer_id}`}
                        className="btn-link"
                      >
                        ดูรายละเอียด
                      </a>
                    </div>
                  </div>
                );
              })}
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

