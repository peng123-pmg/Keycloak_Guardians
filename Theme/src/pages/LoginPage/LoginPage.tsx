import React, { useState } from 'react';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Checkbox } from '../../components/Checkbox/Checkbox';
import styles from './LoginPage.module.css';

// 图标组件
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M12 7h-1V5a3 3 0 0 0-6 0v2H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM6 5a2 2 0 1 1 4 0v2H6V5z"/>
  </svg>
);

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '' });

  const validateForm = () => {
    const newErrors = { username: '', password: '' };
    let isValid = true;

    if (!username.trim()) {
      newErrors.username = '请输入用户名';
      isValid = false;
    }

    if (!password) {
      newErrors.password = '请输入密码';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = '密码至少6位';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = () => {
    if (validateForm()) {
      // Mock登录逻辑
      console.log('登录信息:', { username, password, rememberMe });
      
      // TODO: 调用后端API
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password })
      // });
      
      // 模拟登录成功，跳转到主界面
      console.log('✅ 登录验证通过，跳转到主界面...');
      
      // 使用 hash 路由跳转
      window.location.hash = '#/dashboard';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className={`${styles.loginContainer} watermark-bg`}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>MYSYSTEM</h1>
        <p className={styles.subtitle}>欢迎登录</p>

        <div className={styles.formGroup}>
          <Input
            type="text"
            placeholder="请输入用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            icon={<UserIcon />}
          />
          {errors.username && <span className={styles.error}>{errors.username}</span>}
        </div>

        <div className={styles.formGroup}>
          <Input
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            icon={<LockIcon />}
          />
          {errors.password && <span className={styles.error}>{errors.password}</span>}
        </div>

        <div className={styles.options}>
          <Checkbox
            label="记住我"
            checked={rememberMe}
            onChange={setRememberMe}
          />
          <a href="#" className={styles.forgotPassword}>忘记密码？</a>
        </div>

        <Button onClick={handleLogin}>
          登录
        </Button>

        <div className={styles.footer}>
          <span className={styles.footerText}>还没有账号？</span>
          <a href="#" className={styles.registerLink}>立即注册</a>
        </div>
      </div>
    </div>
  );
};
