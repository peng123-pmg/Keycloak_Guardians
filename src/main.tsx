// import { createRoot } from "react-dom/client";
// import { StrictMode } from "react";
// import { KcPage } from "./kc.gen";

// // The following block can be uncommented to test a specific page with `yarn dev`
// // Don't forget to comment back or your bundle size will increase
// /*
// import { getKcContextMock } from "./login/KcPageStory";

// if (import.meta.env.DEV) {
//     window.kcContext = getKcContextMock({
//         pageId: "register.ftl",
//         overrides: {}
//     });
// }
// */

// createRoot(document.getElementById("root")!).render(
//     <StrictMode>
//         {!window.kcContext ? (
//             <h1>No Keycloak Context</h1>
//         ) : (
//             <KcPage kcContext={window.kcContext} />
//         )}
//     </StrictMode>
// );
// src/main.tsx
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { KcPage } from "./kc.gen";

// 取消注释以下代码来测试登录页面
import { getKcContextMock } from "./login/KcPageStory";

if (import.meta.env.DEV) {
    window.kcContext = getKcContextMock({
        pageId: "login.ftl",  // 改为测试登录页面
        overrides: {}
    });
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {!window.kcContext ? (
            <h1>No Keycloak Context</h1>
        ) : (
            <KcPage kcContext={window.kcContext} />
        )}
    </StrictMode>
);