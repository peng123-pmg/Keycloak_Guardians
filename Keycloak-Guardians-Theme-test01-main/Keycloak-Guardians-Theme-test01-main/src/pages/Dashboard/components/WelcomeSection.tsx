import React from 'react';
import styles from './WelcomeSection.module.css';

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

interface WelcomeSectionProps {
  userInfo?: UserInfo | null;
  userStats?: UserStats | null;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userInfo, userStats }) => {
  return (
    <section className={styles.welcomeSection}>
      <div className={styles.header}>
        <h1>{userInfo?.welcome || '欢迎回来!'}</h1>
        <p> {new Date().toLocaleDateString('zh-CN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      {userStats && (
        <div className={styles.statsOverview}>
          <div className={styles.statCard}>
            <h3>用户总数</h3>
            <p className={styles.statValue}>{userStats.summary.totalOwners}</p>
          </div>
          
          <div className={styles.statCard}>
            <h3>活跃文件数</h3>
            <p className={styles.statValue}>{userStats.summary.activeOwners}</p>
          </div>
          
          <div className={styles.statCard}>
            <h3>总文件数</h3>
            <p className={styles.statValue}>{userStats.summary.totalFiles}</p>
          </div>
          
          <div className={styles.statCard}>
            <h3>已用存储</h3>
            <p className={styles.statValue}>{userStats.summary.storageUsedReadable}</p>
          </div>
        </div>
      )}

      <div className={styles.recentActivity}>
        <h2>系统概览</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>👤</span>
            <div className={styles.activityContent}>
              <h4>当前用户</h4>
              <p>{userInfo?.username || '未知用户'}</p>
            </div>
          </div>
          
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>🔒</span>
            <div className={styles.activityContent}>
              <h4>用户角色</h4>
              <p>{userInfo?.roles?.join(', ') || '未分配角色'}</p>
            </div>
          </div>
          
          {userStats && (
            <div className={styles.activityItem}>
              <span className={styles.activityIcon}>📊</span>
              <div className={styles.activityContent}>
                <h4>数据统计</h4>
                <p>系统共有 {userStats.summary.totalFiles} 个文件，占用存储 {userStats.summary.storageUsedReadable}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};