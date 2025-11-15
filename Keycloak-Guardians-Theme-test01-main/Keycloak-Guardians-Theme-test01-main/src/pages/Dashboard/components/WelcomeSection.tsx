import React, { useEffect, useState } from 'react';
import styles from './WelcomeSection.module.css';

export const WelcomeSection: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // 尝试从localStorage获取用户信息
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserInfo(user);
      } catch (e) {
        console.error('解析用户信息失败:', e);
      }
    }
  }, []);

  return (
    <div className={styles.welcomeContainer}>
      {/* 主标题 - 横跨两个色块 */}
      <h2 className={styles.mainTitle}>
        {userInfo ? `欢迎回来，${userInfo.username || userInfo.email || '用户'}!` : '欢迎使用Mysystem'}
      </h2>
      
      {userInfo && (
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 3
        }}>
          <p><strong>用户名:</strong> {userInfo.username || 'N/A'}</p>
          <p><strong>邮箱:</strong> {userInfo.email || 'N/A'}</p>
          <p><strong>角色:</strong> {Array.isArray(userInfo.roles) ? userInfo.roles.join(', ') : 'N/A'}</p>
        </div>
      )}
      
      {/* 蓝色区块 - 595×295px，下层 z-index: 1 */}
      <div className={styles.blueBlock}></div>

      {/* 粉色区块 - 595×295px，上层 z-index: 2 */}
      <div className={styles.pinkBlock}></div>
    </div>
  );
};