import React, { useState } from 'react';
import Login from './login/pages/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import './styles/variables.css';
import './styles/global.css';

// 简单的路由应用：登录页 -> 主界面
function SimpleApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  console.log('SimpleApp 渲染，isLoggedIn:', isLoggedIn);

  if (isLoggedIn) {
    return <Dashboard />;
  }

  // 创建模拟的 Keycloak Context
  const mockKcContext = {
    pageId: "login.ftl" as const,
    realm: {
      loginWithEmailAllowed: true,
      registrationEmailAsUsername: false,
      rememberMe: true,
      resetPasswordAllowed: true,
    },
    url: {
      loginAction: "#",
      loginResetCredentialsUrl: "#",
    },
    message: undefined,
    login: {
      username: "",
    },
    usernameHidden: false,
    messagesPerField: {
      existsError: () => false,
    },
    isAppInitiatedAction: false,
    auth: {
      selectedCredential: "",
    },
  };

  const mockI18n = {};

  const handleLoginSuccess = () => {
    console.log('handleLoginSuccess 被调用');
    setIsLoggedIn(true);
  };

  console.log('准备渲染 Login，传递 handleLoginSuccess');
  
  // 直接传递 setIsLoggedIn 函数
  return <Login kcContext={mockKcContext} i18n={mockI18n} onLoginSuccess={handleLoginSuccess} />;
}

export default SimpleApp;
