import React, { useState, useEffect } from 'react';
import styles from './MyTeamsPage.module.css';
import { FileUpload } from '../../components/FileUpload';
import { fileService, FileInfo } from '../../services/fileService';

interface TeamFile extends FileInfo {}

interface Team {
  id: string;
  name: string;
  teamId: string;
  role: string;
  permission: string;
}

export const MyTeamsPage: React.FC = () => {
  const [files, setFiles] = useState<TeamFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [showUploadArea, setShowUploadArea] = useState(false);

  // 加载文件列表
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      // TODO: 替换为真实的 teamId
      const teamFiles = await fileService.getTeamFiles('team_001');
      setFiles(teamFiles);
    } catch (error) {
      console.error('加载文件列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    setShowUploadArea(!showUploadArea);
  };

  const handleFilesSelected = async (selectedFiles: File[]) => {
    console.log('选中的文件:', selectedFiles);
    
    try {
      // 添加到上传中列表
      const fileNames = selectedFiles.map(f => f.name);
      setUploadingFiles(prev => [...prev, ...fileNames]);

      // 上传文件
      const uploadedFiles = await fileService.uploadFiles(
        selectedFiles,
        (fileName, progress) => {
          console.log(`${fileName} 上传进度: ${progress}%`);
        }
      );

      // 添加到文件列表
      setFiles(prev => [...uploadedFiles, ...prev]);
      
      // 移除上传中标记
      setUploadingFiles(prev => prev.filter(name => !fileNames.includes(name)));
      
      // 关闭上传区域
      setShowUploadArea(false);
    } catch (error) {
      console.error('文件上传失败:', error);
      setUploadingFiles([]);
    }
  };

  const handleDownloadFile = async (file: TeamFile) => {
    try {
      await fileService.downloadFile(file.id, file.name);
      
      // 临时方案：如果有 URL，使用 a 标签下载
      if (file.url) {
        const a = document.createElement('a');
        a.href = file.url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('下载文件失败:', error);
      alert('下载失败，请稍后重试');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('确定要删除这个文件吗？')) {
      return;
    }

    try {
      await fileService.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('删除文件失败:', error);
      alert('删除失败，请稍后重试');
    }
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
          <button 
            className={`${styles.addButton} ${showUploadArea ? styles.addButtonActive : ''}`}
            onClick={handleAddFile} 
            title={showUploadArea ? "关闭上传区域" : "添加文件"}
          >
            {showUploadArea ? '×' : '+'}
          </button>
        </div>

        {/* 文件上传区域 */}
        {showUploadArea && (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            maxFileSize={50 * 1024 * 1024} // 50MB
            multiple={true}
          />
        )}

        {/* 上传中提示 */}
        {uploadingFiles.length > 0 && (
          <div className={styles.uploadingNotice}>
            ⏳ 正在上传 {uploadingFiles.length} 个文件...
          </div>
        )}

        {/* 文件列表 */}
        {isLoading ? (
          <div className={styles.loadingMessage}>加载中...</div>
        ) : files.length === 0 ? (
          <div className={styles.emptyMessage}>暂无文件，点击 "+" 上传文件</div>
        ) : (
          <div className={styles.filesGrid}>
            {files.map((file, index) => (
              <div
                key={file.id}
                className={`${styles.fileCard} ${index % 2 === 0 ? styles.fileCardBlue : styles.fileCardWhite}`}
              >
                <div className={styles.fileIcon}>
                  {getFileIcon(file.type)}
                </div>
                <div className={styles.fileInfo}>
                  <div className={styles.fileName} title={file.name}>{file.name}</div>
                  <div className={styles.fileMetadata}>
                    <span className={styles.fileSize}>
                      {fileService.formatFileSize(file.size)}
                    </span>
                    <span className={styles.fileSeparator}>·</span>
                    <span className={styles.fileTime}>
                      {fileService.formatUploadTime(file.uploadTime)}
                    </span>
                  </div>
                  {file.uploader && (
                    <div className={styles.fileUploader}>
                      上传者: {file.uploader}
                    </div>
                  )}
                </div>
                <div className={styles.fileActions}>
                  <button
                    className={styles.downloadButton}
                    onClick={() => handleDownloadFile(file)}
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
        )}
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
