import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, GroupInfo } from '../../services/userService';
import styles from './CreatedTeamsListPage.module.css';

interface CreatedTeam {
  id: string;
  name: string;
  code: string;
  joinPolicy?: string;
  memberLimit?: number;
  description?: string;
}

interface JoinedTeam {
  id: string;
  name: string;
  code: string;
  joinPolicy?: string;
  membershipRole?: string;
  description?: string;
}

export const CreatedTeamsListPage: React.FC = () => {
  const navigate = useNavigate();

  const [createdTeams, setCreatedTeams] = useState<CreatedTeam[]>([]);
  const [joinedTeams, setJoinedTeams] = useState<JoinedTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);
        const groups = await userService.getMyGroups();
        const normalized = groups.map((group: GroupInfo) => ({
          id: String(group.id),
          name: group.name || '未命名小组',
          description: group.description,
          code: `ID-${group.id}`,
          joinPolicy: group.joinPolicy,
          memberLimit: group.memberLimit,
          membershipRole: group.membershipRole,
          isOwner: group.isOwner || group.membershipRole === 'ADMIN'
        }));

        const owned = normalized
          .filter(group => group.isOwner)
          .sort((a, b) => Number(a.id) - Number(b.id));
        const joined = normalized
          .filter(group => !group.isOwner)
          .sort((a, b) => Number(a.id) - Number(b.id));

        setCreatedTeams(owned.map(({ isOwner, ...rest }) => rest));
        setJoinedTeams(joined.map(({ isOwner, ...rest }) => rest));
      } catch (err) {
        console.error('加载团队列表失败:', err);
        setError('无法获取团队列表，请稍后再试');
        setCreatedTeams([]);
        setJoinedTeams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // 预留的空白行数（用于填充空间）
  const PLACEHOLDER_ROWS_CREATED = 6;
  const PLACEHOLDER_ROWS_JOINED = 6; // 与"我创建的"保持一致

  const handleDeleteTeam = async (id: string, type: 'created' | 'joined') => {
    if (type === 'joined') {
      console.warn('尚未实现退出团队逻辑');
      return;
    }
    if (!window.confirm('确定删除该小组吗？删除后无法恢复。')) {
      return;
    }
    try {
      await userService.deleteGroup(Number(id));
      setCreatedTeams(prev => prev.filter(team => team.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除小组失败');
    }
  };

  const handleTeamClick = (teamId: string, type: 'created' | 'joined') => {
    if (type === 'created') {
      navigate(`/team-management/created-team/${teamId}`);
    } else {
      navigate(`/team-management/joined-team/${teamId}`);
    }
  };

  // 渲染团队列表（包含占位符和底部粉色区块）
  const renderTeamsList = (teams: (CreatedTeam | JoinedTeam)[], placeholderCount: number, type: 'created' | 'joined') => {
    if (loading) {
      return <div className={styles.loadingState}>正在加载团队数据...</div>;
    }

    if (error) {
      return <div className={styles.errorState}>{error}</div>;
    }

    const items = [...teams];
    const totalRows = Math.max(items.length, placeholderCount);
    const placeholders = Array.from({ length: totalRows - items.length }, (_, i) => ({
      id: `placeholder-${i}`,
      name: '',
      code: '',
      isPlaceholder: true
    }));

    const displayItems = [...items, ...placeholders];

    return displayItems.map((item) => (
      <div
        key={item.id}
        className={`${styles.teamItem} ${'isPlaceholder' in item && item.isPlaceholder ? styles.placeholderItem : ''}`}
        onClick={'isPlaceholder' in item && item.isPlaceholder ? undefined : () => handleTeamClick(item.id, type)}
        style={{ cursor: ('isPlaceholder' in item && item.isPlaceholder) ? 'default' : 'pointer' }}
      >
        {'isPlaceholder' in item && item.isPlaceholder ? (
          <span className={styles.placeholderLine}></span>
        ) : (
          <>
            <div className={styles.teamMainLine}>
              <span className={styles.teamCode}>{item.code}</span>
              <span className={styles.teamName}>{item.name}</span>
            </div>
            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTeam(item.id, type);
              }}
              title={type === 'created' ? '删除团队' : '退出团队'}
            >
              🗑️
            </button>
          </>
        )}
      </div>
    ));
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* ========== 我创建的区块（三个独立部分） ========== */}
        
        {/* 1. 标题区域 - 1074×385px，蓝色50% */}
        <div className={styles.createdTitleSection}>
          <h2 className={styles.sectionTitle}>我创建的</h2>
        </div>

        {/* 2. 团队列表区域 - 包含真实数据、占位符和底部粉色区块 */}
        <div className={styles.createdTeamsList}>
          {renderTeamsList(createdTeams, PLACEHOLDER_ROWS_CREATED, 'created')}
        </div>

        {/* 40px 空白间隔 */}
        <div className={styles.spacer}></div>

        {/* ========== 我加入的区块（三个独立部分） ========== */}
        
        {/* 1. 标题区域 - 1074×385px，蓝色50% */}
        <div className={styles.joinedTitleSection}>
          <h2 className={styles.sectionTitle}>我加入的</h2>
        </div>

        {/* 2. 团队列表区域 - 包含真实数据、占位符和底部粉色区块，填充到底部 */}
        <div className={styles.joinedTeamsList}>
          {renderTeamsList(joinedTeams, PLACEHOLDER_ROWS_JOINED, 'joined')}
        </div>
      </div>
    </div>
  );
};
