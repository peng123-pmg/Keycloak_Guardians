import React from 'react';
import styles from './WelcomeSection.module.css';

export const WelcomeSection: React.FC = () => {
  return (
    <div className={styles.welcomeContainer}>
      {/* 主标题 - 横跨两个色块 */}
      <h2 className={styles.mainTitle}>欢迎使用Mysystem</h2>
      
      {/* 蓝色区块 - 595×295px，下层 z-index: 1 */}
      <div className={styles.blueBlock}></div>

      {/* 粉色区块 - 595×295px，上层 z-index: 2 */}
      <div className={styles.pinkBlock}></div>
    </div>
  );
};
