import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { KcPage } from "./kc.gen";
import type { KcContext } from "./login/KcContext";

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

// 获取 Keycloak 上下文（生产环境从 window 获取，开发环境使用模拟数据）
const kcContext = (window as any).kcContext || (import.meta.env.DEV ? getMockKcContext() : undefined);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {kcContext ? (
            <KcPage kcContext={kcContext} />
        ) : (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <h1>No Keycloak Context</h1>
                <p>请在 Keycloak 环境中运行或启用开发模式</p>
            </div>
        )}
    </StrictMode>
);
