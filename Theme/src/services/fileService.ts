import { userService } from './userService';

interface GroupSharedFile {
  id: number;
  fileId: number;
  groupId: number;
  fileName: string;
  originalName?: string;
  mimeType: string;
  sizeBytes: number;
  ownerId: string;
  sharedBy: string;
  permission: string;
  sharedAt: string;
}

/**
 * 文件服务层
 * 提供文件上传、下载、删除等功能
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

const getToken = () => sessionStorage.getItem("kc_token") || localStorage.getItem("kc_token");

export interface BackendFile {
  id: number;
  fileName: string;
  originalName?: string;
  mimeType: string;
  sizeBytes: number;
  ownerId: string;
  createdAt: string;
}

export interface FileInfo {
  id: string;
  name: string;
  type: 'file' | 'link' | 'audio' | 'image' | 'video' | 'document';
  size: number;
  uploadTime: string;
  uploader?: string;
  groupId?: number;
  permission?: string;
}

interface FileListResponse {
  files: BackendFile[];
  total: number;
  totalSize: number;
}

interface FileUploadResponse {
  file: BackendFile;
}

interface GroupFilesResponse {
  files: GroupSharedFile[];
  total: number;
}

interface ShareFilePayload {
  fileId: number;
  permission?: string;
}

class FileService {
  private async authorizedFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const token = getToken();
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  }

  /**
   * 上传文件
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void, groupId?: number): Promise<FileInfo> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText) as FileUploadResponse;
            const mapped = this.mapBackendFile(response.file);
            if (groupId) {
              await this.shareFileWithGroup(mapped.id, groupId);
            }
            resolve(mapped);
          } catch (e) {
            reject(new Error('服务器响应解析失败'));
          }
        } else {
          reject(new Error(`上传失败: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('网络错误')));

      xhr.open('POST', `${API_BASE_URL}/api/files`);
      const token = getToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      const safeName = encodeURIComponent(file.name || 'uploaded-file');
      xhr.setRequestHeader('X-File-Name', safeName);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.send(file);
    });
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(files: File[], onProgress?: (fileId: string, progress: number) => void, groupId?: number): Promise<FileInfo[]> {
    const results: FileInfo[] = [];
    for (const file of files) {
      const info = await this.uploadFile(file, (progress) => onProgress?.(file.name, progress), groupId);
      results.push(info);
    }
    return results;
  }

  /**
   * 分享文件给团队
   */
  async shareFileWithGroup(fileId: string | number, groupId: number, permission: string = 'READ'): Promise<void> {
    const payload: ShareFilePayload = {
      fileId: Number(fileId),
      permission,
    };
    const response = await this.authorizedFetch(`/api/groups/${groupId}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: '共享文件失败' }));
      throw new Error(err.error || '共享文件失败');
    }
  }

  async shareExistingFileToGroup(fileId: number, groupId: number, permission: string = 'READ'): Promise<void> {
    return this.shareFileWithGroup(fileId, groupId, permission);
  }

  async uploadAndShareToGroup(files: File[], groupId: number, onProgress?: (fileName: string, progress: number) => void): Promise<FileInfo[]> {
    const uploaded = await this.uploadFiles(files, (fileName, progress) => onProgress?.(fileName, progress));
    for (const info of uploaded) {
      await this.shareFileWithGroup(info.id, groupId);
    }
    return uploaded;
  }

  /**
   * 下载文件
   */
  async downloadFile(fileId: number, fileName: string): Promise<void> {
    const blob = await userService.downloadFile(fileId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: number): Promise<void> {
    await userService.deleteFile(fileId);
  }

  /**
   * 下载团队共享文件（复用通用下载接口）
   */
  async downloadSharedGroupFile(fileId: number, fileName: string): Promise<void> {
    return this.downloadFile(fileId, fileName);
  }

  /**
   * 删除团队共享文件（撤销共享）
   */
  async deleteSharedGroupFile(fileId: number): Promise<void> {
    const resp = await this.authorizedFetch(`/api/groups/files/${fileId}`, { method: 'DELETE' });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: '删除失败' }));
      throw new Error(err.error || '删除失败');
    }
  }

  /**
   * 获取用户的文件列表
   */
  async getUserFiles(): Promise<FileInfo[]> {
    const response = await this.authorizedFetch('/api/files');
    if (!response.ok) throw new Error('获取文件列表失败');

    const data: FileListResponse = await response.json();
    return data.files.map((file) => this.mapBackendFile(file));
  }

  /**
   * 获取团队文件
   */
  async getSharedGroupFiles(): Promise<FileInfo[]> {
    const response = await this.authorizedFetch('/api/groups/files');
    if (!response.ok) throw new Error('获取团队文件失败');

    const data: GroupFilesResponse = await response.json();
    return data.files.map((file) => ({
      id: String(file.fileId ?? file.id),
      name: file.originalName || file.fileName,
      type: 'file',
      size: Number(file.sizeBytes ?? 0),
      uploadTime: file.sharedAt,
      uploader: file.sharedBy,
      groupId: file.groupId,
      permission: file.permission,
    }));
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

  private mapBackendFile(file: BackendFile): FileInfo {
    return {
      id: String(file.id),
      name: file.originalName || file.fileName,
      type: 'file',
      size: Number(file.sizeBytes ?? 0),
      uploadTime: file.createdAt || new Date().toISOString(),
    };
  }
}

export const fileService = new FileService();