// import { Suspense, lazy } from "react";
// import type { ClassKey } from "keycloakify/login";
// import type { KcContext } from "./KcContext";
// import { useI18n } from "./i18n";
// import DefaultPage from "keycloakify/login/DefaultPage";
// import Template from "keycloakify/login/Template";
// const UserProfileFormFields = lazy(
//     () => import("keycloakify/login/UserProfileFormFields")
// );

// const doMakeUserConfirmPassword = true;

// export default function KcPage(props: { kcContext: KcContext }) {
//     const { kcContext } = props;

//     const { i18n } = useI18n({ kcContext });

//     return (
//         <Suspense>
//             {(() => {
//                 switch (kcContext.pageId) {
//                     default:
//                         return (
//                             <DefaultPage
//                                 kcContext={kcContext}
//                                 i18n={i18n}
//                                 classes={classes}
//                                 Template={Template}
//                                 doUseDefaultCss={true}
//                                 UserProfileFormFields={UserProfileFormFields}
//                                 doMakeUserConfirmPassword={doMakeUserConfirmPassword}
//                             />
//                         );
//                 }
//             })()}
//         </Suspense>
//     );
// }

// const classes = {} satisfies { [key in ClassKey]?: string };



import { Suspense, lazy } from "react";
import type { ClassKey } from "keycloakify/login";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import DefaultPage from "keycloakify/login/DefaultPage";
import Template from "keycloakify/login/Template";

const UserProfileFormFields = lazy(
    () => import("keycloakify/login/UserProfileFormFields")
);

const doMakeUserConfirmPassword = true;

// 自定义样式
const customStyles = {
  container: {
    backgroundColor: '#f0f8ff', // 浅蓝色背景
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  loginBox: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    color: '#1976d2',
    textAlign: 'center' as const,
    marginBottom: '0.5rem',
    fontSize: '1.5rem'
  },
  subtitle: {
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: '2rem',
    fontSize: '0.9rem'
  }
};

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;

    const { i18n } = useI18n({ kcContext });

    return (
        <div style={customStyles.container}>
            <div style={customStyles.loginBox}>
                {/* 自定义欢迎文字 */}
                <div>
                    <h1 style={customStyles.title}>欢迎登录我们的系统</h1>
                    <p style={customStyles.subtitle}>请输入您的凭证以继续访问</p>
                </div>
                
                <Suspense>
                    {(() => {
                        switch (kcContext.pageId) {
                            default:
                                return (
                                    <DefaultPage
                                        kcContext={kcContext}
                                        i18n={i18n}
                                        classes={classes}
                                        Template={Template}
                                        doUseDefaultCss={true}
                                        UserProfileFormFields={UserProfileFormFields}
                                        doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                                    />
                                );
                        }
                    })()}
                </Suspense>
            </div>
        </div>
    );
}

const classes = {} satisfies { [key in ClassKey]?: string };