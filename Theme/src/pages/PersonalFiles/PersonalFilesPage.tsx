import React, { useState } from 'react';
import styles from './PersonalFilesPage.module.css';

interface PersonalFile {
  id: string;
  name: string;
  type: 'file' | 'link' | 'image' | 'audio';
}

export const PersonalFilesPage: React.FC = () => {
  const [files] = useState<PersonalFile[]>([
    { id: '1', name: '我的文件.cpp', type: 'file' },
    { id: '2', name: '我的文件.cpp', type: 'link' },
    { id: '3', name: '我的文件.cpp', type: 'image' },
    { id: '4', name: '我的文件.cpp', type: 'audio' },
  ]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'file': return '📄';
      case 'link': return '🔗';
      case 'image': return '🖼️';
      case 'audio': return '🎧';
      default: return '📄';
    }
  };

  return (
    <div className={styles.pageContainer}>
      

      {/* 文件网格区域 */}
      <div className={styles.filesGrid}>
        {files.map((file) => (
          <div key={file.id} className={styles.fileCard}>
            <div className={styles.fileHeader}>
              <div className={styles.fileIconArea}>
                <span className={styles.fileIcon}>{getFileIcon(file.type)}</span>
              </div>
              <button className={styles.addBtn} title="添加">+</button>
            </div>
            <div className={styles.fileInfo}>
              <div className={styles.fileName}>{file.name}</div>
              <div className={styles.fileActions}>
                <button className={styles.iconBtn} title="下载">⬇</button>
                <button className={styles.iconBtn} title="删除">🗑️</button>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};
