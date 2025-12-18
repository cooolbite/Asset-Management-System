'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Save, Building2, Bell, Database, Users, Globe } from 'lucide-react';
import './settings.css';

interface SystemSetting {
  setting_key: string;
  setting_value: string;
  setting_type: string;
  category: string;
  description: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<{ [key: string]: SystemSetting }>({});
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const settingsMap: { [key: string]: SystemSetting } = {};
        const cats: string[] = [];
        
        data.data.forEach((setting: SystemSetting) => {
          settingsMap[setting.setting_key] = setting;
          if (!cats.includes(setting.category)) {
            cats.push(setting.category);
          }
        });
        
        setSettings(settingsMap as any);
        setCategories(cats);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const updates = Object.keys(settings).map(key => ({
        key,
        value: settings[key].setting_value || '',
      }));

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: updates }),
      });

      if (response.ok) {
        alert('บันทึกการตั้งค่าสำเร็จ');
        fetchSettings(); // Refresh settings
      } else {
        const error = await response.json();
        alert(error.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general':
        return <Building2 size={20} />;
      case 'notification':
        return <Bell size={20} />;
      case 'system':
        return <Database size={20} />;
      default:
        return <Globe size={20} />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      general: 'ข้อมูลทั่วไป',
      notification: 'การแจ้งเตือน',
      system: 'ระบบ',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">กำลังโหลด...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="settings-page">
        <div className="page-header">
          <div>
            <h2>ตั้งค่าระบบ</h2>
            <p className="page-description">จัดการการตั้งค่าระบบทั้งหมด</p>
          </div>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
            <Save size={20} />
            {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
          </button>
        </div>

        <div className="settings-sections">
          {categories.map((category) => (
            <div key={category} className="settings-section">
              <div className="section-header">
                {getCategoryIcon(category)}
                <h3>{getCategoryLabel(category)}</h3>
              </div>
              <div className="settings-list">
                {Object.keys(settings)
                  .filter((key) => {
                    const setting = settings[key] as any;
                    return setting?.category === category;
                  })
                  .map((key) => {
                    const setting = settings[key] as any;
                    const settingValue = setting?.setting_value || '';
                    const settingType = setting?.setting_type || 
                      (key.includes('enabled') || key.includes('_enabled') 
                        ? 'boolean' 
                        : key.includes('days') || key.includes('_days')
                        ? 'number'
                        : 'text');

                    return (
                      <div key={key} className="setting-item">
                        <label className="setting-label">
                          {setting?.description || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        {settingType === 'boolean' ? (
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={settingValue === 'true'}
                              onChange={(e) =>
                                setSettings({ 
                                  ...settings, 
                                  [key]: { ...setting, setting_value: e.target.checked ? 'true' : 'false' }
                                })
                              }
                            />
                            เปิดใช้งาน
                          </label>
                        ) : (
                          <input
                            type={settingType === 'number' ? 'number' : settingType === 'email' ? 'email' : 'text'}
                            value={settingValue}
                            onChange={(e) =>
                              setSettings({ 
                                ...settings, 
                                [key]: { ...setting, setting_value: e.target.value }
                              })
                            }
                            className="setting-input"
                          />
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

