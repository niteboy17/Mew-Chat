import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
});

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}

// This map will hold the mapping of user IDs to their corresponding socket IDs
const userSocketMap ={};

io.on("connection", (socket) => {
    console.log("A user connected: ", socket.id);

    const userId = socket.handshake.query.userId; // Get the user ID from the query parameters]
    if(userId) userSocketMap [userId] = socket.id; // Store the mapping of user ID to socket ID

    //io.emit() is used to send a message to all connected clients. You can use it to broadcast messages or notifications to all users. 
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit the list of online users to all clients

    socket.on("disconnect", () => {
        console.log("A user disconnected: ", socket.id);
        delete userSocketMap[userId]; // Remove the user from the map when they disconnect

        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit the updated list of online users to all clients
    });


});

export { io, server, app }