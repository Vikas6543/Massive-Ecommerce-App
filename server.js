import "./src/config/env.js";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { initializeSocket } from "./src/config/socket.js";
import { setIO } from "./src/services/notification.service.js";
import http from "http";
import "./src/config/redis.js";

const PORT = process.env.PORT || 5000;

// ✅ Create HTTP server from express app
const server = http.createServer(app);

// ✅ Initialize Socket.io
const io = initializeSocket(server);
setIO(io);

connectDB().then(async () => {
  server.listen(PORT, () => {
    console.log(
      `🚀 Server running on port ${PORT} - ${process.env.NODE_ENV} mode`,
    );
  });
});
