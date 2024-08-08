import { registerProApplicationLogin } from "./pro-application-login.js";
import { registerProApplication } from "./pro-application.js";
import { registerProApplicationTextInput, registerProApplicationSelectInput } from "./pro-application-inputs.js";

import "./app.css"

registerProApplicationLogin();
registerProApplication();

registerProApplicationTextInput();
registerProApplicationSelectInput();