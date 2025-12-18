'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import '../domains.css';

interface DomainDetail {
  domain_id: number;
  domain_name: string;
  registrar: string;
  registration_date: string;
  expiry_date: string;
  hosting_provider: string;
  hosting_expiry_date: string;
  ssl_expiry_date: string;
  ssl_type: string;
  ssl_issuer: string;
}

export default function DomainDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState<DomainDetail | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchDomain();
    }
  }, [params.id]);

  const fetchDomain = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/domains/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDomain(data.data);
      }
    } catch (error) {
      console.error('Error fetching domain:', error);
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

  if (!domain) {
    return (
      <Layout>
        <div className="error">ไม่พบข้อมูลโดเมน</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="domains-page">
        <div className="page-header">
          <a href="/dashboard/domains" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <div>
            <h2>{domain.domain_name}</h2>
          </div>
        </div>

        <div className="detail-grid">
          <div className="main-content">
            <div className="info-card">
              <h3>ข้อมูลโดเมน</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">ชื่อโดเมน:</span>
                  <span className="domain-name">{domain.domain_name}</span>
                </div>
                {domain.registrar && (
                  <div className="info-row">
                    <span className="info-label">Registrar:</span>
                    <span>{domain.registrar}</span>
                  </div>
                )}
                {domain.registration_date && (
                  <div className="info-row">
                    <span className="info-label">วันที่จดทะเบียน:</span>
                    <span>{new Date(domain.registration_date).toLocaleDateString('th-TH')}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">วันหมดอายุ:</span>
                  <span>{new Date(domain.expiry_date).toLocaleDateString('th-TH')}</span>
                </div>
              </div>
            </div>

            {domain.hosting_provider && (
              <div className="info-card">
                <h3>ข้อมูล Hosting</h3>
                <div className="info-list">
                  <div className="info-row">
                    <span className="info-label">ผู้ให้บริการ:</span>
                    <span>{domain.hosting_provider}</span>
                  </div>
                  {domain.hosting_expiry_date && (
                    <div className="info-row">
                      <span className="info-label">วันหมดอายุ:</span>
                      <span>{new Date(domain.hosting_expiry_date).toLocaleDateString('th-TH')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {domain.ssl_expiry_date && (
              <div className="info-card">
                <h3>ข้อมูล SSL Certificate</h3>
                <div className="info-list">
                  {domain.ssl_type && (
                    <div className="info-row">
                      <span className="info-label">ประเภท SSL:</span>
                      <span>{domain.ssl_type}</span>
                    </div>
                  )}
                  {domain.ssl_issuer && (
                    <div className="info-row">
                      <span className="info-label">ผู้ออก (CA):</span>
                      <span>{domain.ssl_issuer}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">วันหมดอายุ:</span>
                    <span>{new Date(domain.ssl_expiry_date).toLocaleDateString('th-TH')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

