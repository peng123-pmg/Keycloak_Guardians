/**
 * 用户服务 - 封装用户相关的API调用
 */

import apiClient from './apiClient';

/**
 * 用户统计数据接口
 */
export interface UserStats {
  message: string;
  data: {
    summary: {
      总用户数: number;
      活跃用户: number;
      今日新增: number;
    };
    roleDistribution: Array<{
      角色: string;
      用户数: number;
    }>;
    registrationHistory: Array<{
      日期: string;
      注册人数: number;
    }>;
  };
  metadata?: {
    生成者: string;
    生成时间: string;
    timestamp: number;
  };
}

/**
 * 创建用户请求参数
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  roles: string[];
}

/**
 * 创建用户响应
 */
export interface CreateUserResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    enabled: boolean;
    roles: string[];
  };
}

class UserService {
  /**
   * 获取当前用户信息
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/api/users/me');
      return response.data;
    } catch (error) {
      console.error('获取当前用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户统计数据 (需要admin角色)
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await apiClient.get('/api/user/stats');
      return response.data;
    } catch (error) {
      console.error('获取用户统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 创建新用户 (需要admin角色)
   */
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const response = await apiClient.post('/api/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }

  /**
   * 健康检查 - 测试后端连接
   */
  async healthCheck(): Promise<{ status: string; timestamp: number }> {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('健康检查失败:', error);
      throw error;
    }
  }
}

// 导出单例
export const userService = new UserService();
export default userService;
