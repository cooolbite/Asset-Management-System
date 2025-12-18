'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Edit, CheckCircle, Clock, XCircle, AlertCircle, User, Calendar, DollarSign } from 'lucide-react';
import './repair-detail.css';

interface RepairDetail {
  ticket: any;
  attachments: any[];
  timeline: any[];
  spareParts: any[];
}

export default function RepairDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RepairDetail | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchRepairDetail();
    }
  }, [params.id]);

  const fetchRepairDetail = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/repairs/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching repair detail:', error);
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

  if (loading) {
    return (
      <Layout>
        <div className="loading">กำลังโหลด...</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="error">ไม่พบข้อมูลงานซ่อม</div>
      </Layout>
    );
  }

  const { ticket, attachments, timeline, spareParts } = data;

  return (
    <Layout>
      <div className="repair-detail-page">
        <div className="page-header">
          <a href="/dashboard/repairs" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <div className="header-content">
            <div>
              <h2>{ticket.title}</h2>
              <div className="job-id">Job ID: {ticket.job_id}</div>
            </div>
            <div className="status-badge">
              {getStatusIcon(ticket.status)}
              <span>{getStatusLabel(ticket.status)}</span>
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="main-content">
            <div className="info-card">
              <h3>รายละเอียดปัญหา</h3>
              <p>{ticket.description}</p>
              {ticket.location && (
                <div className="info-item">
                  <strong>ตำแหน่ง:</strong> {ticket.location}
                </div>
              )}
              {ticket.problem_type_name && (
                <div className="info-item">
                  <strong>ประเภทปัญหา:</strong> {ticket.problem_type_name}
                </div>
              )}
            </div>

            {ticket.status === 'Completed' && (
              <>
                {ticket.root_cause && (
                  <div className="info-card">
                    <h3>สาเหตุ</h3>
                    <p>{ticket.root_cause}</p>
                  </div>
                )}
                {ticket.solution && (
                  <div className="info-card">
                    <h3>วิธีแก้ไข</h3>
                    <p>{ticket.solution}</p>
                  </div>
                )}
              </>
            )}

            {spareParts.length > 0 && (
              <div className="info-card">
                <h3>อะไหล่ที่ใช้</h3>
                <table className="spare-parts-table">
                  <thead>
                    <tr>
                      <th>ชื่ออะไหล่</th>
                      <th>จำนวน</th>
                      <th>ราคาต่อหน่วย</th>
                      <th>รวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spareParts.map((part) => (
                      <tr key={part.repair_part_id}>
                        <td>{part.spare_part_name}</td>
                        <td>{part.quantity}</td>
                        <td>{part.unit_cost.toLocaleString()} บาท</td>
                        <td>{part.total_cost.toLocaleString()} บาท</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ticket.total_cost > 0 && (
                  <div className="total-cost">
                    <strong>ค่าใช้จ่ายรวม: {ticket.total_cost.toLocaleString()} บาท</strong>
                  </div>
                )}
              </div>
            )}

            {attachments.length > 0 && (
              <div className="info-card">
                <h3>ไฟล์แนบ</h3>
                <div className="attachments-list">
                  {attachments.map((att) => (
                    <a
                      key={att.attachment_id}
                      href={att.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachment-item"
                    >
                      {att.file_name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {timeline.length > 0 && (
              <div className="info-card">
                <h3>Timeline</h3>
                <div className="timeline">
                  {timeline.map((item, index) => (
                    <div key={item.timeline_id} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-status">{getStatusLabel(item.status)}</div>
                        {item.note && <p className="timeline-note">{item.note}</p>}
                        <div className="timeline-meta">
                          โดย {item.created_by_name} • {new Date(item.created_at).toLocaleString('th-TH')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="sidebar">
            <div className="info-card">
              <h3>ข้อมูลงาน</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">ความเร่งด่วน:</span>
                  <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">แจ้งโดย:</span>
                  <span>{ticket.reported_by_name}</span>
                </div>
                {ticket.assigned_to_name && (
                  <div className="info-row">
                    <span className="info-label">มอบหมายให้:</span>
                    <span>{ticket.assigned_to_name}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">วันที่แจ้ง:</span>
                  <span>{new Date(ticket.reported_at).toLocaleString('th-TH')}</span>
                </div>
                {ticket.assigned_at && (
                  <div className="info-row">
                    <span className="info-label">วันที่มอบหมาย:</span>
                    <span>{new Date(ticket.assigned_at).toLocaleString('th-TH')}</span>
                  </div>
                )}
                {ticket.started_at && (
                  <div className="info-row">
                    <span className="info-label">วันที่เริ่ม:</span>
                    <span>{new Date(ticket.started_at).toLocaleString('th-TH')}</span>
                  </div>
                )}
                {ticket.completed_at && (
                  <div className="info-row">
                    <span className="info-label">วันที่เสร็จ:</span>
                    <span>{new Date(ticket.completed_at).toLocaleString('th-TH')}</span>
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

