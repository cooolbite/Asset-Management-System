'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, FileText, AlertTriangle } from 'lucide-react';
import './software.css';

interface SoftwareLicense {
  license_id: number;
  software_name: string;
  version: string;
  license_type: string;
  total_licenses: number;
  used_licenses: number;
  available_licenses: number;
  expiry_date: string;
  vendor: string;
}

export default function SoftwarePage() {
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [expiringSoon, setExpiringSoon] = useState(false);

  useEffect(() => {
    fetchLicenses();
  }, [expiringSoon]);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (expiringSoon) params.append('expiringSoon', 'true');

      const response = await fetch(`/api/software-licenses?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLicenses(data.data);
      }
    } catch (error) {
      console.error('Error fetching software licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLicenseTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      Perpetual: 'ถาวร',
      Subscription: 'รายเดือน/รายปี',
      Trial: 'ทดลองใช้',
    };
    return labels[type] || type;
  };

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const getUsagePercentage = (used: number, total: number) => {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  };

  return (
    <Layout>
      <div className="software-page">
        <div className="page-header">
          <div>
            <h2>ซอฟต์แวร์</h2>
            <p className="page-description">จัดการซอฟต์แวร์และ License</p>
          </div>
          <a href="/dashboard/software/new" className="btn btn-primary">
            <Plus size={20} />
            เพิ่มซอฟต์แวร์
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
        ) : licenses.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <p>ไม่พบซอฟต์แวร์</p>
          </div>
        ) : (
          <div className="licenses-grid">
            {licenses.map((license) => {
              const expiring = license.expiry_date && isExpiringSoon(license.expiry_date);
              const usagePercent = getUsagePercentage(license.used_licenses, license.total_licenses);
              return (
                <div key={license.license_id} className="license-card">
                  <div className="card-header">
                    <div>
                      <h3>{license.software_name}</h3>
                      {license.version && (
                        <span className="version">v{license.version}</span>
                      )}
                    </div>
                    {expiring && (
                      <span className="expiring-badge">
                        <AlertTriangle size={14} />
                        ใกล้หมดอายุ
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="info-item">
                      <strong>ประเภท:</strong> {getLicenseTypeLabel(license.license_type)}
                    </div>
                    {license.vendor && (
                      <div className="info-item">
                        <strong>Vendor:</strong> {license.vendor}
                      </div>
                    )}
                    {license.expiry_date && (
                      <div className="info-item">
                        <strong>วันหมดอายุ:</strong>{' '}
                        <span className={expiring ? 'expiring' : ''}>
                          {new Date(license.expiry_date).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    )}
                    <div className="license-usage">
                      <div className="usage-header">
                        <span>
                          ใช้ไป {license.used_licenses} / {license.total_licenses} License
                        </span>
                        <span className="usage-percent">{usagePercent}%</span>
                      </div>
                      <div className="usage-bar">
                        <div
                          className="usage-fill"
                          style={{ width: `${usagePercent}%` }}
                        ></div>
                      </div>
                      <div className="usage-footer">
                        <span className="available">
                          คงเหลือ {license.available_licenses} License
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <a href={`/dashboard/software/${license.license_id}`} className="btn-link">
                      ดูรายละเอียด
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

