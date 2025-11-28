import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { WelcomeSection } from './components/WelcomeSection';
import styles from './Dashboard.module.css';
import { apiService } from '../../services/api';

interface UserInfo {
  username: string;
  email: string;
  roles: string[];
  userId: string;
  welcome: string;
}

interface UserStatsSummary {
  totalOwners: number;
  activeOwners: number;
  totalFiles: number;
  storageUsedBytes: number;
  storageUsedReadable: string;
  averageFileSizeBytes: number;
}

interface UserStorageEntry {
  ownerId: string;
  fileCount: number;
  storageBytes: number;
}

interface UserStats {
  summary: UserStatsSummary;
  filesByStatus: Record<string, number>;
  topUsersByStorage: UserStorageEntry[];
  generatedAt: string;
}

// 文件相关接口
interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'deleted' | 'archived';
}

// 团队相关接口
interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  members: TeamMember[];
}

interface TeamMember {
  id: string;
  username: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

// 文件管理组件
const FileManager: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const filesData = await apiService.getFiles();
      setFiles(filesData);
      setError(null);
    } catch (err) {
      console.error('获取文件列表失败:', err);
      setError('获取文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await apiService.deleteFile(fileId);
      setFiles(files.filter(file => file.id !== fileId));
    } catch (err) {
      console.error('删除文件失败:', err);
      setError('删除文件失败');
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.fileManager}>
      <h2>文件管理</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>文件名</th>
            <th>大小</th>
            <th>所有者</th>
            <th>创建时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => (
            <tr key={file.id}>
              <td>{file.name}</td>
              <td>{(file.size / 1024).toFixed(2)} KB</td>
              <td>{file.owner}</td>
              <td>{new Date(file.createdAt).toLocaleDateString()}</td>
              <td>{file.status}</td>
              <td>
                <button onClick={() => handleDelete(file.id)}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 团队管理组件
const TeamManager: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const teamsData = await apiService.getTeams();
      setTeams(teamsData);
      setError(null);
    } catch (err) {
      console.error('获取团队列表失败:', err);
      setError('获取团队列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (teamId: string) => {
    try {
      await apiService.deleteTeam(teamId);
      setTeams(teams.filter(team => team.id !== teamId));
    } catch (err) {
      console.error('删除团队失败:', err);
      setError('删除团队失败');
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.teamManager}>
      <h2>团队管理</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>团队名称</th>
            <th>描述</th>
            <th>成员数</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {teams.map(team => (
            <tr key={team.id}>
              <td>{team.name}</td>
              <td>{team.description}</td>
              <td>{team.members.length}</td>
              <td>{new Date(team.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleDelete(team.id)}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 创建团队组件
const CreateTeam: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiService.createTeam({ name, description });
      setSuccess('团队创建成功');
      setError(null);
      setName('');
      setDescription('');
    } catch (err) {
      console.error('创建团队失败:', err);
      setError('创建团队失败');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.createTeam}>
      <h2>创建团队</h2>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="teamName">团队名称:</label>
          <input
            id="teamName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="teamDescription">描述:</label>
          <textarea
            id="teamDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '创建中...' : '创建团队'}
        </button>
      </form>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('welcome');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 同时获取用户信息和统计数据
        const [userInfoData, userStatsData] = await Promise.all([
          apiService.getCurrentUser(),
          apiService.getUserStats()
        ]);
        
        setUserInfo(userInfoData);
        setUserStats(userStatsData);
        setError(null);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMenuChange = (menu: string) => {
    if (menu === 'logout') {
      // 清除登录状态
      sessionStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      
      // 触发退出登录事件
      window.dispatchEvent(new CustomEvent('keycloak-logout'));
      
      console.log('✅ 已退出登录');
    } else {
      setActiveMenu(menu);
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'welcome':
        return <WelcomeSection userInfo={userInfo} userStats={userStats} />;
      case 'my-files':
      case 'delete':
        return <FileManager />;
      case 'team-management':
      case 'team-files':
        return <TeamManager />;
      case 'create-team':
        return <CreateTeam />;
      default:
        return <WelcomeSection userInfo={userInfo} userStats={userStats} />;
    }
  };

  return (
    <div className={`${styles.dashboardContainer} watermark-bg`}>
      <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />
      <main className={styles.mainContent}>
        {loading ? (
          <div>加载中...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            {renderContent()}
            
            {/* 底部装饰区块 */}
            <div className={styles.bottomDecoration}></div>
          </>
        )}
      </main>
    </div>
  );
};