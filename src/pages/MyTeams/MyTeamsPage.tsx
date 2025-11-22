import React, { useState } from 'react';
import styles from './MyTeamsPage.module.css';

interface TeamFile {
  id: string;
  name: string;
  type: 'file' | 'link' | 'audio' | 'image';
  size?: string;
}

interface Team {
  id: string;
  name: string;
  teamId: string;
  role: string;
  permission: string;
}

export const MyTeamsPage: React.FC = () => {
  const [files] = useState<TeamFile[]>([
    { id: '1', name: '团队的文件.cpp', type: 'file', size: '315*315' },
    { id: '2', name: '团队文件.cpp', type: 'link', size: '315*315' },
    { id: '3', name: '我的音乐.cpp', type: 'audio', size: '' },
    { id: '4', name: '团队文件.png', type: 'image', size: '' },
  ]);

  const [teams] = useState<Team[]>([
    { id: '1', name: '团队一', teamId: '团队号111111', role: '管理员', permission: '仅阅读' },
    { id: '2', name: '团队2', teamId: '团队2222222', role: '管理员', permission: '可访问' },
  ]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'file': return '📄';
      case 'link': return '🔗';
      case 'audio': return '🎧';
      case 'image': return '🖼️';
      default: return '📄';
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* 页面标题 */}
      <h1 className={styles.pageTitle}>团队文件</h1>

      {/* 文件网格区域 */}
      <div className={styles.filesSection}>
        <div className={styles.filesGrid}>
          {files.map((file) => (
            <div key={file.id} className={styles.fileCard}>
              <div className={styles.fileIconArea}>
                <span className={styles.fileIcon}>{getFileIcon(file.type)}</span>
              </div>
              <div className={styles.fileInfo}>
                <div className={styles.fileName}>{file.name}</div>
                <div className={styles.fileActions}>
                  <button className={styles.iconBtn} title="下载">⬇</button>
                  <button className={styles.iconBtn} title="复制">📋</button>
                  <button className={styles.iconBtn} title="删除">🗑️</button>
                </div>
              </div>
              {file.size && (
                <div className={styles.fileSize}>
                  {file.size}<br/>
                  <span className={styles.fileMeta}>背景色</span><br/>
                  <span className={styles.fileMeta}>5A9BE6 50%</span><br/>
                  <span className={styles.fileMeta}>字体思源黑体</span><br/>
                  <span className={styles.fileMeta}>18</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 我加入的团队 */}
      <div className={styles.teamsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>我加入的</h2>
          <button className={styles.addBtn}>+</button>
        </div>
        <div className={styles.teamsTable}>
          {teams.map((team) => (
            <div key={team.id} className={styles.teamRow}>
              <div className={styles.teamName}>{team.name}</div>
              <div className={styles.teamId}>{team.teamId}</div>
              <div className={styles.teamRole}>{team.role}</div>
              <div className={styles.teamPermission}>{team.permission}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
