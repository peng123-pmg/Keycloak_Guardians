import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Keycloak from "keycloak-js";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { KcPage } from "./kc.gen";
import type { KcContext } from "./login/KcContext";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { PersonalFilesPage } from "./pages/PersonalFiles/PersonalFilesPage";
import { MyTeamsPage } from "./pages/MyTeams/MyTeamsPage";
import { CreatedTeamsPage } from "./pages/CreatedTeams/CreatedTeamsPage";
import { CreatedTeamsListPage } from "./pages/CreatedTeamsList/CreatedTeamsListPage";
import { CreateTeamPage } from "./pages/CreateTeam/CreateTeamPage";
import NotificationCenterPage from "./pages/NotificationCenter/NotificationCenterPage";
import MessageDetailPage from "./pages/MessageDetail/MessageDetailPage";
import RecycleBinPage from "./pages/RecycleBin/RecycleBinPage";
import TaskProgressPage from "./pages/TaskProgress/TaskProgressPage";
import SecurityBackupPage from "./pages/SecurityBackup/SecurityBackupPage";
import { DashboardLayout } from "./pages/Dashboard/DashboardLayout";
import { LoadingScreen } from "./components/LoadingScreen";
import { AuthGuard } from "./components/AuthGuard";
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

const keycloak = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080",
    realm: import.meta.env.VITE_KEYCLOAK_REALM || "guardians",
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "frontend-app"
});

// Keycloak 提供者组件
function KeycloakProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        if (hasInitializedRef.current) {
            return;
        }
        hasInitializedRef.current = true;

        keycloak
            .init({
                checkLoginIframe: false,
                onLoad: "login-required",
                pkceMethod: "S256",
                responseMode: "fragment"
            })
            .then((authenticated) => {
                setIsAuthenticated(authenticated);
                if (authenticated) {
                    sessionStorage.setItem("kc_token", keycloak.token ?? "");
                    sessionStorage.setItem("kc_refresh_token", keycloak.refreshToken ?? "");
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <LoadingScreen message="正在加载认证状态..." />;
    }

    if (!isAuthenticated) {
        return <LoadingScreen message="正在跳转到登录页..." />;
    }

    return <AuthGuard keycloak={keycloak}>{children}</AuthGuard>;
}

// 应用程序外壳
function AppShell() {
    return (
        <HashRouter>
            <DashboardLayout keycloak={keycloak}>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/personal-files" element={<PersonalFilesPage />} />
                    <Route path="/team-management/create" element={<CreateTeamPage />} />
                    <Route path="/team-management/my-teams" element={<CreatedTeamsListPage />} />
                    <Route path="/team-management/joined-team/:teamId" element={<MyTeamsPage />} />
                    <Route path="/team-management/created-team/:teamId" element={<CreatedTeamsPage />} />
                    <Route path="/recycle-bin" element={<RecycleBinPage />} />
                    <Route path="/notifications" element={<NotificationCenterPage />} />
                    <Route path="/message-detail/:id" element={<MessageDetailPage />} />
                    <Route path="/task-progress" element={<TaskProgressPage />} />
                    <Route path="/security-backup" element={<SecurityBackupPage />} />
                </Routes>
            </DashboardLayout>
        </HashRouter>
    );
}

const themePreviewEnabled = (import.meta.env.VITE_THEME_PREVIEW || "false").toString().toLowerCase() === "true";

function Root() {
    const kcContext = (window as any).kcContext ?? (themePreviewEnabled ? getMockKcContext() : undefined);

    if (kcContext) {
        return <KcPage kcContext={kcContext} />;
    }

    return (
        <KeycloakProvider>
            <AppShell />
        </KeycloakProvider>
    );
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Root />
    </StrictMode>
);
