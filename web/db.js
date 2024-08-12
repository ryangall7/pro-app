
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const connectionUrl = process.env.DATABASE_URL;
const databaseName = process.env.DATABASE_NAME;

const client = new MongoClient(connectionUrl, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let conn;
try {
  conn = await client.connect();
} catch(e) {
  console.error(e);
}

let db = conn.db(databaseName);

export {
    databaseName,
    connectionUrl,
    db
}