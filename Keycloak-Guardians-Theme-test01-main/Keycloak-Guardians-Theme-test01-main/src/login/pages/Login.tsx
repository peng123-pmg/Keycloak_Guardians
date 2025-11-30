import { useState, useEffect } from "react";
import type { KcContext } from "../KcContext";
import { CustomHeader } from "../components/CustomHeader";
import { WaterMark } from "../components/WaterMark";
import { CustomButton } from "../components/CustomButton";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import { authService } from "../../src/services/authService";
import "../index.css";

export default function Login(props: { 
    kcContext: Extract<KcContext, { pageId: "login.ftl" }>;
    i18n: any;
    onLoginSuccess?: () => void;
}) {
    const { kcContext, onLoginSuccess } = props;
    
    const { realm, url, message, login, usernameHidden, messagesPerField, isAppInitiatedAction } = kcContext;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss: false,
        classes: {}
    });

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
    const [isRememberMe, setIsRememberMe] = useState(false);
    const [username, setUsername] = useState(login.username ?? "");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.title = "欢迎登录我们的系统";
    }, []);

    // 验证表单
    const validateForm = (): boolean => {
        const newErrors: { username?: string; password?: string } = {};

        // 验证用户名
        if (!username.trim()) {
            newErrors.username = "请输入用户名";
        }

        // 验证密码
        if (!password.trim()) {
            newErrors.password = "请输入密码";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLoginClick = async () => {
        // 清除之前的错误
        setErrors({});
        
        // 表单验证
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setIsLoginButtonDisabled(true);

        try {
            // 用户凭据验证
            const result = await authService.login({
                username,
                password,
                rememberMe: isRememberMe
            });

            if (result.success) {
                console.log('✅ 登录成功');
                
                // 触发自定义登录事件（用于开发模式跳转）
                window.dispatchEvent(new CustomEvent('keycloak-login'));
                
                // 如果有回调函数也调用它
                if (onLoginSuccess) {
                    onLoginSuccess();
                }
                
                // 如果是在真实的Keycloak环境中，提交表单
                const form = document.getElementById('kc-form-login') as HTMLFormElement;
                if (form) {
                    form.submit();
                }
            } else {
                setErrors({
                    general: result.error || "登录失败"
                });
            }
        } catch (error: any) {
            console.error('登录过程中发生错误:', error);
            setErrors({
                general: error.message || "登录过程中发生错误"
            });
        } finally {
            setIsLoading(false);
            setIsLoginButtonDisabled(false);
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

                {/* 显示错误信息 */}
                {errors.general && (
                    <div className="alert alert-error">
                        {errors.general}
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
                        disabled={isLoginButtonDisabled || isLoading}
                    >
                        {isLoading ? "登录中..." : (isAppInitiatedAction ? "继续" : "登录")}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}