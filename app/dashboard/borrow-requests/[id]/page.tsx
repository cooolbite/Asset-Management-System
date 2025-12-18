'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import '../borrow-requests.css';

interface BorrowRequestDetail {
  request_id: number;
  request_number: string;
  equipment_name: string;
  computer_name: string;
  monitor_name: string;
  printer_name: string;
  network_device_name: string;
  requested_by_name: string;
  approved_by_name: string;
  status: string;
  request_reason: string;
  borrow_date: string;
  expected_return_date: string;
  actual_return_date: string;
  condition_before: string;
  condition_after: string;
  rejection_reason: string;
}

export default function BorrowRequestDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<BorrowRequestDetail | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchRequest();
    }
  }, [params.id]);

  const fetchRequest = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/borrow-requests/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRequest(data.data);
      }
    } catch (error) {
      console.error('Error fetching borrow request:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEquipmentName = () => {
    return (
      request?.equipment_name ||
      request?.computer_name ||
      request?.monitor_name ||
      request?.printer_name ||
      request?.network_device_name ||
      '-'
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">กำลังโหลด...</div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout>
        <div className="error">ไม่พบข้อมูลคำขอยืม</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="borrow-requests-page">
        <div className="page-header">
          <a href="/dashboard/borrow-requests" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <div>
            <h2>คำขอยืม #{request.request_number}</h2>
            <div className="status-badge">
              {request.status === 'Approved' || request.status === 'Returned' ? (
                <CheckCircle className="status-icon approved" />
              ) : request.status === 'Rejected' ? (
                <XCircle className="status-icon rejected" />
              ) : null}
              <span>{request.status}</span>
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="main-content">
            <div className="info-card">
              <h3>ข้อมูลคำขอ</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">Request Number:</span>
                  <span>{request.request_number}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">อุปกรณ์:</span>
                  <span>{getEquipmentName()}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ผู้ขอยืม:</span>
                  <span>{request.request_by_name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">เหตุผล:</span>
                  <span>{request.request_reason}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">วันที่ยืม:</span>
                  <span>{new Date(request.borrow_date).toLocaleDateString('th-TH')}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">กำหนดคืน:</span>
                  <span>{new Date(request.expected_return_date).toLocaleDateString('th-TH')}</span>
                </div>
                {request.actual_return_date && (
                  <div className="info-row">
                    <span className="info-label">วันที่คืนจริง:</span>
                    <span>{new Date(request.actual_return_date).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
                {request.condition_before && (
                  <div className="info-row">
                    <span className="info-label">สภาพก่อนยืม:</span>
                    <span>{request.condition_before}</span>
                  </div>
                )}
                {request.condition_after && (
                  <div className="info-row">
                    <span className="info-label">สภาพหลังคืน:</span>
                    <span>{request.condition_after}</span>
                  </div>
                )}
                {request.approved_by_name && (
                  <div className="info-row">
                    <span className="info-label">อนุมัติโดย:</span>
                    <span>{request.approved_by_name}</span>
                  </div>
                )}
                {request.rejection_reason && (
                  <div className="info-row">
                    <span className="info-label">เหตุผลปฏิเสธ:</span>
                    <span>{request.rejection_reason}</span>
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

