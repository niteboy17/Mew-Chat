import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getUsersForSidebar } from '../controllers/message.controller.js';
import { getMessages } from '../controllers/message.controller.js';
import { sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar); // A protected route to get the list of users for the sidebar. It will return the list of users except the currently logged in user.

router.get("/:id", protectRoute, getMessages); // A protected route to get the messages between the logged in user and the user with the specified id.

router.post("/send/:id", protectRoute, sendMessage); // A protected route to send a message to the user with the specified id.
export default router;