const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const rooms = {}; // Store users in rooms
const usernames = {}; // Store usernames for each room

const activeRooms = new Set(); // Track active rooms

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Send initial room list to new client
  socket.emit("roomListUpdate", Array.from(activeRooms));

  // Handle room list requests
  socket.on("getRooms", (callback) => {
    callback(Array.from(activeRooms));
  });

  // Handle joining room
  socket.on("joinRoom", ({ username, room }, callback) => {
    if (!rooms[room]) {
      rooms[room] = [];
      activeRooms.add(room);
      io.emit("roomListUpdate", Array.from(activeRooms)); // Broadcast updated room list
    }

    // Check if username exists in the same room
    if (usernames[room] && usernames[room][username]) {
      return callback({ error: "Username already taken in this room" });
    }

    const userExists = rooms[room].some((user) => user.username === username);

    if (userExists) {
      return callback({ error: "Username already taken in this room" });
    }

    // Store user in room
    if (!usernames[room]) {
      usernames[room] = {};
    }
    usernames[room][username] = socket.id; // Store username with socket ID

    rooms[room].push({ id: socket.id, username });
    socket.join(room);

    console.log(`User ${username} joined room ${room}`);
    callback({ success: true });

    // Broadcast that a new user has joined
    socket.to(room).emit("userJoined", `${username} has joined the room.`);
  });

  // Handle sending messages
  socket.on("sendMessage", ({ room, message, username }) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log("Sending message:", { username, message, room, timestamp }); // Debugging line to trace message sending


    io.to(room).emit("receiveMessage", { username, message, timestamp });
    console.log(`Message sent to room ${room}:`, { username, message, timestamp }); // Debugging line to confirm message emission

  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    for (const room in rooms) {
      if (usernames[room]) {
        delete usernames[room][username]; // Remove username from the room
      }

      rooms[room] = rooms[room].filter((user) => user.id !== socket.id);
      if (rooms[room].length === 0) {
        delete rooms[room];
        activeRooms.delete(room);
        io.emit("roomListUpdate", Array.from(activeRooms)); // Broadcast updated room list
      }
    }
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
