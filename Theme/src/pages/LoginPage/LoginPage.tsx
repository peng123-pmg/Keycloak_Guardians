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

// export const LoginPage: React.FC = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [rememberMe, setRememberMe] = useState(false);
//   const [errors, setErrors] = useState({ username: '', password: '' });

//   const validateForm = () => {
//     const newErrors = { username: '', password: '' };
//     let isValid = true;

//     if (!username.trim()) {
//       newErrors.username = '请输入用户名';
//       isValid = false;
//     }

//     if (!password) {
//       newErrors.password = '请输入密码';
//       isValid = false;
//     } else if (password.length < 6) {
//       newErrors.password = '密码至少6位';
//       isValid = false;
//     }

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleLogin = async () => {
//     if (validateForm()) {
//       try {
//         // 调用Keycloak API进行登录
//         const response = await fetch('/auth/realms/myrealm/protocol/openid-connect/token', {
//           method: 'POST',
//           headers: { 
//             'Content-Type': 'application/x-www-form-urlencoded'
//           },
//           body: new URLSearchParams({
//             grant_type: 'password',
//             client_id: 'my-client',
//             username: username,
//             password: password
//           })
//         });
        
//         if (response.ok) {
//           const data = await response.json();
          
//           // 存储访问令牌
//           localStorage.setItem('access_token', data.access_token);
//           localStorage.setItem('refresh_token', data.refresh_token);
          
//           // 设置登录状态
//           sessionStorage.setItem('isLoggedIn', 'true');
          
//           // 触发登录事件
//           window.dispatchEvent(new CustomEvent('keycloak-login'));
          
//           // 跳转到主界面
//           window.location.hash = '#/dashboard';
//         } else {
//           setErrors({
//             username: '登录失败',
//             password: '用户名或密码错误'
//           });
//         }
//       } catch (error) {
//         console.error('登录错误:', error);
//         setErrors({
//           username: '登录异常',
//           password: '请稍后重试'
//         });
//       }
//     }
//   };
// ... existing code ...
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

  const handleLogin = async () => {
    if (validateForm()) {
      try {
        // 构建Keycloak认证URL
        const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL;
        const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM;
        const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
        
        const response = await fetch(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'password',
            client_id: KEYCLOAK_CLIENT_ID,
            username: username,
            password: password
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // 存储访问令牌
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          
          // 设置登录状态
          sessionStorage.setItem('isLoggedIn', 'true');
          
          // 触发登录事件
          window.dispatchEvent(new CustomEvent('keycloak-login'));
          
          // 跳转到主界面
          window.location.hash = '#/personal-files';
        } else {
          setErrors({
            username: '登录失败',
            password: '用户名或密码错误'
          });
        }
      } catch (error) {
        console.error('登录错误:', error);
        setErrors({
          username: '登录异常',
          password: '请稍后重试'
        });
      }
    }
  };

  // ... existing code ...
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