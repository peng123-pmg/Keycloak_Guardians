import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BackButton.module.css';

export const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 如果是首页或安全托管与备份页面，不显示返回按钮
  const isHomePage = location.pathname === '/';
  const isSecurityBackupPage = location.pathname === '/security-backup';

  const handleBack = () => {
    navigate(-1);
  };

  if (isHomePage || isSecurityBackupPage) {
    return null;
  }

  return (
    <button className={styles.backButton} onClick={handleBack}>
      <span className={styles.backIcon}>←</span>
      <span className={styles.backText}>返回</span>
    </button>
  );
};
