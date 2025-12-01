import React, { useState } from 'react';
import styles from './RecycleBinPage.module.css';

type FileCategory = '视频' | '文档' | '图片' | '音频' | '其他';

interface DeletedFile {
  id: string;
  fileName: string;
  category: FileCategory;
  deleteTime: string;
  remainingDays: number;
  originalPath: string;
}

const RecycleBinPage: React.FC = () => {
  const [deletedFiles, setDeletedFiles] = useState<DeletedFile[]>([
    {
      id: '1',
      fileName: 'xxxx',
      category: '视频',
      deleteTime: '2025.11.27 22:00',
      remainingDays: 10,
      originalPath: '/personal/videos'
    },
    {
      id: '2',
      fileName: '项目文档',
      category: '文档',
      deleteTime: '2025.11.26 15:30',
      remainingDays: 9,
      originalPath: '/team/documents'
    },
    {
      id: '3',
      fileName: '会议记录',
      category: '文档',
      deleteTime: '2025.11.25 10:20',
      remainingDays: 8,
      originalPath: '/personal/docs'
    },
    {
      id: '4',
      fileName: '演示文稿',
      category: '文档',
      deleteTime: '2025.11.24 18:45',
      remainingDays: 7,
      originalPath: '/team/presentations'
    },
    {
      id: '5',
      fileName: '培训视频',
      category: '视频',
      deleteTime: '2025.11.23 09:15',
      remainingDays: 6,
      originalPath: '/personal/training'
    }
  ]);

  // 永久删除文件
  const handlePermanentDelete = (id: string) => {
    if (window.confirm('确定要永久删除该文件吗？此操作无法撤销！')) {
      setDeletedFiles(prev => prev.filter(file => file.id !== id));
      console.log(`文件 ${id} 已永久删除`);
      // TODO: 调用后端 API 永久删除文件
    }
  };

  // 恢复文件
  const handleRestore = (file: DeletedFile) => {
    if (window.confirm(`确定要将文件"${file.fileName}"恢复到原位置吗？`)) {
      setDeletedFiles(prev => prev.filter(f => f.id !== file.id));
      console.log(`文件 ${file.fileName} 已恢复至 ${file.originalPath}`);
      // TODO: 调用后端 API 恢复文件
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentArea}>
        {/* 标题栏 */}
        <div className={styles.headerRow}>
          <div className={styles.headerCell} style={{ width: '200px' }}>
            文件名称
          </div>
          <div className={styles.headerCell} style={{ width: '150px' }}>
            原分类
          </div>
          <div className={styles.headerCell} style={{ width: '250px' }}>
            删除时间
          </div>
          <div className={styles.headerCell} style={{ width: '180px' }}>
            剩余保留天数
          </div>
          <div className={styles.headerCell} style={{ flex: 1 }}>
            操作
          </div>
        </div>

        {/* 表格区域 */}
        <div className={styles.tableArea}>
          {deletedFiles.length === 0 ? (
            <div className={styles.emptyMessage}>回收站为空</div>
          ) : (
            deletedFiles.map(file => (
              <div key={file.id} className={styles.tableRow}>
                <div className={styles.rowCell} style={{ width: '200px' }}>
                  {file.fileName}
                </div>
                <div className={styles.rowCell} style={{ width: '150px' }}>
                  {file.category}
                </div>
                <div className={styles.rowCell} style={{ width: '250px' }}>
                  {file.deleteTime}
                </div>
                <div className={styles.rowCell} style={{ width: '180px' }}>
                  {file.remainingDays}天
                </div>
                <div className={styles.rowCell} style={{ flex: 1 }}>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handlePermanentDelete(file.id)}
                    >
                      删除
                    </button>
                    <button
                      className={styles.restoreButton}
                      onClick={() => handleRestore(file)}
                    >
                      恢复
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部提示 */}
        {deletedFiles.length > 0 && (
          <div className={styles.footerHint}>
            <p>提示：文件将在回收站保留 30 天，超过期限将被自动永久删除</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecycleBinPage;
