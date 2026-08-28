import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Start HTTP listener
  app.listen(PORT, () => {
    console.log(`🚀 PAW TRACK Backend API listening on http://localhost:${PORT}`);
    console.log(`🔒 RBAC & Auth endpoints active at http://localhost:${PORT}/api/auth`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
