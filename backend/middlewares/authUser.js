const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
dotenv.config();

const secret_key=process.env.SECRET_KEY


const auth = async( req,res,next )=>{
    console.log("cookie",req.cookies);
    const token = req.cookies?.accesstoken;
    console.log("token in mid",token);
    if(!token){
        res.status(400).json("Unauthorized access");
    }
    try {
        const decoded = jwt.verify(token,secret_key);
        console.log("dec ", decoded);
        req.user = decoded;
        console.log("user is",req.user);   
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
}
module.exports = {auth};