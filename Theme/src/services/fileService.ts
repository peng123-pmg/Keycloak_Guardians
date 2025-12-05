/**
 * 文件服务层
 * 提供文件上传、下载、删除等功能
 */

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
    // 这里应根据实际认证方式获取令牌
    // 示例中使用localStorage存储令牌
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser).token : null;
  }

  /**
   * 上传文件
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<FileInfo> {
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
        } else {
          let errorMessage = `上传失败: ${xhr.statusText}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.message || errorMessage;
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
      xhr.open('POST', '/api/files/upload');
      
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
    onProgress?: (fileName: string, progress: number) => void
  ): Promise<FileInfo[]> {
    // 并行上传所有文件
    const uploadPromises = files.map(file => 
      this.uploadFile(file, progress => {
        if (onProgress) {
          onProgress(file.name, progress);
        }
      })
    );

    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('批量上传过程中发生错误:', error);
      throw error;
    }
  }

  /**
   * 下载文件
   */
  async downloadFile(fileId: string, fileName: string): Promise<void> {
    try {
      const token = this.getAuthToken();
      const response = await fetch(`/api/files/${fileId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = '下载失败';
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
        } catch (e) {
          // 解析错误信息失败
        }
        throw new Error(errorMessage);
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
        errorMessage = errorResponse.message || errorMessage;
      } catch (e) {
        // 解析错误信息失败
      }
      throw new Error(errorMessage);
    }
  }

  /**
   * 获取用户的文件列表
   */
  async getUserFiles(): Promise<FileInfo[]> {
    const token = this.getAuthToken();
    const response = await fetch('/api/user/files', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = '获取文件列表失败';
      try {
        const errorResponse = await response.json();
        errorMessage = errorResponse.message || errorMessage;
      } catch (e) {
        // 解析错误信息失败
      }
      throw new Error(errorMessage);
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