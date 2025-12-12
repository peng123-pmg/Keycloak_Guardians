import React, { useState, useEffect, useMemo } from 'react';
import styles from './MyTeamsPage.module.css';
import { FileUpload } from '../../components/FileUpload/FileUpload';
import { fileService, FileInfo } from '../../services/fileService';
import { userService, GroupMember } from '../../services/userService';
import type { GroupInfo } from '../../services/userService';

interface Team extends GroupInfo {
  teamCode: string;
  roleLabel: string;
  permissionLabel: string;
}

export const MyTeamsPage: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [ownedTeams, setOwnedTeams] = useState<Team[]>([]);
  const [joinedTeams, setJoinedTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teamMembers, setTeamMembers] = useState<GroupMember[]>([]);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamsLoading, setTeamsLoading] = useState<boolean>(true);
  const LAST_SELECTED_TEAM_KEY = 'myteams:last-selected-team';

  const resolveDefaultTeamId = (ownedList: Team[], joinedList: Team[]) => {
    if (ownedList.length > 0) return ownedList[0].id;
    if (joinedList.length > 0) return joinedList[0].id;
    return null;
  };

  // 加载文件列表
  useEffect(() => {
    loadFiles();
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeamId) {
      loadMembers(selectedTeamId);
    } else {
      setTeamMembers([]);
    }
  }, [selectedTeamId]);

  const loadFiles = async (teamId?: number) => {
    try {
      setIsLoading(true);
      const sharedFiles = await fileService.getSharedGroupFiles();
      setFiles(sharedFiles);
      if (teamId) {
        setSelectedTeamId(teamId);
        localStorage.setItem(LAST_SELECTED_TEAM_KEY, teamId.toString());
      }
    } catch (error) {
      console.error('加载文件列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      setTeamsLoading(true);
      setTeamError(null);
      const groupList = await userService.getMyGroups();
      const owned = groupList.filter(group => group.isOwner || group.membershipRole === 'ADMIN');
      const joined = groupList.filter(group => !group.isOwner && group.membershipRole !== 'ADMIN');

      const mappedOwned = owned.map((group) => ({
        id: group.id,
        name: group.name,
        teamCode: `ID-${group.id}`,
        roleLabel: '团队拥有者',
        permissionLabel: '完全控制'
      }));

      const mappedJoined = joined.map((group) => ({
        id: group.id,
        name: group.name,
        teamCode: `ID-${group.id}`,
        roleLabel: '成员',
        permissionLabel: '仅阅读'
      }));

      setOwnedTeams(mappedOwned);
      setJoinedTeams(mappedJoined);

      const lastSelectedId = localStorage.getItem(LAST_SELECTED_TEAM_KEY);
      if (lastSelectedId) {
        const restoredId = Number(lastSelectedId);
        const exists = [...mappedOwned, ...mappedJoined].some(g => g.id === restoredId);
        const fallbackId = resolveDefaultTeamId(mappedOwned, mappedJoined);
        const finalId = exists ? restoredId : fallbackId;
        setSelectedTeamId(finalId);
        if (!exists && finalId !== null) {
          localStorage.setItem(LAST_SELECTED_TEAM_KEY, finalId.toString());
        }
      } else {
        const defaultId = resolveDefaultTeamId(mappedOwned, mappedJoined);
        setSelectedTeamId(defaultId);
        if (defaultId !== null) localStorage.setItem(LAST_SELECTED_TEAM_KEY, defaultId.toString());
      }
    } catch (error) {
      console.error('加载小组失败:', error);
      setTeamError('无法获取团队列表，请稍后重试');
      setOwnedTeams([]);
      setJoinedTeams([]);
    } finally {
      setTeamsLoading(false);
    }
  };

  const loadMembers = async (teamId: number) => {
    try {
      const members = await userService.getGroupMembers(teamId);
      setTeamMembers(members);
    } catch (error) {
      console.error('加载成员失败:', error);
      setTeamMembers([]);
    }
  };

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
    if (!selectedTeamId) {
      alert('请先选择一个团队');
      return;
    }
    try {
      const fileNames = selectedFiles.map(f => f.name);
      setUploadingFiles(prev => [...prev, ...fileNames]);
      await fileService.uploadFiles(
        selectedFiles,
        (fileName, progress) => console.log(`${fileName} 上传进度: ${progress}%`),
        selectedTeamId
      );
      await loadFiles(selectedTeamId);
      setUploadingFiles(prev => prev.filter(name => !fileNames.includes(name)));
      setShowUploadArea(false);
    } catch (error) {
      console.error('文件上传失败:', error);
      setUploadingFiles([]);
    }
  };

  const handleDownloadFile = async (file: FileInfo) => {
    try {
      await fileService.downloadFile(Number(file.id), file.name);
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
      await fileService.deleteSharedGroupFile(Number(fileId));
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('删除文件失败:', error);
      alert('删除失败，请稍后重试');
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (!window.confirm('确定删除该小组吗？删除后无法恢复。')) {
      return;
    }
    try {
      await userService.deleteGroup(teamId);
      await loadTeams();
    } catch (error) {
      alert(error instanceof Error ? error.message : '删除小组失败');
    }
  };

  const handleSelectTeam = (teamId: number) => {
    setSelectedTeamId(teamId);
    localStorage.setItem(LAST_SELECTED_TEAM_KEY, teamId.toString());
  };

  const handleInviteMember = async () => {
    if (!selectedTeamId) {
      setInviteError('请先选择一个团队');
      return;
    }
    if (!inviteUserId.trim()) {
      setInviteError('请输入用户名');
      return;
    }
    try {
      setInviteError(null);
      await userService.inviteGroupMember(selectedTeamId, { username: inviteUserId.trim() });
      setInviteUserId('');
      await loadMembers(selectedTeamId);
      alert('已发送邀请');
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : '邀请失败');
    }
  };

  const shareExistingFile = async (fileId: string) => {
    if (!selectedTeamId) {
      alert('请先选择一个团队');
      return;
    }
    try {
      await fileService.shareExistingFileToGroup(Number(fileId), selectedTeamId);
      await loadFiles(selectedTeamId);
      alert('已共享到团队');
    } catch (error) {
      alert(error instanceof Error ? error.message : '共享失败');
    }
  };

  const filteredFiles = useMemo(() => {
    if (selectedTeamId === null) return files;
    return files.filter(file => file.groupId === selectedTeamId);
  }, [files, selectedTeamId]);

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
        ) : filteredFiles.length === 0 ? (
          <div className={styles.emptyMessage}>暂无文件，点击 "+" 上传文件</div>
        ) : (
          <div className={styles.filesGrid}>
            {filteredFiles.map((file, index) => (
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
                  <button
                    className={styles.shareButton}
                    onClick={() => shareExistingFile(file.id)}
                    title="同步到团队"
                  >
                    ↗
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
          <h2 className={styles.subTitle}>我创建的</h2>
        </div>
        <div className={styles.teamsTable}>
          {teamsLoading ? (
            <div className={styles.loadingMessage}>团队数据加载中...</div>
          ) : ownedTeams.length === 0 ? (
            <div className={styles.emptyMessage}>暂未创建任何团队</div>
          ) : (
            ownedTeams.map(team => (
              <div key={team.id} className={styles.teamRow}>
                <div className={styles.teamInfo} onClick={() => handleSelectTeam(team.id)}>
                  <span className={styles.teamName}>{team.name}</span>
                  <span className={styles.teamNumber}>{team.teamCode}</span>
                  <span className={styles.teamRole}>{team.roleLabel}</span>
                  <span className={styles.teamPermission}>{team.permissionLabel}</span>
                </div>
                <button
                  className={styles.deleteTeamButton}
                  onClick={() => handleDeleteTeam(team.id)}
                  title="删除小组"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        <div className={styles.sectionHeader}>
          <h2 className={styles.subTitle}>我加入的</h2>
        </div>
        <div className={styles.teamsTable}>
          {joinedTeams.length === 0 ? (
            <div className={styles.emptyMessage}>暂无加入的团队</div>
          ) : (
            joinedTeams.map(team => (
              <div key={team.id} className={styles.teamRow}>
                <div className={styles.teamInfo} onClick={() => handleSelectTeam(team.id)}>
                  <span className={styles.teamName}>{team.name}</span>
                  <span className={`${styles.teamNumber} ${selectedTeamId === team.id ? styles.activeTeam : ''}`}>{team.teamCode}</span>
                  <span className={styles.teamRole}>{team.roleLabel}</span>
                  <span className={styles.teamPermission}>{team.permissionLabel}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.membersSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.subTitle}>团队成员</h2>
            <div className={styles.inviteControls}>
              <input
                className={styles.inviteInput}
                placeholder="输入用户ID"
                value={inviteUserId}
                onChange={(e) => setInviteUserId(e.target.value)}
              />
              <button className={styles.inviteButton} onClick={handleInviteMember}>+ 邀请</button>
            </div>
          </div>
          {inviteError && <div className={styles.errorBanner}>{inviteError}</div>}
          <div className={styles.membersList}>
            {teamMembers.length === 0 ? (
              <div className={styles.emptyMessage}>未选择团队或暂无成员</div>
            ) : teamMembers.map(member => (
              <div key={member.id} className={styles.memberRow}>
                <div>
                  <div className={styles.memberName}>{member.displayName || member.username || member.userId}</div>
                  <div className={styles.memberMeta}>角色：{member.role}</div>
                </div>
                <div className={styles.memberMeta}>{new Date(member.joinedAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        {teamError && (
          <div className={styles.errorBanner}>{teamError}</div>
        )}
       </section>
     </div>
   );
 };