'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Filter, Wrench, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import './repairs.css';

interface RepairTicket {
  ticket_id: number;
  job_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  reported_by_name: string;
  assigned_to_name: string;
  reported_at: string;
  completed_at: string;
  total_cost: number;
}

export default function RepairsPage() {
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter, priorityFilter, page]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const response = await fetch(`/api/repairs?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.data.tickets);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="status-icon completed" />;
      case 'In Progress':
        return <Clock className="status-icon in-progress" />;
      case 'Assigned':
        return <AlertCircle className="status-icon assigned" />;
      case 'Cancelled':
        return <XCircle className="status-icon cancelled" />;
      default:
        return <Clock className="status-icon pending" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      Pending: 'รอรับ',
      Assigned: 'มอบหมายแล้ว',
      'In Progress': 'กำลังดำเนินการ',
      Completed: 'เสร็จสิ้น',
      Cancelled: 'ยกเลิก',
    };
    return labels[status] || status;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: { [key: string]: string } = {
      Low: 'priority-low',
      Normal: 'priority-normal',
      High: 'priority-high',
      Urgent: 'priority-urgent',
    };
    return colors[priority] || 'priority-normal';
  };

  return (
    <Layout>
      <div className="repairs-page">
        <div className="page-header">
          <div>
            <h2>ระบบแจ้งซ่อม</h2>
            <p className="page-description">จัดการงานซ่อมและติดตามสถานะ</p>
          </div>
          <a href="/dashboard/repairs/new" className="btn btn-primary">
            <Plus size={20} />
            แจ้งซ่อมใหม่
          </a>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="ค้นหา Job ID, หัวข้อ, รายละเอียด..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="">ทุกสถานะ</option>
              <option value="Pending">รอรับ</option>
              <option value="Assigned">มอบหมายแล้ว</option>
              <option value="In Progress">กำลังดำเนินการ</option>
              <option value="Completed">เสร็จสิ้น</option>
              <option value="Cancelled">ยกเลิก</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="">ทุกความเร่งด่วน</option>
              <option value="Low">ต่ำ</option>
              <option value="Normal">ปกติ</option>
              <option value="High">สูง</option>
              <option value="Urgent">ด่วนมาก</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <Wrench size={48} />
            <p>ไม่พบงานซ่อม</p>
          </div>
        ) : (
          <>
            <div className="tickets-grid">
              {tickets.map((ticket) => (
                <a
                  key={ticket.ticket_id}
                  href={`/dashboard/repairs/${ticket.ticket_id}`}
                  className="ticket-card"
                >
                  <div className="ticket-header">
                    <div className="ticket-id">{ticket.job_id}</div>
                    <div className={`priority-badge ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </div>
                  </div>
                  <h3 className="ticket-title">{ticket.title}</h3>
                  <p className="ticket-description">{ticket.description.substring(0, 100)}...</p>
                  <div className="ticket-footer">
                    <div className="ticket-status">
                      {getStatusIcon(ticket.status)}
                      <span>{getStatusLabel(ticket.status)}</span>
                    </div>
                    <div className="ticket-meta">
                      <span>โดย {ticket.reported_by_name}</span>
                      {ticket.assigned_to_name && (
                        <span>• มอบหมายให้ {ticket.assigned_to_name}</span>
                      )}
                    </div>
                    <div className="ticket-date">
                      {new Date(ticket.reported_at).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                </a>
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

