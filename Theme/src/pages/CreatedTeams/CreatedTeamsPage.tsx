import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './CreatedTeamsPage.module.css';
import { fileService, FileInfo } from '../../services/fileService';
import { userService, GroupInfo, GroupMember } from '../../services/userService';
import { FileUpload } from '../../components/FileUpload';

// 扩展 FileInfo 以包含共享文件的特定属性
interface TeamFile extends FileInfo {
  uploader?: string;
  permission?: string;
}

export const CreatedTeamsPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const numericTeamId = Number(teamId);

  const [teamInfo, setTeamInfo] = useState<GroupInfo | null>(null);
  const [files, setFiles] = useState<TeamFile[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [personalFiles, setPersonalFiles] = useState<FileInfo[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showUploadArea, setShowUploadArea] = useState(false);
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showPersonalFilesPicker, setShowPersonalFilesPicker] = useState(false);

  const loadPageData = async () => {
    if (!numericTeamId) {
      setError("无效的团队ID");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);

      // 并行获取所有数据
      const [groups, groupFiles, groupMembers, userFiles] = await Promise.all([
        userService.getMyGroups(),
        fileService.getSharedGroupFiles(),
        userService.getGroupMembers(numericTeamId),
        fileService.getUserFiles() // 获取个人文件用于选择
      ]);

      // 查找当前团队信息
      const currentTeam = groups.find(g => g.id === numericTeamId);
      setTeamInfo(currentTeam ?? null);

      // 过滤出当前团队的文件
      const currentTeamFiles = groupFiles.filter(f => f.groupId === numericTeamId);
      setFiles(currentTeamFiles);

      setMembers(groupMembers);
      setPersonalFiles(userFiles);

    } catch (err) {
      console.error("加载团队数据失败:", err);
      setError(err instanceof Error ? err.message : "加载数据失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [numericTeamId]);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType === 'application/pdf') return '📄';
    return '📄';
  };

  const handleAddFileClick = () => {
    setShowUploadArea(prev => !prev);
    setShowPersonalFilesPicker(false); // 重置
  };

  const handleFilesSelectedForUpload = async (selectedFiles: File[]) => {
    try {
      await fileService.uploadAndShareToGroup(selectedFiles, numericTeamId);
      await loadPageData(); // 重新加载数据
      setShowUploadArea(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : '上传失败');
    }
  };

  const handleShareExistingFile = async (fileId: string) => {
    try {
      await fileService.shareExistingFileToGroup(Number(fileId), numericTeamId);
      await loadPageData();
      setShowPersonalFilesPicker(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : '共享失败');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm("确定要从此团队中移除此文件吗？")) return;
    try {
      await fileService.deleteSharedGroupFile(Number(fileId));
      await loadPageData();
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleDownloadFile = async (file: TeamFile) => {
    try {
      await fileService.downloadFile(Number(file.id), file.name);
    } catch (err) {
      alert(err instanceof Error ? err.message : '下载失败');
    }
  };

  const handleAddMemberClick = () => {
    setShowInviteInput(prev => !prev);
    setInviteUserId('');
    setInviteError(null);
  };

  const handleInviteMember = async () => {
    if (!inviteUserId.trim()) {
      setInviteError("请输入用户名");
      return;
    }
    try {
      setInviteError(null);
      await userService.inviteGroupMember(numericTeamId, { username: inviteUserId.trim() });
      setInviteUserId('');
      setShowInviteInput(false);
      await loadPageData();
      alert("邀请成功");
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "邀请失败");
    }
  };

  const handleDeleteMember = (memberId: number) => {
    if (!window.confirm("确定要移除该成员吗？")) return;
    console.log('删除成员:', memberId);
    // await userService.removeGroupMember(numericTeamId, memberId);
    // await loadPageData();
    alert("移除成员功能待后端实现");
  };

  if (isLoading) {
    return <div className={styles.loadingState}>正在加载团队空间...</div>;
  }

  if (error) {
    return <div className={styles.errorState}>错误: {error}</div>;
  }

  return (
    <div className={styles.pageContainer}>
      {/* ========== 团队文件区块 ========== */}
      <section className={styles.createdSection}>
        <div className={styles.sectionHeaderWithCards}>
          <h1 className={styles.mainTitle}>{teamInfo?.name || '团队文件'}</h1>
        </div>

        {/* 文件卡片横向滚动区域 */}
        <div className={styles.cardsScrollWrapper}>
          <div className={styles.cardsContainer}>
            {/* 添加文件卡片 */}
            <div className={`${styles.fileCard} ${styles.addCard}`} onClick={handleAddFileClick}>
              <div className={styles.addCardIcon}>+</div>
              <div className={styles.addCardText}>添加文件</div>
            </div>

            {files.map((file, idx) => (
              <div key={`${file.id}-${idx}`} className={styles.fileCard}>
                <div className={styles.cardIconArea}>
                  <span className={styles.cardIcon}>{getFileIcon(file.type)}</span>
                </div>
                <div className={styles.cardFileName} title={file.name}>{file.name}</div>
                <div className={styles.cardFooter}>
                  <div className={styles.cardFileMeta}>
                    <span>{fileService.formatFileSize(file.size)}</span>
                    <span title={file.uploader}>{file.uploader}</span>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.cardActionBtn} onClick={() => handleDownloadFile(file)} title="下载">↓</button>
                    <button className={styles.cardActionBtn} onClick={() => handleDeleteFile(file.id)} title="删除">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 上传/选择文件区域 */}
        {showUploadArea && (
          <div className={styles.uploadContainer}>
            <div className={styles.uploadTabs}>
              <button
                className={!showPersonalFilesPicker ? styles.activeTab : ''}
                onClick={() => setShowPersonalFilesPicker(false)}
              >
                上传新文件
              </button>
              <button
                className={showPersonalFilesPicker ? styles.activeTab : ''}
                onClick={() => setShowPersonalFilesPicker(true)}
              >
                从我的文件选择
              </button>
            </div>
            {showPersonalFilesPicker ? (
              <div className={styles.personalFilesPicker}>
                {personalFiles.length > 0 ? personalFiles.map(pf => (
                  <div key={pf.id} className={styles.personalFileItem} onClick={() => handleShareExistingFile(pf.id)}>
                    <span>{pf.name}</span>
                    <span>{fileService.formatFileSize(pf.size)}</span>
                  </div>
                )) : <p>您还没有个人文件</p>}
              </div>
            ) : (
              <FileUpload onFilesSelected={handleFilesSelectedForUpload} />
            )}
          </div>
        )}
      </section>

      {/* ========== 团队成员区块 ========== */}
      <section className={styles.membersSection}>
        <div className={styles.membersSectionHeader}>
          <h2 className={styles.membersTitle}>团队成员 ({members.length})</h2>
          <button className={styles.membersAddBtn} onClick={handleAddMemberClick} title="添加成员">+</button>
        </div>

        {/* 邀请成员输入行 */}
        {showInviteInput && (
          <div className={styles.inviteMemberRow}>
            <input
              type="text"
              placeholder="输入用户名"
              value={inviteUserId}
              onChange={(e) => setInviteUserId(e.target.value)}
              className={styles.inviteInput}
            />
            <button onClick={handleInviteMember} className={styles.inviteButton}>邀请</button>
            {inviteError && <span className={styles.inviteError}>{inviteError}</span>}
          </div>
        )}

        {/* 成员列表 */}
        <div className={styles.membersList}>
          {members.map((member) => (
            <div key={member.id} className={styles.memberItem}>
              <div className={styles.memberName}>{member.displayName || member.username}</div>
              <div className={styles.memberEmail}>{member.email}</div>
              <div className={styles.memberPermission}>{member.role}</div>
              <button className={styles.memberDeleteBtn} onClick={() => handleDeleteMember(member.id)} title="删除成员">🗑️</button>
            </div>
          ))}
          {members.length === 0 && !showInviteInput && (
            <div className={styles.emptyPlaceholder}>暂无成员</div>
          )}
        </div>
      </section>
    </div>
  );
};
