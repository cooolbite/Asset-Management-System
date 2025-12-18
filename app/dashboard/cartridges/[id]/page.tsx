'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft } from 'lucide-react';
import '../cartridges.css';

interface CartridgeDetail {
  cartridge_id: number;
  model: string;
  brand: string;
  color: string;
  type: string;
  price: number;
  printer_model: string;
  stock_quantity: number;
  min_stock: number;
  stock_location: string;
}

export default function CartridgeDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [cartridge, setCartridge] = useState<CartridgeDetail | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchCartridge();
    }
  }, [params.id]);

  const fetchCartridge = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/cartridges/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCartridge(data.data);
      }
    } catch (error) {
      console.error('Error fetching cartridge:', error);
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

  if (!cartridge) {
    return (
      <Layout>
        <div className="error">ไม่พบข้อมูลตลับหมึก</div>
      </Layout>
    );
  }

  const isLowStock = cartridge.stock_quantity <= cartridge.min_stock;
  const getColorLabel = (color: string) => {
    const labels: { [key: string]: string } = {
      C: 'Cyan',
      M: 'Magenta',
      Y: 'Yellow',
      K: 'Black',
      Black: 'ดำ',
      Color: 'สี',
    };
    return labels[color] || color;
  };

  return (
    <Layout>
      <div className="cartridges-page">
        <div className="page-header">
          <a href="/dashboard/cartridges" className="back-link">
            <ArrowLeft size={20} />
            กลับ
          </a>
          <div>
            <h2>{cartridge.model}</h2>
            {cartridge.brand && <div className="page-description">{cartridge.brand}</div>}
          </div>
        </div>

        <div className="detail-grid">
          <div className="main-content">
            <div className="info-card">
              <h3>ข้อมูลตลับหมึก</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">Model:</span>
                  <span><strong>{cartridge.model}</strong></span>
                </div>
                {cartridge.brand && (
                  <div className="info-row">
                    <span className="info-label">Brand:</span>
                    <span>{cartridge.brand}</span>
                  </div>
                )}
                {cartridge.color && (
                  <div className="info-row">
                    <span className="info-label">สี:</span>
                    <span>{getColorLabel(cartridge.color)}</span>
                  </div>
                )}
                {cartridge.type && (
                  <div className="info-row">
                    <span className="info-label">ประเภท:</span>
                    <span>{cartridge.type}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">ราคา:</span>
                  <span>{cartridge.price.toLocaleString()} บาท</span>
                </div>
                {cartridge.printer_model && (
                  <div className="info-row">
                    <span className="info-label">รุ่นเครื่องพิมพ์ที่ใช้:</span>
                    <span>{cartridge.printer_model}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3>ข้อมูล Stock</h3>
              <div className="info-list">
                <div className="info-row">
                  <span className="info-label">คงเหลือ:</span>
                  <span className={isLowStock ? 'low-stock' : ''}>
                    {cartridge.stock_quantity}
                    {isLowStock && ' (สต็อกต่ำ!)'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Min Stock:</span>
                  <span>{cartridge.min_stock}</span>
                </div>
                {cartridge.stock_location && (
                  <div className="info-row">
                    <span className="info-label">ตำแหน่งจัดเก็บ:</span>
                    <span>{cartridge.stock_location}</span>
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

