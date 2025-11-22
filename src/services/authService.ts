/**
 * 认证服务层 - 统一的认证接口
 * 
 * 使用方式:
 * - Mock模式: 用于开发测试
 * - 真实API模式: 对接Keycloak后端(预留)
 * 
 * 环境变量配置:
 * - VITE_USE_MOCK_AUTH: true使用Mock, false使用真实API
 */

import type {
  LoginRequest,
  LoginResponse,
  TokenResponse,
  User,
  AuthState,
  KeycloakConfig
} from './types';

// 认证服务接口 - 后端对接需要实现这些方法
export interface IAuthService {
  // 用户登录
  login(request: LoginRequest): Promise<LoginResponse>;
  
  // 用户登出
  logout(): Promise<void>;
  
  // 刷新Token
  refreshToken(refreshToken: string): Promise<TokenResponse>;
  
  // 获取当前用户信息
  getCurrentUser(): Promise<User | null>;
  
  // 验证Token是否有效
  validateToken(token: string): Promise<boolean>;
}

// ============================================
// Mock 认证服务实现 (用于开发测试)
// ============================================
class MockAuthService implements IAuthService {
  private mockUsers = [
    { 
      username: "admin", 
      password: "123456", 
      email: "admin@guardians.com",
      roles: ["admin", "user"] as const,
      displayName: "管理员"
    },
    { 
      username: "alice", 
      password: "alice", 
      email: "alice@guardians.com",
      roles: ["user"] as const,
      displayName: "Alice"
    },
    { 
      username: "jdoe", 
      password: "jdoe", 
      email: "jdoe@guardians.com",
      roles: ["user", "user_premium"] as const,
      displayName: "John Doe"
    }
  ];

  async login(request: LoginRequest): Promise<LoginResponse> {
    // 模拟网络延迟
    await this.delay(500);

    const user = this.mockUsers.find(
      u => u.username === request.username && u.password === request.password
    );

    if (!user) {
      return {
        success: false,
        error: "用户名或密码错误"
      };
    }

    // 生成Mock Token
    const tokens: TokenResponse = {
      accessToken: this.generateMockToken(user.username),
      refreshToken: this.generateMockToken(user.username, 'refresh'),
      expiresIn: 3600,
      tokenType: "Bearer"
    };

    const userData: User = {
      username: user.username,
      email: user.email,
      roles: [...user.roles],
      displayName: user.displayName
    };

    // 保存到localStorage
    this.saveAuthData(userData, tokens);

    console.log(`✅ Mock登录成功: ${user.username}`, userData);

    return {
      success: true,
      user: userData,
      tokens,
      message: "登录成功"
    };
  }

  async logout(): Promise<void> {
    await this.delay(200);
    this.clearAuthData();
    console.log('✅ Mock登出成功');
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    await this.delay(300);
    
    // 简单验证refresh token
    if (!refreshToken || refreshToken === 'invalid') {
      throw new Error('Invalid refresh token');
    }

    return {
      accessToken: this.generateMockToken('refreshed-user'),
      refreshToken: this.generateMockToken('refreshed-user', 'refresh'),
      expiresIn: 3600,
      tokenType: "Bearer"
    };
  }

  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    await this.delay(100);
    return token.startsWith('mock_token_');
  }

  // 辅助方法
  private generateMockToken(username: string, type: 'access' | 'refresh' = 'access'): string {
    const timestamp = Date.now();
    return `mock_token_${type}_${username}_${timestamp}`;
  }

  private saveAuthData(user: User, tokens: TokenResponse): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authTokens', JSON.stringify(tokens));
    localStorage.setItem('loginTime', new Date().toISOString());
  }

  private clearAuthData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authTokens');
    localStorage.removeItem('loginTime');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================
// 真实 Keycloak 认证服务 (预留接口)
// ============================================
class KeycloakAuthService implements IAuthService {
  private config: KeycloakConfig;

