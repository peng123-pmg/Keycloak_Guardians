/**
 * API客户端配置
 * 统一处理API请求和响应
 */

class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * 获取认证令牌
   */
  private getAuthToken(): string | null {
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
   * 通用GET请求
   */
  async get<T>(url: string): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(this.baseUrl + url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      let errorMessage = '请求失败';
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
   * 通用POST请求
   */
  async post<T>(url: string, data?: any, additionalHeaders: Record<string, string> = {}): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(this.baseUrl + url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      let errorMessage = '请求失败';
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
   * 通用DELETE请求
   */
  async delete(url: string): Promise<void> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(this.baseUrl + url, {
      method: 'DELETE',
      headers
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
   * 文件上传专用POST请求
   */
  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const token = this.getAuthToken();
      
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
      xhr.open('POST', this.baseUrl + url);
      
      // 添加认证头
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
   * 文件下载专用GET请求
   */
  async downloadFile(url: string): Promise<Blob> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(this.baseUrl + url, {
      method: 'GET',
      headers
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
}

export const apiClient = new ApiClient();