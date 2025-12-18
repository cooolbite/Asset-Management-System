'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import '../contracts.css';

interface ContractDetail {
  contract_id: number;
  contract_number: string;
  contract_type: string;
  title: string;
  vendor_company: string;
  vendor_contact: string;
  vendor_phone: string;
  vendor_email: string;
  vendor_address: string;
  start_date: string;
  end_date: string;
  contract_value: number;
  payment_terms: string;
  status: string;
}

export default function ContractDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<ContractDetail | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchContract();
    }
  }, [params.id]);

  const fetchContract = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/contracts/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setContract(data.data);
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">กำลังโหลด...</div>
      </Layout>
    );
  }

  if (!contract) {
    return (
      <Layout>
        <div className="error">ไม่พบข้อมูลสัญญา</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="contracts-page">
        <div className="page-header">
          <a href="/dashboard/contracts" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <div>
            <h2>{contract.title}</h2>
            <div className="contract-number">เลขที่สัญญา: {contract.contract_number}</div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="main-content">
            <div className="info-card">
              <h3>ข้อมูลสัญญา</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">เลขที่สัญญา:</span>
                  <span className="contract-number">{contract.contract_number}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ประเภท:</span>
                  <span>{contract.contract_type}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">หัวข้อ:</span>
                  <span>{contract.title}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">วันเริ่มต้น:</span>
                  <span>{new Date(contract.start_date).toLocaleDateString('th-TH')}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">วันสิ้นสุด:</span>
                  <span>{new Date(contract.end_date).toLocaleDateString('th-TH')}</span>
                </div>
                {contract.contract_value > 0 && (
                  <div className="info-row">
                    <span className="info-label">มูลค่าสัญญา:</span>
                    <span>{contract.contract_value.toLocaleString()} บาท</span>
                  </div>
                )}
                {contract.payment_terms && (
                  <div className="info-row">
                    <span className="info-label">เงื่อนไขการชำระ:</span>
                    <span>{contract.payment_terms}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">สถานะ:</span>
                  <span className={`status-badge status-${contract.status.toLowerCase()}`}>
                    {contract.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>ข้อมูลคู่สัญญา</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">ชื่อบริษัท:</span>
                  <span>{contract.vendor_company}</span>
                </div>
                {contract.vendor_contact && (
                  <div className="info-row">
                    <span className="info-label">ผู้ติดต่อ:</span>
                    <span>{contract.vendor_contact}</span>
                  </div>
                )}
                {contract.vendor_phone && (
                  <div className="info-row">
                    <span className="info-label">เบอร์โทรศัพท์:</span>
                    <span>{contract.vendor_phone}</span>
                  </div>
                )}
                {contract.vendor_email && (
                  <div className="info-row">
                    <span className="info-label">อีเมล:</span>
                    <span>{contract.vendor_email}</span>
                  </div>
                )}
                {contract.vendor_address && (
                  <div className="info-row">
                    <span className="info-label">ที่อยู่:</span>
                    <span>{contract.vendor_address}</span>
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

