/**
 * 后端连接测试工具
 * 用于快速测试后端服务是否正常工作
 */

import axios from 'axios';

interface TestResult {
  service: string;
  status: 'success' | 'failed';
  message: string;
  details?: any;
}

/**
 * 测试后端服务连接
 */
export async function testBackendConnection(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';
  const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';

  // 测试1: 后端服务健康检查
  try {
    console.log('🧪 测试后端服务健康检查...');
    const response = await axios.get(`${backendUrl}/health`, { timeout: 5000 });
    results.push({
      service: '后端服务健康检查',
      status: 'success',
      message: `后端服务运行正常 (${backendUrl})`,
      details: response.data
    });
    console.log('✅ 后端服务健康检查通过');
  } catch (error: any) {
    results.push({
      service: '后端服务健康检查',
      status: 'failed',
      message: `无法连接到后端服务 (${backendUrl})`,
      details: error.message
    });
    console.error('❌ 后端服务健康检查失败:', error.message);
  }

  // 测试2: Keycloak服务连接
  try {
    console.log('🧪 测试Keycloak服务连接...');
    const response = await axios.get(`${keycloakUrl}/health`, { timeout: 5000 });
    results.push({
      service: 'Keycloak服务连接',
      status: 'success',
      message: `Keycloak服务运行正常 (${keycloakUrl})`,
      details: response.data
    });
    console.log('✅ Keycloak服务连接成功');
  } catch (error: any) {
    // Keycloak可能没有/health端点，尝试其他端点
    try {
      await axios.get(`${keycloakUrl}`, { timeout: 5000 });
      results.push({
        service: 'Keycloak服务连接',
        status: 'success',
        message: `Keycloak服务运行正常 (${keycloakUrl})`
      });
      console.log('✅ Keycloak服务连接成功');
    } catch (error2: any) {
      results.push({
        service: 'Keycloak服务连接',
        status: 'failed',
        message: `无法连接到Keycloak服务 (${keycloakUrl})`,
        details: error2.message
      });
      console.error('❌ Keycloak服务连接失败:', error2.message);
    }
  }

  // 测试3: 后端API接口（需要先登录）
  const tokens = localStorage.getItem('authTokens');
  if (tokens) {
    try {
      console.log('🧪 测试后端API接口...');
      const { accessToken } = JSON.parse(tokens);
      const response = await axios.get(`${backendUrl}/api/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 5000
      });
      results.push({
        service: '后端API接口',
        status: 'success',
        message: 'API接口调用成功',
        details: response.data
      });
      console.log('✅ 后端API接口测试通过');
    } catch (error: any) {
      results.push({
        service: '后端API接口',
        status: 'failed',
        message: 'API接口调用失败（可能需要重新登录）',
        details: error.message
      });
      console.error('❌ 后端API接口测试失败:', error.message);
    }
  } else {
    results.push({
      service: '后端API接口',
      status: 'failed',
      message: '未登录，无法测试API接口',
      details: '请先登录后再测试'
    });
  }

  return results;
}

/**
 * 测试Keycloak登录流程
 */
export async function testKeycloakLogin(username: string, password: string): Promise<TestResult> {
  const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';
  const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'guardians';
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'backend-service';

  try {
    console.log('🧪 测试Keycloak登录...');
    const response = await axios.post(
      `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`,
      new URLSearchParams({
        grant_type: 'password',
        client_id: clientId,
        username: username,
        password: password
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      }
    );

    console.log('✅ Keycloak登录测试成功');
    return {
      service: 'Keycloak登录测试',
      status: 'success',
      message: '登录成功，Token获取成功',
      details: {
        tokenType: response.data.token_type,
        expiresIn: response.data.expires_in,
        hasAccessToken: !!response.data.access_token,
        hasRefreshToken: !!response.data.refresh_token
      }
    };
  } catch (error: any) {
    console.error('❌ Keycloak登录测试失败:', error);
    
    let message = '登录失败';
    if (error.response?.status === 401) {
      message = '用户名或密码错误';
    } else if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      message = '无法连接到Keycloak服务';
    } else if (error.response?.data?.error_description) {
      message = error.response.data.error_description;
    }

    return {
      service: 'Keycloak登录测试',
      status: 'failed',
      message,
      details: error.response?.data || error.message
    };
  }
}

/**
 * 打印测试结果
 */
export function printTestResults(results: TestResult[]): void {
  console.log('\n========== 后端连接测试结果 ==========\n');
  
  results.forEach((result, index) => {
    const icon = result.status === 'success' ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${result.service}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   详情:`, result.details);
    }
    console.log('');
  });

  const successCount = results.filter(r => r.status === 'success').length;
  const totalCount = results.length;
  
  console.log(`========== 测试完成: ${successCount}/${totalCount} 通过 ==========\n`);
}

/**
 * 在浏览器控制台中使用:
 * 
 * import { testBackendConnection, testKeycloakLogin, printTestResults } from '@/utils/testBackend';
 * 
 * // 测试后端连接
 * const results = await testBackendConnection();
 * printTestResults(results);
 * 
 * // 测试登录
 * const loginResult = await testKeycloakLogin('admin', 'admin');
 * console.log(loginResult);
 */
