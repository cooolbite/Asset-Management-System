'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Edit, Save } from 'lucide-react';
import '../computers.css';

interface ComputerDetail {
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
  contract_end_date: string;
  user_name: string;
}

export default function ComputerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [computer, setComputer] = useState<ComputerDetail | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (params.id) {
      fetchComputer();
    }
  }, [params.id]);

  const fetchComputer = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/computers/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setComputer(data.data);
        setFormData({
          name: data.data.name,
          brand: data.data.brand || '',
          model: data.data.model || '',
          cpu: data.data.cpu || '',
          ram: data.data.ram || '',
          storage: data.data.storage || '',
          os: data.data.os || '',
          status: data.data.status,
        });
      }
    } catch (error) {
      console.error('Error fetching computer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/computers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditing(false);
        fetchComputer();
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error updating computer:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตคอมพิวเตอร์');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">กำลังโหลด...</div>
      </Layout>
    );
  }

  if (!computer) {
    return (
      <Layout>
        <div className="error">ไม่พบข้อมูลคอมพิวเตอร์</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="computers-page">
        <div className="page-header">
          <a href="/dashboard/computers" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <div className="header-content">
            <div>
              <h2>{computer.name}</h2>
              <div className="asset-code">Asset Code: {computer.asset_code}</div>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn btn-secondary">
                <Edit size={20} />
                แก้ไข
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="equipment-form">
            <div className="form-section">
              <h3>ข้อมูลพื้นฐาน</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>ชื่อคอมพิวเตอร์ *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>ประเภท</label>
                  <select
                    value={computer.computer_type}
                    disabled
                    className="form-group select"
                  >
                    <option value="PC">PC</option>
                    <option value="Laptop">Laptop</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>ยี่ห้อ</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>รุ่น</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Specifications</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>CPU</label>
                  <input
                    type="text"
                    value={formData.cpu}
                    onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>RAM</label>
                  <input
                    type="text"
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Storage</label>
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>OS</label>
                  <input
                    type="text"
                    value={formData.os}
                    onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>สถานะ</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Available">พร้อมใช้งาน</option>
                  <option value="In Use">กำลังใช้งาน</option>
                  <option value="Repair">ซ่อม</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={20} />
                บันทึก
              </button>
            </div>
          </form>
        ) : (
          <div className="detail-grid">
            <div className="main-content">
              <div className="info-card">
                <h3>ข้อมูลพื้นฐาน</h3>
                <div className="info-list">
                  <div className="info-row">
                    <span className="info-label">Asset Code:</span>
                    <span className="asset-code">{computer.asset_code}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ชื่อ:</span>
                    <span>{computer.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ประเภท:</span>
                    <span>{computer.computer_type}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">ยี่ห้อ/รุ่น:</span>
                    <span>{computer.brand} {computer.model}</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3>Specifications</h3>
                <div className="info-list">
                  {computer.cpu && (
                    <div className="info-row">
                      <span className="info-label">CPU:</span>
                      <span>{computer.cpu}</span>
                    </div>
                  )}
                  {computer.ram && (
                    <div className="info-row">
                      <span className="info-label">RAM:</span>
                      <span>{computer.ram}</span>
                    </div>
                  )}
                  {computer.storage && (
                    <div className="info-row">
                      <span className="info-label">Storage:</span>
                      <span>{computer.storage}</span>
                    </div>
                  )}
                  {computer.os && (
                    <div className="info-row">
                      <span className="info-label">OS:</span>
                      <span>{computer.os}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">สถานะ:</span>
                    <span className={`status-badge status-${computer.status.toLowerCase().replace(' ', '-')}`}>
                      {computer.status}
                    </span>
                  </div>
                </div>
              </div>

              {computer.contract_end_date && (
                <div className="info-card">
                  <h3>สัญญาเช่า</h3>
                  <div className="info-list">
                    <div className="info-row">
                      <span className="info-label">วันสิ้นสุดสัญญา:</span>
                      <span>{new Date(computer.contract_end_date).toLocaleDateString('th-TH')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

