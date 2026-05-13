import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { 
        expiresIn: '7d' 
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, //prvent xss attacks by making the cookie inaccessible to JavaScript. xss is a type of attack where malicious scripts are injected into trusted websites, and httpOnly cookies cannot be accessed or manipulated by these scripts.
        sameSite: "lax", //allow cookies to be sent with same-site requests and top-level navigations from external sites
        secure: process.env.NODE_ENV !== "development",
    });

    return token;
};