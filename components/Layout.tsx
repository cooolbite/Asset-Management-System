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
  Building2
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
          </nav>
        </aside>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

