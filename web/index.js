// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import GDPRWebhookHandlers from "./gdpr.js";

import applyMetaFieldsApiEndpoints from "./middleware/metafields-api.js";
import applyProApplicationApiEndpoints from "./middleware/pro-application-api.js";
import applyDiscountApiEndpoints from "./middleware/discounts-api.js";
import applyProxyEndpoints from "./middleware/proxy.js";
import applySettingsApiEndpoints from "./middleware/settings-api.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  // async (req, res, next) => {

  //   const session = res.locals.shopify.session;
  //   const hasPayment = true;
  //   const hasPayment = await shopify.api.billing.check({
  //     session,
  //     plans: ['Basic Plan'],
  //     isTest: true,
  //   });

  //   if (hasPayment) {
  //     next();
  //   } else {
  //     res.redirect(
  //       await shopify.api.billing.request({
  //         session,
  //         plan: 'Basic Plan',
  //         isTest: true,
  //       }),
  //     );
  //   }
  // },
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

applyProxyEndpoints(app);
applyMetaFieldsApiEndpoints(app);
applyProApplicationApiEndpoints(app);
applyDiscountApiEndpoints(app);
applySettingsApiEndpoints(app);

app.use(shopify.cspHeaders());

app.use('/files', serveStatic(`${process.cwd()}/files`, { index: false }))

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
