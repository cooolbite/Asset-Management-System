'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';
import './borrow-requests.css';

interface BorrowRequest {
  request_id: number;
  request_number: string;
  equipment_name: string;
  computer_name: string;
  monitor_name: string;
  printer_name: string;
  network_device_name: string;
  requested_by_name: string;
  status: string;
  borrow_date: string;
  expected_return_date: string;
  request_reason: string;
}

export default function BorrowRequestsPage() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRequests();
  }, [search, statusFilter, page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/borrow-requests?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.data.requests);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching borrow requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Borrowed':
        return <CheckCircle className="status-icon approved" />;
      case 'Rejected':
        return <XCircle className="status-icon rejected" />;
      case 'Returned':
        return <CheckCircle className="status-icon returned" />;
      case 'Overdue':
        return <Clock className="status-icon overdue" />;
      default:
        return <Clock className="status-icon pending" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      Pending: 'รออนุมัติ',
      Approved: 'อนุมัติแล้ว',
      Rejected: 'ปฏิเสธ',
      Borrowed: 'ยืมแล้ว',
      Returned: 'คืนแล้ว',
      Overdue: 'เกินกำหนด',
    };
    return labels[status] || status;
  };

  const getEquipmentName = (request: BorrowRequest) => {
    return (
      request.equipment_name ||
      request.computer_name ||
      request.monitor_name ||
      request.printer_name ||
      request.network_device_name ||
      '-'
    );
  };

  return (
    <Layout>
      <div className="borrow-requests-page">
        <div className="page-header">
          <div>
            <h2>ยืม-คืนอุปกรณ์</h2>
            <p className="page-description">จัดการคำขอยืมและคืนอุปกรณ์</p>
          </div>
          <a href="/dashboard/borrow-requests/new" className="btn btn-primary">
            <Plus size={20} />
            ขอยืมอุปกรณ์
          </a>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="ค้นหา Request Number, อุปกรณ์..."
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
            <option value="Pending">รออนุมัติ</option>
            <option value="Approved">อนุมัติแล้ว</option>
            <option value="Rejected">ปฏิเสธ</option>
            <option value="Borrowed">ยืมแล้ว</option>
            <option value="Returned">คืนแล้ว</option>
            <option value="Overdue">เกินกำหนด</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} />
            <p>ไม่พบคำขอยืม</p>
          </div>
        ) : (
          <>
            <div className="requests-grid">
              {requests.map((request) => (
                <div key={request.request_id} className="request-card">
                  <div className="card-header">
                    <div className="request-number">{request.request_number}</div>
                    <div className="status-badge">
                      {getStatusIcon(request.status)}
                      <span>{getStatusLabel(request.status)}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="info-item">
                      <strong>อุปกรณ์:</strong> {getEquipmentName(request)}
                    </div>
                    <div className="info-item">
                      <strong>ผู้ขอยืม:</strong> {request.requested_by_name}
                    </div>
                    <div className="info-item">
                      <strong>เหตุผล:</strong> {request.request_reason.substring(0, 100)}
                      {request.request_reason.length > 100 && '...'}
                    </div>
                    <div className="date-info">
                      <div>
                        <strong>วันที่ยืม:</strong>{' '}
                        {new Date(request.borrow_date).toLocaleDateString('th-TH')}
                      </div>
                      <div>
                        <strong>กำหนดคืน:</strong>{' '}
                        {new Date(request.expected_return_date).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <a
                      href={`/dashboard/borrow-requests/${request.request_id}`}
                      className="btn-link"
                    >
                      ดูรายละเอียด
                    </a>
                  </div>
                </div>
              ))}
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

