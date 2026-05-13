import User from '../models/user.model.js';
import Message from '../models/message.model.js';
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from '../lib/socket.js';

export const getUsersForSidebar = async (req, res) => {
    try{
        const loggedInUserId = req.user._id; // Get the logged in user's ID from the request object (set by protectRoute middleware)
        const filterredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password"); // Find all users except the logged in user and select only fullName and profilePicture fields

        res.status(200).json(filterredUsers);
    }catch(error){
        console.error("Error while fetching users for sidebar:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getMessages = async (req, res) => {
    try{
        const {id:userToChatId} = req.params; // Get the ID of the user to chat with from the request parameters
        const myId = req.user._id; // Get the logged in user's ID from the request object (set by protectRoute middleware)

        const messages = await Message.find({
            $or: [
                // Find messages where the logged in user is the sender and the user to chat with is the receiver, or vice versa
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ]
        })
        res.status(200).json(messages);
    }catch(error){
        console.error("Error while fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const sendMessage = async (req, res) => {
    try{
        const {text, image} = req.body; // Get the text and image from the request body
        const {id:receiverId} = req.params; // Get the ID of the receiver from the request parameters
        const senderId = req.user._id; // Get the logged in user's ID from the request object (set by protectRoute middleware)

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl =uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();


        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage); // Emit the new message to the receiver using their socket ID. And to(receiverSocketId) is used to send a message to a specific client identified by their socket ID. You can use it to send a message directly to a particular user without broadcasting it to all connected clients.
        }

        res.status(201).json(newMessage);

    }catch(error){
        console.error("Error while sending message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}