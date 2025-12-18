'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import '../spare-parts.css';

interface SparePartDetail {
  spare_part_id: number;
  part_code: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  unit_price: number;
  unit: string;
  stock_quantity: number;
  min_stock: number;
  max_stock: number;
  stock_location: string;
}

export default function SparePartDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [sparePart, setSparePart] = useState<SparePartDetail | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchSparePart();
    }
  }, [params.id]);

  const fetchSparePart = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/spare-parts/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSparePart(data.data);
      }
    } catch (error) {
      console.error('Error fetching spare part:', error);
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

  if (!sparePart) {
    return (
      <Layout>
        <div className="error">ไม่พบข้อมูลอะไหล่</div>
      </Layout>
    );
  }

  const isLowStock = sparePart.stock_quantity <= sparePart.min_stock;

  return (
    <Layout>
      <div className="spare-parts-page">
        <div className="page-header">
          <a href="/dashboard/spare-parts" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <div>
            <h2>{sparePart.name}</h2>
            <div className="part-code">Part Code: {sparePart.part_code}</div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="main-content">
            <div className="info-card">
              <h3>ข้อมูลพื้นฐาน</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">Part Code:</span>
                  <span className="part-code">{sparePart.part_code}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ชื่อ:</span>
                  <span>{sparePart.name}</span>
                </div>
                {sparePart.category && (
                  <div className="info-row">
                    <span className="info-label">หมวดหมู่:</span>
                    <span>{sparePart.category}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">ยี่ห้อ/รุ่น:</span>
                  <span>{sparePart.brand} {sparePart.model}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ราคาต่อหน่วย:</span>
                  <span>{sparePart.unit_price.toLocaleString()} บาท / {sparePart.unit}</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>ข้อมูล Stock</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">คงเหลือ:</span>
                  <span className={isLowStock ? 'low-stock' : ''}>
                    {sparePart.stock_quantity} {sparePart.unit}
                    {isLowStock && ' (สต็อกต่ำ!)'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Min Stock:</span>
                  <span>{sparePart.min_stock} {sparePart.unit}</span>
                </div>
                {sparePart.max_stock && (
                  <div className="info-row">
                    <span className="info-label">Max Stock:</span>
                    <span>{sparePart.max_stock} {sparePart.unit}</span>
                  </div>
                )}
                {sparePart.stock_location && (
                  <div className="info-row">
                    <span className="info-label">ตำแหน่งจัดเก็บ:</span>
                    <span>{sparePart.stock_location}</span>
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

