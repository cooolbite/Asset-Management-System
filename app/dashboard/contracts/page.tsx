'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, FileText, AlertTriangle } from 'lucide-react';
import './contracts.css';

interface Contract {
  contract_id: number;
  contract_number: string;
  contract_type: string;
  title: string;
  vendor_company: string;
  start_date: string;
  end_date: string;
  contract_value: number;
  status: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expiringSoon, setExpiringSoon] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, [statusFilter, expiringSoon]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (expiringSoon) params.append('expiringSoon', 'true');

      const response = await fetch(`/api/contracts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setContracts(data.data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContractTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      Lease: 'เช่า',
      Service: 'บริการ',
      Maintenance: 'บำรุงรักษา',
      Other: 'อื่นๆ',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { label: string; class: string } } = {
      Active: { label: 'ใช้งาน', class: 'status-active' },
      Expired: { label: 'หมดอายุ', class: 'status-expired' },
      Cancelled: { label: 'ยกเลิก', class: 'status-cancelled' },
      Renewed: { label: 'ต่ออายุ', class: 'status-renewed' },
    };
    return badges[status] || { label: status, class: '' };
  };

  const isExpiringSoon = (endDate: string) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  return (
    <Layout>
      <div className="contracts-page">
        <div className="page-header">
          <div>
            <h2>สัญญา</h2>
            <p className="page-description">จัดการสัญญาทั้งหมด</p>
          </div>
          <a href="/dashboard/contracts/new" className="btn btn-primary">
            <Plus size={20} />
            เพิ่มสัญญา
          </a>
        </div>

        <div className="filters-section">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
            }}
            className="filter-select"
          >
            <option value="">ทุกสถานะ</option>
            <option value="Active">ใช้งาน</option>
            <option value="Expired">หมดอายุ</option>
            <option value="Cancelled">ยกเลิก</option>
            <option value="Renewed">ต่ออายุ</option>
          </select>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={expiringSoon}
              onChange={(e) => setExpiringSoon(e.target.checked)}
            />
            แสดงที่ใกล้หมดอายุเท่านั้น
          </label>
        </div>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : contracts.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <p>ไม่พบสัญญา</p>
          </div>
        ) : (
          <div className="contracts-table-container">
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>เลขที่สัญญา</th>
                  <th>หัวข้อ</th>
                  <th>ประเภท</th>
                  <th>คู่สัญญา</th>
                  <th>วันเริ่มต้น</th>
                  <th>วันสิ้นสุด</th>
                  <th>มูลค่า</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => {
                  const statusBadge = getStatusBadge(contract.status);
                  const expiring = isExpiringSoon(contract.end_date);
                  return (
                    <tr
                      key={contract.contract_id}
                      className={expiring && contract.status === 'Active' ? 'expiring-row' : ''}
                    >
                      <td>
                        <strong className="contract-number">{contract.contract_number}</strong>
                      </td>
                      <td>{contract.title}</td>
                      <td>{getContractTypeLabel(contract.contract_type)}</td>
                      <td>{contract.vendor_company}</td>
                      <td>{new Date(contract.start_date).toLocaleDateString('th-TH')}</td>
                      <td>
                        <span className={expiring && contract.status === 'Active' ? 'expiring' : ''}>
                          {new Date(contract.end_date).toLocaleDateString('th-TH')}
                          {expiring && contract.status === 'Active' && (
                            <AlertTriangle size={14} className="inline-icon" />
                          )}
                        </span>
                      </td>
                      <td>
                        {contract.contract_value
                          ? contract.contract_value.toLocaleString() + ' บาท'
                          : '-'}
                      </td>
                      <td>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                        {expiring && contract.status === 'Active' && (
                          <span className="expiring-badge">
                            <AlertTriangle size={14} />
                            ใกล้หมดอายุ
                          </span>
                        )}
                      </td>
                      <td>
                        <a href={`/dashboard/contracts/${contract.contract_id}`} className="btn-link">
                          ดูรายละเอียด
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

