import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import Keycloak from 'keycloak-js';
import { fetchCurrentUser } from './utils/api';

// 初始化 Keycloak 实例
const keycloak = new Keycloak({
  url: 'http://localhost:8080', // Keycloak 服务器地址
  realm: 'guardians', // Realm 名称
  clientId: 'myclient' // 客户端 ID
});

// 检查是否已登录，并获取用户信息
const initializeApp = async () => {
  try {
    const authenticated = await keycloak.init({ onLoad: 'check-sso' });
    
    if (authenticated && keycloak.token) {
      console.log('用户已登录，正在获取用户信息...');
      
      // 将访问令牌保存到 sessionStorage
      sessionStorage.setItem('accessToken', keycloak.token);
      
      // 调用后端API获取用户信息
      const userInfo = await fetchCurrentUser(keycloak.token);
      if (userInfo) {
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
      }
    } else {
      console.log('用户未登录');
    }
  } catch (error) {
    console.error('初始化 Keycloak 时出错:', error);
  }
};

// 在应用启动时初始化
initializeApp().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ReactKeycloakProvider authClient={keycloak}>
        <App />
      </ReactKeycloakProvider>
    </React.StrictMode>,
  );
});