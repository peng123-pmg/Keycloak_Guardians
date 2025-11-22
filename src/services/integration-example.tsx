/**
 * 集成示例 - 如何在Login组件中使用认证服务
 * 
 * 这个文件展示了如何将 authService 集成到现有的Login.tsx中
 * 可以参考这个示例修改你的登录页面
 */

import { useState } from "react";
import { authService } from "./authService";
import type { LoginRequest } from "./types";

// ============================================
// 示例1: 简单的登录处理
// ============================================
export const SimpleLoginExample = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    // 构造登录请求
    const request: LoginRequest = {
      username,
      password,
      rememberMe: true
    };

    try {
      // 调用认证服务
      const response = await authService.login(request);

      if (response.success) {
        console.log("✅ 登录成功", response.user);
        // 跳转到Dashboard或触发登录成功事件
        window.dispatchEvent(new CustomEvent('keycloak-login'));
      } else {
        setError(response.error || "登录失败");
      }
    } catch (err) {
      setError("网络错误,请稍后重试");
      console.error("登录异常:", err);
    }
  };

  return (
    <div>
      <input 
        value={username} 
        onChange={e => setUsername(e.target.value)} 
        placeholder="用户名"
      />
      <input 
        type="password"
        value={password} 
        onChange={e => setPassword(e.target.value)}
        placeholder="密码" 
      />
      {error && <div className="error">{error}</div>}
      <button onClick={handleLogin}>登录</button>
    </div>
  );
};

// ============================================
// 示例2: 完整的登录流程 (包含验证、加载状态)
// ============================================
export const FullLoginExample = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.username.trim()) {
      newErrors.username = "请输入用户名";
    } else if (formData.username.length < 3) {
      newErrors.username = "用户名至少3个字符";
    }

    if (!formData.password.trim()) {
      newErrors.password = "请输入密码";
    } else if (formData.password.length < 6) {
      newErrors.password = "密码至少6个字符";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 登录处理
  const handleLogin = async () => {
    // 1. 清除之前的错误
    setErrors({});

    // 2. 表单验证
    if (!validateForm()) {
      return;
    }

    // 3. 开始登录
    setIsLoading(true);

    try {
      const request: LoginRequest = {
        username: formData.username,
        password: formData.password,
        rememberMe: true
      };

      const response = await authService.login(request);

      if (response.success) {
        console.log("✅ 登录成功");
        console.log("用户信息:", response.user);
        console.log("Token信息:", response.tokens);
        
        // 触发登录成功事件
        window.dispatchEvent(new CustomEvent('keycloak-login'));
      } else {
        // 登录失败
        setErrors({
          password: response.error || "登录失败,请检查用户名和密码"
        });
      }
    } catch (err) {
      console.error("登录异常:", err);
      setErrors({
        password: "网络错误,请稍后重试"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form">
      <input
        value={formData.username}
        onChange={e => setFormData({ ...formData, username: e.target.value })}
        placeholder="用户名"
        disabled={isLoading}
      />
      {errors.username && <span className="error">{errors.username}</span>}

      <input
        type="password"
        value={formData.password}
        onChange={e => setFormData({ ...formData, password: e.target.value })}
        placeholder="密码"
        disabled={isLoading}
      />
      {errors.password && <span className="error">{errors.password}</span>}

      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "登录中..." : "登录"}
      </button>
    </div>
  );
};

// ============================================
// 示例3: 在现有Login.tsx中集成
// ============================================
export const IntegrationGuide = `
// 在你的 Login.tsx 中,只需要修改 handleLoginClick 函数:

// 原来的代码:
const handleLoginClick = () => {
    // ... 验证逻辑 ...
    const isAuthenticated = authenticateUser(username, password);
    if (isAuthenticated) {
        window.dispatchEvent(new CustomEvent('keycloak-login'));
    }
};

// 改为:
import { authService } from '../services/authService';
import type { LoginRequest } from '../services/types';

const handleLoginClick = async () => {
    // 1. 表单验证
    if (!validateForm()) {
        return;
    }

    // 2. 禁用按钮
    setIsLoginButtonDisabled(true);

    try {
        // 3. 调用认证服务
        const request: LoginRequest = {
            username,
            password,
            rememberMe: isRememberMe
        };

        const response = await authService.login(request);

        if (response.success) {
            console.log('✅ 登录成功', response.user);
            
            // 4. 触发登录事件
            window.dispatchEvent(new CustomEvent('keycloak-login'));
            
            // 5. 调用回调
            if (onLoginSuccess) {
                onLoginSuccess();
            }
        } else {
            // 登录失败
            setErrors({
                password: response.error || "用户名或密码错误"
            });
            setIsLoginButtonDisabled(false);
        }
    } catch (err) {
        console.error('登录异常:', err);
        setErrors({
            password: "网络错误,请稍后重试"
        });
        setIsLoginButtonDisabled(false);
    }
};

// 就是这么简单! 原有的UI和验证逻辑都不需要改动,
// 只是把 authenticateUser 替换成 authService.login 即可
`;

// ============================================
// 示例4: 获取和显示当前用户
// ============================================
export const UserProfileExample = () => {
  const [user, setUser] = useState<any>(null);

  const loadCurrentUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    // 跳转到登录页
  };

  return (
    <div>
      {user ? (
        <div>
          <h2>欢迎, {user.displayName || user.username}</h2>
          <p>用户名: {user.username}</p>
          <p>邮箱: {user.email}</p>
          <p>角色: {user.roles.join(", ")}</p>
          <button onClick={handleLogout}>退出登录</button>
        </div>
      ) : (
        <button onClick={loadCurrentUser}>加载用户信息</button>
      )}
    </div>
  );
};

// ============================================
// 示例5: Token自动刷新
// ============================================
export const TokenRefreshExample = () => {
  // 在App初始化时设置Token自动刷新
  const setupTokenRefresh = () => {
    // 每50分钟刷新一次Token (Token有效期通常是60分钟)
    const refreshInterval = setInterval(async () => {
      try {
        const tokensStr = localStorage.getItem('authTokens');
        if (!tokensStr) return;

        const tokens = JSON.parse(tokensStr);
        const newTokens = await authService.refreshToken(tokens.refreshToken);
        
        // 更新localStorage
        localStorage.setItem('authTokens', JSON.stringify(newTokens));
        console.log('✅ Token已自动刷新');
      } catch (err) {
        console.error('Token刷新失败:', err);
        // 清除登录状态,跳转到登录页
        await authService.logout();
      }
    }, 50 * 60 * 1000); // 50分钟

    // 清理函数
    return () => clearInterval(refreshInterval);
  };

  return null;
};
`;
