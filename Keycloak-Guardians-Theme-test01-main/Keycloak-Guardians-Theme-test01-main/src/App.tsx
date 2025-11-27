import React, { useEffect } from 'react';
import { Dashboard } from './pages/Dashboard/Dashboard';
import './styles/variables.css';
import './styles/global.css';
import { apiService } from './services/api';

// 这个App仅用于预览主界面UI设计
// 实际登录功能使用原有的Keycloak主题（src/login/pages/Login.tsx）
function App() {
  useEffect(() => {
    // 在实际应用中，这里应该从Keycloak或其他认证系统获取token
    // 作为演示，我们使用一个模拟的token
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    apiService.setToken(mockToken);
  }, []);

  return <Dashboard />;
}

export default App;