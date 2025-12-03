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
   * 上传文件
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<FileUploadResponse> {
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
      xhr.open('POST', `${import.meta.env.VITE_BACKEND_URL || ''}/api/files`);
      
      // 添加认证头
      const token = this.getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      // 设置文件名和内容类型
      xhr.setRequestHeader('X-File-Name', file.name);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      xhr.send(file);
    });
  }

  /**
   * 获取用户的文件列表
   */
  async getUserFiles(): Promise<FileListResponse> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/files`, {
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

    return await response.json();
  }

  /**
   * 下载文件
   */
  async downloadFile(fileId: number): Promise<Blob> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/files/${fileId}`, {
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

    return await response.blob();
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: number): Promise<void> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/files/${fileId}`, {
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
}

export const fileService = new FileService();