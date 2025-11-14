import axios from 'axios';
import type { KcContext } from 'keycloakify';

// 创建后端API客户端
const apiClient = axios.create({
  baseURL: 'http://localhost:8081', // 后端服务地址
  headers: {
    'Content-Type': 'application/json'
  }
});

// 定义接口返回数据类型（与后端响应匹配）
export interface UserMeResponse {
  username: string | null;
  email: string | null;
  roles: string[];
  userId: string;
  welcome: string;
}

/**
 * 调用 /api/users/me 接口
 * @param kcContext Keycloakify提供的上下文（包含access_token、认证状态）
 */
export const fetchCurrentUser = async (
  kcContext: KcContext
): Promise<UserMeResponse> => {
  // 从kcContext中获取access_token（Keycloakify已自动处理认证）
  const accessToken = kcContext.token;

  if (!accessToken) {
    throw new Error('未获取到认证Token，请先登录');
  }

  // 携带Token请求接口
  const response = await apiClient.get('/api/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}` // 核心认证头
    }
  });

  return response.data;
};