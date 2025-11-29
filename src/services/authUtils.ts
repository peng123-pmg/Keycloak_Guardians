/**
 * 认证工具函数
 */

import type { TokenResponse, User } from './types';

/**
 * 检查用户是否已登录
 */
export function isAuthenticated(): boolean {
  const user = localStorage.getItem('currentUser');
  const tokens = localStorage.getItem('authTokens');
  return !!(user && tokens);
}

/**
 * 获取存储的Token
 */
export function getStoredTokens(): TokenResponse | null {
  const tokensStr = localStorage.getItem('authTokens');
  if (!tokensStr) return null;
  
  try {
    return JSON.parse(tokensStr);
  } catch {
    return null;
  }
}

/**
 * 获取存储的用户信息
 */
export function getStoredUser(): User | null {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * 检查Token是否即将过期
 */
export function isTokenExpiring(): boolean {
  const loginTimeStr = localStorage.getItem('loginTime');
  if (!loginTimeStr) return true;
  
  try {
    const loginTime = new Date(loginTimeStr);
    const now = new Date();
    const diffMinutes = (now.getTime() - loginTime.getTime()) / 1000 / 60;
    
    // 如果超过50分钟，认为即将过期（Token通常1小时有效）
    return diffMinutes > 50;
  } catch {
    return true;
  }
}

/**
 * 检查用户是否有指定角色
 */
export function hasRole(role: string): boolean {
  const user = getStoredUser();
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
}

/**
 * 检查用户是否是管理员
 */
export function isAdmin(): boolean {
  return hasRole('admin');
}

/**
 * 获取当前认证模式
 */
export function getAuthMode(): 'mock' | 'keycloak' {
  const useMock = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';
  return useMock ? 'mock' : 'keycloak';
}

/**
 * 格式化登录时间
 */
export function getLoginTimeFormatted(): string | null {
  const loginTimeStr = localStorage.getItem('loginTime');
  if (!loginTimeStr) return null;
  
  try {
    const loginTime = new Date(loginTimeStr);
    return loginTime.toLocaleString('zh-CN');
  } catch {
    return null;
  }
}

/**
 * 获取认证信息摘要 (用于调试)
 */
export function getAuthSummary() {
  const user = getStoredUser();
  const tokens = getStoredTokens();
  const loginTime = getLoginTimeFormatted();
  const authMode = getAuthMode();
  
  return {
    isAuthenticated: isAuthenticated(),
    authMode,
    user: user ? {
      username: user.username,
      email: user.email,
      roles: user.roles
    } : null,
    hasToken: !!tokens?.accessToken,
    loginTime,
    isTokenExpiring: isTokenExpiring()
  };
}
