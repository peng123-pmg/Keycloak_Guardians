/**
 * 文件服务层
 * 提供文件上传、下载、删除等功能
 * TODO: 后端 API 就绪后，替换为真实接口调用
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
   * 上传文件
   * TODO: 替换为真实 API - POST /api/files/upload
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<FileInfo> {
    // 模拟上传进度
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (onProgress) {
          onProgress(Math.min(progress, 100));
        }

        if (progress >= 100) {
          clearInterval(interval);
          
          // 模拟返回的文件信息
          const fileInfo: FileInfo = {
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: this.getFileType(file.name),
            size: file.size,
            uploadTime: new Date().toISOString(),
            uploader: '当前用户', // TODO: 从认证系统获取
            url: URL.createObjectURL(file), // 临时 URL，仅用于预览
          };

          resolve(fileInfo);
        }
      }, 100);

      // 模拟上传失败（10% 概率，用于测试错误处理）
      // if (Math.random() < 0.1) {
      //   clearInterval(interval);
      //   reject(new Error('上传失败：网络错误'));
      // }
    });

    /* 真实 API 调用示例：
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`, // TODO: 添加认证
      },
    });

    if (!response.ok) {
      throw new Error('上传失败');
    }

    return await response.json();
    */
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(
    files: File[],
    onProgress?: (fileId: string, progress: number) => void
  ): Promise<FileInfo[]> {
    const uploadPromises = files.map((file) => 
      this.uploadFile(file, (progress) => {
        if (onProgress) {
          onProgress(file.name, progress);
        }
      })
    );

    return Promise.all(uploadPromises);
  }

  /**
   * 下载文件
   * TODO: 替换为真实 API - GET /api/files/{fileId}/download
   */
  async downloadFile(fileId: string, fileName: string): Promise<void> {
    // 模拟下载延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // TODO: 真实实现应该从后端获取文件
    console.log(`下载文件: ${fileId} - ${fileName}`);
    
    // 临时方案：如果有 URL，直接下载
    // 注意：这只适用于浏览器内存中的临时文件
    // 真实场景需要从后端获取文件流

    /* 真实 API 调用示例：
    const response = await fetch(`/api/files/${fileId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('下载失败');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    */
  }

  /**
   * 删除文件
   * TODO: 替换为真实 API - DELETE /api/files/{fileId}
   */
  async deleteFile(fileId: string): Promise<void> {
    // 模拟删除延迟
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    console.log(`删除文件: ${fileId}`);

    /* 真实 API 调用示例：
    const response = await fetch(`/api/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('删除失败');
    }
    */
  }

  /**
   * 获取团队文件列表
   * TODO: 替换为真实 API - GET /api/teams/{teamId}/files
   */
  async getTeamFiles(teamId: string): Promise<FileInfo[]> {
    // 模拟 API 延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 返回模拟数据
    return [
      {
        id: '1',
        name: '团队的文件.cpp',
        type: 'file',
        size: 2048,
        uploadTime: '2025-11-20T10:30:00Z',
        uploader: '张三',
      },
      {
        id: '2',
        name: '团队文件.cpp',
        type: 'link',
        size: 1024,
        uploadTime: '2025-11-21T14:20:00Z',
        uploader: '李四',
      },
      {
        id: '3',
        name: '我的音乐.mp3',
        type: 'audio',
        size: 5242880,
        uploadTime: '2025-11-22T09:15:00Z',
        uploader: '王五',
      },
      {
        id: '4',
        name: '团队文件.png',
        type: 'image',
        size: 102400,
        uploadTime: '2025-11-23T11:45:00Z',
        uploader: '赵六',
      },
    ];

    /* 真实 API 调用示例：
    const response = await fetch(`/api/teams/${teamId}/files`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('获取文件列表失败');
    }

    return await response.json();
    */
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
