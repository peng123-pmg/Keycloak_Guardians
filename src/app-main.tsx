import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import SimpleApp from "./SimpleApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SimpleApp />
  </StrictMode>
);
