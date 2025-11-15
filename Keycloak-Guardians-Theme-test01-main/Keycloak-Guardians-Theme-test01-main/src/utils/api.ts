/*
 * @Author: peng123-pmg 3438145513@qq.com
 * @Date: 2025-11-15 18:27:20
 * @LastEditors: peng123-pmg 3438145513@qq.com
 * @LastEditTime: 2025-11-15 18:29:38
 * @FilePath: \Keycloak_Guardians\Keycloak-Guardians-Theme-test01-main\Keycloak-Guardians-Theme-test01-main\src\utils\api.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// API工具类，用于处理与后端的交互
const BACKEND_BASE_URL = (import.meta as any).env?.VITE_BACKEND_BASE_URL ?? "";

/**
 * 调用后端 /api/users/me 接口获取当前用户信息
 */
export async function fetchCurrentUser(accessToken: string): Promise<any> {
    if (!BACKEND_BASE_URL) {
        console.log('⚠️ 未配置 BACKEND_BASE_URL，无法调用后端API');
        return null;
    }

    try {
        console.log(`➡️ 调用 ${BACKEND_BASE_URL.replace(/\/$/, '')}/api/users/me`);
        const response = await fetch(`${BACKEND_BASE_URL.replace(/\/$/, '')}/api/users/me`, {
            headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn('/api/users/me 返回非 2xx：', response.status);
            const text = await response.text();
            console.warn('响应内容：', text);
            return null;
        }

        const userData = await response.json();
        console.log('✅ /api/users/me 返回：', userData);
        return userData;
    } catch (error) {
        console.error('调用 /api/users/me 时发生错误：', error);
        return null;
    }
}

/**
 * 从Keycloak获取的JWT Token中解析用户信息
 */
export function parseJwt(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('解析JWT时出错:', error);
        return null;
    }
}