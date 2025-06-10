const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const dotenv = require('dotenv');
dotenv.config();

const generateAccessToken = async(userid)=>{
    // const secret_key = "abcd";
    const token = jwt.sign(
        {id:userid},
        process.env.SECRET_KEY,
        { expiresIn: "1d" }
    )
    console.log("token in fxn ",token);
    return token;
}


const allUsers = async (req, res) => {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
  
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id}});
    res.send(users);
};

const registerUser = async(req,res) =>{
    const {name,email,password,pic} = req.body;
    if(!name || !email || !password){
        return res.status(400).json("All fields are required");

    }
    const userExists = await User.findOne({email});
    if(userExists){
        return res.status(400).json("User Exists");
    }
    const user = await User.create({
        name,
        email,
        password,
        pic
    })
    if(user){
        const options = {
            httpOnly: true,
            secure: true,
        };
        const token = await generateAccessToken(user._id);


        res.status(200)
        .cookie("accesstoken",token,options)
        .json({
            _id:user._id,
            name:user.name,
            email:user.email,
            
        })

    
    }else{
        res.status(400).json("unable to create user");
    }

    
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
  
    if (user && (await user.matchPassword(password))) {
        const options = {
            httpOnly: true,
            secure: true,
        };
        const token = await generateAccessToken(user._id);
        console.log("token in ctrl ", token);
        res
        .cookie("accesstoken",token,options)
        .json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: token
        
      });
    } else {
      res.status(401);
      throw new Error("Invalid Email or Password");
    }
  };
  
  

module.exports = {registerUser,loginUser,allUsers};