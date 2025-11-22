import React, { useState } from 'react';
import styles from './CreatedTeamsPage.module.css';

interface TeamFile {
  id: string;
  name: string;
  type: 'file' | 'link' | 'image' | 'audio';
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  permission: string;
}

export const CreatedTeamsPage: React.FC = () => {
  const [files] = useState<TeamFile[]>([
    { id: '1', name: '团队的文件.cpp', type: 'file' },
    { id: '2', name: '我的文件.cpp', type: 'link' },
    { id: '3', name: '音频文件.mp3', type: 'audio' },
    { id: '4', name: '我的图片.jpg', type: 'image' },
  ]);

  const [members] = useState<TeamMember[]>([
    { id: '1', name: '王铭萱', email: '123465@qq.com', permission: '仅阅读' },
    { id: '2', name: '王子萱', email: '123465@qq.com', permission: '可访问' },
  ]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'file': return '📄';
      case 'link': return '🔗';
      case 'audio': return '🎵';
      case 'image': return '🖼️';
      default: return '📄';
    }
  };

  const handleAddFile = () => {
    console.log('添加文件');
  };

  const handleDeleteFile = (id: string) => {
    console.log('删除文件:', id);
  };

  const handleDownloadFile = (id: string) => {
    console.log('下载文件:', id);
  };

  const handleAddMember = () => {
    console.log('添加成员');
  };

  const handleDeleteMember = (id: string) => {
    console.log('删除成员:', id);
  };

  return (
    <div className={styles.pageContainer}>
      {/* ========== 我创建的区块 ========== */}
      <section className={styles.createdSection}>
        <div className={styles.sectionHeaderWithCards}>
          <h1 className={styles.mainTitle}>我创建的</h1>
        </div>

        {/* 文件卡片横向滚动区域 */}
        <div className={styles.cardsScrollWrapper}>
          <div className={styles.cardsContainer}>
            {files.map((file, index) => (
              <div 
                key={file.id} 
                className={`${styles.fileCard} ${
                  index % 2 === 1 ? styles.fileCardWhite : ''
                }`}
              >
                {/* 右上角加号按钮 */}
                <button 
                  className={styles.cardAddBtn}
                  onClick={handleAddFile}
                  title="添加文件"
                >
                  +
                </button>

                {/* 文件图标 */}
                <div className={styles.cardIconArea}>
                  <span className={styles.cardIcon}>{getFileIcon(file.type)}</span>
                </div>

                {/* 文件名 */}
                <div className={styles.cardFileName}>{file.name}</div>

                {/* 右下角操作按钮 */}
                <div className={styles.cardActions}>
                  <button 
                    className={styles.cardActionBtn}
                    onClick={() => handleDownloadFile(file.id)}
                    title="下载"
                  >
                    ↓
                  </button>
                  <button 
                    className={styles.cardActionBtn}
                    onClick={() => handleDeleteFile(file.id)}
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 我的组员区块 ========== */}
      <section className={styles.membersSection}>
        <div className={styles.membersSectionHeader}>
          <h2 className={styles.membersTitle}>我的组员</h2>
          <button 
            className={styles.membersAddBtn}
            onClick={handleAddMember}
            title="添加成员"
          >
            +
          </button>
        </div>

        {/* 成员列表 */}
        <div className={styles.membersList}>
          {members.map((member) => (
            <div key={member.id} className={styles.memberItem}>
              <div className={styles.memberName}>{member.name}</div>
              <div className={styles.memberEmail}>{member.email}</div>
              <div className={styles.memberPermission}>{member.permission}</div>
              <button 
                className={styles.memberDeleteBtn}
                onClick={() => handleDeleteMember(member.id)}
                title="删除成员"
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
