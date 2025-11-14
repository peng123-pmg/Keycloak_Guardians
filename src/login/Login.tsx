import React, { useEffect, useState } from 'react';
import type { KcContext } from 'keycloakify';
import { fetchCurrentUser, UserMeResponse } from '../api/userApi';

// 组件接收Keycloakify的上下文作为参数（由Keycloak自动注入）
interface UserProfileProps {
  kcContext: KcContext;
}

const UserProfile: React.FC<UserProfileProps> = ({ kcContext }) => {
  const [userInfo, setUserInfo] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        // 调用接口（传入kcContext获取Token）
        const data = await fetchCurrentUser(kcContext);
        setUserInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取用户信息失败');
      } finally {
        setLoading(false);
      }
    };

    // 仅在认证成功后调用接口
    if (kcContext.authenticated) {
      loadUserInfo();
    } else {
      setError('用户未登录');
      setLoading(false);
    }
  }, [kcContext]);

  if (loading) return <div className="kc-loading">加载用户信息中...</div>;
  if (error) return <div className="kc-error">错误：{error}</div>;

  return (
    <div className="kc-user-profile">
      <h2 className="kc-title">当前用户信息</h2>
      <div className="kc-user-info">
        <pre>{JSON.stringify(userInfo, null, 2)}</pre>
      </div>
    </div>
  );
};

export default UserProfile;