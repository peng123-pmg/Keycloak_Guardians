import React, { useState, useEffect } from 'react';
import { FileUpload } from '../../components/FileUpload/FileUpload';
import { fileService, FileInfo } from '../../services/fileService';
import styles from './PersonalFilesPage.module.css';

export const PersonalFilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 获取文件列表
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const fileList = await fileService.getUserFiles();
      setFiles(fileList);
      setError(null);
    } catch (err) {
      console.error('获取文件列表失败:', err);
      setError('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取文件列表
  useEffect(() => {
    fetchFiles();
  }, []);

  // 处理文件选择
  const handleFilesSelected = async (selectedFiles: File[]) => {
    try {
      setUploading(true);
      setError(null);
      
      // 上传文件
      const uploadedFiles = await fileService.uploadFiles(selectedFiles);
      
      // 更新文件列表
      setFiles(prevFiles => [...uploadedFiles, ...prevFiles]);
    } catch (err) {
      console.error('上传文件失败:', err);
      setError('上传文件失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setUploading(false);
    }
  };

  // 下载文件
  const handleDownload = async (file: FileInfo) => {
    try {
      await fileService.downloadFile(file.id, file.name);
    } catch (err) {
      console.error('下载文件失败:', err);
      setError('下载文件失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  // 删除文件
  const handleDelete = async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId);
      // 从列表中移除文件
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    } catch (err) {
      console.error('删除文件失败:', err);
      setError('删除文件失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'file': return '📄';
      case 'link': return '🔗';
      case 'image': return '🖼️';
      case 'audio': return '🎧';
      case 'video': return '🎬';
      case 'document': return '📝';
      default: return '📄';
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>个人文件</h1>
      
      {/* 上传区域 */}
      <div className={styles.uploadSection}>
        <FileUpload 
          onFilesSelected={handleFilesSelected}
          multiple={true}
        />
        {uploading && <div className={styles.uploadStatus}>文件上传中...</div>}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className={styles.errorNotification}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
          <button 
            className={styles.closeError} 
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* 文件列表区域 */}
      <div className={styles.filesSection}>
        <h2>我的文件 ({files.length})</h2>
        
        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : files.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📁</div>
            <p>暂无文件</p>
            <p>请通过上方区域上传文件</p>
          </div>
        ) : (
          <div className={styles.filesGrid}>
            {files.map((file) => (
              <div key={file.id} className={styles.fileCard}>
                <div className={styles.fileHeader}>
                  <div className={styles.fileIconArea}>
                    <span className={styles.fileIcon}>{getFileIcon(file.type)}</span>
                  </div>
                </div>
                <div className={styles.fileInfo}>
                  <div className={styles.fileName} title={file.name}>
                    {file.name}
                  </div>
                  <div className={styles.fileMeta}>
                    <span className={styles.fileSize}>
                      {fileService.formatFileSize(file.size)}
                    </span>
                    <span className={styles.uploadTime}>
                      {fileService.formatUploadTime(file.uploadTime)}
                    </span>
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
          </div>
        )}
      </div>
    </div>
  );
};