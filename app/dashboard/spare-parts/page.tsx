'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, Package, AlertTriangle } from 'lucide-react';
import './spare-parts.css';

interface SparePart {
  spare_part_id: number;
  part_code: string;
  name: string;
  category: string;
  brand: string;
  unit_price: number;
  stock_quantity: number;
  min_stock: number;
  max_stock: number;
}

export default function SparePartsPage() {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSpareParts();
  }, [search, lowStock, page]);

  const fetchSpareParts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
      });
      if (search) params.append('search', search);
      if (lowStock) params.append('lowStock', 'true');

      const response = await fetch(`/api/spare-parts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSpareParts(data.data.spareParts);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching spare parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLowStock = (quantity: number, minStock: number) => {
    return quantity <= minStock;
  };

  return (
    <Layout>
      <div className="spare-parts-page">
        <div className="page-header">
          <div>
            <h2>อะไหล่</h2>
            <p className="page-description">จัดการคลังอะไหล่และวัสดุสิ้นเปลือง</p>
          </div>
          <a href="/dashboard/spare-parts/new" className="btn btn-primary">
            <Plus size={20} />
            เพิ่มอะไหล่
          </a>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="ค้นหา Part Code, ชื่อ, ยี่ห้อ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={lowStock}
              onChange={(e) => {
                setLowStock(e.target.checked);
                setPage(1);
              }}
            />
            แสดงสต็อกต่ำเท่านั้น
          </label>
        </div>

        {loading ? (
          <div className="loading">กำลังโหลด...</div>
        ) : spareParts.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <p>ไม่พบอะไหล่</p>
          </div>
        ) : (
          <>
            <div className="spare-parts-table-container">
              <table className="spare-parts-table">
                <thead>
                  <tr>
                    <th>Part Code</th>
                    <th>ชื่ออะไหล่</th>
                    <th>หมวดหมู่</th>
                    <th>ยี่ห้อ</th>
                    <th>ราคาต่อหน่วย</th>
                    <th>คงเหลือ</th>
                    <th>Min Stock</th>
                    <th>สถานะ</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {spareParts.map((part) => {
                    const stockLow = isLowStock(part.stock_quantity, part.min_stock);
                    return (
                      <tr key={part.spare_part_id} className={stockLow ? 'low-stock-row' : ''}>
                        <td>
                          <strong className="part-code">{part.part_code}</strong>
                        </td>
                        <td>{part.name}</td>
                        <td>{part.category || '-'}</td>
                        <td>{part.brand || '-'}</td>
                        <td>{part.unit_price.toLocaleString()} บาท</td>
                        <td>
                          <span className={stockLow ? 'low-stock' : ''}>
                            {part.stock_quantity}
                          </span>
                        </td>
                        <td>{part.min_stock}</td>
                        <td>
                          {stockLow && (
                            <span className="low-stock-badge">
                              <AlertTriangle size={14} />
                              สต็อกต่ำ
                            </span>
                          )}
                        </td>
                        <td>
                          <a
                            href={`/dashboard/spare-parts/${part.spare_part_id}`}
                            className="btn-link"
                          >
                            ดูรายละเอียด
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary"
                >
                  ก่อนหน้า
                </button>
                <span>
                  หน้า {page} จาก {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-secondary"
                >
                  ถัดไป
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

