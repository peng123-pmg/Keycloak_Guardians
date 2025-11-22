import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { GlobalSearch } from '../../components/GlobalSearch/GlobalSearch';
import { WelcomeSection } from './components/WelcomeSection';
import { PersonalFilesPage } from '../PersonalFiles/PersonalFilesPage';
import { MyTeamsPage } from '../MyTeams/MyTeamsPage';
import { CreatedTeamsPage } from '../CreatedTeams/CreatedTeamsPage';
import { CreatedTeamsListPage } from '../CreatedTeamsList/CreatedTeamsListPage';
import { CreateTeamPage } from '../CreateTeam/CreateTeamPage';
import styles from './Dashboard.module.css';

const DashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 根据当前路径确定激活的菜单项
  const getActiveMenu = () => {
    const path = location.pathname;
    if (path === '/personal-files') return 'my-files';
    if (path === '/team-management/create') return 'create-team';
    if (path === '/team-management/my-teams') return 'my-teams';
    if (path.startsWith('/team-management/created-team/')) return 'my-teams';
    if (path.startsWith('/team-management/joined-team/')) return 'my-teams';
    if (path === '/recycle-bin') return 'recycle-bin';
    if (path === '/notifications') return 'notifications';
    if (path === '/settings') return 'settings';
    return '';
  };

  const handleMenuChange = (menu: string) => {
    if (menu === 'logout') {
      // 清除登录状态
      sessionStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      
      // 触发退出登录事件
      window.dispatchEvent(new CustomEvent('keycloak-logout'));
      
      console.log('✅ 已退出登录');
      return;
    }

    const currentActive = getActiveMenu();
    
    // 如果点击的是当前激活的菜单项,返回主界面
    if (currentActive === menu) {
      navigate('/');
      return;
    }

    // 根据菜单项导航到对应页面
    switch (menu) {
      case 'my-files':
        navigate('/personal-files');
        break;
      case 'create-team':
        navigate('/team-management/create');
        break;
      case 'my-teams':
        navigate('/team-management/my-teams');
        break;
      case 'recycle-bin':
        navigate('/recycle-bin');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className={`${styles.dashboardContainer} watermark-bg`}>
      <Sidebar activeMenu={getActiveMenu()} onMenuChange={handleMenuChange} />
      {/* 全局搜索框 */}
      <GlobalSearch />
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<WelcomeSection />} />
          <Route path="/personal-files" element={<PersonalFilesPage />} />
          <Route path="/team-management/create" element={<CreateTeamPage />} />
          <Route path="/team-management/my-teams" element={<CreatedTeamsListPage />} />
          <Route path="/team-management/joined-team/:teamId" element={<MyTeamsPage />} />
          <Route path="/team-management/created-team/:teamId" element={<CreatedTeamsPage />} />
          <Route path="/recycle-bin" element={<div className={styles.placeholder}>回收站页面（待开发）</div>} />
          <Route path="/notifications" element={<div className={styles.placeholder}>消息中心页面（待开发）</div>} />
          <Route path="/settings" element={<div className={styles.placeholder}>设置页面（待开发）</div>} />
        </Routes>

        {/* 底部装饰区块 */}
        <div className={styles.bottomDecoration}></div>
      </main>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  return (
    <Router>
      <DashboardContent />
    </Router>
  );
};
