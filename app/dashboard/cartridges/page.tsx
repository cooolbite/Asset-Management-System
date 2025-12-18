'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Plus, Search, ShoppingCart, AlertTriangle } from 'lucide-react';
import './cartridges.css';

interface Cartridge {
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

export default function CartridgesPage() {
  const [cartridges, setCartridges] = useState<Cartridge[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCartridges();
  }, [search, lowStock, page]);

  const fetchCartridges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
      });
      if (search) params.append('search', search);
      if (lowStock) params.append('lowStock', 'true');

      const response = await fetch(`/api/cartridges?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCartridges(data.data.cartridges);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching cartridges:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLowStock = (quantity: number, minStock: number) => {
    return quantity <= minStock;
  };

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
          <div>
            <h2>ตลับหมึก</h2>
            <p className="page-description">จัดการตลับหมึกและ Toner</p>
          </div>
          <a href="/dashboard/cartridges/new" className="btn btn-primary">
            <Plus size={20} />
            เพิ่มตลับหมึก
          </a>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="ค้นหา Model, Brand, Printer Model..."
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
        ) : cartridges.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={48} />
            <p>ไม่พบตลับหมึก</p>
          </div>
        ) : (
          <>
            <div className="cartridges-table-container">
              <table className="cartridges-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Brand</th>
                    <th>สี</th>
                    <th>ประเภท</th>
                    <th>ราคา</th>
                    <th>Printer Model</th>
                    <th>คงเหลือ</th>
                    <th>Min Stock</th>
                    <th>สถานะ</th>
                    <th>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {cartridges.map((cartridge) => {
                    const stockLow = isLowStock(cartridge.stock_quantity, cartridge.min_stock);
                    return (
                      <tr key={cartridge.cartridge_id} className={stockLow ? 'low-stock-row' : ''}>
                        <td>
                          <strong>{cartridge.model}</strong>
                        </td>
                        <td>{cartridge.brand || '-'}</td>
                        <td>{cartridge.color ? getColorLabel(cartridge.color) : '-'}</td>
                        <td>{cartridge.type || '-'}</td>
                        <td>{cartridge.price.toLocaleString()} บาท</td>
                        <td>{cartridge.printer_model || '-'}</td>
                        <td>
                          <span className={stockLow ? 'low-stock' : ''}>
                            {cartridge.stock_quantity}
                          </span>
                        </td>
                        <td>{cartridge.min_stock}</td>
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
                            href={`/dashboard/cartridges/${cartridge.cartridge_id}`}
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

