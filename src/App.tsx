import React from 'react';
import { Dashboard } from './pages/Dashboard/Dashboard';
import './styles/variables.css';
import './styles/global.css';

// 这个App仅用于预览主界面UI设计
// 实际登录功能使用原有的Keycloak主题（src/login/pages/Login.tsx）
function App() {
  return <Dashboard />;
}

export default App;
