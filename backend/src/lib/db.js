// db.js is used to connect to the MongoDB database using Mongoose. It exports a function called connectDB that establishes the connection and logs the status. The connection string is retrieved from environment variables for security reasons.

import mongoose from 'mongoose';

export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch(error){
        console.error('Error connecting to MongoDB:', error);
    }
}