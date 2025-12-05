/**
 * 文件服务层
 * 提供文件上传、下载、删除等功能
 */

// 从环境变量获取API基础URL，如果没有则使用相对路径
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

export interface FileInfo {
  id: string;
  name: string;
  type: 'file' | 'link' | 'audio' | 'image' | 'video' | 'document';
  size: number; // 字节数
  uploadTime: string; // ISO 8601 格式
  uploader?: string;
  url?: string;
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
    // 使用Keycloak令牌
    return localStorage.getItem('access_token');
  }

  /**
   * 上传文件
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<FileInfo> {
    // 检查是否处于开发模式且没有配置后端API
    if (import.meta.env.DEV && !import.meta.env.VITE_BACKEND_URL && import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      // 在开发模式下模拟上传过程
      return new Promise((resolve) => {
        // 模拟上传进度
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (onProgress) onProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            // 模拟上传成功返回的文件信息
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              name: file.name,
              type: this.getFileType(file.name),
              size: file.size,
              uploadTime: new Date().toISOString()
            });
          }
        }, 200);
      });
    }

    // 创建FormData对象
    const formData = new FormData();
    formData.append('file', file);

    // 使用XMLHttpRequest以便监控进度
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
            resolve(response);
          } catch (e) {
            reject(new Error('服务器响应解析失败'));
          }
        } else if (xhr.status === 401) {
          reject(new Error('认证失败，请重新登录'));
        } else if (xhr.status === 404) {
          reject(new Error('服务器端点不存在，请检查后端服务'));
        } else {
          reject(new Error(`上传失败: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('网络错误'));
      });

      // 发送请求
      xhr.open('POST', `${API_BASE_URL}/api/files/upload`);
      
      // 添加认证头
      const token = this.getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(
    files: File[],
    onProgress?: (fileId: string, progress: number) => void
  ): Promise<FileInfo[]> {
    // 在实际应用中，我们可能想要并行上传文件，并提供每个文件的进度反馈
    
    const results: FileInfo[] = [];
    
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
   * 下载文件
   */
  async downloadFile(fileId: string, fileName: string): Promise<void> {
    // 检查是否处于开发模式且没有配置后端API
    if (import.meta.env.DEV && !import.meta.env.VITE_BACKEND_URL && import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      // 在开发模式下模拟下载过程
      console.log(`模拟下载文件: ${fileName} (${fileId})`);
      // 创建一个模拟的下载
      const blob = new Blob([`这是模拟的文件内容: ${fileName}`], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return;
    }
    
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('未认证，请重新登录');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('认证失败，请重新登录');
        } else if (response.status === 404) {
          throw new Error('文件不存在或服务器端点不存在');
        }
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载文件时出错:', error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string): Promise<void> {
    // 检查是否处于开发模式且没有配置后端API
    if (import.meta.env.DEV && !import.meta.env.VITE_BACKEND_URL && import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      // 在开发模式下模拟删除过程
      console.log(`模拟删除文件: ${fileId}`);
      return Promise.resolve();
    }
    
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('未认证，请重新登录');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('认证失败，请重新登录');
      } else if (response.status === 404) {
        throw new Error('文件不存在或服务器端点不存在');
      }
      throw new Error('删除失败');
    }
  }

  /**
   * 获取用户的文件列表
   */
  async getUserFiles(): Promise<FileInfo[]> {
    // 检查是否处于开发模式且没有配置后端API
    if (import.meta.env.DEV && !import.meta.env.VITE_BACKEND_URL && import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      // 在开发模式下返回模拟的文件列表
      return [
        {
          id: '1',
          name: '文档示例.pdf',
          type: 'document',
          size: 1024000,
          uploadTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 昨天
          uploader: '张三'
        },
        {
          id: '2',
          name: '图片示例.jpg',
          type: 'image',
          size: 2048000,
          uploadTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
          uploader: '李四'
        },
        {
          id: '3',
          name: '视频示例.mp4',
          type: 'video',
          size: 10240000,
          uploadTime: new Date().toISOString(), // 刚刚
          uploader: '王五'
        }
      ];
    }
    
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('未认证，请重新登录');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/files`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('认证失败，请重新登录');
      } else if (response.status === 404) {
        throw new Error('服务器端点不存在，请检查后端服务');
      }
      throw new Error('获取文件列表失败');
    }

    return await response.json();
  }

  /**
   * 根据文件名推断文件类型
   */
  private getFileType(fileName: string): FileInfo['type'] {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    const typeMap: Record<string, FileInfo['type']> = {
      // 文档
      'doc': 'document',
      'docx': 'document',
      'pdf': 'document',
      'txt': 'document',
      'md': 'document',
      
      // 图片
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'bmp': 'image',
      'svg': 'image',
      
      // 音频
      'mp3': 'audio',
      'wav': 'audio',
      'flac': 'audio',
      'aac': 'audio',
      
      // 视频
      'mp4': 'video',
      'avi': 'video',
      'mov': 'video',
      'wmv': 'video',
      
      // 链接
      'url': 'link',
      'lnk': 'link',
    };

    return typeMap[extension] || 'file';
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * 格式化上传时间
   */
  formatUploadTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;

    // 超过7天显示具体日期
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export const fileService = new FileService();