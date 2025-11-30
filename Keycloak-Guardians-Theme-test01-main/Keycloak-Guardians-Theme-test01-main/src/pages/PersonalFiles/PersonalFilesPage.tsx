import React, { useState, useEffect } from 'react';
import { FileUpload } from '../../components/FileUpload/FileUpload';
import { fileService, FileInfo } from '../../services/fileService';
import styles from './PersonalFilesPage.module.css';

export const PersonalFilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 获取文件列表
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const fileList = await fileService.getUserFiles();
      setFiles(fileList);
      setError(null);
    } catch (err: any) {
      setError(err.message || '获取文件列表失败');
      console.error('获取文件列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 处理文件上传
  const handleFilesSelected = async (selectedFiles: File[]) => {
    try {
      const uploadedFiles = await fileService.uploadFiles(selectedFiles);
      setFiles(prev => [...uploadedFiles, ...prev]);
    } catch (err: any) {
      setError(err.message || '文件上传失败');
      console.error('文件上传失败:', err);
    }
  };

  // 处理文件下载
  const handleDownload = async (file: FileInfo) => {
    try {
      await fileService.downloadFile(file.id, file.name);
    } catch (err: any) {
      setError(err.message || '文件下载失败');
      console.error('文件下载失败:', err);
    }
  };

  // 处理文件删除
  const handleDelete = async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err: any) {
      setError(err.message || '文件删除失败');
      console.error('文件删除失败:', err);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'file': return '📄';
      case 'link': return '🔗';
      case 'image': return '🖼️';
      case 'audio': return '🎧';
      case 'video': return '🎬';
      case 'document': return '📑';
      default: return '📄';
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h2>个人文件</h2>
      
      {/* 文件上传区域 */}
      <div className={styles.uploadSection}>
        <FileUpload 
          onFilesSelected={handleFilesSelected}
          multiple={true}
        />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className={styles.errorBanner}>
          错误: {error}
          <button onClick={() => setError(null)} className={styles.closeButton}>×</button>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className={styles.loading}>加载中...</div>
      )}

      {/* 文件网格区域 */}
      <div className={styles.filesGrid}>
        {files.map((file) => (
          <div key={file.id} className={styles.fileCard}>
            <div className={styles.fileHeader}>
              <div className={styles.fileIconArea}>
                <span className={styles.fileIcon}>{getFileIcon(file.type)}</span>
              </div>
            </div>
            <div className={styles.fileInfo}>
              <div className={styles.fileName} title={file.name}>{file.name}</div>
              <div className={styles.fileMeta}>
                <span className={styles.fileSize}>{fileService.formatFileSize(file.size)}</span>
                <span className={styles.uploadTime}>{fileService.formatUploadTime(file.uploadTime)}</span>
              </div>
              <div className={styles.fileActions}>
                <button 
                  className={styles.iconBtn} 
                  title="下载"
                  onClick={() => handleDownload(file)}
                >
                  ⬇
                </button>
                <button 
                  className={styles.iconBtn} 
                  title="删除"
                  onClick={() => handleDelete(file.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {files.length === 0 && !loading && (
          <div className={styles.emptyState}>
            暂无文件，请上传文件
          </div>
        )}
      </div>
    </div>
  );
};