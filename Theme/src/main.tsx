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
// function App() {
//     const [isLoggedIn, setIsLoggedIn] = useState(false);

//     useEffect(() => {
//         // 检查是否已登录
//         const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
//         setIsLoggedIn(loggedIn);

//         // 监听登录事件
//         const handleLogin = () => {
//             sessionStorage.setItem('isLoggedIn', 'true');
//             setIsLoggedIn(true);
//             console.log('🔐 已登录');
//         };

//         // 监听退出登录事件
//         const handleLogout = () => {
//             sessionStorage.removeItem('isLoggedIn');
//             localStorage.removeItem('currentUser');
//             setIsLoggedIn(false);
//             console.log('🚪 已退出登录');
//         };

//         window.addEventListener('keycloak-login', handleLogin);
//         window.addEventListener('keycloak-logout', handleLogout);
        
//         return () => {
//             window.removeEventListener('keycloak-login', handleLogin);
//             window.removeEventListener('keycloak-logout', handleLogout);
//         };
//     }, []);

//     // 获取 Keycloak 上下文（生产环境从 window 获取，开发环境也可以使用真实上下文）
//     const kcContext = (window as any).kcContext || undefined;

//     // 如果已登录，显示Dashboard
//     if (isLoggedIn) {
//         return <Dashboard />;
//     }

//     // 未登录，显示Keycloak登录页面
//     return kcContext ? (
//         <KcPage kcContext={kcContext} />
//     ) : (
//         <div style={{ padding: "40px", textAlign: "center" }}>
//             <h1>No Keycloak Context</h1>
//             <p>请在 Keycloak 环境中运行</p>
//         </div>
//     );
// }

// ... existing code ...

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

    // 获取 Keycloak 上下文（生产环境从 window 获取，开发环境也可以使用真实上下文）
    const kcContext = (window as any).kcContext || undefined;

    // 检查是否为开发模式
    const isDevMode = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

    // 如果已登录，显示Dashboard
    if (isLoggedIn) {
        return <Dashboard />;
    }

    // 未登录，显示Keycloak登录页面
    return kcContext ? (
        <KcPage kcContext={kcContext} />
    ) : isDevMode ? (
        // 在开发模式下使用模拟的Keycloak上下文
        <KcPage kcContext={getMockKcContext()} />
    ) : (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h1>No Keycloak Context</h1>
            <p>请在 Keycloak 环境中运行</p>
            <p style={{ marginTop: "20px" }}>
                <strong>开发建议:</strong><br/>
                1. 确保 .env 文件中设置 VITE_USE_MOCK_AUTH=true<br/>
                2. 或者通过Keycloak服务器访问此应用
            </p>
            <button onClick={() => {
                // 临时解决方案：直接跳转到登录页面组件
                window.location.hash = '#/login';
            }} style={{ 
                marginTop: "20px", 
                padding: "10px 20px", 
                backgroundColor: "#4A90E2", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: "pointer"
            }}>
                直接访问登录页面 (临时方案)
            </button>
        </div>
    );
}

// ... existing code ...

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);