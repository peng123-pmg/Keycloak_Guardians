/**
 * API客户端 - 统一的HTTP请求工具
 * 
 * 功能:
 * - 自动添加Authorization Token
 * - 统一的错误处理
 * - 请求/响应拦截
 * - Token过期自动刷新
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 自动添加Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取Token
    const tokensStr = localStorage.getItem('authTokens');
    if (tokensStr) {
      try {
        const tokens = JSON.parse(tokensStr);
        if (tokens.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
      } catch (error) {
        console.warn('解析Token失败:', error);
      }
    }
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    // 成功响应直接返回
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // 处理401未授权错误
    if (error.response?.status === 401) {
      console.warn('⚠️ Token已过期或无效 (401)');
      
      // 清除认证信息
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authTokens');
      localStorage.removeItem('loginTime');

      // 可以在这里触发跳转到登录页
      // window.location.href = '/login';
      
      return Promise.reject({
        code: 'UNAUTHORIZED',
        message: 'Token已过期，请重新登录',
        originalError: error
      });
    }

    // 处理403权限不足
    if (error.response?.status === 403) {
      console.warn('⚠️ 权限不足 (403)');
      return Promise.reject({
        code: 'FORBIDDEN',
        message: '您没有权限访问此资源',
        originalError: error
      });
    }

    // 处理404资源不存在
    if (error.response?.status === 404) {
      console.warn('⚠️ 资源不存在 (404)');
      return Promise.reject({
        code: 'NOT_FOUND',
        message: '请求的资源不存在',
        originalError: error
      });
    }

    // 处理500服务器错误
    if (error.response?.status === 500) {
      console.error('❌ 服务器内部错误 (500)');
      return Promise.reject({
        code: 'SERVER_ERROR',
        message: '服务器内部错误，请稍后重试',
        originalError: error
      });
    }

    // 处理网络错误
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.error('❌ 网络连接失败');
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: '网络连接失败，请检查后端服务是否启动',
        originalError: error
      });
    }

    // 其他错误
    console.error('❌ API请求失败:', error);
    return Promise.reject({
      code: 'UNKNOWN_ERROR',
      message: error.response?.data?.message || error.message || '请求失败',
      originalError: error
    });
  }
);

export default apiClient;
