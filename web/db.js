
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const connectionUrl = `${
    process.env.DATABASE_PROTOCOL ? process.env.DATABASE_PROTOCOL + "://" : "mongodb://"
  }${
    process.env.DATABASE_USERNAME
      ? encodeURIComponent(process.env.DATABASE_USERNAME) + ":" + encodeURIComponent(process.env.DATABASE_PASSWORD) + "@"
      : ""
  }${process.env.DATABASE_HOSTNAME}/?${
    process.env.DATABASE_SSL == "true" ? "tls=true&" : ""
  }${
    process.env.DATABASE_AUTHSOURCE
      ? "authSource=" + process.env.DATABASE_AUTHSOURCE + "&"
      : ""
  }retryWrites=true&w=majority`;

const databaseName = process.env.DATABASE_DATABASE;
console.log("connectionUrl", connectionUrl, databaseName);

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