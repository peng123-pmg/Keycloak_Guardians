/**
 * 用户服务层
 * 提供用户信息获取、管理等功能
 */

export interface UserInfo {
  username: string;
  email: string;
  roles: string[];
  userId: string;
  welcome: string;
}

export interface UserStats {
  summary: {
    totalOwners: number;
    activeOwners: number;
    totalFiles: number;
    storageUsedBytes: number;
    storageUsedReadable: string;
    averageFileSizeBytes: number;
  };
  filesByStatus: Record<string, number>;
  topUsersByStorage: Array<{
    ownerId: string;
    fileCount: number;
    storageBytes: number;
  }>;
  generatedAt: string;
}

export interface UserStatsResponse {
  message: string;
  data: UserStats;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  roles: string[];
}

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

export interface UserListResponse {
  total: number;
  users: Array<{
    id: string;
    username: string;
    email: string;
    enabled: boolean;
    roles: string[];
  }>;
}

class UserService {
  /**
   * 获取认证令牌
   */
  private getAuthToken(): string | null {
    // 根据实际认证方式获取令牌
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        return user.token || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<UserInfo> {
    const token = this.getAuthToken();
    
    const response = await fetch('/api/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      let errorMessage = '获取用户信息失败';
      try {
        const errorResponse = await response.json();
        errorMessage = errorResponse.error || errorMessage;
      } catch (e) {
        // 解析错误信息失败
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  /**
   * 获取用户统计数据（需要管理员权限）
   */
  async getUserStats(): Promise<UserStatsResponse> {
    const token = this.getAuthToken();
    
    const response = await fetch('/api/user/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      let errorMessage = '获取用户统计数据失败';
      try {
        const errorResponse = await response.json();
        errorMessage = errorResponse.error || errorMessage;
      } catch (e) {
        // 解析错误信息失败
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  /**
   * 创建用户（需要管理员权限）
   */
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    const token = this.getAuthToken();
    
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      let errorMessage = '创建用户失败';
      try {
        const errorResponse = await response.json();
        errorMessage = errorResponse.error || errorMessage;
      } catch (e) {
        // 解析错误信息失败
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  /**
   * 获取用户列表（需要管理员权限）
   */
  async getUsers(): Promise<UserListResponse> {
    const token = this.getAuthToken();
    
    const response = await fetch('/api/admin/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      let errorMessage = '获取用户列表失败';
      try {
        const errorResponse = await response.json();
        errorMessage = errorResponse.error || errorMessage;
      } catch (e) {
        // 解析错误信息失败
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }
}

export const userService = new UserService();