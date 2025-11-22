import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreatedTeamsListPage_Responsive.module.css';

interface CreatedTeam {
  id: string;
  name: string;
}

interface JoinedTeam {
  id: string;
  name: string;
}

/**
 * 响应式"我的团队"页面组件
 * 特点：
 * 1. 完全响应式设计，无固定像素值
 * 2. 使用 Flexbox 布局，两个区块各占50%高度
 * 3. 使用 clamp() 实现流体字号和间距
 * 4. 无需垂直滚动条（除非团队列表过多）
 * 5. 适配桌面、平板、手机等各种屏幕尺寸
 */
export const CreatedTeamsListPageResponsive: React.FC = () => {
  const navigate = useNavigate();
  
  const [createdTeams] = useState<CreatedTeam[]>([
    { id: '1', name: '团队1' },
    { id: '2', name: '团队2' },
    { id: '3', name: '团队3' },
  ]);

  const [joinedTeams] = useState<JoinedTeam[]>([
    { id: '1', name: '团队A' },
    { id: '2', name: '团队B' },
  ]);

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

  return (
    <div className={styles.pageContainer}>
      {/* ========== 我创建的区块 ========== */}
      <section className={styles.sectionBlock}>
        {/* 标题区域 - 蓝色背景 */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>我创建的</h2>
        </div>
        
        {/* 团队列表区域 - 灰色背景 */}
        <div className={styles.teamsList}>
          {createdTeams.map((team) => (
            <div 
              key={team.id} 
              className={styles.teamItem}
              onClick={() => handleTeamClick(team.id, 'created')}
            >
              <span className={styles.teamName}>{team.name}</span>
              <button
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTeam(team.id, 'created');
                }}
                title="删除团队"
                aria-label={`删除团队 ${team.name}`}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {/* 底部装饰区域 - 粉色背景 */}
        <div className={styles.decorativeArea}></div>
      </section>

      {/* ========== 分隔线 ========== */}
      <div className={styles.divider}></div>

      {/* ========== 我加入的区块 ========== */}
      <section className={styles.sectionBlock}>
        {/* 标题区域 - 蓝色背景 */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>我加入的</h2>
        </div>
        
        {/* 团队列表区域 - 灰色背景 */}
        <div className={styles.teamsList}>
          {joinedTeams.map((team) => (
            <div 
              key={team.id} 
              className={styles.teamItem}
              onClick={() => handleTeamClick(team.id, 'joined')}
            >
              <span className={styles.teamName}>{team.name}</span>
              <button
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTeam(team.id, 'joined');
                }}
                title="退出团队"
                aria-label={`退出团队 ${team.name}`}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {/* 底部装饰区域 - 粉色背景 */}
        <div className={styles.decorativeArea}></div>
      </section>
    </div>
  );
};
