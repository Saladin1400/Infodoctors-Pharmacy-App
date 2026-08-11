import express from "express";
import http from "http";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Standard CORS headers middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "50mb" }));

const httpServer = http.createServer(app);

// ==========================================
// WEBSOCKET SIGNALING SERVER (WebRTC Room Signaling)
// ==========================================
interface RoomParticipant {
  userId: string;
  role: string;
  socket: WebSocket;
}

const roomsStore = new Map<string, RoomParticipant[]>();
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws: WebSocket) => {
  let currentRoomId: string | null = null;
  let currentUserId: string | null = null;

  ws.on("message", (message) => {
    try {
      const payload = JSON.parse(message.toString());

      switch (payload.type) {
        case "join": {
          const { roomId, userId, role } = payload;
          if (!roomId || !userId) return;

          currentRoomId = roomId;
          currentUserId = userId;

          let list = roomsStore.get(roomId) || [];
          list = list.filter(p => p.userId !== userId);
          list.push({ userId, role, socket: ws });
          roomsStore.set(roomId, list);

          list.forEach(p => {
            if (p.userId !== userId && p.socket.readyState === WebSocket.OPEN) {
              p.socket.send(JSON.stringify({ type: "user-joined", userId, role }));
            }
          });

          ws.send(JSON.stringify({
            type: "room-users",
            users: list.map(p => ({ userId: p.userId, role: p.role }))
          }));
          break;
        }

        case "signal": {
          const { roomId, userId, signal } = payload;
          if (!roomId) return;

          const list = roomsStore.get(roomId);
          if (list) {
            list.forEach(p => {
              if (p.userId !== userId && p.socket.readyState === WebSocket.OPEN) {
                p.socket.send(JSON.stringify({ type: "signal", userId, signal }));
              }
            });
          }
          break;
        }
      }
    } catch (e) {
      console.error("[WS] Error parsing message:", e);
    }
  });

  ws.on("close", () => {
    if (currentRoomId && currentUserId) {
      const list = roomsStore.get(currentRoomId);
      if (list) {
        const updated = list.filter(p => p.userId !== currentUserId);
        if (updated.length > 0) {
          roomsStore.set(currentRoomId, updated);
          updated.forEach(p => {
            if (p.socket.readyState === WebSocket.OPEN) {
              p.socket.send(JSON.stringify({ type: "user-left", userId: currentUserId }));
            }
          });
        } else {
          roomsStore.delete(currentRoomId);
        }
      }
    }
  });
});

httpServer.on("upgrade", (request, socket, head) => {
  const { pathname } = new URL(request.url || "", `http://${request.headers.host}`);
  if (pathname === "/ws/signaling") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

// ==========================================
// REST API ROUTES
// ==========================================

// Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Pharmaceutical Care Unified API Backend" });
});

// Auth Routes Example
app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبة" });
  }

  res.json({
    token: `jwt_token_sample_${Date.now()}`,
    user: {
      id: "usr_1001",
      email,
      fullName: role === 'pharmacist' ? "د. أحمد كمال - صيدلي سريري" : "محمد محمود السيد",
      role: role || 'patient'
    }
  });
});

// Patient Endpoints
app.get("/api/patients", (_req, res) => {
  res.json({ message: "Fetch all registered patients" });
});

httpServer.listen(PORT, () => {
  console.log(`[Backend Server] Running smoothly on port ${PORT}`);
});
