/**
 * 认证服务层 - 统一的认证接口
 * 
 * 使用方式:
 * - Mock模式: 用于开发测试
 * - 真实API模式: 对接Keycloak后端
 * 
 * 环境变量配置:
 * - VITE_USE_MOCK_AUTH: true使用Mock, false使用真实API
 */

import axios from 'axios';
import apiClient from './apiClient';
import type {
  LoginRequest,
  LoginResponse,
  TokenResponse,
  User,
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
// 真实 Keycloak 认证服务实现
// ============================================
class KeycloakAuthService implements IAuthService {
  private config: KeycloakConfig;

  constructor(config: KeycloakConfig) {
    this.config = config;
  }

  /**
   * 用户登录 - 使用Keycloak密码模式获取Token
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('🔐 开始Keycloak登录流程...');

      // 步骤1: 向Keycloak请求Token
      const tokenResponse = await this.getTokenFromKeycloak(
        request.username,
        request.password
      );

      console.log('✅ Token获取成功');

      // 步骤2: 使用Token获取用户信息
      const user = await this.fetchUserInfo(tokenResponse.accessToken);

      console.log('✅ 用户信息获取成功:', user);

      // 步骤3: 保存到本地存储
      this.saveAuthData(user, tokenResponse);

      return {
        success: true,
        user,
        tokens: tokenResponse,
        message: '登录成功'
      };
    } catch (error: any) {
      console.error('❌ Keycloak登录失败:', error);

      // 解析错误信息
      let errorMessage = '登录失败，请稍后重试';
      
      if (error.response?.status === 401) {
        errorMessage = '用户名或密码错误';
      } else if (error.response?.data?.error_description) {
        errorMessage = error.response.data.error_description;
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = '无法连接到认证服务器，请检查网络或后端服务';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 用户登出 - 调用Keycloak登出端点并清除本地数据
   */
  async logout(): Promise<void> {
    try {
      const tokens = this.getStoredTokens();
      
      if (tokens?.refreshToken) {
        console.log('🔐 调用Keycloak登出端点...');
        
        // 调用Keycloak登出API
        await axios.post(
          `${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/logout`,
          new URLSearchParams({
            client_id: this.config.clientId,
            refresh_token: tokens.refreshToken
          }),
          {
            headers: { 
              'Content-Type': 'application/x-www-form-urlencoded' 
            }
          }
        );

        console.log('✅ Keycloak登出成功');
      }
    } catch (error) {
      console.warn('⚠️ Keycloak登出请求失败，但仍清除本地数据:', error);
    } finally {
      // 无论是否成功，都清除本地认证数据
      this.clearAuthData();
      console.log('✅ 本地认证数据已清除');
    }
  }

  /**
   * 刷新Token - 使用refresh_token获取新的access_token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      console.log('🔄 刷新Token...');

      const response = await axios.post(
        `${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          refresh_token: refreshToken
        }),
        {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded' 
          }
        }
      );

      const tokenResponse: TokenResponse = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        tokenType: 'Bearer'
      };

      // 更新本地存储的Token
      localStorage.setItem('authTokens', JSON.stringify(tokenResponse));

      console.log('✅ Token刷新成功');
      return tokenResponse;
    } catch (error) {
      console.error('❌ Token刷新失败:', error);
      
      // Token刷新失败，清除认证信息
      this.clearAuthData();
      
      throw new Error('Token刷新失败，请重新登录');
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // 优先从localStorage读取缓存的用户信息
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        // 验证缓存的用户信息是否仍然有效
        const isValid = await this.validateStoredUser();
        if (isValid) {
          return user;
        }
      }

      // 缓存无效或不存在，从后端API获取
      console.log('📡 从后端获取用户信息...');
      const response = await apiClient.get('/api/users/me');
      const userData = response.data;

      const user: User = {
        username: userData.username,
        email: userData.email,
        roles: userData.roles || [],
        displayName: userData.username
      };

      // 缓存用户信息
      localStorage.setItem('currentUser', JSON.stringify(user));

      console.log('✅ 用户信息获取成功:', user);
      return user;
    } catch (error: any) {
      console.error('❌ 获取用户信息失败:', error);
      
      // 如果是401错误，清除本地数据
      if (error.code === 'UNAUTHORIZED') {
        this.clearAuthData();
      }
      
      return null;
    }
  }

  /**
   * 验证Token是否有效
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // 通过调用需要认证的API来验证Token
      await apiClient.get('/api/users/me', {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      return true;
    } catch (error) {
      console.warn('⚠️ Token验证失败:', error);
      return false;
    }
  }

  // ========== 私有辅助方法 ==========

  /**
   * 从Keycloak获取Token (Resource Owner Password Credentials Grant)
   */
  private async getTokenFromKeycloak(
    username: string,
    password: string
  ): Promise<TokenResponse> {
    const response = await axios.post(
      `${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: this.config.clientId,
        username: username,
        password: password
      }),
      {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        timeout: 10000
      }
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      tokenType: 'Bearer'
    };
  }

  /**
   * 获取用户信息 - 调用后端API
   */
  private async fetchUserInfo(accessToken: string): Promise<User> {
    const response = await apiClient.get('/api/users/me', {
      headers: { 
        Authorization: `Bearer ${accessToken}` 
      }
    });

    const userData = response.data;

    return {
      username: userData.username,
      email: userData.email || '',
      roles: userData.roles || [],
      displayName: userData.username
    };
  }

  /**
   * 保存认证数据到localStorage
   */
  private saveAuthData(user: User, tokens: TokenResponse): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authTokens', JSON.stringify(tokens));
    localStorage.setItem('loginTime', new Date().toISOString());
  }

  /**
   * 清除认证数据
   */
  private clearAuthData(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authTokens');
    localStorage.removeItem('loginTime');
  }

  /**
   * 获取存储的Token
   */
  private getStoredTokens(): TokenResponse | null {
    const tokensStr = localStorage.getItem('authTokens');
    if (!tokensStr) return null;
    
    try {
      return JSON.parse(tokensStr);
    } catch {
      return null;
    }
  }

  /**
   * 验证存储的用户信息是否仍然有效
   */
  private async validateStoredUser(): Promise<boolean> {
    const tokens = this.getStoredTokens();
    if (!tokens?.accessToken) {
      return false;
    }

    // 检查Token是否过期 (简单检查登录时间)
    const loginTimeStr = localStorage.getItem('loginTime');
    if (loginTimeStr) {
      const loginTime = new Date(loginTimeStr);
      const now = new Date();
      const diffMinutes = (now.getTime() - loginTime.getTime()) / 1000 / 60;
      
      // 如果超过50分钟（Token通常1小时过期），重新验证
      if (diffMinutes > 50) {
        return await this.validateToken(tokens.accessToken);
      }
    }

    return true;
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
