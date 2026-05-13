import express from 'express';
import { signup, login, logout, updateProfile, checkAuth} from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile); //protectRoute is a middleware to check if user is authenticated before allowing access to this route.

router.get("/check", protectRoute, checkAuth); // A protected route to check if the user is authenticated. If the user is authenticated, it will return the user data.

export default router;