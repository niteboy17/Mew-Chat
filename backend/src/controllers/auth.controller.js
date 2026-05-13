import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';

export const signup = async(req, res) => {
    const {email, fullName, password} = req.body;
    try{
        if(!email || !fullName || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        
        if (password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters long"});
        }

        const user = await User.findOne({email});

        if(user){
            return res.status(400).json({message: "Email already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
        });

        if(newUser){
            //generate JWT token here and send it in response
            generateToken(newUser._id, res);    //_id as this is how mongodb store it.
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePicture: newUser.profilePicture
            });
        }else{
            return res.status(400).json({message: "Invalid user data"});
        }
    }catch(error){
        console.error('Error during signup:', error);
        res.status(500).json({message: "Server error"});
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid credentials"});
        }

        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePicture: user.profilePicture
        });
    }
    catch(error){
        console.error('Error during login:', error);
        res.status(500).json({message: "Server error"});
    }
};
    
export const logout = (req, res) => {
    try{
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({message: "Logged out successfully"});
    }catch(error){
        console.error('Error during logout:', error);
        res.status(500).json({message: "Server error"});
    }

};

export const updateProfile = async (req, res) => {
    try{
        const {profilePicture} = req.body;
        const userId = req.user._id; //req.user is set in protectRoute middleware after verifying JWT token.
        
        if(!profilePicture){
            return res.status(400).json({message: "Profile picture is required"});
        }

        // Check base64 size (rough estimate: base64 is ~33% larger than binary)
        const base64Size = profilePicture.length * 0.75 / (1024 * 1024); // Convert to MB
        if(base64Size > 5){
            return res.status(400).json({message: `Image too large (${base64Size.toFixed(2)}MB). Maximum 5MB allowed.`});
        }

        console.log("🔍 Cloudinary Config Debug:", {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "✓ SET" : "✗ MISSING",
            api_key: process.env.CLOUDINARY_API_KEY ? "✓ SET" : "✗ MISSING",
            api_secret: process.env.CLOUDINARY_API_SECRET ? "✓ SET" : "✗ MISSING",
        });

        const uploadResponse = await cloudinary.uploader.upload(profilePicture, {
            folder: "chat-app/profiles",
            resource_type: "auto",
            quality: "auto:good"
        });
        
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePicture: uploadResponse.secure_url}, {new: true}).select("-password");

        res.status(200).json(updatedUser);
    }catch(error){
        console.error('❌ Cloudinary upload error:', {
            message: error.message,
            statusCode: error.http_code,
            http_code: error.http_code,
            error_name: error.name
        });
        
        // 403 = Authentication failed
        if(error.http_code === 403){
            return res.status(403).json({
                message: "Cloudinary authentication failed. Please verify your API credentials in the .env file are correct.",
                error: "Invalid API credentials"
            });
        }
        if(error.message.includes("File size too large")){
            return res.status(400).json({message: "Image file is too large. Please use an image under 5MB."});
        }
        if(error.message.includes("Invalid")){
            return res.status(400).json({message: "Invalid image file. Please upload a valid image (JPG, PNG, GIF, etc.)"});
        }
        
        res.status(500).json({message: "Failed to upload image. Please try again."});
    }
};

export const checkAuth = (req, res) => {
    try{
        res.status(200).json({
            _id: req.user._id,
            fullName: req.user.fullName,
            email: req.user.email,
            profilePicture: req.user.profilePicture,
            createdAt: req.user.createdAt
        }); //req.user is set in protectRoute middleware after verifying JWT token.
    }catch(error){
        console.error('Error checking authentication:', error);
        res.status(500).json({message: "Server error"});
    }
}