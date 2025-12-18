'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Globe, AlertTriangle } from 'lucide-react';
import './domains.css';

interface Domain {
  domain_id: number;
  domain_name: string;
  registrar: string;
  expiry_date: string;
  hosting_provider: string;
  hosting_expiry_date: string;
  ssl_expiry_date: string;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [expiringSoon, setExpiringSoon] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, [expiringSoon]);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (expiringSoon) params.append('expiringSoon', 'true');

      const response = await fetch(`/api/domains?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDomains(data.data);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  return (
    <Layout>
      <div className="domains-page">
        <div className="page-header">
          <div>
            <h2>โดเมน</h2>
            <p className="page-description">จัดการโดเมนและ SSL Certificate</p>
          </div>
          <a href="/dashboard/domains/new" className="btn btn-primary">
            <Plus size={20} />
            เพิ่มโดเมน
          </a>
        </div>

        <div className="filters-section">
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
        ) : domains.length === 0 ? (
          <div className="empty-state">
            <Globe size={48} />
            <p>ไม่พบโดเมน</p>
          </div>
        ) : (
          <div className="domains-table-container">
            <table className="domains-table">
              <thead>
                <tr>
                  <th>ชื่อโดเมน</th>
                  <th>Registrar</th>
                  <th>วันหมดอายุ</th>
                  <th>Hosting Provider</th>
                  <th>Hosting หมดอายุ</th>
                  <th>SSL หมดอายุ</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => {
                  const domainExpiring = isExpiringSoon(domain.expiry_date);
                  const sslExpiring = domain.ssl_expiry_date && isExpiringSoon(domain.ssl_expiry_date);
                  return (
                    <tr key={domain.domain_id} className={domainExpiring ? 'expiring-row' : ''}>
                      <td>
                        <strong className="domain-name">{domain.domain_name}</strong>
                      </td>
                      <td>{domain.registrar || '-'}</td>
                      <td>
                        {domain.expiry_date ? (
                          <span className={domainExpiring ? 'expiring' : ''}>
                            {new Date(domain.expiry_date).toLocaleDateString('th-TH')}
                            {domainExpiring && <AlertTriangle size={14} className="inline-icon" />}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{domain.hosting_provider || '-'}</td>
                      <td>
                        {domain.hosting_expiry_date
                          ? new Date(domain.hosting_expiry_date).toLocaleDateString('th-TH')
                          : '-'}
                      </td>
                      <td>
                        {domain.ssl_expiry_date ? (
                          <span className={sslExpiring ? 'expiring' : ''}>
                            {new Date(domain.ssl_expiry_date).toLocaleDateString('th-TH')}
                            {sslExpiring && <AlertTriangle size={14} className="inline-icon" />}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {domainExpiring && (
                          <span className="expiring-badge">
                            <AlertTriangle size={14} />
                            ใกล้หมดอายุ
                          </span>
                        )}
                      </td>
                      <td>
                        <a href={`/dashboard/domains/${domain.domain_id}`} className="btn-link">
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

