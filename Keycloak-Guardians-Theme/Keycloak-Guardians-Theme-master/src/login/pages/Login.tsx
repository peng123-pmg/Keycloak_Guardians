import { useState, useEffect, FormEventHandler } from "react";
import type { KcContext } from "../KcContext";
import { CustomHeader } from "../components/CustomHeader";
import { WaterMark } from "../components/WaterMark";
import { CustomButton } from "../components/CustomButton";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";

export default function Login(props: { 
    kcContext: Extract<KcContext, { pageId: "login.ftl" }>;
    i18n: any;
}) {
    const { kcContext } = props;
    const { realm, url, message, login, usernameHidden, messagesPerField, isAppInitiatedAction } = kcContext;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss: false,
        classes: {}
    });

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
    const [isRememberMe, setIsRememberMe] = useState(false);

    useEffect(() => {
        document.title = "欢迎登录我们的系统";
    }, []);

    const onSubmit: FormEventHandler<HTMLFormElement> = _e => {
        setIsLoginButtonDisabled(true);
        return true;
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

                <form
                    id="kc-form-login"
                    className="login-form"
                    onSubmit={onSubmit}
                    action={url.loginAction}
                    method="post"
                >
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
                                className={kcClsx("kcInputClass")}
                                name="username"
                                defaultValue={login.username ?? ""}
                                type="text"
                                autoFocus
                                autoComplete="username"
                                aria-invalid={messagesPerField.existsError("username", "password")}
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="password">密码</label>
                        <input
                            tabIndex={3}
                            id="password"
                            className={kcClsx("kcInputClass")}
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            aria-invalid={messagesPerField.existsError("username", "password")}
                        />
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
                        type="submit"
                        disabled={isLoginButtonDisabled}
                    >
                        {isAppInitiatedAction ? "继续" : "登录"}
                    </CustomButton>
                </form>
            </div>
        </div>
    );
}
