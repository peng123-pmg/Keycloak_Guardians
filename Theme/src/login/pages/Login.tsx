import { useState, useEffect } from "react";
import type { KcContext } from "../KcContext";
import { CustomHeader } from "../components/CustomHeader";
import { WaterMark } from "../components/WaterMark";
import { CustomButton } from "../components/CustomButton";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import "../index.css";

export default function Login(props: { 
    kcContext: Extract<KcContext, { pageId: "login.ftl" }>;
    i18n: any;
    onLogin?: () => void;
    onLoginSuccess?: () => void;
}) {
    console.log('Login 组件渲染，props keys:', Object.keys(props));
    console.log('完整 props:', props);
    console.log('onLoginSuccess 类型:', typeof props.onLoginSuccess);
    console.log('onLoginSuccess 是否存在:', !!props.onLoginSuccess);
    
    const { kcContext, onLoginSuccess } = props;
    
    useEffect(() => {
        console.log('Login useEffect，onLoginSuccess:', onLoginSuccess);
        console.log('onLoginSuccess 类型:', typeof onLoginSuccess);
    }, [onLoginSuccess]);
    const { realm, url, message, login, usernameHidden, messagesPerField, isAppInitiatedAction } = kcContext;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss: false,
        classes: {}
    });

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
    const [isRememberMe, setIsRememberMe] = useState(false);
    const [username, setUsername] = useState(login.username ?? "");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

    useEffect(() => {
        document.title = "欢迎登录我们的系统";
    }, []);

    // Mock 账号数据（测试用）
    const mockUsers = [
        { username: "admin", password: "123456", role: "管理员" },
        { username: "user", password: "123456", role: "普通用户" },
        { username: "test", password: "test123", role: "测试用户" }
    ];

    // 验证表单
    const validateForm = (): boolean => {
        const newErrors: { username?: string; password?: string } = {};

        // 验证用户名
        if (!username.trim()) {
            newErrors.username = "请输入用户名";
        } else if (username.length < 3) {
            newErrors.username = "用户名至少3个字符";
        }

        // 验证密码
        if (!password.trim()) {
            newErrors.password = "请输入密码";
        } else if (password.length < 6) {
            newErrors.password = "密码至少6个字符";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ... existing code ...

    // 验证用户凭据
    const authenticateUser = (username: string, password: string): boolean => {
      const user = mockUsers.find(
        u => u.username === username && u.password === password
      );
      
      if (user) {
        console.log(`✅ 验证成功: ${user.username} (${user.role})`);
        // 存储用户信息和模拟令牌到 localStorage
        const userData = {
          username: user.username,
          role: user.role,
          loginTime: new Date().toISOString(),
          token: btoa(`${user.username}:${user.password}`) // 简单的Base64编码作为模拟令牌
        };
        localStorage.setItem('currentUser', JSON.stringify(userData));
        return true;
      }
      
      console.log('❌ 验证失败: 用户名或密码错误');
      return false;
    };

// ... existing code ...

    const handleLoginClick = () => {
        console.log('=== 登录按钮被点击 ===');
        
        // 清除之前的错误
        setErrors({});
        
        // 表单验证
        if (!validateForm()) {
            console.log('❌ 表单验证失败');
            return;
        }

        // 禁用登录按钮
        setIsLoginButtonDisabled(true);

        // 用户凭据验证
        const isAuthenticated = authenticateUser(username, password);
        
        if (isAuthenticated) {
            console.log('✅ 登录成功，准备跳转...');
            
            // 触发自定义登录事件（用于开发模式跳转）
            window.dispatchEvent(new CustomEvent('keycloak-login'));
            
            // 如果有回调函数也调用它
            if (onLoginSuccess) {
                onLoginSuccess();
            }
        } else {
            // 验证失败
            setErrors({
                password: "用户名或密码错误，请重试"
            });
            setIsLoginButtonDisabled(false);
            console.log('❌ 登录失败');
        }
    };

    // 处理 Enter 键登录
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoginButtonDisabled) {
            handleLoginClick();
        }
    };

    return (
        <div id="kc-login">
            <WaterMark text="MYREALM" />
            
            <div className="login-container">
                <CustomHeader 
                    title="欢迎登录我们的系统"
                    subtitle="请输入您的认证凭据访问"
                />

                {message !== undefined && (
                    <div className={`alert alert-${message.type}`}>
                        {message.summary}
                    </div>
                )}

                <div className="login-form">
                    {!usernameHidden && (
                        <div className="form-group">
                            <label htmlFor="username">
                                {!realm.loginWithEmailAllowed
                                    ? "用户名"
                                    : !realm.registrationEmailAsUsername
                                    ? "用户名或邮箱"
                                    : "邮箱"}
                            </label>
                            <input
                                tabIndex={2}
                                id="username"
                                className={`${kcClsx("kcInputClass")} ${errors.username ? 'error' : ''}`}
                                name="username"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    if (errors.username) {
                                        setErrors({ ...errors, username: undefined });
                                    }
                                }}
                                onKeyPress={handleKeyPress}
                                type="text"
                                autoFocus
                                autoComplete="username"
                                aria-invalid={!!errors.username}
                            />
                            {errors.username && (
                                <div className="error-message">{errors.username}</div>
                            )}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="password">密码</label>
                        <input
                            tabIndex={3}
                            id="password"
                            className={`${kcClsx("kcInputClass")} ${errors.password ? 'error' : ''}`}
                            name="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) {
                                    setErrors({ ...errors, password: undefined });
                                }
                            }}
                            onKeyPress={handleKeyPress}
                            type="password"
                            autoComplete="current-password"
                            aria-invalid={!!errors.password}
                        />
                        {errors.password && (
                            <div className="error-message">{errors.password}</div>
                        )}
                    </div>

                    <div className="form-options">
                        {realm.rememberMe && !usernameHidden && (
                            <div className="remember-me">
                                <input
                                    tabIndex={5}
                                    id="rememberMe"
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={isRememberMe}
                                    onChange={(e) => setIsRememberMe(e.target.checked)}
                                />
                                <label htmlFor="rememberMe">记住我</label>
                            </div>
                        )}

                        {realm.resetPasswordAllowed && (
                            <a
                                tabIndex={6}
                                href={url.loginResetCredentialsUrl}
                                className="forgot-password"
                            >
                                忘记密码?
                            </a>
                        )}
                    </div>

                    <input
                        type="hidden"
                        id="id-hidden-input"
                        name="credentialId"
                        value={kcContext.auth.selectedCredential}
                    />

                    <CustomButton
                        type="button"
                        onClick={handleLoginClick}
                        disabled={isLoginButtonDisabled}
                    >
                        {isAppInitiatedAction ? "继续" : "登录"}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}
