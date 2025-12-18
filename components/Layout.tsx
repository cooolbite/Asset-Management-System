'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  History,
  LogOut,
  Menu,
  Box,
  FolderTree,
  MapPin,
  Building2,
  Wrench,
  Computer,
  Monitor,
  Printer,
  Network,
  Package,
  ClipboardList,
  Calendar,
  Globe,
  FileText,
  Settings,
  ShoppingCart,
  HardDrive
} from 'lucide-react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!accessToken || !userData) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (err) {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="layout-container">
      <header className="header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Box size={24} style={{ color: 'var(--primary)' }} />
            <h1>Asset Management System</h1>
          </div>
          <div className="header-actions">
            <span className="user-info">
              {user?.fullName}
              <span className="user-role-badge">{user?.role}</span>
            </span>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="layout-body">
        <aside className="sidebar">
          <nav>
            <a
              href="/dashboard/assets"
              className={pathname === '/dashboard/assets' ? 'active' : ''}
            >
              <LayoutDashboard size={20} />
              Assets
            </a>
            {user?.role === 'Admin' && (
              <>
                <a
                  href="/dashboard/assets/new"
                  className={pathname === '/dashboard/assets/new' ? 'active' : ''}
                >
                  <PlusCircle size={20} />
                  Add Asset
                </a>
                <a
                  href="/dashboard/categories"
                  className={pathname === '/dashboard/categories' ? 'active' : ''}
                >
                  <FolderTree size={20} />
                  Categories
                </a>
                <a
                  href="/dashboard/locations"
                  className={pathname === '/dashboard/locations' ? 'active' : ''}
                >
                  <MapPin size={20} />
                  Locations
                </a>
                <a
                  href="/dashboard/vendors"
                  className={pathname === '/dashboard/vendors' ? 'active' : ''}
                >
                  <Building2 size={20} />
                  Vendors
                </a>
                <a
                  href="/dashboard/users"
                  className={pathname === '/dashboard/users' ? 'active' : ''}
                >
                  <Users size={20} />
                  Users
                </a>
              </>
            )}
            <a
              href="/dashboard/transactions"
              className={pathname === '/dashboard/transactions' ? 'active' : ''}
            >
              <History size={20} />
              Transactions
            </a>
            <div className="nav-divider">ระบบแจ้งซ่อม</div>
            <a
              href="/dashboard/repairs"
              className={pathname?.startsWith('/dashboard/repairs') ? 'active' : ''}
            >
              <Wrench size={20} />
              แจ้งซ่อม
            </a>
            <div className="nav-divider">อุปกรณ์</div>
            <a
              href="/dashboard/equipment"
              className={pathname?.startsWith('/dashboard/equipment') ? 'active' : ''}
            >
              <HardDrive size={20} />
              อุปกรณ์ทั่วไป
            </a>
            <a
              href="/dashboard/computers"
              className={pathname?.startsWith('/dashboard/computers') ? 'active' : ''}
            >
              <Computer size={20} />
              คอมพิวเตอร์
            </a>
            <a
              href="/dashboard/monitors"
              className={pathname?.startsWith('/dashboard/monitors') ? 'active' : ''}
            >
              <Monitor size={20} />
              จอภาพ
            </a>
            <a
              href="/dashboard/printers"
              className={pathname?.startsWith('/dashboard/printers') ? 'active' : ''}
            >
              <Printer size={20} />
              เครื่องพิมพ์
            </a>
            <a
              href="/dashboard/network-devices"
              className={pathname?.startsWith('/dashboard/network-devices') ? 'active' : ''}
            >
              <Network size={20} />
              อุปกรณ์เครือข่าย
            </a>
            <div className="nav-divider">คลัง</div>
            <a
              href="/dashboard/spare-parts"
              className={pathname?.startsWith('/dashboard/spare-parts') ? 'active' : ''}
            >
              <Package size={20} />
              อะไหล่
            </a>
            <a
              href="/dashboard/cartridges"
              className={pathname?.startsWith('/dashboard/cartridges') ? 'active' : ''}
            >
              <ShoppingCart size={20} />
              ตลับหมึก
            </a>
            <div className="nav-divider">การจัดการ</div>
            <a
              href="/dashboard/borrow-requests"
              className={pathname?.startsWith('/dashboard/borrow-requests') ? 'active' : ''}
            >
              <ClipboardList size={20} />
              ยืม-คืนอุปกรณ์
            </a>
            <a
              href="/dashboard/pm"
              className={pathname?.startsWith('/dashboard/pm') ? 'active' : ''}
            >
              <Calendar size={20} />
              บำรุงรักษา (PM)
            </a>
            {user?.role === 'Admin' && (
              <>
                <div className="nav-divider">ระบบ</div>
                <a
                  href="/dashboard/domains"
                  className={pathname?.startsWith('/dashboard/domains') ? 'active' : ''}
                >
                  <Globe size={20} />
                  โดเมน
                </a>
                <a
                  href="/dashboard/software"
                  className={pathname?.startsWith('/dashboard/software') ? 'active' : ''}
                >
                  <FileText size={20} />
                  ซอฟต์แวร์
                </a>
                <a
                  href="/dashboard/contracts"
                  className={pathname?.startsWith('/dashboard/contracts') ? 'active' : ''}
                >
                  <FileText size={20} />
                  สัญญา
                </a>
                <a
                  href="/dashboard/settings"
                  className={pathname?.startsWith('/dashboard/settings') ? 'active' : ''}
                >
                  <Settings size={20} />
                  ตั้งค่าระบบ
                </a>
              </>
            )}
          </nav>
        </aside>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

