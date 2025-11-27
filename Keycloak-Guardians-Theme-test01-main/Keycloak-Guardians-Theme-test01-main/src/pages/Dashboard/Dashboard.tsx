import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { WelcomeSection } from './components/WelcomeSection';
import styles from './Dashboard.module.css';
import { apiService } from '../../services/api';

interface UserInfo {
  username: string;
  email: string;
  roles: string[];
  userId: string;
  welcome: string;
}

interface UserStatsSummary {
  totalOwners: number;
  activeOwners: number;
  totalFiles: number;
  storageUsedBytes: number;
  storageUsedReadable: string;
  averageFileSizeBytes: number;
}

interface UserStorageEntry {
  ownerId: string;
  fileCount: number;
  storageBytes: number;
}

interface UserStats {
  summary: UserStatsSummary;
  filesByStatus: Record<string, number>;
  topUsersByStorage: UserStorageEntry[];
  generatedAt: string;
}

export const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('welcome');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 同时获取用户信息和统计数据
        const [userInfoData, userStatsData] = await Promise.all([
          apiService.getCurrentUser(),
          apiService.getUserStats()
        ]);
        
        setUserInfo(userInfoData);
        setUserStats(userStatsData);
        setError(null);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMenuChange = (menu: string) => {
    if (menu === 'logout') {
      // 清除登录状态
      sessionStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      
      // 触发退出登录事件
      window.dispatchEvent(new CustomEvent('keycloak-logout'));
      
      console.log('✅ 已退出登录');
    } else {
      setActiveMenu(menu);
    }
  };

  return (
    <div className={`${styles.dashboardContainer} watermark-bg`}>
      <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />
      <main className={styles.mainContent}>
        {loading ? (
          <div>加载中...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            <WelcomeSection userInfo={userInfo} userStats={userStats} />
            
            {/* 底部装饰区块 */}
            <div className={styles.bottomDecoration}></div>
          </>
        )}
      </main>
    </div>
  );
};