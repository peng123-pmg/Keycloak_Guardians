import { createRoot } from "react-dom/client";
import { StrictMode, useState, useEffect } from "react";
import { KcPage } from "./kc.gen";
import type { KcContext } from "./login/KcContext";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import "./styles/variables.css";
import "./styles/global.css";

// 在开发模式下创建模拟的 Keycloak 上下文
const getMockKcContext = (): KcContext => ({
    themeType: "login",
    themeName: "lixinran-keycloak-theme",
    pageId: "login.ftl",
    realm: {
        displayName: "MYREALM",
        displayNameHtml: "<b>MYREALM</b>",
        name: "myrealm",
        internationalizationEnabled: false,
        loginWithEmailAllowed: true,
        rememberMe: true,
        resetPasswordAllowed: true,
        registrationEmailAsUsername: false
    },
    url: {
        loginAction: "#",
        registrationUrl: "/registration",
        loginResetCredentialsUrl: "/reset-credentials"
    } as any,
    login: {
        username: ""
    },
    auth: {
        selectedCredential: ""
    } as any,
    usernameHidden: false,
    message: undefined,
    isAppInitiatedAction: false,
    locale: {
        current: "zh-CN",
        supported: [{ languageTag: "zh-CN", label: "中文" }]
    } as any,
    messagesPerField: {
        existsError: () => false,
        get: () => "",
        exists: () => false,
        printIfExists: () => ""
    }
} as any);

// 主应用组件，处理登录状态和路由
function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // 检查是否已登录
        const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loggedIn);

        // 监听登录事件
        const handleLogin = () => {
            sessionStorage.setItem('isLoggedIn', 'true');
            setIsLoggedIn(true);
            console.log('🔐 已登录');
        };

        // 监听退出登录事件
        const handleLogout = () => {
            sessionStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            setIsLoggedIn(false);
            console.log('🚪 已退出登录');
        };

        window.addEventListener('keycloak-login', handleLogin);
        window.addEventListener('keycloak-logout', handleLogout);
        
        return () => {
            window.removeEventListener('keycloak-login', handleLogin);
            window.removeEventListener('keycloak-logout', handleLogout);
        };
    }, []);

    // 获取 Keycloak 上下文（生产环境从 window 获取，开发环境使用模拟数据）
    const kcContext = (window as any).kcContext || (import.meta.env.DEV ? getMockKcContext() : undefined);

    // 如果已登录，显示Dashboard
    if (isLoggedIn) {
        return <Dashboard />;
    }

    // 未登录，显示Keycloak登录页面
    return kcContext ? (
        <KcPage kcContext={kcContext} />
    ) : (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h1>No Keycloak Context</h1>
            <p>请在 Keycloak 环境中运行或启用开发模式</p>
        </div>
    );
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
