/*
 * @Author: peng123-pmg 3438145513@qq.com
 * @Date: 2025-11-15 20:20:05
 * @LastEditors: peng123-pmg 3438145513@qq.com
 * @LastEditTime: 2025-11-15 20:40:06
 * @FilePath: \Keycloak_Guardians\Keycloak-Guardians-Theme-test01-main\Keycloak-Guardians-Theme-test01-main\src\pages\Dashboard\components\WelcomeSection.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from 'react';
import styles from './WelcomeSection.module.css';

export const WelcomeSection: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // 从localStorage获取用户信息
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        setUserInfo(currentUser);
      } catch (e) {
        console.error('解析用户信息失败:', e);
      }
    }
  }, []);

  return (
    <div className={styles.welcomeContainer}>
      {/* 主标题 - 横跨两个色块 */}
      <h2 className={styles.mainTitle}>
        {userInfo ? `${userInfo.welcome || `欢迎使用Mysystem，${userInfo.username}`}` : '欢迎使用Mysystem'}
      </h2>
      
      {/* 用户信息展示 */}
      {userInfo && (
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '10px 15px',
          borderRadius: '8px',
          zIndex: 3,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div>用户名: {userInfo.username}</div>
          <div>邮箱: {userInfo.email}</div>
          <div>角色: {userInfo.roles?.join(', ')}</div>
        </div>
      )}
      
      {/* 蓝色区块 - 595×295px，下层 z-index: 1 */}
      <div className={styles.blueBlock}></div>

      {/* 粉色区块 - 595×295px，上层 z-index: 2 */}
      <div className={styles.pinkBlock}></div>
    </div>
  );
};