import React, { useState } from 'react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  children?: MenuItem[];
}

// 新的菜单结构
const menuData: MenuItem[] = [
  {
    id: 'personal',
    label: '个人文件管理',
    children: [
      { id: 'my-files', label: '我的文件' }
    ]
  },
  {
    id: 'team-management',
    label: '团队文件管理',
    children: [
      { id: 'create-team', label: '创建团队' },
      { id: 'my-teams', label: '我的团队' }
    ]
  },
  { id: 'recycle-bin', label: '回收站管理' },
  { id: 'notifications', label: '消息通知中心' },
  { id: 'task-progress', label: '任务进度' },
  {
    id: 'settings',
    label: '设置',
    children: [
      { id: 'security-backup', label: '安全托管与备份' },
      { id: 'logout', label: '退出账号' }
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuChange }) => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['personal', 'team-management', 'settings']);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const isActive = activeMenu === item.id;

    return (
      <div key={item.id} className={styles.menuItemWrapper}>
        <div
          className={`${styles.menuItem} 
            ${isActive ? styles.active : ''} 
            ${level === 1 ? styles.level2 : ''} 
            ${level === 2 ? styles.level3 : ''}`}
          data-menu={item.id}
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            } else {
              onMenuChange(item.id);
            }
          }}
        >
          <span className={styles.menuLabel}>{item.label}</span>
          {hasChildren && (
            <span className={`${styles.arrow} ${isExpanded ? styles.expanded : ''}`}>
              ▶
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className={styles.submenu}>
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo区域 */}
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>■</div>
        <h1 className={styles.logoText}>Mysystem</h1>
      </div>

      {/* 导航菜单 */}
      <nav className={styles.menu}>
        {menuData.map(item => renderMenuItem(item))}
      </nav>
    </aside>
  );
};
