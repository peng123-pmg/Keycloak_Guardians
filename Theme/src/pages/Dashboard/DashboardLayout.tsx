import React from "react";
import { Sidebar } from "./components/Sidebar";
import { GlobalSearch } from "../../components/GlobalSearch/GlobalSearch";
import { BackButton } from "../../components/BackButton/BackButton";
import styles from "./Dashboard.module.css";
import Keycloak from "keycloak-js";
import { useLocation, useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  keycloak: Keycloak;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ keycloak, children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveMenu = () => {
    const path = location.pathname;
    if (path.startsWith("/personal-files")) return "my-files";
    if (path.startsWith("/team-management/created-team")) return "my-teams";
    if (path.startsWith("/team-management/joined-team")) return "my-teams";
    if (path.startsWith("/team-management")) return "my-teams";
    if (path.startsWith("/recycle-bin")) return "recycle-bin";
    if (path.startsWith("/notifications") || path.startsWith("/message-detail")) return "notifications";
    if (path.startsWith("/task-progress")) return "task-progress";
    if (path.startsWith("/security-backup")) return "security-backup";
    return "dashboard";
  };

  const handleMenuChange = (menu: string) => {
    if (menu === "logout") {
      keycloak.logout({ redirectUri: window.location.origin });
      return;
    }
    switch (menu) {
      case "my-files":
        navigate("/personal-files");
        break;
      case "my-teams":
        navigate("/team-management/my-teams");
        break;
      case "recycle-bin":
        navigate("/recycle-bin");
        break;
      case "notifications":
        navigate("/notifications");
        break;
      case "task-progress":
        navigate("/task-progress");
        break;
      case "security-backup":
        navigate("/security-backup");
        break;
      default:
        navigate("/dashboard");
    }
  };

  return (
    <div className={`${styles.dashboardContainer} watermark-bg`}>
      <Sidebar activeMenu={getActiveMenu()} onMenuChange={handleMenuChange} />
      <GlobalSearch />
      <main className={styles.mainContent}>
        <BackButton />
        {children}
        <div className={styles.bottomDecoration}></div>
      </main>
    </div>
  );
};
