/**
 * 文件服务层
 * 提供文件上传、下载、删除等功能
 */

export interface FileInfo {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  ownerId: string;
  checksum: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileListResponse {
  files: FileInfo[];
  total: number;
  totalSize: number;
}

export interface FileUploadResponse {
  message: string;
  file: FileInfo;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

class FileService {
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
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * 格式化上传时间
   */
  formatUploadTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return '刚刚';
    } else if (diffMins < 60) {
      return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 30) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  }

  /**
   * 上传文件
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<FileInfo> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // 监听上传进度
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });

      // 处理响应
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.file);
          } catch (e) {
            reject(new Error('服务器响应解析失败'));
          }
        } else {
          let errorMessage = `上传失败: ${xhr.statusText}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error || errorMessage;
          } catch (e) {
            // 解析错误信息失败，使用默认消息
          }
          reject(new Error(errorMessage));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('网络错误'));
      });

      // 发送请求
      xhr.open('POST', '/api/files');
      
      // 添加认证头
      const token = this.getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      // 设置文件名和内容类型
      xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name));
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      xhr.send(file);
    });
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(
    files: File[],
    onProgress?: (fileName: string, progress: number) => void
  ): Promise<FileInfo[]> {
    const results: FileInfo[] = [];
    
    // 顺序上传文件以避免并发问题
    for (const file of files) {
      try {
        const fileInfo = await this.uploadFile(file, (progress) => {
          if (onProgress) {
            onProgress(file.name, progress);
          }
        });
        results.push(fileInfo);
      } catch (error) {
        console.error(`文件 ${file.name} 上传失败:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * 获取用户的文件列表
   */
  async getUserFiles(): Promise<FileInfo[]> {
    const token = this.getAuthToken();
    
    const response = await fetch('/api/files', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      let errorMessage = '获取文件列表失败';
      try {
        const errorResponse = await response.json();
        errorMessage = errorResponse.error || errorMessage;
      } catch (e) {
        // 解析错误信息失败
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.files;
  }

  /**
   * 下载文件
   */
  async downloadFile(fileId: number, fileName?: string): Promise<void> {
    const token = this.getAuthToken();
    
    const response = await fetch(`/api/files/${fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = '下载失败';
      try {
        const errorResponse = await response.json();
        errorMessage = errorResponse.error || errorMessage;
      } catch (e) {
        // 解析错误信息失败
      }
      throw new Error(errorMessage);
    }

    // 创建下载链接
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `file_${fileId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: number): Promise<void> {
    const token = this.getAuthToken();
    
    const response = await fetch(`/api/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = '删除失败';
      try {
        const errorResponse = await response.json();
        errorMessage = errorResponse.error || errorMessage;
      } catch (e) {
        // 解析错误信息失败
      }
      throw new Error(errorMessage);
    }
  }
  
  /**
   * 获取团队文件列表
   */
  async getTeamFiles(teamId: string): Promise<FileInfo[]> {
    // 在实际应用中应该查询特定团队的文件
    // 当前只是模拟返回用户的所有文件
    return await this.getUserFiles();
  }
}

export const fileService = new FileService();