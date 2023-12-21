import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./lib/ui";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(<App />);
