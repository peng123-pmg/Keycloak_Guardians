import { Suspense } from "react";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import Login from "./pages/Login";
import "./index.css";

export default function KcPage(props: { kcContext: KcContext }) {
    const { kcContext } = props;
    const { i18n } = useI18n({ kcContext });

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        return <Login kcContext={kcContext} i18n={i18n} />;
                    default:
                        return <div>Page {kcContext.pageId} not implemented</div>;
                }
            })()}
        </Suspense>
    );
}
