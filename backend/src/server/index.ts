import express from 'express';
import apiV1 from './routes.apiRoutes';
import { port } from '../config/envVariables.config';
import cors from 'cors';
import { createServer } from 'http';
import { connectToPostgres } from '../config/db/db.postgres';
import { initSocketIO, getIO } from "../libs/socket";
import redis from 'redis';

import { redisHost, redisPort } from '../config/envVariables.config';

const redisUrl = `redis://${redisHost}:${redisPort}`;


const allowlist = ['http://localhost:3000', 'http://localhost:3001'];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void => {
    if (!origin || allowlist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/v1', apiV1);

app.get("/", (req, res) => {
  res.send("Hello from the inside!!");
});

// ⬇️ Create HTTP server and attach Socket.IO
const httpServer = createServer(app);
const io = initSocketIO(httpServer);

// 🔁 Handle socket connections
io.on('connection', (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join-conversation", (conversationId: string) => {
    socket.join(conversationId);
    console.log(`🧑‍🤝‍🧑 ${socket.id} joined conversation:${conversationId}`);
  });

  socket.on('disconnect', () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// ✅ Setup Redis pub/sub listener
(async () => {
  try {
    const client = redis.createClient({ url: redisUrl });
    const subscriber = client.duplicate();

    await subscriber.connect();
    await subscriber.subscribe("new-message", (raw) => {
      try {
        console.log("📥 Received raw message from Redis:", raw);
        const parsedData = JSON.parse(raw);

        let conversationId = parsedData.conversationId;
        let messageToSend;

        // Scenario 1: Payload has a 'message' key (preferred, complete message object)
        if (parsedData.message && typeof parsedData.message === 'object' && parsedData.message.id && parsedData.message.content) {
            messageToSend = parsedData.message;
            // Use conversationId from the top level, or fallback to message.conversationId if it exists there
            conversationId = conversationId || messageToSend.conversationId;
        }
        // Scenario 2: Payload has 'content' at the top level (legacy/simpler, but less complete)
        else if (parsedData.content) {
            // Create a minimal message object from the top-level content
            // THIS ASSUMES messages will have an ID and role when they reach the frontend
            // If ID/role/timestamp are not present, your frontend might have issues.
            // This is primarily for backward compatibility or simpler messages.
            messageToSend = {
                id: parsedData.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate temp ID if missing
                content: parsedData.content,
                role: parsedData.role || 'assistant', // Default role if not provided
                timestamp: parsedData.timestamp || new Date().toISOString(), // Default timestamp
                // Add other default or null properties as per your Message interface if needed
                tool: parsedData.tool || null,
                args: parsedData.args || {},
                next: parsedData.next || null,
            };
        }

        // Final validation before emitting
        if (!conversationId || !messageToSend || !messageToSend.id || !messageToSend.content) {
          console.warn("⚠️ Subscriber: Skipping emission due to missing conversationId or invalid/incomplete message payload after processing:", parsedData);
          return;
        }

        const io = getIO();
        io.to(conversationId).emit("new-message", messageToSend); // Emit the constructed/extracted message
        console.log("📤 Emitted socket message via Redis →", conversationId, messageToSend);
      } catch (err) {
        console.error("❌ Failed to emit socket message from Redis (parsing or other error):", err, "Raw data:", raw);
      }
    });

    console.log("📡 Subscribed to Redis channel: new-message");
  } catch (error) {
    console.error('❌ Error setting up Redis:', error);
    process.exit(1);
  }
})();
// Connect to Postgres
(async () => {
  try {
    await connectToPostgres();
    console.log('Postgres Client Connected 🚀🚀🚀...');
  } catch (error) {
    console.error('Error connecting to Postgres:', error);
    process.exit(1);
  }
})();


// 🚀 Start server with HTTP + Socket.IO
httpServer.listen(port, () => {
  console.log(`🚀 Express + Socket.IO server running on port ${port}`);
});


// --- Add this section for graceful shutdown ---
process.on('SIGINT', () => { // Catch Ctrl+C and nodemon's restart signal (SIGUSR2 on some systems)
  console.log('SIGINT signal received: Closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed.');
    process.exit(0); // Exit cleanly
  });
});

// For nodemon specifically, sometimes SIGUSR2 is used for restart
process.on('SIGUSR2', () => {
  console.log('Nodemon restart signal received: Closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed. Exiting for nodemon restart.');
    process.exit(0);
  });
});