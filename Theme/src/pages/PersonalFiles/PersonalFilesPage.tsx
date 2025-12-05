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
      if (err instanceof Error && err.message.includes('认证失败')) {
        // 认证失败，触发登出
        window.dispatchEvent(new CustomEvent('keycloak-logout'));
      } else {
        setError('获取文件列表失败: ' + (err instanceof Error ? err.message : '未知错误'));
      }
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
      if (err instanceof Error && err.message.includes('认证失败')) {
        // 认证失败，触发登出
        window.dispatchEvent(new CustomEvent('keycloak-logout'));
      } else {
        setError('上传文件失败: ' + (err instanceof Error ? err.message : '未知错误'));
      }
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
      if (err instanceof Error && err.message.includes('认证失败')) {
        // 认证失败，触发登出
        window.dispatchEvent(new CustomEvent('keycloak-logout'));
      } else {
        setError('下载文件失败: ' + (err instanceof Error ? err.message : '未知错误'));
      }
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
      if (err instanceof Error && err.message.includes('认证失败')) {
        // 认证失败，触发登出
        window.dispatchEvent(new CustomEvent('keycloak-logout'));
      } else {
        setError('删除文件失败: ' + (err instanceof Error ? err.message : '未知错误'));
      }
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
          <span className={styles.errorText}>{error}</span>
          <button 
            className={styles.closeButton}
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* 文件列表 */}
      <div className={styles.fileListContainer}>
        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : files.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📁</div>
            <p>暂无文件</p>
            <p>请上传文件或刷新列表</p>
            <button onClick={fetchFiles} className={styles.refreshButton}>刷新</button>
          </div>
        ) : (
          <div className={styles.fileGrid}>
            {files.map((file) => (
              <div key={file.id} className={styles.fileCard}>
                <div className={styles.fileIcon}>{getFileIcon(file.type)}</div>
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
                </div>
                <div className={styles.fileActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleDownload(file)}
                    title="下载"
                  >
                    ⬇️
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleDelete(file.id)}
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};