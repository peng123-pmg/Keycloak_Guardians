import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreatedTeamsListPage.module.css';

interface CreatedTeam {
  id: string;
  name: string;
}

interface JoinedTeam {
  id: string;
  name: string;
}

export const CreatedTeamsListPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [createdTeams] = useState<CreatedTeam[]>([
    { id: '1', name: '团队1' },
  ]);

  const [joinedTeams] = useState<JoinedTeam[]>([
    { id: '1', name: '团队1' },
  ]);

  // 预留的空白行数（用于填充空间）
  const PLACEHOLDER_ROWS_CREATED = 6;
  const PLACEHOLDER_ROWS_JOINED = 6; // 与"我创建的"保持一致

  const handleDeleteTeam = (id: string, type: 'created' | 'joined') => {
    console.log(`删除${type === 'created' ? '创建的' : '加入的'}团队:`, id);
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
    const items = [...teams];
    // 添加占位符以达到最小行数
    const totalRows = Math.max(items.length, placeholderCount);
    const placeholders = Array.from({ length: totalRows - items.length }, (_, i) => ({
      id: `placeholder-${i}`,
      name: '',
      isPlaceholder: true
    }));

    // 添加底部粉色区块（作为最后一行）
    const bottomFill = {
      id: 'bottom-fill',
      name: '',
      isBottomFill: true
    };

    return [...items, ...placeholders, bottomFill].map((item) => {
      const isPlaceholder = 'isPlaceholder' in item && item.isPlaceholder;
      const isBottomFill = 'isBottomFill' in item && item.isBottomFill;
      
      return (
        <div
          key={item.id}
          className={`${styles.teamItem} ${isPlaceholder ? styles.placeholderItem : ''} ${isBottomFill ? styles.bottomFillItem : ''}`}
          onClick={isPlaceholder || isBottomFill ? undefined : () => handleTeamClick(item.id, type)}
          style={{ cursor: (isPlaceholder || isBottomFill) ? 'default' : 'pointer' }}
        >
          {!isPlaceholder && !isBottomFill && (
            <>
              <span className={styles.teamName}>{item.name}</span>
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
      );
    });
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
