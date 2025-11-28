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

// 文件相关接口
interface File {
  id: string;
  name: string;
  size: number;
  type: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'deleted' | 'archived';
}

// 团队相关接口
interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  members: TeamMember[];
}

interface TeamMember {
  id: string;
  username: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
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

  // ========================
  // 文件管理 API
  // ========================

  // 获取文件列表
  async getFiles(filters?: { status?: string; owner?: string }): Promise<File[]> {
    let url = '/files';
    if (filters) {
      const params = new URLSearchParams(filters as Record<string, string>);
      url += `?${params.toString()}`;
    }
    return this.request<File[]>(url);
  }

  // 获取单个文件详情
  async getFile(fileId: string): Promise<File> {
    return this.request<File>(`/files/${fileId}`);
  }

  // 上传文件
  async uploadFile(file: File, metadata: Partial<File>): Promise<File> {
    const formData = new FormData();
    formData.append('file', file as any);
    formData.append('metadata', JSON.stringify(metadata));

    return this.request<File>('/files', {
      method: 'POST',
      body: formData as any,
      headers: {} // 清空 Content-Type，让浏览器自动设置 multipart/form-data
    });
  }

  // 更新文件信息
  async updateFile(fileId: string, updates: Partial<File>): Promise<File> {
    return this.request<File>(`/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // 删除文件
  async deleteFile(fileId: string): Promise<void> {
    await this.request(`/files/${fileId}`, {
      method: 'DELETE'
    });
  }

  // ========================
  // 团队管理 API
  // ========================

  // 获取团队列表
  async getTeams(): Promise<Team[]> {
    return this.request<Team[]>('/teams');
  }

  // 获取单个团队详情
  async getTeam(teamId: string): Promise<Team> {
    return this.request<Team>(`/teams/${teamId}`);
  }

  // 创建团队
  async createTeam(teamData: Pick<Team, 'name' | 'description'>): Promise<Team> {
    return this.request<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
  }

  // 更新团队信息
  async updateTeam(teamId: string, updates: Partial<Team>): Promise<Team> {
    return this.request<Team>(`/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // 删除团队
  async deleteTeam(teamId: string): Promise<void> {
    await this.request(`/teams/${teamId}`, {
      method: 'DELETE'
    });
  }

  // 邀请用户加入团队
  async inviteUserToTeam(teamId: string, username: string, role: string): Promise<TeamMember> {
    return this.request<TeamMember>(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ username, role })
    });
  }

  // 从团队移除用户
  async removeUserFromTeam(teamId: string, userId: string): Promise<void> {
    await this.request(`/teams/${teamId}/members/${userId}`, {
      method: 'DELETE'
    });
  }
}

export const apiService = new ApiService();