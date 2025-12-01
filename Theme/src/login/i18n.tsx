import { useEffect } from "react";
import type { KcContext } from "./KcContext";

export function useI18n(_params: { kcContext: KcContext }) {
    useEffect(() => {
        // Set page title
        document.title = "欢迎登录我们的系统";
    }, []);

    return {
        i18n: {
            msgStr: (key: string) => key,
            currentLanguage: {
                languageTag: "zh-CN"
            },
            enabledLanguages: [
                {
                    languageTag: "zh-CN",
                    label: "中文"
                }
            ]
        }
    };
}
