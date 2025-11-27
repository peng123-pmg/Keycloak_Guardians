// API服务模块，用于与后端进行数据交互

const API_BASE_URL = '/api';

interface UserInfo {
  username: string;
  email: string;
  roles: string[];
  userId: string;
  welcome: string;
}

interface UserStatsSummary {
  totalOwners: number;
  activeOwners: number;
  totalFiles: number;
  storageUsedBytes: number;
  storageUsedReadable: string;
  averageFileSizeBytes: number;
}

interface UserStorageEntry {
  ownerId: string;
  fileCount: number;
  storageBytes: number;
}

interface UserStats {
  summary: UserStatsSummary;
  filesByStatus: Record<string, number>;
  topUsersByStorage: UserStorageEntry[];
  generatedAt: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }
    
    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  // 获取当前用户信息
  async getCurrentUser(): Promise<UserInfo> {
    return this.request<UserInfo>('/users/me');
  }

  // 获取用户统计数据
  async getUserStats(): Promise<UserStats> {
    return this.request<UserStats>('/user/stats');
  }

  // 创建新用户（需要管理员权限）
  async createUser(userData: any): Promise<any> {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
}

export const apiService = new ApiService();