  constructor(config: KeycloakConfig) {
    this.config = config;
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    /**
     * 🔧 TODO: 由对接后端的同事实现
     * 
     * 实现说明:
     * 1. 使用 Resource Owner Password Credentials Grant (直接授权)
     * 2. 请求 Keycloak Token Endpoint
     * 3. 处理响应并解析Token
     * 
     * 示例请求:
     * POST {keycloakUrl}/realms/{realm}/protocol/openid-connect/token
     * Content-Type: application/x-www-form-urlencoded
     * 
     * Body:
     * - grant_type=password
     * - client_id={clientId}
     * - username={username}
     * - password={password}
     */
    
    throw new Error('KeycloakAuthService.login() 需要实现 - 请对接Keycloak Token API');
  }

  async logout(): Promise<void> {
    /**
     * 🔧 TODO: 由对接后端的同事实现
     * 
     * 实现说明:
     * 1. 调用 Keycloak Logout Endpoint
     * 2. 清除本地Token
     * 
     * 示例请求:
     * POST {keycloakUrl}/realms/{realm}/protocol/openid-connect/logout
     * Content-Type: application/x-www-form-urlencoded
     * 
     * Body:
     * - client_id={clientId}
     * - refresh_token={refreshToken}
     */
    
    throw new Error('KeycloakAuthService.logout() 需要实现');
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    /**
     * 🔧 TODO: 由对接后端的同事实现
     * 
     * 实现说明:
     * 1. 使用refresh_token获取新的access_token
     * 
     * 示例请求:
     * POST {keycloakUrl}/realms/{realm}/protocol/openid-connect/token
     * 
     * Body:
     * - grant_type=refresh_token
     * - client_id={clientId}
     * - refresh_token={refreshToken}
     */
    
    throw new Error('KeycloakAuthService.refreshToken() 需要实现');
  }

  async getCurrentUser(): Promise<User | null> {
    /**
     * 🔧 TODO: 由对接后端的同事实现
     * 
     * 实现说明:
     * 1. 使用access_token调用 UserInfo Endpoint
     * 2. 解析JWT获取用户信息和角色
     * 
     * 示例请求:
     * GET {keycloakUrl}/realms/{realm}/protocol/openid-connect/userinfo
     * Authorization: Bearer {accessToken}
     */
    
    throw new Error('KeycloakAuthService.getCurrentUser() 需要实现');
  }

  async validateToken(token: string): Promise<boolean> {
    /**
     * 🔧 TODO: 由对接后端的同事实现
     * 
     * 实现说明:
     * 1. 调用 Token Introspection Endpoint
     * 2. 或本地验证JWT签名
     */
    
    throw new Error('KeycloakAuthService.validateToken() 需要实现');
  }
}

// ============================================
// 认证服务工厂 - 根据环境自动选择
// ============================================
class AuthServiceFactory {
  private static instance: IAuthService | null = null;

  static getService(): IAuthService {
    if (this.instance) {
      return this.instance;
    }

    // 从环境变量读取配置
    const useMock = import.meta.env.VITE_USE_MOCK_AUTH !== 'false'; // 默认使用Mock

    if (useMock) {
      console.log('🔧 使用 Mock 认证服务 (开发模式)');
      this.instance = new MockAuthService();
    } else {
      console.log('🔐 使用 Keycloak 认证服务 (生产模式)');
      
      const config: KeycloakConfig = {
        url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
        realm: import.meta.env.VITE_KEYCLOAK_REALM || 'guardians',
        clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'backend-service'
      };

      this.instance = new KeycloakAuthService(config);
    }

    return this.instance;
  }

  // 用于测试时重置服务实例
  static reset(): void {
    this.instance = null;
  }
}

// ============================================
// 导出默认认证服务
// ============================================
export const authService = AuthServiceFactory.getService();

// 导出类型和服务实例供其他模块使用
export { MockAuthService, KeycloakAuthService, AuthServiceFactory };
