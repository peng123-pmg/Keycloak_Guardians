/**
 * 认证服务类型定义
 * 为后端对接预留的标准接口
 */

// 用户角色类型
export type UserRole = 'admin' | 'user' | 'user_premium' | string;

// 用户信息
export interface User {
  username: string;
  email?: string;
  roles: UserRole[];
  displayName?: string;
  avatar?: string;
}

// 登录请求参数
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// Token响应
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // 过期时间(秒)
  tokenType: string; // 如: "Bearer"
}

// 登录响应
export interface LoginResponse {
  success: boolean;
  user?: User;
  tokens?: TokenResponse;
  message?: string;
  error?: string;
}

// 认证状态
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: TokenResponse | null;
  loading: boolean;
  error: string | null;
}

// Keycloak配置
export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}
