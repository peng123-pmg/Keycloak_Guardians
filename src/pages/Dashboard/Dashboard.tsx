import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { WelcomeSection } from './components/WelcomeSection';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('welcome');

  return (
    <div className={`${styles.dashboardContainer} watermark-bg`}>
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      <main className={styles.mainContent}>
        <WelcomeSection />

        {/* 底部装饰区块 */}
        <div className={styles.bottomDecoration}></div>
      </main>
    </div>
  );
};
