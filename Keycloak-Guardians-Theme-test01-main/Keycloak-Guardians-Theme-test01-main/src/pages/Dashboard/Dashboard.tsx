import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { WelcomeSection } from './components/WelcomeSection';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('welcome');

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
        <WelcomeSection />

        {/* 底部装饰区块 */}
        <div className={styles.bottomDecoration}></div>
      </main>
    </div>
  );
};
