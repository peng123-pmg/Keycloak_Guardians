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

  const handleAddFile = () => {
    console.log('添加文件');
  };

  const handleDownloadFile = (fileId: string) => {
    console.log('下载文件:', fileId);
  };

  const handleDeleteFile = (fileId: string) => {
    console.log('删除文件:', fileId);
  };

  const handleAddTeam = () => {
    console.log('加入团队');
  };

  const handleDeleteTeam = (teamId: string) => {
    console.log('退出团队:', teamId);
  };

  return (
    <div className={styles.pageContainer}>
      {/* 团队文件区块 */}
      <section className={styles.teamFilesSection}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.mainTitle}>团队文件</h1>
          <button className={styles.addButton} onClick={handleAddFile} title="添加文件">
            +
          </button>
        </div>

        <div className={styles.filesGrid}>
          {files.map((file, index) => (
            <div
              key={file.id}
              className={`${styles.fileCard} ${index % 2 === 0 ? styles.fileCardBlue : styles.fileCardWhite}`}
            >
              <div className={styles.fileIcon}>
                {getFileIcon(file.type)}
              </div>
              <div className={styles.fileName}>{file.name}</div>
              <div className={styles.fileActions}>
                <button
                  className={styles.downloadButton}
                  onClick={() => handleDownloadFile(file.id)}
                  title="下载"
                >
                  ↓
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteFile(file.id)}
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 我加入的区块 */}
      <section className={styles.joinedTeamsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.subTitle}>我加入的</h2>
          <button className={styles.addButton} onClick={handleAddTeam} title="加入团队">
            +
          </button>
        </div>

        <div className={styles.teamsTable}>
          {teams.map((team) => (
            <div key={team.id} className={styles.teamRow}>
              <div className={styles.teamInfo}>
                <span className={styles.teamName}>{team.name}</span>
                <span className={styles.teamNumber}>{team.teamId}</span>
                <span className={styles.teamRole}>{team.role}</span>
                <span className={styles.teamPermission}>{team.permission}</span>
              </div>
              <button
                className={styles.deleteTeamButton}
                onClick={() => handleDeleteTeam(team.id)}
                title="退出团队"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
