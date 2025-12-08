import React, { useEffect } from "react";
import Keycloak from "keycloak-js";

interface AuthGuardProps {
  keycloak: Keycloak;
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ keycloak, children }) => {
  useEffect(() => {
    const refreshToken = () => {
      keycloak
        .updateToken(30)
        .then((refreshed) => {
          if (refreshed) {
            sessionStorage.setItem("kc_token", keycloak.token ?? "");
            sessionStorage.setItem("kc_refresh_token", keycloak.refreshToken ?? "");
          }
        })
        .catch(() => {
          keycloak.logout();
        });
    };

    const interval = setInterval(refreshToken, 20000);
    return () => clearInterval(interval);
  }, [keycloak]);

  return <>{children}</>;
};

