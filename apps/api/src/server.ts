import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocketIO } from "./config/socket.js";

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Create HTTP & Socket.IO server
  const server = http.createServer(app);
  initSocketIO(server);

  server.listen(PORT, () => {
    console.log(`🚀 PAW TRACK Backend API listening on http://localhost:${PORT}`);
    console.log(`🔒 RBAC & Auth endpoints active at http://localhost:${PORT}/api/auth`);
    console.log(`⚡ Socket.IO Gateway active on ws://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
