import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`[server] Memorable API listening on port ${env.port} (${env.nodeEnv})`);
  });
}

start();
