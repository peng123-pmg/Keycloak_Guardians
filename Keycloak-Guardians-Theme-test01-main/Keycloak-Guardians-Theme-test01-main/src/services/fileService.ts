/**
 * 文件服务层
 * 提供文件上传、下载、删除等功能
 * 已连接真实后端API
 */

import apiClient from './apiClient';

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
   * 上传文件
   * API: POST /api/files
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<FileInfo> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/api/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.progress) {
            onProgress(Math.round(progressEvent.progress * 100));
          }
        }
      });

      const data = response.data.file;
      
      const fileInfo: FileInfo = {
        id: data.id.toString(),
        name: data.originalName,
        type: this.getFileType(data.originalName),
        size: data.sizeBytes,
        uploadTime: data.createdAt,
        uploader: data.ownerId,
      };

      return fileInfo;
    } catch (error: any) {
      console.error('文件上传失败:', error);
      throw new Error(error.response?.data?.message || '文件上传失败');
    }
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(
    files: File[],
    onProgress?: (fileId: string, progress: number) => void
  ): Promise<FileInfo[]> {
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
   * API: GET /api/files/{id}
   */
  async downloadFile(fileId: string, fileName: string): Promise<void> {
    try {
      const response = await apiClient.get(`/api/files/${fileId}`, {
        responseType: 'blob'
      });

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('文件下载失败:', error);
      throw new Error(error.response?.data?.message || '文件下载失败');
    }
  }

  /**
   * 删除文件
   * API: DELETE /api/files/{id}
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/files/${fileId}`);
    } catch (error: any) {
      console.error('文件删除失败:', error);
      throw new Error(error.response?.data?.message || '文件删除失败');
    }
  }

  /**
   * 获取文件列表
   * API: GET /api/files
   */
  async getUserFiles(): Promise<FileInfo[]> {
    try {
      const response = await apiClient.get('/api/files');
      const files = response.data.files || [];
      
      return files.map((file: any) => ({
        id: file.id.toString(),
        name: file.originalName,
        type: this.getFileType(file.originalName),
        size: file.sizeBytes,
        uploadTime: file.createdAt,
        uploader: file.ownerId,
      }));
    } catch (error: any) {
      console.error('获取文件列表失败:', error);
      throw new Error(error.response?.data?.message || '获取文件列表失败');
    }
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