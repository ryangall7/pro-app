import { join } from "path";

// import { ProApplicationDB } from "./pro-application-db.js";
import { BillingInterval, BillingReplacementBehavior, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
//import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
import { MongoDBSessionStorage } from '@shopify/shopify-app-session-storage-mongodb';
import { connectionUrl, databaseName } from "./db.js";

const billingConfig = {
    "Basic Plan": {
      amount: 25.0,
      currencyCode: 'USD',
      interval: BillingInterval.Every30Days,
      trialDays: 30
    }
  }

// Initialize SQLite DB
// ProApplicationDB.db = database;
// ProApplicationDB.init();
const shopify = shopifyApp({
  api: {
    apiVersion: "2023-07",
    restResources,
    billing: billingConfig // or replace with billingConfig above to enable example billing
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  //sessionStorage: new SQLiteSessionStorage(database),
  sessionStorage: new MongoDBSessionStorage(
    connectionUrl,
    databaseName,
  ),
});


export default shopify;
